import model from './counter-model';
import Counter from './counter-component';
import React from 'react';
import ReactDOM from 'react-dom';
import {useInteractions} from 'cycle-react/rxjs';

const [interactions, useCycle] = useInteractions(
  0, // initial state
  model() // model
);

function Root() {
  // Setup useState, useEffect and get state from useState
  const state = useCycle();
  return (
    <div>
      <Counter value={state}
               onIncrement={interactions.listener('onIncrement')}
               onDecrement={interactions.listener('onDecrement')} />
      <hr />
      <p>Compare with <a href="https://github.com/gaearon/redux/tree/v3.7.2/examples/counter">redux</a></p>
    </div>
  );
}

ReactDOM.render(
  <Root />,
  document.querySelector('.js-container')
);
