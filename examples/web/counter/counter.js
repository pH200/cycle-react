import {applyToDOM} from 'cycle-react';
import makeModel from './counter-model';
import makeView from './counter-view';
import React from 'react';
import {component} from 'cycle-react';

React.render(
  React.createElement(
    component(
      'Root',
      (interactions) => makeView(interactions, makeModel(interactions))
    )
  ),
  document.querySelector('.js-container')
);
