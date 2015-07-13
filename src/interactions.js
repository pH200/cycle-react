/* globals process */
'use strict';
var createEventSubject = require('./event-subject');

function makeInteractions() {
  var subjects = {};

  function get(name) {
    if (name === null || name === (void 0)) {
      throw new Error('Invalid name for the interaction collection.');
    }
    if (!subjects[name]) {
      subjects[name] = createEventSubject();
    }
    return subjects[name];
  }

  function listener(name) {
    var eventSubject = subjects[name];
    if (!eventSubject && process.env.NODE_ENV !== 'production') {
      if (typeof console !== 'undefined') {
        console.warn(
          'Listening event "' + name + '" before using interactions.get("' +
          name + '")'
        );
      }
    }
    if (!eventSubject) {
      eventSubject = get(name);
    }
    return eventSubject.onEvent;
  }

  function bindListeners(interactionTypes) {
    var result = {};
    var names = Object.keys(interactionTypes);
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      result[name] = listener(interactionTypes[name]);
    }
    return result;
  }

  return {
    get: get,
    listener: listener,
    bindListeners: bindListeners
  };
}

module.exports = {
  makeInteractions: makeInteractions
};
