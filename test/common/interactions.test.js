const {Observable} = require('rx');
const createEventSubject = require('../../src/rx/event-subject');
const makeInteractions = require('../../src/interactions');

describe('interactions', () => {
  it('should provide collection of interactions', (done) => {
    const interactions = makeInteractions(createEventSubject);
    interactions.get('foo').subscribe((value) => {
      expect(value).toBe('bar');
      done();
    });
    const proxyHandler = interactions.listener('foo');
    proxyHandler('bar');
  });

  it('should return the same interaction observable from the same key', () => {
    const interactions = makeInteractions(createEventSubject);
    expect(interactions.get('foo'))
      .toBe(interactions.get('foo'));
  });

  it('should return the object of listeners by bindListeners', (done) => {
    const interactions = makeInteractions(createEventSubject);
    const interactionTypes = {
      foo: 'onFoo',
      foo2: 'onFoo2'
    };
    const foo = interactions.get(interactionTypes.foo);
    const foo2 = interactions.get(interactionTypes.foo2);
    Observable.zip(
      foo.tap(value => expect(value, 'bar')),
      foo2.tap(value => expect(value, 'bar2')),
      () => null
    ).subscribe(done);

    const listeners = interactions.bindListeners(interactionTypes);
    expect(listeners.foo).toBeDefined();
    expect(listeners.foo2).toBeDefined();
    // test listeners
    listeners.foo('bar');
    // test listener key
    interactions.listener(interactionTypes.foo2)('bar2');
  });

  it('should throw error when the key is null', () => {
    const interactions = makeInteractions(createEventSubject);
    expect(() => interactions.get()).toThrowError(/Invalid name/i);
    expect(() => interactions.get(null)).toThrowError(/Invalid name/i);
  });

  it('should warn when `listener` is used before `get`', (done) => {
    /* eslint-disable no-console */
    const interactions = makeInteractions(createEventSubject);
    const tempConsoleWarn = console.warn;
    console.warn = function warn(message) {
      expect(message).toMatch(/foo/);
      console.warn = tempConsoleWarn;
      done();
    };
    interactions.listener('foo');
  });
});
