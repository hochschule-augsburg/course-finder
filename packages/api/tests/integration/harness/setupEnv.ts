// Set environment variables before any modules are imported
process.env.NODE_ENV = 'development'
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://user:password@127.0.0.1:5432/course_finder_test'
process.env.JWT_SECRET =
  process.env.JWT_SECRET ||
  'integration-test-secret-must-be-at-least-32-characters-long!'
process.env.CONTACT_EMAIL =
  process.env.CONTACT_EMAIL || 'course-finder@test.example.com'
process.env.FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000'
process.env.LDAP_BASE_DN =
  process.env.LDAP_BASE_DN || 'ou=People,dc=example,dc=com'
process.env.LDAP_URL = process.env.LDAP_URL || 'ldaps://localhost:636'
process.env.SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost'
process.env.SERVER_PORT = process.env.SERVER_PORT || '3001'
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent'

// Mock LDAP authentication so integration tests don't attempt external network connections
vi.mock('../../../src/domain/user/ldap/LdapAuth.ts', () => ({
  pwdAuth: vi.fn().mockResolvedValue({
    cause: 'invalid-credentials',
    success: false,
  }),
}))

// Mock email sending so emails aren't written to disk during integration tests
vi.mock('../../../src/domain/mail/Mail.ts', () => ({
  emailToLists: vi.fn().mockResolvedValue(undefined),
  emailToStudents: vi.fn().mockResolvedValue(undefined),
  sendEmail: vi.fn().mockResolvedValue({ messageId: 'test-message-id' }),
}))
