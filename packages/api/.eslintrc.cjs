module.exports = {
  extends: [
    'standard',
    'plugin:perfectionist/recommended-natural',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  ignorePatterns: ['playground.ts', '**/*.json'],
  parserOptions: {
    project: './tsconfig.json',
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
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'never' },
    ],
    'func-style': ['error', 'declaration'],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        checksVoidReturn: {
          arguments: false,
        },
      },
    ],
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
