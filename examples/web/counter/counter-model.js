// This example merges the "intent" tier into the "model" tier.
// See "many" and "todomvc" for MVI examples.
import Rx from 'rx';
import {
  onIncrement,
  onDecrement,
  onIncrementIfOdd
} from './interaction-types';

export default function makeModel(interactions) {
  const incrementMod = interactions.get(onIncrement)
    .map(() => counter => counter + 1);
  const decrementMod = interactions.get(onDecrement)
    .map(() => counter => counter - 1);
  const incrementIfOddMod = interactions.get(onIncrementIfOdd)
    .map(() => counter => counter % 2 === 0 ? counter : counter + 1);

  return Rx.Observable.merge(
    incrementMod,
    decrementMod,
    incrementIfOddMod
  ).startWith(0) // 0 is the initial state
  .scan((counterState, mod) => mod(counterState));
}
