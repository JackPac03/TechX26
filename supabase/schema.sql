-- TECHx26 live leaderboard. Run this once in the Supabase SQL editor.
--
-- Each phone signs in anonymously and keeps one row: a nickname, a short player code, and its
-- stamps, hidden exhibits and challenge results. No names or emails are stored.
-- The database works out every score itself, so a phone can't send a made-up total.
-- Keep the limits and points in step with src/scoring.ts, src/data.ts (46 booths) and src/secrets.ts (5 hidden exhibits).

create table if not exists public.players (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  nickname text not null check (char_length(btrim(nickname)) between 2 and 20 and nickname !~* '@|https?:|www\.'),
  code text not null check (code ~ '^[A-Z2-9]{4}$'),
  stamps text[] not null default '{}' check (cardinality(stamps) <= 46),
  secrets text[] not null default '{}' check (cardinality(secrets) <= 5),
  results jsonb not null default '{}',
  explorer_type text check (char_length(explorer_type) <= 40),
  score integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists players_score_idx on public.players (score desc);

-- Scores: 10 per stamp, 25 per hidden exhibit, and each booth challenge's best result up to 100.
-- Duplicates only count once, and anything a phone sends in the score column is replaced.
create or replace function public.score_player() returns trigger
language plpgsql set search_path = '' as $$
declare
  challenge_total integer;
begin
  new.stamps := array(select distinct stamp from unnest(new.stamps) as stamp);
  new.secrets := array(select distinct secret from unnest(new.secrets) as secret);
  if jsonb_typeof(new.results) <> 'object' or (select count(*) from jsonb_object_keys(new.results)) > 46 then
    raise exception 'results must be an object with at most 46 booths';
  end if;
  select coalesce(sum(least(greatest(value::numeric, 0), 100)), 0)::integer into challenge_total from jsonb_each_text(new.results);
  new.score := 10 * cardinality(new.stamps) + 25 * cardinality(new.secrets) + challenge_total;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists score_player on public.players;
create trigger score_player before insert or update on public.players
for each row execute function public.score_player();

-- Networks allowed to save to the leaderboard, by the public address the request arrives from.
-- While it's empty, any network can save. The repo is public, so add the networks here rather than in this file,
-- matching the site's TRUSTED_NETWORKS secret, for example:
--   insert into public.trusted_networks values ('203.0.113.0/24', 'Venue Wi-Fi');
-- The table isn't readable through the API.
create table if not exists public.trusted_networks (
  network cidr primary key,
  label text not null
);
alter table public.trusted_networks enable row level security;

-- The address a request came from and whether it's on a trusted network. Cloudflare, in front of
-- Supabase, sets cf-connecting-ip itself. Otherwise use the last x-forwarded-for entry, as earlier ones can be faked.
create or replace function public.network_check() returns table (ip text, trusted boolean)
language plpgsql stable security definer set search_path = '' as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  address inet;
begin
  begin
    address := btrim(coalesce(headers ->> 'cf-connecting-ip', reverse(split_part(reverse(headers ->> 'x-forwarded-for'), ',', 1))))::inet;
  exception when others then
    address := null;
  end;
  return query select host(address),
    not exists (select 1 from public.trusted_networks) or exists (select 1 from public.trusted_networks t where address <<= t.network);
end $$;

-- Anyone can read the board. Each phone can only add and change its own row, from a trusted network.
alter table public.players enable row level security;
drop policy if exists "Anyone can read the leaderboard" on public.players;
create policy "Anyone can read the leaderboard" on public.players for select to anon, authenticated using (true);
drop policy if exists "Players add their own row" on public.players;
create policy "Players add their own row" on public.players for insert to authenticated with check (id = (select auth.uid()) and (select trusted from public.network_check()));
drop policy if exists "Players update their own row" on public.players;
create policy "Players update their own row" on public.players for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()) and (select trusted from public.network_check()));

-- A player's points overall, or at one booth (its stamp plus the best challenge score there).
create or replace function public.player_points(player public.players, booth text) returns integer
language sql immutable set search_path = '' as $$
  select case when booth is null then player.score
    else (case when booth = any(player.stamps) then 10 else 0 end) + least(greatest(coalesce((player.results ->> booth)::numeric, 0), 0), 100)::integer end
$$;

-- The top players overall, or at one booth.
create or replace function public.leaderboard(booth text default null, max_rows integer default 10)
returns table (nickname text, code text, points integer)
language sql stable set search_path = '' as $$
  select p.nickname, p.code, public.player_points(p, booth) as points
  from public.players p
  where public.player_points(p, booth) > 0
  order by points desc, p.nickname
  limit least(greatest(max_rows, 1), 50)
$$;

-- Where a score would place, ignoring the signed-in player's own saved row.
create or replace function public.leaderboard_rank(my_points integer, booth text default null) returns integer
language sql stable set search_path = '' as $$
  select 1 + count(*)::integer from public.players p
  where p.id is distinct from (select auth.uid()) and public.player_points(p, booth) > my_points
$$;

revoke execute on function public.network_check() from public;
grant execute on function public.leaderboard(text, integer), public.leaderboard_rank(integer, text), public.network_check() to anon, authenticated;
