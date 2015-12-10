'use strict';
/* global describe, it */
let assert = require('assert');
let Rx = require('rx');
let EventEmitter = require('events').EventEmitter;
let makeInteractions = require('../../src/interactions');

describe('interactions', function () {
  it('should provide collection of interactions', function (done) {
    let interactions = makeInteractions();
    interactions.get('foo').subscribe(function (value) {
      assert.strictEqual(value, 'bar');
      done();
    });
    let proxyHandler = interactions.listener('foo');
    proxyHandler('bar');
  });

  it('should return the same interaction observable from the same key', function () {
    let interactions = makeInteractions();
    assert.strictEqual(
      interactions.get('foo'),
      interactions.get('foo')
    );
  });

  it('should return the object of listeners by bindListeners', function (done) {
    let interactions = makeInteractions();
    let interactionTypes = {
      foo: 'onFoo',
      foo2: 'onFoo2'
    };
    let foo = interactions.get(interactionTypes.foo);
    let foo2 = interactions.get(interactionTypes.foo2);
    Rx.Observable.zip(
      foo.tap(value => assert.strictEqual(value, 'bar')),
      foo2.tap(value => assert.strictEqual(value, 'bar2')),
      () => null
    ).subscribe(done);
    let listeners = interactions.bindListeners(interactionTypes);
    assert.ok(listeners.foo);
    assert.ok(listeners.foo2);
    // test listeners
    listeners.foo('bar');
    // test listener key
    interactions.listener(interactionTypes.foo2)('bar2');
  });

  it('should throw error when the key is null', function () {
    let interactions = makeInteractions();
    assert.throws(() => interactions.get(), /Invalid name/i);
    assert.throws(() => interactions.get(null), /Invalid name/i);
  });

  it('should warn when `listener` is used before `get`', function (done) {
    let interactions = makeInteractions();
    let tempConsoleWarn = console.warn;
    console.warn = function warn(message) {
      assert.ok(/foo/.test(message));
      console.warn = tempConsoleWarn;
      done();
    };
    interactions.listener('foo');
  });
});
