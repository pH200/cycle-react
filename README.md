# Cycle-React

[![Build Status](https://travis-ci.org/pH200/cycle-react.svg?branch=master)](https://travis-ci.org/pH200/cycle-react)

An [RxJS](https://github.com/ReactiveX/rxjs) functional interface
to [Facebook's React](https://reactjs.org/).

Cycle-React creates custom [React](https://github.com/facebook/react)
[Hooks](https://reactjs.org/docs/hooks-intro.html) and allow applications
to be written in functional style and control data flow with Observables.

Additionally, Cycle-React is inspired by a beautiful
framework called [Cycle.js](https://github.com/cyclejs/cycle-core).

## Installing

```
npm install cycle-react react rxjs
```

React v16.8 or later is **required**.

Currently, Only RxJS 6 is supported. For migrating RxJS with cycle-react v7, see release note for details.

## Example

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { useInteractions } from 'cycle-react';
import { map } from 'rxjs/operators'

const [interactions, useCycle] = useInteractions(
  '', // Initial state
  { // Interaction operators
    onNameChange: map(ev => currentState => ev.target.value)
  }
);

function View() {
  const name = useCycle();
  return (
    <div>
      <label>Name:</label>
      <input type="text"
             onChange={interactions('onNameChange')} />
      <hr />
      <h1>Hello {name}</h1>
    </div>
  );
}

ReactDOM.render(
  <View />,
  document.querySelector('.js-container')
);
```

`interactions` is a collection containing all user interaction events happening
on the user-defined event handlers on the DOM, which you can define by providing
`Object.<string, function>`. And the event handler for DOM can be defined by
`interactions.listener(eventName)` or simply `interactions(eventName)`.

Function `useInteractions` subscribes the Observable which is the combination of all
interactions merged together, and calls `setState` from `useState(initialState)`.
By connecting `interactions` and `setState`, the Observable of user interactions and
state changes is completed.

You can learn more about the concept behind `interactions` and `Cycle` from
André's amazing presentation:
["What if the user was a function?"](https://youtu.be/1zj7M1LnJV4)

## From Redux to Cycle-React

Redux | Cycle-React
--- | ---
Actions | Interactions name
Reducers | Interactions operator
Store | Interactions object and side-effect from useCycle
Provider | [createContext](https://reactjs.org/docs/context.html) - Check example TodoMVC for details.
dispatch(action) | interactions(action)

## Learn more

Cycle-React is a React-style implementation of Cycle.js, so we have the same
concept of handling user interactions. Learn more on:
http://cycle.js.org/dialogue.html

In addition, we're working on the documentation site for Cycle-React with more
useful examples, too. Stay tuned!

## React Native

Example can be found at [examples/native](/examples/native)

## FAQ

### What operators are used from RxJS 6?

[src/rxjs-adapter.js](/src/rxjs-adapter.js)

Specifically, `merge` and `Subject` from `rxjs`, and `scan`, `startWith` from `rxjs/operators`.

### Can I use Cycle-React with [Redux](https://redux.js.org/)?

Not recommended anymore after Cycle-React 7.0. Think Cycle-React as a concise RxJS version of Redux.

### Can I host a Cycle-React application in another Cycle-React application?

Nested composition has not supported yet.

## Run examples

`npm run examples` starts an HTTP server that shows examples

## Community

* Ask "_how do I...?_" questions in Cycle-React's Gitter: <br/>
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pH200/cycle-react?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
* Propose and discuss significant changes as a GitHub issues

## Contributions and thanks

- [@cem2ran](https://github.com/cem2ran) for adding the support of React Native
- [@corps](https://github.com/corps) for implementing the render scheduler feature

## License

[The MIT License](/LICENSE)
