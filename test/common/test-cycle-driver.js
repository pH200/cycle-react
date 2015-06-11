'use strict';
/* global describe, it */
let assert = require('assert');
let makeDOMDriver = require('../../src/cycle-driver');

describe('makeDOMDriver', function () {
  it('should return a driver function', function () {
    let driver = makeDOMDriver('.root');
    assert.strictEqual(typeof driver, 'function');
  });
});
