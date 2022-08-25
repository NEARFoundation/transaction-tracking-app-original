// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
  },
  extends: ['near'],
  globals: {
    console: true,
    process: true,
    window: true,
  },
  rules: {
    'no-console': 'off',
  },
};
