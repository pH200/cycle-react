'use strict';
/* global describe, it */
let assert = require('assert');
let Cycle = require('../../src/cycle');

describe('Cycle', function () {
  describe('API', function () {
    it('should have `applyToDOM`', function () {
      assert.strictEqual(typeof Cycle.applyToDOM, 'function');
    });

    it('should have `renderAsHTML`', function () {
      assert.strictEqual(typeof Cycle.renderAsHTML, 'function');
    });

    it('should have `component`', function () {
      assert.strictEqual(typeof Cycle.component, 'function');
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
});
