'use strict';
var Rx = require('rx');
var createEventSubject = require('./event-subject');

function makeEmptyInteractions() {
  function getEventSubject() {
    return createEventSubject();
  }
  return {
    get: function get() {
      return Rx.Observable.empty();
    },
    granularGet: function granularGet() {
      return Rx.Observable.empty();
    },
    subject: getEventSubject,
    getEventSubject: getEventSubject
  };
}

function makeInteractions(rootElem$) {
  var subjects = {};
  function getEventSubject(name) {
    if (name === null || name === (void 0)) {
      return createEventSubject();
    }
    if (!subjects[name]) {
      subjects[name] = createEventSubject();
    }
    return subjects[name];
  }
  function match(selector, isRoot) {
    return function filterSelector(e) {
      if (isRoot) {
        return true;
      }
      var className = selector.replace(/^\./, '');
      var classRegex = new RegExp('\\b' + className + '\\b');
      if (classRegex.test(e.target.className)) {
        return true;
      }
      if (e.target.matches) {
        return e.target.matches(selector);
      }
      if (e.target.matchesSelector) {
        return e.target.matchesSelector(selector);
      }
      if (e.target.webkitMatchesSelector) {
        return e.target.webkitMatchesSelector(selector);
      }
      if (e.target.mozMatchesSelector) {
        return e.target.mozMatchesSelector(selector);
      }
      if (e.target.msMatchesSelector) {
        return e.target.msMatchesSelector(selector);
      }
      return false;
    };
  }

  return {
    get: function get(selector, eventName, isSingle, isRoot) {
      if (typeof selector !== 'string') {
        throw new Error('interactions.get() expects first argument to be a ' +
          'string as a CSS selector');
      }
      if (typeof eventName !== 'string') {
        throw new Error('interactions.get() expects second argument to be a ' +
          'string representing the event type to listen for.');
      }
      return rootElem$
        .distinctUntilChanged(Rx.helpers.identity, function compareNode(x , y) {
          return x === y || x.isEqualNode(y);
        })
        .flatMapLatest(function flatMapDOMUserEventStream(rootElem) {
          if (!rootElem) {
            return Rx.Observable.empty();
          }
          var eventObservable = Rx.Observable.fromEvent(rootElem, eventName)
            .filter(match(selector, isRoot));
          if (isSingle) {
            return eventObservable.take(1);
          }
          return eventObservable;
        });
    },
    granularGet: function granularGet(selector, eventName, isSingle, isRoot) {
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
          if (isRoot || klassRegex.test(rootElem.className)) {
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
    subject: getEventSubject,
    getEventSubject: getEventSubject
  };
}

module.exports = {
  makeEmptyInteractions: makeEmptyInteractions,
  makeInteractions: makeInteractions
};
