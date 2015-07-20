'use strict';
let Cycle = require('../../');
let React = require('react');
let {App} = require('./app');

React.render(
  React.createElement(App, {context: window.appContext}),
  document.querySelector('.app-container'));
// or
// Cycle.applyToDOM(
//   '.app-container',
//   () => Rx.Observable.just(<App context={window.appContext} />)
// );
