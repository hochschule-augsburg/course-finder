import js from '@eslint/js'
import ts from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { sharedRules } from '../../eslint-shared.js'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...sharedRules,
  {
    rules: {},
  },
  eslintPluginPrettierRecommended,
)
