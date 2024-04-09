import crypto from 'crypto'

import { prisma } from '../../../prisma'
import { AuthResult } from '../UserService'

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

  const hashedPassword = crypto
    .createHash('sha256')
    .update(password + user.auth.salt)
    .digest('hex')

  if (hashedPassword === user.auth.password) {
    if (user.auth.twoFA) {
      return { success: true, twoFA: true, user }
    }
    return { success: true, twoFA: false, user }
  }

  return { cause: 'invalid-credentials', success: false }
}
