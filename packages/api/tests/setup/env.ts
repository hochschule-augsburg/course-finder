vi.mock('../../src/env.ts', () => ({
  env: {
    DATABASE_URL: 'https://example.com',
    FRONTEND_HOSTNAME: 'localhost',
    JWT_SECRET:
      'askdfjasdklfauheubnasdfnasdkjfnasdkfjnasdlkfasdfkljabndlfkjabdlkjas;dkj',
    LDAP_BASE_DN: 'dc:example,dc:com',
    LDAP_URL: 'https://example.com',
    MAIL_RECEIVERS: '',
    SERVER_HOSTNAME: 'localhost',
    SERVER_PORT: '3000',
  },
}))
