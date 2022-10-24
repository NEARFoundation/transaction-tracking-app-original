/* TODO: Discuss whether our shared Eslint rules should be updated such that we won't need to define these overrides. 
Also, we should add to that library:
    // https://eslint.org/docs/rules/max-lines
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],

    // https://eslint.org/docs/rules/max-lines-per-function
    'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
*/

// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
  },
  extends: ['near', 'eslint:recommended', 'plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'], // https://stackoverflow.com/a/58513127/
  globals: {
    console: true,
    process: true,
    window: true,
  },
  rules: {
    curly: 'error', // https://eslint.org/docs/latest/rules/curly
    'canonical/sort-keys': 'off',
    'no-console': 'warn',
    'consistent-return': 'off',
    'func-style': 'off',
    'import/extensions': 'off',
    // https://eslint.org/docs/rules/max-lines
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],

    // https://eslint.org/docs/rules/max-lines-per-function
    'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
  },
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  ignorePatterns: ['.eslintrc.cjs'] // https://stackoverflow.com/a/65063702/
};
