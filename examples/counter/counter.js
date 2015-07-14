import {applyToDOM} from 'cycle-react';
import makeModel from './counter-model';
import makeView from './counter-view';

applyToDOM(
  '.js-container',
  (interactions) => makeView(interactions, makeModel(interactions))
);
// Use React.render instead of applyToDOM:
// React.render(
//   React.createElement(
//     component(
//       'Root',
//       (interactions) => makeView(interactions, makeModel(interactions))
//     )
//   ),
//   document.querySelector('.js-container')
// );
