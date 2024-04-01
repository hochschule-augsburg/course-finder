module.exports = {
  extends: ['../../.eslintrc.cjs'],
  ignorePatterns: ['playground.ts', 'prisma/seed.ts'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
