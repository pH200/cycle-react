'use strict';
var document = require("global/document");
var window = require("global/window");

var createCustomEvent;
if (window && window.CustomEvent && typeof window.CustomEvent === 'function') {
  createCustomEvent = function createCustomEvent(type, eventInitDict) {
    return new window.CustomEvent(type, eventInitDict);
  };
} else if (document && document.createEvent) {
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
