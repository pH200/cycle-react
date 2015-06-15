'use strict';
var createCustomEvent = require('./CustomEvent');
var PlainCustomEvent = require('./plain-custom-event');

function createCustomEventWithOption(type, eventInitDict, target, noDispatch) {
  if (noDispatch) {
    return new PlainCustomEvent(type, eventInitDict.detail, target);
  }
  return createCustomEvent(type, eventInitDict);
}

module.exports = createCustomEventWithOption;
