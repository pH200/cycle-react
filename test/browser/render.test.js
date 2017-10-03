const r = require('react').createElement;
const renderer = require('react-test-renderer');
const {component} = require('../../src');

describe('render', () => {
  jest.useRealTimers();
  afterEach(done => setTimeout(done, 1));

  it('should throw if definitionFn returns bad output', () => {
    expect(() => {
      renderer.create(r(component('test', () => {})));
    }).toThrowError(/definitionFn given to/);
  });
});
