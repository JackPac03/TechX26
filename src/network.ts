// Checks whether this phone is on a trusted network, by comparing a fingerprint of its public
// IPv4 address with the fingerprints the build made from TRUSTED_NETWORKS (see vite.config.ts).
const trusted = __TRUSTED_NETWORKS__
export const networkCheckEnabled = trusted !== null

// Cloudflare echoes back the address a request came from. 1.1.1.1 always answers over IPv4.
const traceUrls = ['https://1.1.1.1/cdn-cgi/trace', 'https://www.cloudflare.com/cdn-cgi/trace']
const publicAddress = async () => {
  for (const url of traceUrls) {
    try {
      const response = await fetch(url, { cache: 'no-store' })
      const ip = (await response.text()).match(/^ip=(.+)$/m)?.[1]
      if (ip) return ip
    } catch {
      // Try the next one.
    }
  }
  return null
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
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return { ip, trusted: false }
  const value = parts.reduce((total, part) => total * 256 + part, 0)
  for (const length of trusted!.lengths) {
    const network = Math.floor(value / 2 ** (32 - length)) * 2 ** (32 - length)
    if (trusted!.fingerprints.includes(await fingerprint(`${length}|${network}`))) return { ip, trusted: true }
  }
  return { ip, trusted: false }
}
