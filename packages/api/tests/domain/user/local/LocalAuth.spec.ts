import { pwdAuth } from '../../../../src/domain/user/local/LocalAuth'
import { hashPassword } from '../../../../src/domain/user/local/password-auth'
import { prismaMock } from '../../../setup/prisma'

describe('pwdAuth', () => {
  it('should return invalid credentials if user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)

    const result = await pwdAuth('username', 'password')

    expect(result).toEqual({ cause: 'invalid-credentials', success: false })
  })

  it('should return invalid credentials if auth method is not local', async () => {
    // @ts-ignore
    prismaMock.user.findUnique.mockResolvedValue({
      auth: { method: 'ldap' },
    })

    const result = await pwdAuth('username', 'password')

    expect(result).toEqual({ cause: 'invalid-credentials', success: false })
  })

  it('should return invalid credentials if password is incorrect', async () => {
    // @ts-ignore
    prismaMock.user.findUnique.mockResolvedValue({
      auth: { method: 'local', password: 'hashedPassword', salt: 'salt' },
    })

    const result = await pwdAuth('username', 'wrong-password')

    expect(result).toEqual({ cause: 'invalid-credentials', success: false })
  })

  it('should return success and twoFA status if password is correct', async () => {
    const salt = 'salt'
    const password = 'password'
    const hashedPassword = await hashPassword(password, salt)

    // @ts-ignore
    prismaMock.user.findUnique.mockResolvedValue({
      auth: { method: 'local', password: hashedPassword, salt, twoFA: true },
    })

    const result = await pwdAuth('username', password)

    expect(result).toEqual({
      success: true,
      twoFA: true,
      user: expect.any(Object),
    })
  })
})
