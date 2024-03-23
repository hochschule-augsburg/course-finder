module.exports = {
  extends: ['../../.eslintrc.cjs', 'plugin:vue/vue3-recommended'],
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.vue'],
    parser: '@typescript-eslint/parser',
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
