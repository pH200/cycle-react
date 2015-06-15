'use strict';
/* global describe, it */
let assert = require('assert');
let PlainCustomEvent = require('../../src/plain-custom-event');
let createCustomEventWithOption = require('../../src/create-custom-event');

describe('PlainCustomEvent', function () {
  it('should have property "type"', function () {
    let event = new PlainCustomEvent('click', null);
    assert.strictEqual(event.type, 'click');
  });

  it('should have property "detail"', function () {
    let event = new PlainCustomEvent('click', 'foo');
    assert.strictEqual(event.detail, 'foo');
  });
});

describe('createCustomEventWithOption', function () {
  it('should create PlainCustomEvent when the "noDispatch" option is true', function () {
    let event = createCustomEventWithOption('click', {
      detail: 'foo'
    }, true);
    assert.strictEqual(event.type, 'click');
    assert.strictEqual(event.detail, 'foo');
    // Should not have preventDefault since it's not a DOM event
    assert.strictEqual(event.preventDefault, (void 0));
  });
});
