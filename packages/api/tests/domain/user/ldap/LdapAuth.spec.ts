import { type DN, InvalidCredentialsError } from 'ldapts'

import ldapStudentResult from '../../../../src/domain/user/ldap/example-responses/loggedInStudent.json'
import { pwdAuth } from '../../../../src/domain/user/ldap/LdapAuth'
import { prismaMock } from '../../../setup/prisma'

vi.mock('ldapts', async () => {
  const originalModule = await vi.importActual('ldapts')

  class MockClient {
    bind(dn: DN | string, password: string) {
      if (dn.toString().includes('doejohn') && password === 'password') {
        return
      }
      if (dn.toString().includes('servicedown')) {
        throw new Error()
      }
      throw new InvalidCredentialsError()
    }

    search(dn: DN | string) {
      if (dn.toString().includes('doejohn')) {
        return {
          searchEntries: [ldapStudentResult],
          searchReferences: [],
        }
      }
    }
  }

  return {
    ...originalModule,
    Client: MockClient,
  }
})

describe('LdapAuth', () => {
  test('pwdAuth - successful authentication', async () => {
    const username = 'doejohn'
    const password = 'password'

    // @ts-ignore
    prismaMock.user.upsert.mockResolvedValue({
      auth: { method: 'ldap' },
      username: 'doejohn',
    })

    const result = await pwdAuth(username, password)
    expect(result.success).toBe(true)
  })

  test('pwdAuth - invalid credentials', async () => {
    const username = 'invalidUser'
    const password = 'invalidPassword'

    const result = await pwdAuth(username, password)
    expect(!result.success && result.cause).toBe('invalid-credentials')
  })

  test('pwdAuth - service not available', async () => {
    const username = 'servicedown'
    const password = 'testPassword'

    const result = await pwdAuth(username, password)
    expect(!result.success && result.cause).toBe('service-not-available')
  })
})
