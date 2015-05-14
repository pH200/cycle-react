'use strict';
var Rx = require('rx');
var createEventSubject = require('./event-subject');

function makeEmptyInteractions() {
  return {
    get: function get() {
      return Rx.Observable.empty();
    },
    getEventSubject: function getEventSubject() {
      return createEventSubject();
    }
  };
}

function makeInteractions(rootElem$) {
  var subjects = {};
  return {
    get: function get(selector, eventName, isSingle) {
      if (typeof selector !== 'string') {
        throw new Error('interactions.get() expects first argument to be a ' +
          'string as a CSS selector');
      }
      if (typeof eventName !== 'string') {
        throw new Error('interactions.get() expects second argument to be a ' +
          'string representing the event type to listen for.');
      }
      return rootElem$
        .flatMapLatest(function flatMapDOMUserEventStream(rootElem) {
          if (!rootElem) {
            return Rx.Observable.empty();
          }
          var klass = selector.replace('.', '');
          var klassRegex = new RegExp('\\b' + klass + '\\b');
          if (klassRegex.test(rootElem.className)) {
            return Rx.Observable.fromEvent(rootElem, eventName);
          }
          if (isSingle) {
            var targetElement = rootElem.querySelector(selector);
            if (targetElement) {
              return Rx.Observable.fromEvent(targetElement, eventName);
            }
          } else {
            var targetElements = rootElem.querySelectorAll(selector);
            if (targetElements && targetElements.length > 0) {
              return Rx.Observable.fromEvent(targetElements, eventName);
            }
          }
          return Rx.Observable.empty();
        });
    },
    getEventSubject: function getEventSubject(name) {
      if (!subjects[name]) {
        subjects[name] = createEventSubject();
      }
      return subjects[name];
    }
  };
}

module.exports = {
  makeEmptyInteractions: makeEmptyInteractions,
  makeInteractions: makeInteractions
};
