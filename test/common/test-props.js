'use strict';
/* global describe, it */
let assert = require('assert');
let Rx = require('rx');
let makePropsObservable = require('../../src/rx/props');

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
