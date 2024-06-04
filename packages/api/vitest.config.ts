import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: 'testDatabaseUrl',
      FRONTEND_HOSTNAME: 'testFrontendHostname',
      LDAP_BASE_DN: 'testLdapBaseDn',
      LDAP_URL: 'testLdapUrl',
      MAIL_RECEIVERS: 'testMailReceivers',
      MAIL_SENDER_PASSWORD: 'testMailSenderPassword',
      MAIL_SENDER_USERNAME: 'testMailSenderUsername',
      SERVER_HOSTNAME: 'testServerHostname',
      SERVER_PORT: 'testServerPort',
      SESSION_SECRET: 'testSessionSecret',
    },
    environment: 'node',
    globals: true,
    includeSource: ['src/domain/enroll/**/*.ts'],
    setupFiles: ['prisma'].map((file) => `tests/setup/${file}.ts`),
  },
})
