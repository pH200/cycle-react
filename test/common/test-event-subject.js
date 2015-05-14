'use strict';
/* global describe, it */
let assert = require('assert');
let createEventSubject = require('../../src/event-subject');

describe('createEventSubject', function () {
  it('should have onEvent', function () {
    let subject = createEventSubject();
    assert.strictEqual(typeof subject.onEvent, 'function');
  });

  it('should be a subject', function () {
    let subject = createEventSubject();
    assert.strictEqual(typeof subject.onNext, 'function');
    assert.strictEqual(typeof subject.onError, 'function');
    assert.strictEqual(typeof subject.onCompleted, 'function');
    assert.strictEqual(typeof subject.subscribe, 'function');
  });

  it('should have onEvent bound', function (done) {
    let subject = createEventSubject();
    let onEvent = subject.onEvent;

    subject.subscribe(function (value) {
      assert.strictEqual(value, 1);
      done();
    });

    onEvent(1);
  });
});
