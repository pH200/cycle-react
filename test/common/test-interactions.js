'use strict';
/* global describe, it */
let assert = require('assert');
let Rx = require('rx');
let EventEmitter = require('events').EventEmitter;
let {makeInteractions} = require('../../src/interactions');

describe('interactions', function () {
  it('should provide collection of EventSubjects by get', function (done) {
    let interactions = makeInteractions();
    interactions.get('foo').subscribe(function (value) {
      assert.strictEqual(value, 'bar');
      done();
    });
    let proxyHandler = interactions.listener('foo');
    proxyHandler('bar');
  });

  it('should return created EventSubject from the inserted key', function () {
    let interactions = makeInteractions();
    assert.strictEqual(
      interactions.get('foo'),
      interactions.get('foo')
    );
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
