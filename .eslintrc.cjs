module.exports = {
  extends: [
    'standard',
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'perfectionist',
    'unused-imports',
    'sort-keys-fix',
    'typescript-sort-keys',
    'vitest',
    'prettier',
  ],
  ignorePatterns: ['**/*.json'],
  root: true,
  rules: {
    'func-style': ['error', 'declaration'],
    // unused-imports
    ...{
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          vars: 'all',
          varsIgnorePattern: '^_',
        },
      ],
      'unused-imports/no-unused-imports': 'error',
    },
    // overrides for standard
    ...{
      'no-void': 'off',
    },
  },
}
