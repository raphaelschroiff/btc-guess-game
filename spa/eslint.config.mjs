import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import preact from 'eslint-config-preact';

export default defineConfig(
  {
    extends: [
      preact,
      eslint.configs.recommended,
      tseslint.configs.recommended,
    ],
    files: ['**/*.ts', '**/*.tsx' ],
  }
);

