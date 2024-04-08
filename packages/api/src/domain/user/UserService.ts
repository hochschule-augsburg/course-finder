import { UserExtended } from '../../prisma/PrismaTypes'
import { pwdAuth as ldapPwdAuth } from './ldap/auth'
import { pwdAuth as localPwdAuth } from './local/auth'

export type AuthResult =
  | 'service-not-available'
  | 'two-fa-required'
  | UserExtended
  | undefined

export async function authenticate(
  username: string,
  password: string,
): Promise<AuthResult> {
  const [ldapPromise, localPromise] = [ldapPwdAuth, localPwdAuth].map((f) =>
    f(username, password),
  )
  const ldap = await ldapPromise
  if (ldap !== undefined && ldap !== 'service-not-available') {
    return ldap
  }
  const local = await localPromise
  if (local !== undefined && local !== 'service-not-available') {
    return local
  }
  return [ldap, local].every((r) => r === 'service-not-available')
    ? 'service-not-available'
    : undefined
}
