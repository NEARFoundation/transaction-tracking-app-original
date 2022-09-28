/* eslint-disable canonical/filename-match-exported */
import { type Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // moduleDirectories: ['node_modules', 'src', 'shared/helpers'],
  modulePaths: ['node_modules', 'src', 'shared', 'server/src', 'server/node_modules'], // https://jestjs.io/docs/next/configuration#modulepaths-arraystring
  // TODO: https://jestjs.io/docs/next/configuration#projects-arraystring--projectconfig
};

export default config;
