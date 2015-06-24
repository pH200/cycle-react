/* globals process */
'use strict';
var createEventSubject = require('./event-subject');

function makeInteractions() {
  var subjects = {};

  function getEventSubject(name) {
    if (name === null || name === (void 0)) {
      throw new Error('Invalid name for the interaction collection.');
    }
    if (!subjects[name]) {
      subjects[name] = createEventSubject();
    }
    return subjects[name];
  }

  return {
    get: getEventSubject,
    listener: function listener(name) {
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
        eventSubject = getEventSubject(name);
      }
      return eventSubject.onEvent;
    }
  };
}

module.exports = {
  makeInteractions: makeInteractions
};
