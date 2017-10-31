import manyIntent from './many-intent';
import manyModel from './many-model';
import manyView from './many-view';
import {component} from 'cycle-react/rxjs';
import React from 'react';
import ReactDOM from 'react-dom';

const Root = component('Root', function computer(interactions) {
  return manyView(manyModel(manyIntent(interactions)), interactions);
});

ReactDOM.render(
  <Root />,
  document.querySelector('.js-container')
);
