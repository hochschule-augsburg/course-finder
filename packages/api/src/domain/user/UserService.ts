import type {
  ClientUser,
  ClientUserExtended,
} from '../../prisma/PrismaTypes.ts'

import { pwdAuth as ldapPwdAuth } from './ldap/LdapAuth.ts'
import { pwdAuth as localPwdAuth } from './local/LocalAuth.ts'

export type AuthResult =
  | ({ success: false } & (
      | { cause: 'invalid-credentials' }
      | { cause: 'service-not-available' }
    ))
  | ({ success: true } & (
      | { twoFA: false; user: ClientUserExtended }
      | { twoFA: true; user: ClientUser }
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
