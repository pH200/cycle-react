'use strict';
var applyToDOM = require('./src/render-dom');
var createReactClass = require('./src/create-react-class');
var makeDOMDriver = require('./src/cycle-driver');
var React = require('react');
var Rx = require('rx');

var Cycle = {
  /**
   * The component's definition function.
   *
   * @callback DefinitionFn
   * @param {Object} interactions - The collection of events.
   * @param {Object} props - The observable for React props.
   * @param {Object} [self] - "this" object for the React component.
   * @returns {}
   */
  /**
   * The component's definition.
   *
   * @typedef {(Observable<ReactElement>|{
   *   view: Observable<ReactElement>,
   *   events: ?Object,
   *   dispose: ?Function
   * })} ComponentDefinition
   */
  /**
   * Takes a `computer` function which outputs an Observable of React
   * elements, and renders that into the DOM element indicated by `container`.
   *
   * @function applyToDOM
   * @param {(String|HTMLElement)} container the DOM selector for the element
   * (or the element itself) to contain the rendering of the VTrees.
   * @param {DefinitionFn} computer a function that takes `interactions` as input
   * and outputs an Observable of React elements.
   */
  applyToDOM: applyToDOM,

  /**
   * Takes a `DefinitionFn` function which outputs an Observable of React
   * elements, and returns a native React component which can be used normally
   * by `React.createElement` and "Cycle.applyToDOM".
   *
   * @function component
   * @param {String} displayName - A name which identifies the React component.
   * @param {DefinitionFn} definitionFn - The implementation for the React component.
   * This function takes two arguments: `interactions`, and `properties`, and
   * should output an Observable of React elements.
   * @param {Object} [options] - The options for component.
   * @returns {ReactComponent} The React component.
   */
  component: createReactClass(React),

  /**
   * A factory for the Cycle.js DOM driver function. See docs/cycle-js-driver.md
   * for details.
   *
   * @param {(String|HTMLElement)} container the DOM selector for the element
   * (or the element itself) to contain the rendering of the VTrees.
   * @return {Function} the DOM driver function. The function expects an
   * Observable of definitionFn as input, and outputs the response object for this
   * driver, containing functions `get()` and `dispose()` that can be used for
   * debugging and testing.
   * @function makeDOMDriver
   */
  makeDOMDriver: makeDOMDriver,

  /**
   * A shortcut to the root object of React.
   * @name React
   */
  React: React,

  /**
   * A shortcut to the root object of [RxJS](https://github.com/Reactive-Extensions/RxJS).
   * @name Rx
   */
  Rx: Rx
};

module.exports = Cycle;
