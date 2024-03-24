module.exports = {
  extends: ['plugin:vue/vue3-recommended', '../../.eslintrc.cjs'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
  },
  rules: {
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
    'vue/define-emits-declaration': ['warn', 'type-based'],
    'vue/define-props-declaration': ['warn', 'type-based'],
    'vue/no-boolean-default': ['warn', 'default-false'],
  },
  overrides: [
    {
      files: ['vite.config.ts', '.eslintrc.cjs'],
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.node.json',
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
