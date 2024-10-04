vi.mock('../../src/env.ts', () => ({
  env: {
    CONTACT_EMAIL: 'course-finder@example.com',
    DATABASE_URL: 'https://example.com',
    FRONTEND_ORIGIN: 'http://localhost',
    JWT_SECRET:
      'supersecretkeysupersecretkeysupersecretkeysupersecretkeysupersecretkey',
    LDAP_BASE_DN: 'dc:example,dc:com',
    LDAP_URL: 'https://example.com',
    MAIL_RECEIVERS: '',
    SERVER_HOSTNAME: 'localhost',
    SERVER_PORT: '3000',
  },
}))
