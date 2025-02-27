import type { AuthResult } from '../UserService'

import { prisma } from '../../../prisma/prisma.ts'
import { comparePasswords, hashPassword } from './password-auth.ts'

export async function pwdAuth(
  username: string,
  password: string,
): Promise<AuthResult> {
  const user =
    (await prisma.user.findUnique({
      include: { Student: true },
      where: { username },
    })) ?? undefined

  if (!user || user.auth.method !== 'local') {
    return { cause: 'invalid-credentials', success: false }
  }
  const clientUser = { ...user, auth: {} }

  const hashedPassword = await hashPassword(password, user.auth.salt)

  if (comparePasswords(hashedPassword, user.auth.password)) {
    return { success: true, user: clientUser }
  }

  return { cause: 'invalid-credentials', success: false }
}
