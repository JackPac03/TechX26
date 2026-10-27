# TECHx26 Museum of Technology

A high-fidelity interactive concept for Westpac's TECHx26 event. The phone-first experience reframes an event site as a digital museum with exhibition wings, curated tours, a venue map, saved exhibits and a QR-powered passport.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Concept architecture

This prototype uses React, TypeScript and browser storage. Everything works on the device alone. The optional live leaderboard below adds a shared Supabase database for nicknames and points.

The built-in camera scanner reads QR codes at each booth, reveals the corresponding exhibit and awards its passport stamp. Codes deep-link to `/exhibits/:code`, where each booth has a random 6-character stamp code (`boothCodes` in `src/data.ts`), so stamps can't be collected by guessing links. The code is also printed under the QR on each poster, for typing in if the camera fails. Stamps can only be collected by scanning or typing that code.

## Westpac Wi-Fi only

The site only opens on trusted networks, such as Westpac Wi-Fi. Everyone else sees an entrance page explaining how to get in.

- The networks come from the `TRUSTED_NETWORKS` repository secret: IPv4 addresses or ranges separated by commas, for example `203.0.113.7, 198.51.100.0/24`. Without it, anyone can open the site.
- The repo and the published site never contain the addresses. The build turns each one into a salted, slow one-way fingerprint, and each phone compares a fingerprint of its own address, which it gets from Cloudflare's `cdn-cgi/trace` page.
- The check runs in the browser, so it keeps ordinary visitors out but someone technical could get around it. If Cloudflare can't be reached, the site opens rather than locking everyone out.
- To find a network's address, connect to it, turn off mobile data and Private Relay, and open https://www.cloudflare.com/cdn-cgi/trace. The entrance page also shows the address it saw.
- For local testing, put `TRUSTED_NETWORKS=...` in `.env.local`, which git ignores.

## Admin

Admin (in the footer) has challenge demos for booth hosts and the organisers' event tools: switches, a to-do list, the challenge library and the Print shop (venue posters, booth QR posters and explorer stickers). It's open to anyone who has the site.

## Live leaderboard (Supabase)

The live leaderboard is built but switched off. Until it's on, points and the leaderboard stay on each phone.

When it's on, a phone signs in anonymously after its first challenge win and saves one row: the player's nickname, a four-character player code, stamps, hidden exhibits, challenge results and explorer type. No real names or emails are collected. The database works out every score itself and only lets each phone change its own row. Phones save a moment after progress changes, retry when they're back online, and refresh the board once a minute while it's on screen.

To switch it on:

1. Get approval first. Supabase is a SaaS supplier and needs a TPSA before Westpac can use it.
2. Create a Supabase project. Use the Pro plan for the event month so the project never pauses.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. It's safe to run again.
4. In **Authentication › Sign In / Providers**, turn on **Allow anonymous sign-ins**.
5. In **Authentication › Rate Limits**, raise anonymous sign-ins from the default 30 per hour per IP address to about 3000. Many phones at the venue share one Wi-Fi or mobile network address.
6. In **Authentication › Sessions** (JWT settings), raise the access token expiry to 24 hours, so phones rarely need to refresh their session during the day.
7. In GitHub, add repository variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project Settings › API) and re-run the deploy. For local testing, put them in `.env.local`.
8. Add the trusted networks in the **trusted_networks** table, matching the `TRUSTED_NETWORKS` secret below. Only phones on these networks can save scores; anyone can still view the board. While the table is empty, any network can save.
9. Before handing out prizes, check the top nicknames in the **players** table and match each winner's player code on their phone.

If the number of booths or hidden exhibits changes, update the limits at the top of `supabase/schema.sql`. If the points change, update its scoring too, so it matches `src/scoring.ts`.
