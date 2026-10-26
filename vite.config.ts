import { randomBytes, pbkdf2Sync } from 'node:crypto'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Only phones on these networks can open the site. The list comes from the TRUSTED_NETWORKS
// environment variable (a GitHub secret when deploying, .env.local locally), as IPv4 addresses or
// ranges separated by commas or spaces. The site only ever contains salted, slow one-way fingerprints
// of them, which src/network.ts compares with the phone's own address. Without the variable, anyone can open it.
const iterations = 150_000
const fingerprintNetworks = (list: string) => {
  const entries = list.split(/[\s,]+/).filter(Boolean)
  if (!entries.length) return null
  const salt = randomBytes(16).toString('hex')
  const networks = entries.map((entry) => {
    const [address, bits = '32'] = entry.split('/')
    const parts = address.split('.').map(Number)
    const length = Number(bits)
    if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255) || !Number.isInteger(length) || length < 8 || length > 32) {
      throw new Error(`TRUSTED_NETWORKS: "${entry}" isn't an IPv4 address or range like 203.0.113.7 or 203.0.113.0/24`)
    }
    const value = parts.reduce((total, part) => total * 256 + part, 0)
    const network = Math.floor(value / 2 ** (32 - length)) * 2 ** (32 - length)
    return { length, network }
  })
  const fingerprint = ({ length, network }: { length: number; network: number }) => pbkdf2Sync(`${length}|${network}`, salt, iterations, 32, 'sha256').toString('hex')
  return { salt, iterations, lengths: [...new Set(networks.map(({ length }) => length))], fingerprints: networks.map(fingerprint) }
}

// `npm run build:share` inlines everything into one index.html (in share/) that opens straight from disk.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const define = { __TRUSTED_NETWORKS__: JSON.stringify(fingerprintNetworks(process.env.TRUSTED_NETWORKS ?? env.TRUSTED_NETWORKS ?? '')) }
  return mode === 'share'
    ? { plugins: [react(), viteSingleFile()], base: './', build: { outDir: 'share' }, define }
    : { plugins: [react()], define }
})
