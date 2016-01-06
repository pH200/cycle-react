'use strict';
/* global describe, it */
let assert = require('assert');
let Cycle = require('../../');

describe('Cycle', function () {
  describe('API', function () {
    it('should have `component`', function () {
      assert.strictEqual(typeof Cycle.component, 'function');
    });

    it('should have `viewComponent`', function () {
      assert.strictEqual(typeof Cycle.viewComponent, 'function');
    });
  });
});
