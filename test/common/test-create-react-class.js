'use strict';
/* global describe, it */
let assert = require('assert');
let Cycle = require('../../');
let Rx = require('rx');

describe('component', function () {
  it('should have a default rootTagName', function () {
    let MyElement = Cycle.component(
      'MyElement',
      () => Rx.Observable.empty()
    );
    let element = MyElement.prototype.render();
    assert.strictEqual(element.type, 'div');
  });

  it('should overwrite rootTagName', function () {
    let MyElement = Cycle.component(
      'MyElement',
      () => Rx.Observable.empty(),
      {rootTagName: 'h3'}
    );
    let element = MyElement.prototype.render();
    assert.strictEqual(element.type, 'h3');
  });

  it('should not overwrite rootTagName by null options', function () {
    let MyElement = Cycle.component(
      'MyElement',
      () => Rx.Observable.empty(),
      {rootTagName: null}
    );
    let element = MyElement.prototype.render();
    assert.strictEqual(element.type, 'div');
  });

  it('should have default mixins', function () {
    let MyElement = Cycle.component(
      'MyElement',
      () => Rx.Observable.empty()
    );
    assert.strictEqual(
      typeof MyElement.prototype.shouldComponentUpdate,
      'function'
    );
  });
});
