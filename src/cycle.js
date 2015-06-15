'use strict';
var applyToDOM = require('./render-dom');
var renderAsHTML = require('./render-html');
var component = require('./create-react-class');
var makeDOMDriver = require('./cycle-driver');
var React = require('react');
var Rx = require('rx');
var h = require('./h');

var Cycle = {
  /**
   * Takes a `computer` function which outputs an Observable of React
   * elements, and renders that into the DOM element indicated by `container`,
   * which can be either a CSS selector or an actual element. At the same time,
   * provides the `interactions` input to the `computer` function, which is a
   * collection of all possible events happening on all elements which were
   * rendered. You must query this collection with
   * `interactions.get(selector, eventName)` in order to get an Observable of
   * interactions of type `eventName` happening on the element identified by
   * `selector`.
   * Example: `interactions.get('.mybutton', 'click').map(ev => ...)`
   *
   * @param {(String|HTMLElement)} container the DOM selector for the element
   * (or the element itself) to contain the rendering of the VTrees.
   * @param {Function} computer a function that takes `interactions` as input
   * and outputs an Observable of React elements.
   * @function applyToDOM
   */
  applyToDOM: applyToDOM,

  /**
   * Converts a given Observable of React elements (`vtree$`) into an
   * Observable of corresponding HTML strings (`html$`). The provided `vtree$`
   * must complete (must call onCompleted on its observers) in finite time,
   * otherwise the output `html$` will never emit an HTML string.
   *
   * @param {Rx.Observable} vtree$ Observable of React elements.
   * @return {Rx.Observable} an Observable emitting a string as the HTML
   * renderization of the React element.
   * @function renderAsHTML
   */
  renderAsHTML: renderAsHTML,

  /**
   * Takes a `definitionFn` function which outputs an Observable of React
   * elements, and returns a native React component which can be used normally
   * by `React.createElement` and "Cycle.applyToDOM".
   *
   * The given `definitionFn` function takes two parameters as input, in this order:
   * `interactions` and `properties`. The former works just like it does in the
   * `definitionFn` function given to `applyToDOM`, and the later contains
   * Observables representing properties of the custom element, given from the
   * parent context. `properties.get('foo')` will return the Observable `foo$`.
   *
   * The `definitionFn` must output an object containing the property `vtree$`
   * as an Observable. If the output object contains other Observables, then
   * they are treated as custom events of the custom element.
   *
   * The `options` is optional and can be ignored in most cases.
   *
   * options example:
   *
   *     component('displayName', definitionFn, {
   *       rootTagName: 'div',
   *       mixins: [],
   *       propTypes: null,
   *       disableHotLoader: false,
   *       bindThis: false
   *     });
   *
   * `opt.rootTagName` is the default tagName for the root element.
   * Normally, you don't need to set this option if your root element is div or
   * you have an initial value for the vtree$. Examples:
   *
   *     // The element for the first render would be <h1 />
   *     component('displayName', () => Rx.Observable.just(<h1 />), {
   *       rootTagName: 'div'
   *     });
   *
   *     // The element for the first render would be <div></div>,
   *     // and the second element would be <h1 /> (after 1000ms)
   *     component('displayName',
   *       () => Rx.Observable.timer(1000).map(() => <h1 />), {
   *       rootTagName: 'div'
   *     });
   *
   *     // The element for the first render would be <h2 />,
   *     // and the second element would be <h1 /> (after 1000ms)
   *     // rootTagName has no effect in this case
   *     component('displayName',
   *       () => Rx.Observable.timer(1000)
   *         .map(() => <h1 />)
   *         .startWith(<h2 />), {
   *       rootTagName: 'div'
   *     });
   *
   * @param {String} displayName a name for identifying the React component.
   * @param {Function} definitionFn the implementation for the custom element.
   * This function takes two arguments: `interactions`, and `properties`, and
   * should output an object of Observables.
   * @param {Object} [options] the options for component.
   * @function component
   */
  component: component,

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
  Rx: Rx,

  /**
   * This is a helper for creating VTrees in Views. The API is identical to
   * [virtual-hyperscript](
   * https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript)
   * but returns React element tree instead.
   * @name h
   */
  h: h
};

module.exports = Cycle;
