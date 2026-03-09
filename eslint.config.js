import { defineConfig } from 'eslint/config';
import globals from 'globals';

import js from '@eslint/js';

export default defineConfig([
  {
    basePath: 'src',
    files: ['**/*.{js,mjs,cjs}'],
    ignores: ['**/*.config.js'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
]);
