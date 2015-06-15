/* jshint browser:true */
'use strict';

var createCustomEvent;
if (typeof window !== 'undefined' &&
  window.CustomEvent &&
  typeof window.CustomEvent === 'function')
{
  createCustomEvent = function createCustomEventDefault(type, eventInitDict) {
    return new window.CustomEvent(type, eventInitDict);
  };
} else if (typeof document !== 'undefined' && document.createEvent) {
  // http://www.w3.org/TR/dom/#customevent
  createCustomEvent = function createCustomEventShim(type, eventInitDict) {
    var params = eventInitDict || {};
    var evt = document.createEvent('CustomEvent');
    if (evt.initCustomEvent) {
      evt.initCustomEvent(
        type,
        !!params.bubbles,
        !!params.cancelable,
        params.detail
      );
    }
    return evt;
  };
}

module.exports = createCustomEvent;
