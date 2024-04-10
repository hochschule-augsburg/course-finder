module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  plugins: [
    'vue',
    '@typescript-eslint',
    'unused-imports',
    'import',
    'perfectionist',
    'promise',
    'typescript-sort-keys',
    'prettier',
    'vitest',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts'],
      },
    },
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: {
      ts: '@typescript-eslint/parser',
      '<template>': 'espree',
    },
    sourceType: 'module',
    project: './tsconfig.json',
    extraFileExtensions: ['.vue'],
    ecmaVersion: 'latest',
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:perfectionist/recommended-natural',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  ignorePatterns: [
    'vite.config.ts',
    'vitest.setup.ts',
    'commitlint.config.ts',
    'vitest.globalSetup.ts',
    'vitest.config.ts',
    'migration-sync/**',
    'config/eslint/**',
    'public/**',
    'stories/component/assistant/ExampleAssistantStep.vue',
    'license-reporter.config.ts',
    'build-system/**',
  ],
  rules: {
    'prettier/prettier': 'error',
    indent: 'off',
    'no-throw-literal': 'error',
    curly: 'error',
    'import/no-duplicates': 'error',
    'vue/block-lang': [
      'error',
      {
        script: {
          lang: 'ts',
        },
        style: {
          lang: 'scss',
        },
      },
    ],
    'vue/block-order': [
      'warn',
      {
        order: ['script', 'template', 'style'],
      },
    ],
    'vue/enforce-style-attribute': ['error', { allow: ['scoped'] }],
    'vue/define-emits-declaration': ['warn', 'type-based'],
    'vue/define-props-declaration': ['warn', 'type-based'],
    'vue/no-boolean-default': ['warn', 'default-false'],
    'vue/component-name-in-template-casing': [
      'error',
      'PascalCase',
      { registeredComponentsOnly: false },
    ],
    // vuetify uses invalid v-slot
    'vue/valid-v-slot': 'off',
    'vue/attributes-order': 'off',
    'perfectionist/sort-vue-attributes': [
      'error',
      {
        type: 'natural',
        order: 'asc',
        groups: ['v-model', 'v-', 'multiline', 'unknown', 'shorthand', 'v-on'],
        'custom-groups': {
          'v-modal': 'v-model*',
          'v-': 'v-*',
          'v-on': '@*',
        },
      },
    ],
    'vue/html-self-closing': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-restricted-imports': 'off',
    '@typescript-eslint/no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@api/**'],
            message: 'only types can be shared between ui and api',
            allowTypeImports: true,
          },
        ],
      },
    ],
    'no-return-await': 'error',
    'no-underscore-dangle': 'error',
    'no-else-return': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'func-style': ['error', 'declaration'],
    'promise/prefer-await-to-then': 'error',
    'require-await': 'error',
    semi: 'off',
    'no-unused-vars': 'off',
    'no-restricted-properties': [
      'error',
      {
        object: 'window',
        property: 'context',
      },
    ],
    '@typescript-eslint/no-unused-vars': [
      'warn', // or "error"
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/restrict-template-expressions': [
      'error',
      { allowNumber: true, allowBoolean: true, allowNullish: true },
    ],
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      { assertionStyle: 'never' },
    ],
    'typescript-sort-keys/interface': 'warn',
    'typescript-sort-keys/string-enum': 'warn',
    eqeqeq: ['error', 'always'],
    'unused-imports/no-unused-imports':
      process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    'padding-line-between-statements': 'off',
    '@typescript-eslint/padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'function' },
      { blankLine: 'always', prev: '*', next: 'class' },
    ],
    'lines-between-class-members': 'off',
    '@typescript-eslint/lines-between-class-members': [
      'error',
      'always',
      { exceptAfterSingleLine: true },
    ],
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/**/*.{j,t}s?(x)',
        '**/*.d.ts',
      ],
      rules: {
        'vitest/valid-title': 'error',
        'vitest/no-identical-title': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/typedef': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/consistent-type-assertions': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        'no-global-assign': 'off',
        'vue/one-component-per-file': 'off', // has to be here, because it also effects test files
        'vue/order-in-components': 'off', // has to be here, because it also effects test files
        '@typescript-eslint/naming-convention': [
          'warn',
          {
            format: ['PascalCase'],
            selector: ['typeLike'],
          },
        ],
      },
    },
    {
      files: ['**/*.vue'],
      rules: {
        'vue/no-boolean-default': ['warn', 'default-false'],
        'vue/first-attribute-linebreak': [
          'warn',
          {
            singleline: 'ignore',
            multiline: 'below',
          },
        ],
        'vue/no-multiple-template-root': 'warn',
        'vue/html-self-closing': [
          'error',
          {
            html: {
              void: 'always',
              normal: 'always',
              component: 'always',
            },
            svg: 'always',
            math: 'always',
          },
        ],
        'vue/html-quotes': ['warn', 'double'],
        'vue/block-lang': [
          'warn',
          { script: { lang: 'ts' }, style: { lang: 'scss' } },
        ],
        'vue/component-api-style': ['error', ['script-setup']],
        'vue/component-tags-order': [
          'error',
          {
            order: ['script', 'template', 'style'],
          },
        ],
        'vue/component-name-in-template-casing': 'warn',
        'vue/custom-event-name-casing': 'warn',
        'vue/define-emits-declaration': 'warn',
        'vue/define-props-declaration': 'warn',
        'vue/no-ref-object-destructure': 'warn',
        'vue/no-required-prop-with-default': 'warn',
        'vue/no-undef-properties': 'warn',
        'vue/no-unused-refs': 'warn',
        'vue/no-useless-mustaches': 'warn',
        'vue/no-useless-v-bind': 'warn',
        'vue/no-v-text': 'warn',
        'vue/padding-line-between-blocks': 'warn',
        'vue/prefer-separate-static-class': 'warn',
        'vue/prefer-true-attribute-shorthand': 'warn',
        'vue/eqeqeq': ['error', 'always'],
        'vue/multiline-html-element-content-newline': 'warn',

        // These rules lead to false positives
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        // These rules are just unnecessary
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {
              arguments: false,
            },
          },
        ],
      },
    },
    {
      files: ['./src/pages/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
  ],
}
