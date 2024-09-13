import perfectionist from 'eslint-plugin-perfectionist'
import unusedImports from 'eslint-plugin-unused-imports'

const banTransformations = {
  'no-restricted-syntax': [
    'error',
    {
      selector: 'TSEnumDeclaration',
      message:
        "TypeScript design flaw and --experimental-strip-types doesn't support transforms",
    },
  ],
  '@typescript-eslint/no-namespace': [
    'error',
    { allowDeclarations: true, allowDefinitionFiles: true },
  ],
}

export const sharedRules = [
  perfectionist.configs['recommended-natural'],
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      ...banTransformations,
      ...{
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
          'warn',
          {
            vars: 'all',
            varsIgnorePattern: '^_',
            args: 'after-used',
            argsIgnorePattern: '^_',
          },
        ],
      },
      '@typescript-eslint/only-throw-error': 'off',

      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@api/**'],
              message: 'only types can be shared between frontend and backend',
              allowTypeImports: true,
            },
          ],
        },
      ],
      'no-underscore-dangle': 'error',
      'no-else-return': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'require-await': 'error',
      eqeqeq: 'error',
      curly: 'error',

      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'context',
        },
      ],
    },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
    files: ['**/*.spec.ts'],
  },
]
