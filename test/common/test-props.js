'use strict';
/* global describe, it */
let assert = require('assert');
let Rx = require('rx');
let {
  makeEmptyPropsObservable,
  makePropsObservable
} = require('../../src/props');

describe('makeEmptyPropsObservable', function () {
  it('should be an empty observable', function (done) {
    let props = makeEmptyPropsObservable();
    props.subscribe(() => {
      throw new Error('Should not have element');
    }, () => {}, done);
  });

  it('should has `get()` returning empty observable', function (done) {
    let props = makeEmptyPropsObservable();
    props.get().subscribe(() => {
      throw new Error('Should not have element');
    }, () => {}, done);
  });

  it('should has `getAll()` returning empty observable', function (done) {
    let props = makeEmptyPropsObservable();
    props.getAll().subscribe(() => {
      throw new Error('Should not have element');
    }, () => {}, done);
  });
});

describe('makePropsObservable', function () {
  it('should be an observable for all properties', function (done) {
    let props = makePropsObservable({foo: 'bar'});
    props.subscribe(p => {
      assert.strictEqual(p.foo, 'bar');
      done();
    });
  });

  it('has `get(propertyName)` returns observable for the property', function (done) {
    let props = makePropsObservable({foo: 'bar'});
    props.get('foo').subscribe(foo => {
      assert.strictEqual(foo, 'bar');
      done();
    });
  });

  it('has `get("*")` returns observable for all properties', function (done) {
    let props = makePropsObservable({foo: 'bar'});
    props.get('*').subscribe(p => {
      assert.strictEqual(p.foo, 'bar');
      done();
    });
  });

  it('has `getAll()` returns observable for all properties', function (done) {
    let props = makePropsObservable({foo: 'bar'});
    props.getAll().subscribe(p => {
      assert.strictEqual(p.foo, 'bar');
      done();
    });
  });
});
