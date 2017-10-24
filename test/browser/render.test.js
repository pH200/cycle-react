const r = require('react').createElement;
const renderer = require('react-test-renderer');
const {component} = require('../../src/rxjs');

describe('render', () => {
  jest.useRealTimers();
  afterEach(done => setTimeout(done, 1));

  it('should throw if definitionFn returns bad output', () => {
    /* eslint-disable no-console */
    const tempConsoleError = console.error;
    console.error = jest.fn();

    expect(() => {
      renderer.create(r(component('test', () => {})));
    }).toThrowError(/definitionFn given to/);

    console.error = tempConsoleError;
  });
});
