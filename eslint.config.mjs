import {FlatCompat} from '@eslint/eslintrc';
import {fixupConfigRules} from '@eslint/compat';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const compat = new FlatCompat({
  baseDirectory: path.dirname(fileURLToPath(import.meta.url)),
  resolvePluginsRelativeTo: path.dirname(
    require.resolve('@react-native/eslint-config'),
  ),
});

export default [
  {ignores: ['coverage/**', '**/*.mjs']},
  ...fixupConfigRules(compat.extends('@react-native')),
];
