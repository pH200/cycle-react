const manyIntent = require('./many-intent');
const manyModel = require('./many-model');
const manyView = require('./many-view');
const Cycle = require('cycle-react');

Cycle.applyToDOM('.js-container', function computer(interactions) {
  return manyView(manyModel(manyIntent(interactions)), interactions);
});
