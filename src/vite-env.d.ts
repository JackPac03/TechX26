/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

// Fingerprints of the trusted networks, made by vite.config.ts. null when anyone can open the site.
declare const __TRUSTED_NETWORKS__: { salt: string; iterations: number; lengths: number[]; fingerprints: string[] } | null
