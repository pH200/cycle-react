'use strict';
var Rx = require('rx');
var applyToDOM = require('./render-dom');

function makeGet(rootElem$) {
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
    var subscription = definition$.subscribe(function render(definitionFn) {
      var renderMeta = applyToDOM(container, definitionFn);
      rootElem$.onNext(renderMeta.container);
    });

    return {
      get: makeGet(rootElem$),
      dispose: function dispose() {
        subscription.dispose();
        rootElem$.dispose();
      }
    };
  };
}

module.exports = makeDOMDriver;
