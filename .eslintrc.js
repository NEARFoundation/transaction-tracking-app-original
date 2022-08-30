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
    'no-console': 'off',
  },
};
