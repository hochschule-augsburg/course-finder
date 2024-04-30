import crypto from 'crypto'

import type { AuthResult } from '../UserService'

import { prisma } from '../../../prisma/prisma'

export async function pwdAuth(
  username: string,
  password: string,
): Promise<AuthResult> {
  const user =
    (await prisma.user.findUnique({
      include: { Faculty: true, Prof: true, Student: true },
      where: { username },
    })) ?? undefined

  if (!user || user.auth.method !== 'local') {
    return { cause: 'invalid-credentials', success: false }
  }
  const clientUser = { ...user, auth: { twoFA: user.auth.twoFA } }

  const hashedPassword = crypto
    .createHash('sha256')
    .update(password + user.auth.salt)
    .digest('hex')

  if (hashedPassword === user.auth.password) {
    if (user.auth.twoFA) {
      return { success: true, twoFA: true, user: clientUser }
    }
    return { success: true, twoFA: false, user: clientUser }
  }

  return { cause: 'invalid-credentials', success: false }
}
