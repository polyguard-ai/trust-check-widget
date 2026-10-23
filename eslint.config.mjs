import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      'test-results/**',
      'playwright-report/**',
      'next-env.d.ts',
    ],
  },
  {
    // CommonJS is what most Express apps still use.
    files: ['examples/express/**/*.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
];

export default config;
