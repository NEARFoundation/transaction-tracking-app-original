// https://www.npmjs.com/package/eslint-config-near

/* TODO: Discuss whether our shared Eslint rules should be updated such that we won't need to define these overrides. 
Also, we should add to that library:
    // https://eslint.org/docs/rules/max-lines
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],

    // https://eslint.org/docs/rules/max-lines-per-function
    'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
*/

/* eslint-env node */

module.exports = {
  extends: ['near'],
  rules: {
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
};
