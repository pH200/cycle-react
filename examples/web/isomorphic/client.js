const React = require('react');
const ReactDOM = require('react-dom');
const {App} = require('./app');

ReactDOM.render(
  React.createElement(App, {context: window.appContext}),
  document.querySelector('.app-container')
);
