import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import preact from 'eslint-config-preact';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  preact
);

