// https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/

/* eslint-disable canonical/filename-match-exported */
import { type JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  // [...]
  preset: 'ts-jest/presets/default-esm', // or other ESM presets
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  setupFiles: ['dotenv/config'], // https://stackoverflow.com/a/66765765/ and https://stackoverflow.com/a/70665834/
};

export default jestConfig;
