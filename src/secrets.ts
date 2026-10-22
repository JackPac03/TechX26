// Hidden exhibits: secret QR codes placed around the venue, each a little piece of tech history.
export type Secret = { id: string; code: string; title: string; era: string; fact: string; hint: string; place: string; art: string }

export const secrets: Secret[] = [
  {
    id: 'punch-card', code: 'pc28zt', title: 'The Golden Punch Card', era: 'c. 1928',
    fact: 'Each punch card held just 80 characters, so a single text message would need two of them.',
    hint: 'You walked past it on the way in.', place: 'At the turnstiles',
    art: '<path d="M6 16h44l8 8v26H6z"/><path d="M14 24v5M20 34v5M26 24v5M32 40v5M38 28v5M44 36v5M14 38v5M26 34v5M50 30v5"/>',
  },
  {
    id: 'cash-machine', code: 'atm67w', title: 'The First Cash Machine', era: '1967',
    fact: 'The world’s first cash machine opened in London in 1967. It paid out against paper vouchers, not cards.',
    hint: 'Ask, and you shall receive.', place: 'At the concierge desk',
    art: '<rect x="12" y="6" width="40" height="52" rx="4"/><rect x="18" y="12" width="28" height="14" rx="2"/><path d="M20 34h4M30 34h4M40 34h4M20 41h4M30 41h4M40 41h4M20 50h24"/>',
  },
  {
    id: 'brick-phone', code: 'dy73rb', title: 'The Brick Phone', era: '1973',
    fact: 'The first handheld mobile phone call was made in 1973, on a prototype weighing more than a kilogram.',
    hint: 'Grab your bag and look around.', place: 'At the showbag pick-up area',
    art: '<rect x="21" y="14" width="22" height="44" rx="4"/><path d="M27 14V4"/><rect x="25" y="20" width="14" height="9" rx="1"/><path d="M26 37h3M31 37h3M36 37h2M26 43h3M31 43h3M36 43h2M26 49h3M31 49h3M36 49h2"/>',
  },
  {
    id: 'floppy-disk', code: 'fd81kq', title: 'The Lost Floppy Disk', era: 'c. 1981',
    fact: 'A high-density 3.5-inch floppy held 1.44 MB, less than one photo from the phone in your hand.',
    hint: 'Somewhere laptops go to rest.', place: 'At the Tech Bar & Laptop Hotel',
    art: '<path d="M10 8h38l6 6v42H10z"/><rect x="20" y="8" width="22" height="14" rx="1"/><path d="M35 11v8"/><rect x="17" y="32" width="30" height="24" rx="2"/><path d="M22 40h20M22 47h14"/>',
  },
  {
    id: 'dial-up-modem', code: 'md56xj', title: 'The Dial-up Modem', era: '1990s',
    fact: 'At 56 kbps, downloading a single 4 MB song took about ten minutes. Nobody could use the phone meanwhile.',
    hint: 'Where the GMs and Grads go head to head.', place: 'By the Auditorium doors',
    art: '<rect x="6" y="30" width="52" height="18" rx="4"/><path d="M14 39h3M22 39h3M30 39h3M16 48v5M48 48v5"/><path d="M36 20a14 14 0 0 1 18 0M40 14a8 8 0 0 1 10 0"/>',
  },
]

export const secretUrl = (secret: Secret) => `${window.location.origin}/secret/${secret.code}`
export const findSecret = (value: string) => {
  const code = value.trim().toLowerCase().split('/').filter(Boolean).pop() ?? ''
  return secrets.find((secret) => secret.code === code)
}

export const secretsKey = 'techx26-secrets'
export const readSecrets = (): string[] => {
  try {
    const ids = JSON.parse(localStorage.getItem(secretsKey) ?? '[]') as string[]
    return ids.filter((id) => secrets.some((secret) => secret.id === id))
  } catch {
    return []
  }
}

// When each stamp was collected, for the exhibit report.
export const stampTimesKey = 'techx26-stamp-times'
export const readStampTimes = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(stampTimesKey) ?? '{}')
  } catch {
    return {}
  }
}
export const recordStampTime = (id: string) => {
  const times = readStampTimes()
  times[id] ??= Date.now()
  localStorage.setItem(stampTimesKey, JSON.stringify(times))
}
