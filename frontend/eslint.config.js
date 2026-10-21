import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Allow 'any' type — used extensively with API responses
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow setState inside effects — used intentionally for data fetching
      'react-hooks/set-state-in-effect': 'off',
      // Allow unused vars if prefixed with underscore; downgrade to warning
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
      // Allow unused catch variables
      'no-unused-vars': 'off',
      // Allow manual memoization patterns (useMemo with complex generics)
      'react-hooks/preserve-manual-memoization': 'off',
      // Downgrade exhaustive-deps to warning
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
