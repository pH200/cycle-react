'use strict';
var createCustomEvent = require('./CustomEvent');
var PlainCustomEvent = require('./plain-custom-event');

function createCustomEventWithOption(type, eventInitDict, noDispatch) {
  if (noDispatch) {
    return new PlainCustomEvent(type, eventInitDict.detail);
  }
  return createCustomEvent(type, eventInitDict);
}

module.exports = createCustomEventWithOption;
