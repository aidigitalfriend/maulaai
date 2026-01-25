import js from '@eslint/js';
import node from 'eslint-plugin-node';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        AbortSignal: 'readonly',
        require: 'readonly',
      },
    },
    plugins: {
      node: node,
    },
    rules: {
      // Node.js specific rules
      'node/no-missing-import': ['error', {
        allowModules: ['uuid', 'isolated-vm', 'otplib']
      }],
      'node/no-unsupported-features/es-syntax': 'off', // Allow ES modules
      'node/no-unsupported-features/node-builtins': 'off',

      // General rules
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in backend
      'prefer-const': 'error',
      'no-var': 'error',

      // Disable some overly strict rules for backend code
      'no-process-exit': 'off',
      'no-sync': 'off',
    },
  },
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    rules: {
      'node/no-missing-import': 'off',
      'no-unused-vars': 'off',
    },
  },
];