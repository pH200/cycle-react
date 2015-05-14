'use strict';
/* global describe, it */
let assert = require('assert');
let Rx = require('rx');
let EventEmitter = require('events').EventEmitter;
let {
  makeInteractions, makeEmptyInteractions
} = require('../../src/interactions');

describe('emptyInteractions', function () {
  it('should have get() returns empty observable', function () {
    let interactions = makeEmptyInteractions();
    assert.doesNotThrow(function () {
      interactions.get().subscribe(() => {
        throw new Error('should not onNext');
      });
    });
  });

  it('should have getEventSubject() returns empty observable', function () {
    let interactions = makeEmptyInteractions();
    assert.doesNotThrow(function () {
      interactions.getEventSubject('foo').subscribe(() => {
        throw new Error('should not onNext');
      });
    });
  });

  it('should have subject alias of getEventSubject', function () {
    let interactions = makeEmptyInteractions();
    assert.strictEqual(interactions.subject, interactions.getEventSubject);
  });
})

describe('interactions', function () {
  it('should get events', function (done) {
    let rootElem = new EventEmitter();
    let root$ = Rx.Observable.just(rootElem);
    let interactions = makeInteractions(root$);

    interactions.get('', 'foo', false, true).subscribe(function (value) {
      assert.strictEqual(value, 'bar');
      done();
    });
    rootElem.emit('foo', 'bar');
  });

  it('should provide collection of EventSubjects by getEventSubject', function (done) {
    let interactions = makeInteractions();
    interactions.getEventSubject('foo').subscribe(function (value) {
      assert.strictEqual(value, 'bar');
      done();
    });
    let proxyHandler = interactions.getEventSubject('foo').onEvent;
    proxyHandler('bar');
  });

  it('should have subject alias of getEventSubject', function () {
    let interactions = makeInteractions();
    assert.strictEqual(interactions.subject, interactions.getEventSubject);
  });
});
