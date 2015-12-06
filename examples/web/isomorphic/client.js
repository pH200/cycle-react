'use strict';
let Cycle = require('../../');
let React = require('react');
let ReactDOM = require('react-dom');
let {App} = require('./app');

ReactDOM.render(
  React.createElement(App, {context: window.appContext}),
  document.querySelector('.app-container')
);
