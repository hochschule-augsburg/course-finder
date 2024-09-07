import js from '@eslint/js'
import eslintPluginVue from 'eslint-plugin-vue'
import ts from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { sharedRules } from '../../eslint-shared.js'

const vueRules = {
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
  'vue/component-name-in-template-casing': [
    'error',
    'PascalCase',
    { registeredComponentsOnly: false },
  ],
  'vue/no-boolean-default': ['warn', 'default-false'],
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
  'vue/custom-event-name-casing': 'warn',
  'vue/no-ref-object-reactivity-loss': 'warn',
  'vue/no-required-prop-with-default': 'warn',
  'vue/no-unused-refs': 'warn',
  'vue/no-useless-mustaches': 'warn',
  'vue/no-useless-v-bind': 'warn',
  'vue/no-v-text': 'warn',
  'vue/eqeqeq': ['error', 'always'],
  ...{
    'vue/attributes-order': 'off',
    'perfectionist/sort-vue-attributes': [
      'error',
      {
        type: 'natural',
        order: 'asc',
        groups: ['v-model', 'v-', 'multiline', 'unknown', 'shorthand', 'v-on'],
        customGroups: {
          'v-model': 'v-model*',
          'v-': 'v-*',
          'v-on': '@*',
        },
      },
    ],
  },
}

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  ...eslintPluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: {
          js: '@typescript-eslint/parser',
          ts: '@typescript-eslint/parser',
          '<template>': 'espree',
        },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'], // let's project service treat vue files as ts
      },
    },
  },
  ...sharedRules,
  {
    rules: {
      ...vueRules,
    },
  },
  {
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    },
    files: ['src/**/*.vue'],
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
    },
    files: ['src/pages/**/*.vue'],
  },
  eslintPluginPrettierRecommended,
)
