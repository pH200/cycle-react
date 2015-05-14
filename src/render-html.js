'use strict';
var React = require('react');
var Rx = require('rx');
var digestDefinitionFnOutput = require('./util').digestDefinitionFnOutput;
var makeEmptyInteractions = require('./interactions').makeEmptyInteractions;

function makeEmptyPropsObservable() {
  var empty = Rx.Observable.empty();
  empty.get = function getProp() {
    return Rx.Observable.empty();
  };
  return empty;
}

function renderAsHTML(definitionFn) {
  var computer;
  var isReactClass = false;
  if (definitionFn &&
    typeof definitionFn === 'object' &&
    typeof definitionFn.subscribe === 'function')
  {
    computer = function createReactClassFromObservable() {
      return definitionFn;
    };
  } else if (definitionFn && typeof definitionFn === 'function') {
    if (definitionFn.prototype.render) {
      isReactClass = true;
    } else {
      computer = definitionFn;
    }
  }
  if (!isReactClass && !computer) {
    throw new Error('Invalid definitionFn');
  }
  if (isReactClass) {
    var reactElement = React.createElement(definitionFn);
    return Rx.Observable.just(React.renderToString(reactElement));
  }

  var cycleComponent = digestDefinitionFnOutput(
    computer(makeEmptyInteractions(), makeEmptyPropsObservable())
  );
  return cycleComponent.vtree$
    .map(function convertReactElementToString(vtree) {
      return React.renderToString(vtree);
    });
}

module.exports = renderAsHTML;
