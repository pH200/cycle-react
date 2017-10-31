import makeModel from './counter-model';
import makeView from './counter-view';
import React from 'react';
import ReactDOM from 'react-dom';
import {component} from 'cycle-react/rxjs';

const Root = component(
  'Root',
  (interactions) => makeView(interactions, makeModel(interactions))
);

ReactDOM.render(
  <Root />,
  document.querySelector('.js-container')
);
