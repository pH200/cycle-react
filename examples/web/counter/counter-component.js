import React from 'react';
import {component} from 'cycle-react/rxjs';
import 'rxjs/Rx';

// Use separate interactions-type for the counter component to show
// every component has a isolated interaction collection.
const CounterInteractions = {
  increment: 'increment',
  decrement: 'decrement',
  incrementIfOdd: 'incrementIfOdd'
};

const Counter = component('Counter', (interactions, props) => {
  const events = {
    onIncrement: interactions.get(CounterInteractions.increment),
    onDecrement: interactions.get(CounterInteractions.decrement),
    onIncrementIfOdd: interactions.get(CounterInteractions.incrementIfOdd)
  };
  const {
    increment,
    decrement,
    incrementIfOdd
  } = interactions.bindListeners(CounterInteractions);
  const viewObservable = props.pluck('counter').map(counter =>
    <p>
      Clicked: {counter} times
      {' '}
      <button onClick={increment}>+</button>
      {' '}
      <button onClick={decrement}>-</button>
      {' '}
      <button onClick={incrementIfOdd}>Increment if odd</button>
    </p>
  );
  return {
    view: viewObservable,
    events: events
  };
});

export default Counter;
