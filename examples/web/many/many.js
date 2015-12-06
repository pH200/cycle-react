const manyIntent = require('./many-intent');
const manyModel = require('./many-model');
const manyView = require('./many-view');
const Cycle = require('cycle-react');
const React = require('react');
const ReactDOM = require('react-dom');

const Root = Cycle.component('Root', function computer(interactions) {
  return manyView(manyModel(manyIntent(interactions)), interactions);
});

ReactDOM.render(
  <Root />,
  document.querySelector('.js-container')
);
