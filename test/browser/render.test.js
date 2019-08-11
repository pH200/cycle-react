const r = require('react').createElement;
const renderer = require('react-test-renderer');
//const {useInteractions} = require('../../src/rxjs');

describe.skip('render', () => {
  jest.useRealTimers();
  afterEach(done => setTimeout(done, 1));

  it('should throw if definitionFn returns bad output', () => {
    /* eslint-disable no-console */
    const tempConsoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderer.create(r('div'));
    }).toThrowError(/Invalid definitionFn/);

    console.error = tempConsoleError;
  });

  it('should throw if templateFn returns bad output', () => {
    /* eslint-disable no-console */
    const tempConsoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderer.create(r('div'));
    }).toThrowError(/Invalid templateFn/);

    console.error = tempConsoleError;
  });
});
