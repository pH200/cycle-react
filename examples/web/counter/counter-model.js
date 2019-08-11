// This example merges the "intent" tier into the "model" tier.
// See "many" and "todomvc" for MVI examples.
import {map} from 'rxjs/operators'

export default function model() {
  return {
    // equal to: observable => map(() => counter => counter + 1)(observable)
    onIncrement: map(() => counter => counter + 1),
    onDecrement: map(() => counter => counter - 1)
  };
}
