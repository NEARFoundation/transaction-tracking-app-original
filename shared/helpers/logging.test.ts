// Run via `yarn test shared/helpers/logging.test.ts`

// https://jestjs.io/docs/getting-started#using-typescript

import { logSuccess } from './logging';

describe('logging helper', () => {
  logSuccess('something'); // This is just a hack to include the file
  const object = { ab: 'cd', one: { two: 3 } };
  //   console.log('log', object);
  //   console.error('test');

  const originalError = console.error; // save original console.error function

  //   beforeAll(() => {

  //   });

  beforeEach(() => {
    console.error = jest.fn(); // create a new mock function for each test
  });

  afterAll(() => {
    console.error = originalError; // restore after all tests
  });

  test('console.error', () => {
    // https://stackoverflow.com/a/62819452/
    const firstPart = 'Error';

    console.error(firstPart, object);
    // expect(console.error).toHaveBeenCalledWith(expect.stringContaining('something'));
    // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
    // @ts-ignore
    const message = console.error.mock.calls[0]; // get actual console message
    expect(message).toEqual([firstPart, object]); // TODO: Fix this expectation to expect a formatted datetime to be inserted first.
  });
});
