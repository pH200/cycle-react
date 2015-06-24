'use strict';
var Rx = require('rx');
var applyToDOM = require('./render-dom');
var makeInteractions = require('./interactions').makeInteractions;

function makeGet(interactions, rootElem$) {
  return function get(selector) {
    if (selector === ':root') {
      return rootElem$;
    }
  };
}

function makeDOMDriver(container) {
  return function reactDOMDriver(definition$) {
    if (!definition$) {
      return {};
    }
    var rootElem$ = new Rx.Subject();
    var interactions = makeInteractions(rootElem$);
    var subscription = definition$.subscribe(function render(definitionFn) {
      var renderMeta = applyToDOM(container, definitionFn);
      rootElem$.onNext(renderMeta.container);
    });

    return {
      get: makeGet(interactions, rootElem$),
      dispose: function dispose() {
        subscription.dispose();
        rootElem$.dispose();
      }
    };
  };
}

module.exports = makeDOMDriver;
