'use strict';
/* global describe, it */
let assert = require('assert');
let Cycle = require('../../src/cycle');
let createEventSubject = Cycle.createEventSubject;

describe('Cycle', function () {
  describe('API', function () {
    it('should have `applyToDOM`', function () {
      assert.strictEqual(typeof Cycle.applyToDOM, 'function');
    });

    it('should have `renderAsHTML`', function () {
      assert.strictEqual(typeof Cycle.renderAsHTML, 'function');
    });

    it('should have `createReactClass`', function () {
      assert.strictEqual(typeof Cycle.createReactClass, 'function');
    });

    it('should have `createEventSubject`', function () {
      assert.strictEqual(typeof Cycle.createEventSubject, 'function');
    });

    it('should have a shortcut to Rx', function () {
      assert.strictEqual(typeof Cycle.Rx, 'object');
    });

    it('should have a shortcut to React', function () {
      assert.strictEqual(typeof Cycle.React, 'object');
    });

    it('should have a shortcut to h', function () {
      assert.strictEqual(typeof Cycle.h, 'function');
    });
  });

  describe('createReactClass', function () {
    it('should have a default rootTagName', function () {
      let MyElement = Cycle.createReactClass(
        'MyElement',
        () => Rx.Observable.empty()
      );
      let element = MyElement.prototype.render();
      assert.strictEqual(element.type, 'div');
    });

    it('should overwrite rootTagName', function () {
      let MyElement = Cycle.createReactClass(
        'MyElement',
        () => Rx.Observable.empty(),
        {rootTagName: 'h3'}
      );
      let element = MyElement.prototype.render();
      assert.strictEqual(element.type, 'h3');
    });

    it('should not overwrite rootTagName by null options', function () {
      let MyElement = Cycle.createReactClass(
        'MyElement',
        () => Rx.Observable.empty(),
        {rootTagName: null}
      );
      let element = MyElement.prototype.render();
      assert.strictEqual(element.type, 'div');
    });

    it('should have default mixins', function () {
      let MyElement = Cycle.createReactClass(
        'MyElement',
        () => Rx.Observable.empty()
      );
      assert.strictEqual(
        typeof MyElement.prototype.shouldComponentUpdate,
        'function'
      );
    });

    it('should overwrite mixins', function () {
      let MyElement = Cycle.createReactClass(
        'MyElement',
        () => Rx.Observable.empty(),
        {mixins: []}
      );
      assert.equal(MyElement.prototype.shouldComponentUpdate, null);
    });

    it('should not overwrite mixins by null options', function () {
      let MyElement = Cycle.createReactClass(
        'MyElement',
        () => Rx.Observable.empty(),
        {mixins: null}
      );
      assert.strictEqual(
        typeof MyElement.prototype.shouldComponentUpdate,
        'function'
      );
    });
  })

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

    it('should have onEvent binded', function (done) {
      let subject = createEventSubject();
      let onEvent = subject.onEvent;

      subject.subscribe(function (value) {
        assert.strictEqual(value, 1);
        done();
      });

      onEvent(1);
    });
  });
});
