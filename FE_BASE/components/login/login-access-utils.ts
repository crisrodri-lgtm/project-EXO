export type AccessRole = 'ESTUDIANTE' | 'ADMINISTRADOR' | 'AUXILIAR'

export const DEMO_OTP_CODE = '246810'

const DEMO_ACCOUNTS: Array<{ email: string; password: string; role: AccessRole }> = [
  { email: 'admin@progresodigital.edu.do', password: 'biblonexo', role: 'ADMINISTRADOR' },
  { email: 'auxiliar@progresodigital.edu.do', password: 'biblonexo', role: 'AUXILIAR' },
  { email: 'maria.gutierrez@demo.test', password: 'biblonexo', role: 'ESTUDIANTE' },
]

export async function verifyDemoCredentials(email: string, password: string) {
  await new Promise((resolve) => window.setTimeout(resolve, 500))
  const normalizedEmail = email.trim().toLocaleLowerCase('es')
  return DEMO_ACCOUNTS.find((account) => account.email === normalizedEmail && account.password === password)?.role ?? null
}

export function roleForAccessEmail(email: string): AccessRole | null {
  const normalizedEmail = email.trim().toLocaleLowerCase('es')
  return DEMO_ACCOUNTS.find((account) => account.email === normalizedEmail)?.role ?? null
}

export function routeForRole(role: AccessRole) {
  if (role === 'ESTUDIANTE') return '/estudiante/dashboard'
  return '/admin/dashboard'
}

export function profileRouteForRole(role: AccessRole) {
  if (role === 'ESTUDIANTE') return '/estudiante/perfil?firstLoginOtp=1'
  if (role === 'AUXILIAR') return '/admin/perfil?demoRole=auxiliar&firstLoginOtp=1'
  return '/admin/perfil?firstLoginOtp=1'
}

function datePartsInDominicanRepublic(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  }
}

export function todayInDominicanRepublic() {
  const today = datePartsInDominicanRepublic()
  return `${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}`
}

export function ageOnDominicanDate(birthDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate)
  if (!match) return null

  const [, yearValue, monthValue, dayValue] = match
  const year = Number(yearValue)
  const month = Number(monthValue)
  const day = Number(dayValue)
  const candidate = new Date(Date.UTC(year, month - 1, day))
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) return null

  const today = datePartsInDominicanRepublic()
  let age = today.year - year
  if (today.month < month || (today.month === month && today.day < day)) age -= 1
  return age >= 0 ? age : null
}
