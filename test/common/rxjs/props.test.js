const makePropsObservable = require('../../../src/adapter/rxjs/props');

describe('makePropsObservable', () => {
  it('should be an observable for all properties', (done) => {
    const props = makePropsObservable({foo: 'bar'});
    props.subscribe(p => {
      expect(p.foo).toBe('bar');
      done();
    });
  });

  it('has `get(propertyName)` returns observable for the property', (done) => {
    const props = makePropsObservable({foo: 'bar'});
    props.get('foo').subscribe(foo => {
      expect(foo).toBe('bar');
      done();
    });
  });

  it('has `get("*")` returns observable for all properties', (done) => {
    const props = makePropsObservable({foo: 'bar'});
    props.get('*').subscribe(p => {
      expect(p.foo).toBe('bar');
      done();
    });
  });

  it('has `getAll()` returns observable for all properties', (done) => {
    const props = makePropsObservable({foo: 'bar'});
    props.getAll().subscribe(p => {
      expect(p.foo).toBe('bar');
      done();
    });
  });
});
