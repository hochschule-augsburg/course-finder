import eslintjs from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import { sharedRules } from '../eslint-shared.js'
import tseslint from 'typescript-eslint'

export default defineConfig(
  globalIgnores(['src/generated/**/*']),
  eslintjs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
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
    rules: {
      'no-underscore-dangle': 'off',
    },
  },
  eslintPluginPrettierRecommended,
)
