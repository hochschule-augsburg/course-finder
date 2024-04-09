import { User } from '@prisma/client'

import { UserExtended } from '../../libExports'
import { pwdAuth as ldapPwdAuth } from './ldap/LdapAuth'
import { pwdAuth as localPwdAuth } from './local/LocalAuth'

export type AuthResult =
  | ({ success: false } & (
      | { cause: 'invalid-credentials' }
      | { cause: 'service-not-available' }
    ))
  | ({ success: true } & (
      | { twoFA: false; user: UserExtended }
      | { twoFA: true; user: User }
    ))

export async function authenticate(
  username: string,
  password: string,
): Promise<AuthResult> {
  const [ldapPromise, localPromise] = [ldapPwdAuth, localPwdAuth].map(
    (f): Promise<AuthResult> => f(username, password),
  )
  const local = await localPromise
  if (local.success) {
    return local
  }
  return ldapPromise
}
