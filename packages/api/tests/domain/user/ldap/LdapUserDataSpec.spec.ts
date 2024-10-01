import ldapStudentResult from '../../../../src/domain/user/ldap/example-responses/loggedInStudent.json' // adjust the import path to your actual file structure
import { resultSpec } from '../../../../src/domain/user/ldap/LdapUserDataSpec'

describe('resultSpec', () => {
  describe('parse', () => {
    it.each([
      ['Student', 'Student', ldapStudentResult],
      [
        'Professor',
        'Professor',
        {
          cn: 'John Dö',
          employeeType: 'Professoren',
          mail: 'john.doe@hs-augsburg.de',
          uid: 'doejohn',
        },
      ],
      [
        'Angestellte',
        'User',
        {
          cn: 'John Dö',
          employeeType: 'Angestellte',
          mail: 'john.doe@hs-augsburg.de',
          uid: 'doejohn',
        },
      ],
      [
        'MAPR',
        'User',
        {
          cn: 'John Dö',
          employeeType: 'MAPR',
          mail: 'john.doe@hs-augsburg.de',
          uid: 'doejohn',
        },
      ],
      [
        'UserArray',
        'User',
        {
          cn: 'John Dö',
          employeeType: ['Angestellte', 'MAPR'],
          mail: 'john.doe@hs-augsburg.de',
          uid: 'doejohn',
        },
      ],
    ])('should parse ldap data correctly %s', (_, type, ldapData) => {
      const transformed = resultSpec.parse(ldapData)

      expect(transformed).toEqual(
        expect.objectContaining({
          email: 'john.doe@hs-augsburg.de',
          name: 'John Dö',
          type,
          username: 'doejohn',
        }),
      )
    })

    // Add more tests for other types of data
  })
})
