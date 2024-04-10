module.exports = {
  extends: [
    'standard',
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['**/*.json'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  plugins: [
    '@typescript-eslint',
    'perfectionist',
    'unused-imports',
    'sort-keys-fix',
    'typescript-sort-keys',
    'vitest',
    'prettier',
  ],
  root: true,
  rules: {
    'func-style': ['error', 'declaration'],
    'prettier/prettier': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',

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
  overrides: [
    {
      files: ['tests/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
      },
    },
  ],
}
