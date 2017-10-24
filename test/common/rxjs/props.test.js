const makePropsObservable = require('../../../src/adapter/rxjs/props');

describe('makePropsObservable', () => {
  it('should be an observable for all properties', (done) => {
    const props = makePropsObservable({foo: 'bar'});
    props.subscribe(p => {
      expect(p.foo).toBe('bar');
      done();
    });
  });
});
