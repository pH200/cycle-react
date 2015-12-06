const React = require('react');
const ReactDOM = require('react-dom');
const {component} = require('../../../');

module.exports = function applyToDOM(container, definitionFn) {
  const domContainer = (typeof container === 'string') ?
    document.querySelector(container) :
    container;

  if (definitionFn.prototype.render) {
    return ReactDOM.render(React.createElement(definitionFn), domContainer);
  }

  const RxReactRoot = component('RxReactRoot', definitionFn);
  ReactDOM.render(React.createElement(RxReactRoot), domContainer);
};
