/* eslint-disable canonical/filename-match-exported */
import { type Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // moduleDirectories: ['node_modules', 'src', '../shared/helpers'],
  // modulePaths: ['node_modules', 'src', '../shared'], // https://jestjs.io/docs/next/configuration#modulepaths-arraystring
  moduleNameMapper: {
    // '^@App/(.*)$': '<rootDir>/src/$1',
    // '^../shared/(.*)$': '<rootDir>/shared/$1',
    '@Shared/(.*)': '<rootDir>/../shared/$1',
  },
  // roots: ['<rootDir>/src', '<rootDir>/../shared'], // https://jestjs.io/docs/next/configuration#roots-arraystring
};

export default config;
