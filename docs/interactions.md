# Interactions API

## interactions.get

Get the event observable from interactions collection.

Example:

```js
Cycle.applyToDOM('.js-container', function computer(interactions) {
  // get(eventName: string): Observable<any>
  return interactions.get('OnMyInput')
    .map(ev => ev.target.value)
    .startWith('')
    .map(inputValue =>
      <input type="text"
             value={inputValue}
             onChange={interactions.listener('OnMyInput')} />
    );
});
```

## interactions.listener

Create an event listener for receiving events from React components.

Example:

```js
// listener(eventName: string): (ev: any) => void
<input type="text" onChange={interactions.listener('OnMyInput')} />
```

## interactions.bindListeners

Create an object with event listeners that have the property names mapped from
the `interactionTypes` parameter.

This helper method is inspired by `bindActionCreators` from
[redux](https://github.com/gaearon/redux).

Example:

```js
// Define interaction types
let interactionTypes = {
  IncrementCounter: 'INCREMENT_COUNTER',
  DecrementCounter: 'DECREMENT_COUNTER'
};
// bindListeners(interactionsTypes: any): any
let listeners = interactions.bindListeners(interactionsTypes);
// View
<button onClick={listeners.IncrementCounter}>+1</button>
```

```js
// Intentions
import {IncrementCounter, DecrementCounter} from './interaction-types';
export default function intent(interactions) {
  return {
    incrementCounterObservable: interactions.get(IncrementCounter),
    decrementCounterObservable: interactions.get(DecrementCounter)
  };
}
```
