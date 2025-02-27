import * as ldapPwdAuth from '../../../src/domain/user/ldap/LdapAuth'
import * as localPwdAuth from '../../../src/domain/user/local/LocalAuth'
import { authenticate } from '../../../src/domain/user/UserService'

describe('UserService', () => {
  it('should return local auth result if successful', async () => {
    const mockLocalResult = { success: true }
    const mockLdapResult = { success: false }
    vi.spyOn(localPwdAuth, 'pwdAuth').mockImplementation(() =>
      // @ts-ignore
      Promise.resolve(mockLocalResult),
    )
    vi.spyOn(ldapPwdAuth, 'pwdAuth').mockImplementation(() =>
      // @ts-ignore
      Promise.resolve(mockLdapResult),
    )

    const result = await authenticate('username', 'password')

    expect(result).toEqual(mockLocalResult)
  })

  it('should return ldap auth result if local auth is not successful', async () => {
    const mockLocalResult = { success: false }
    const mockLdapResult = { cause: 'service-not-available', success: false }
    vi.spyOn(localPwdAuth, 'pwdAuth').mockImplementation(() =>
      // @ts-ignore
      Promise.resolve(mockLocalResult),
    )
    vi.spyOn(ldapPwdAuth, 'pwdAuth').mockImplementation(() =>
      // @ts-ignore
      Promise.resolve(mockLdapResult),
    )

    const result = await authenticate('username', 'password')

    expect(result).toEqual(mockLdapResult)
  })
})
