import crypto from 'crypto'

import { prisma } from '../../../prisma'
import { AuthResult } from '../UserService'

export async function pwdAuth(
  username: string,
  password: string,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    include: { Faculty: true, Prof: true, Student: true },
    where: { username },
  })

  if (!user || user.auth.method !== 'local') {
    return undefined
  }

  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex')

  if (hashedPassword === user.auth.password) {
    if (user.auth.twoFA) {
      return 'two-fa-required'
    }
    return user
  }

  return undefined
}
