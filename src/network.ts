// Checks whether this phone is on a trusted network, by comparing a fingerprint of its public
// IPv4 address with the fingerprints the build made from TRUSTED_NETWORKS (see vite.config.ts).
const trusted = __TRUSTED_NETWORKS__
export const networkCheckEnabled = trusted !== null

// Cloudflare echoes back the address a request came from. Phones keep an open connection on the
// network they started on, so after joining Wi-Fi the same address would still answer over mobile data.
// Each check starts with a different address from the last one, which needs a fresh connection.
const traceHosts = ['1.1.1.1', '1.0.0.1', 'cloudflare.com', 'www.cloudflare.com']
const isIPv4 = (ip: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(ip)
let nextHost = 0
const publicAddress = async () => {
  let fallback: string | null = null
  const start = nextHost
  nextHost = (start + 1) % traceHosts.length
  for (let step = 0; step < traceHosts.length; step++) {
    const index = (start + step) % traceHosts.length
    try {
      const response = await fetch(`https://${traceHosts[index]}/cdn-cgi/trace`, { cache: 'no-store' })
      const ip = (await response.text()).match(/^ip=(.+)$/m)?.[1]
      if (!ip) continue
      // The named hosts can answer over IPv6, which can't be matched, so try the next one for an IPv4 address.
      if (isIPv4(ip)) {
        nextHost = (index + 1) % traceHosts.length
        return ip
      }
      fallback ??= ip
    } catch {
      // Try the next one.
    }
  }
  return fallback
}

const fingerprint = async (text: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(text), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(trusted!.salt), iterations: trusted!.iterations }, key, 256)
  return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

// trusted is null when the address couldn't be found, so a Cloudflare outage doesn't lock everyone out.
export const checkNetwork = async (): Promise<{ ip: string | null; trusted: boolean | null }> => {
  const ip = await publicAddress()
  if (!ip) return { ip, trusted: null }
  const parts = ip.split('.').map(Number)
  if (!isIPv4(ip) || parts.some((part) => part > 255)) return { ip, trusted: false }
  const value = parts.reduce((total, part) => total * 256 + part, 0)
  for (const length of trusted!.lengths) {
    const network = Math.floor(value / 2 ** (32 - length)) * 2 ** (32 - length)
    if (trusted!.fingerprints.includes(await fingerprint(`${length}|${network}`))) return { ip, trusted: true }
  }
  return { ip, trusted: false }
}
