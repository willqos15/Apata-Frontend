import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{js,jsx}'],

    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },

    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite
    ],

    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },

    settings: {
      react: {
        version: 'detect'
      }
    },

    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
    }
  }
])