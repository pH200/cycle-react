'use strict';
let Cycle = require('../../src/cycle');
let React = Cycle.React;
let {App} = require('./app');

React.render(
  React.createElement(App, {context: window.appContext}),
  document.querySelector('.app-container'));
// or
// Cycle.applyToDOM(
//   '.app-container',
//   () => Cycle.Rx.Observable.just(
//     Cycle.h(App, {context: window.appContext})
//   )
// );
