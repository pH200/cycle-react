'use strict';
var React = require('react');
var Rx = require('rx');
var digestDefinitionFnOutput = require('./util').digestDefinitionFnOutput;
var makeInteractions = require('./interactions').makeInteractions;
var makeEmptyPropsObservable = require('./props').makeEmptyPropsObservable;

function renderAsHTML(definitionFn) {
  var computer;
  var isReactClass = false;
  if (definitionFn &&
    typeof definitionFn === 'object' &&
    typeof definitionFn.subscribe === 'function')
  {
    computer = function componentFromObservable() {
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
    computer(makeInteractions(), makeEmptyPropsObservable())
  );
  return cycleComponent.vtree$
    .map(function convertReactElementToString(vtree) {
      return React.renderToString(vtree);
    });
}

module.exports = renderAsHTML;
