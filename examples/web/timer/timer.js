import React from 'react';
import ReactDOM from 'react-dom';
import { useInteractions } from 'cycle-react/rxjs';
import { interval } from 'rxjs'
import { map } from 'rxjs/operators'

const [interactions, useCycle] = useInteractions(
  0, // initial state
  {}, // no interactions
  [interval(1000).pipe(map(() => counter => counter + 1 ))] // sinks
);

function Counter({counter}) {
  return <h3>Seconds Elapsed: {counter}</h3>
}

function Timer() {
  const i = useCycle();
  return (
    <Counter counter={i} />
  );
}

ReactDOM.render(
  <Timer />,
  document.querySelector('.js-container')
);
