module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // 'prettier/@typescript-eslint' has been merged into 'prettier'
    'plugin:prettier/recommended',
  ],
  rules: {
    'prettier/prettier': 'error',
    'linebreak-style': 0,
    // If the semi problem persists, explicitly set it here too:
    semi: 'off',
  },
}
