'use strict';
let Cycle = require('../../src');
let React = require('react');
let ReactDOM = require('react-dom');
let {App} = require('./app');

ReactDOM.render(
  React.createElement(App, {context: window.appContext}),
  document.querySelector('.app-container')
);
