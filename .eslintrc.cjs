module.exports = {
  extends: [
    'standard',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:perfectionist/recommended-natural',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'perfectionist',
    'unused-imports',
    'sort-keys-fix',
    'typescript-sort-keys',
    'prettier',
    'vitest',
  ],
  root: true,
  rules: {
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
