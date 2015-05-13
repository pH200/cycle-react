var manyIntent = require('./many-intent');
var manyModel = require('./many-model');
var manyView = require('./many-view');
var Cycle = require('cycle-react');

Cycle.applyToDOM('.js-container', function computer(interactions) {
  return manyView(manyModel(manyIntent(interactions)), interactions);
});
