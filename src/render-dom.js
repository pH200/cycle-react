/* jshint browser:true */
'use strict';
var React = require('react');
var component = require('./create-react-class');

function isElement(obj) {
  return (
    typeof HTMLElement === 'object' ?
    obj instanceof HTMLElement || obj instanceof DocumentFragment : //DOM2
    obj && typeof obj === 'object' && obj !== null &&
    (obj.nodeType === 1 || obj.nodeType === 11) &&
    typeof obj.nodeName === 'string'
  );
}

function applyToDOM(container, definitionFn) {
  // Find and prepare the container
  var domContainer = (typeof container === 'string') ?
    document.querySelector(container) :
    container;
  // Check pre-conditions
  if (typeof container === 'string' && domContainer === null) {
    throw new Error('Cannot render into unknown element \'' + container + '\'');
  } else if (!isElement(domContainer)) {
    throw new Error('Given container is not a DOM element neither a selector string.');
  }

  if (!(definitionFn && typeof definitionFn === 'function')) {
    throw new Error('Invalid definitionFn');
  }
  if (definitionFn.prototype.render) {
    return React.render(React.createElement(definitionFn), domContainer);
  }

  var RxReactRoot = component('RxReactRoot', definitionFn);
  React.render(React.createElement(RxReactRoot), domContainer);

  return {
    container: domContainer
  };
}

module.exports = applyToDOM;
