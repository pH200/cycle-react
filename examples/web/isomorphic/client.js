const React = require('react');
const ReactDOM = require('react-dom');
const {createApp} = require('./app');

ReactDOM.hydrate(
  React.createElement(createApp(window.appContext)),
  document.querySelector('.app-container')
);
