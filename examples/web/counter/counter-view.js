import React from 'react';
import * as InteractionTypes from './interaction-types';
import Counter from './counter-component';

export default function makeView(interactions, model) {
  return model.map(counter =>
    <div>
      <Counter counter={counter}
               {...interactions.bindListeners(InteractionTypes)} />
      <hr />
      <p>Compare with <a href="https://github.com/gaearon/redux/tree/v3.7.2/examples/counter">redux</a></p>
    </div>
  );
}
