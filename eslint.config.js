const {fixupConfigRules} = require('@eslint/compat');
const reactNativeConfig = require('@react-native/eslint-config/flat');
const typescriptParser = require('@typescript-eslint/parser');

// RN 规则中仍有旧版插件 API，通过官方兼容层适配 ESLint 10。
module.exports = [
  {
    ignores: ['node_modules/**', 'android/**', 'ios/**', 'build/**', 'dist/**', '.htyf/**'],
  },
  ...fixupConfigRules(reactNativeConfig),
  {
    // RN 配置中的 Babel parser 尚不支持 ESLint 10 的 scope API；项目 JS 无 Flow 语法。
    files: ['**/*.{js,jsx,cjs,mjs}'],
    languageOptions: {parser: typescriptParser},
  },
];
