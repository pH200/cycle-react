const makeInteractions = require('../../src/interactions');

function mockCreateEventSubject() {
  const mockSubject = {
    onEvent: jest.fn(),
    subscribe: jest.fn()
  };
  return {
    mockFn: jest.fn(() => mockSubject),
    mockSubject
  };
}

describe('interactions', () => {
  it('should provide collection of interactions', () => {
    const {mockFn, mockSubject} = mockCreateEventSubject();
    const interactions = makeInteractions(mockFn);
    const observable = interactions.get('foo');
    expect(observable).toBe(mockSubject);
    const proxyHandler = interactions.listener('foo');
    proxyHandler('bar');
    expect(mockSubject.onEvent).toBeCalledWith('bar');
  });

  it('should return the same interaction observable from the same key', () => {
    const interactions = makeInteractions(jest.fn(() => []));
    expect(interactions.get('foo'))
      .toBe(interactions.get('foo'));
  });

  it('should return the object of listeners by bindListeners', () => {
    const {mockFn, mockSubject} = mockCreateEventSubject();
    const interactions = makeInteractions(mockFn);
    const interactionTypes = {
      foo: 'onFoo',
      foo2: 'onFoo2'
    };
    interactions.get(interactionTypes.foo);
    interactions.get(interactionTypes.foo2);

    const listeners = interactions.bindListeners(interactionTypes);
    expect(listeners.foo).toBeDefined();
    expect(listeners.foo2).toBeDefined();
    // test listeners
    listeners.foo('bar');
    expect(mockSubject.onEvent).toBeCalledWith('bar');
    // test listener key
    interactions.listener(interactionTypes.foo2)('bar2');
    expect(mockSubject.onEvent).toBeCalledWith('bar2');
  });

  it('should return the object of all listeners by bindAllListeners', () => {
    const {mockFn, mockSubject} = mockCreateEventSubject();
    const interactions = makeInteractions(mockFn);
    interactions.get('foo');
    interactions.get('foo2');

    const listeners = interactions.bindAllListeners();
    expect(listeners.foo).toBeDefined();
    expect(listeners.foo2).toBeDefined();
    // test listeners
    listeners.foo('bar');
    expect(mockSubject.onEvent).toBeCalledWith('bar');
    // test listener key
    interactions.listener('foo2')('bar2');
    expect(mockSubject.onEvent).toBeCalledWith('bar2');
  });

  it('should throw error when the key is null', () => {
    const interactions = makeInteractions(mockCreateEventSubject);
    expect(() => interactions.get()).toThrowError(/Invalid name/i);
    expect(() => interactions.get(null)).toThrowError(/Invalid name/i);
  });

  it('should warn when `listener` is used before `get`', (done) => {
    /* eslint-disable no-console */
    const interactions = makeInteractions(mockCreateEventSubject);
    const tempConsoleWarn = console.warn;
    console.warn = function warn(message) {
      expect(message).toMatch(/foo/);
      console.warn = tempConsoleWarn;
      done();
    };
    interactions.listener('foo');
  });
});
