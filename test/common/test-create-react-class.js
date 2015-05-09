'use strict';
/* global describe, it */
let assert = require('assert');
let Cycle = require('../../src/cycle');
let Rx = Cycle.Rx;

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

  it('should not bind `this` for definitionFn by default', function () {
    let plan = 0;
    let MyElement = Cycle.createReactClass(
      'MyElement',
      (_1, _2, self) => {
        assert.equal(self, null);
        plan++;
        return Rx.Observable.empty();
      }
    );
    let element = new MyElement();
    element.componentWillMount();
    assert.strictEqual(plan, 1);
  });

  it('should be able to bind `this` for definitionFn', function () {
    let plan = 0;
    let MyElement = Cycle.createReactClass(
      'MyElement',
      (_1, _2, self) => {
        assert.strictEqual(self.foo, 'bar');
        plan++;
        return Rx.Observable.empty();
      },
      {
        bindThis: true,
        mixins: [{foo: 'bar'}]
      }
    );
    let element = new MyElement();
    element.componentWillMount();
    assert.strictEqual(plan, 1);
  });

  it('should override forceUpdate for react-hot-loader', function () {
    let MyElement = Cycle.createReactClass(
      'MyElement',
      () => Rx.Observable.empty(),
      // _testForceHotLoader is only for tests
      // The override for react-hot-loader is enabled by default
      // if module.hot == true
      {_testForceHotLoader: true}
    );
    assert.strictEqual(
      MyElement.prototype.forceUpdate.name,
      'hotForceUpdate'
    );
  });

  it('should not override forceUpdate by default', function () {
    let MyElement = Cycle.createReactClass(
      'MyElement',
      () => Rx.Observable.empty()
    );
    if (MyElement.prototype.forceUpdate) {
      assert.notStrictEqual(
        MyElement.prototype.forceUpdate.name,
        'hotForceUpdate'
      );
    }
  });
});
