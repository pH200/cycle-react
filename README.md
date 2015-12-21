# Cycle-React

[![Build Status](https://travis-ci.org/pH200/cycle-react.svg?branch=master)](https://travis-ci.org/pH200/cycle-react)

An [RxJS](https://github.com/Reactive-Extensions/RxJS) functional interface
to [Facebook's React](http://facebook.github.io/react/).

Cycle-React allows users to write [React](https://github.com/facebook/react)
applications in functional style and represents their UIs as Observables.
In addition, Cycle-React is immutable and
[optimizes](https://facebook.github.io/react/docs/pure-render-mixin.html)
the component updates internally by default.

Additionally, Cycle-React is also a React-style implementation of a beautiful
framework called [Cycle.js](https://github.com/cyclejs/cycle-core).

## Installing

```
npm install cycle-react react rx
```

## Example

```js
const Cycle = require('cycle-react');
const React = require('react');
const ReactDOM = require('react-dom');

const Hello = Cycle.component('Hello', function computer(interactions) {
  return interactions.get('OnNameChanged')
    .map(ev => ev.target.value)
    .startWith('')
    .map(name =>
      <div>
        <label>Name:</label>
        <input type="text" onChange={interactions.listener('OnNameChanged')} />
        <hr />
        <h1>Hello {name}</h1>
      </div>
    );
});

ReactDOM.render(
  <Hello />,
  document.querySelector('.js-container')
);
```

The input of the function `computer` is `interactions`, a collection containing
all user interaction events happening on the user-defined event handlers on the
DOM, which you can query using `interactions.get(eventName)`. And the event
handler can be defined by `interactions.listener(eventName)`.

The output of the `computer` is `Observable<ReactElement>`
(a reactive sequence of elements, in other words, view).

Function `component` subscribes that Observable of elements and create a new
React component class, which can be used normally by `React.createElement` and
`ReactDOM.render`.

Notice that although `class` is mentioned here, you don't have to
use it. That's why Cycle-React was made. We took functions over classes
and mutable states.

You can learn more about the concept behind `applyToDOM` and `Cycle` from
André's amazing presentation:
["What if the user was a function?"](https://youtu.be/1zj7M1LnJV4)

## React component example

```js
const Cycle = require('cycle-react');
const React = require('react');
const ReactDOM = require('react-dom');
const Rx = require('rx');

// "component" returns a native React component which can be used normally
// by "React.createElement".
let Counter = Cycle.component('Counter', function (interactions, props) {
  return props.get('counter').map(counter =>
    <h3>Seconds Elapsed: {counter}</h3>
  );
});

let Timer = Cycle.component('Timer', function () {
  return Rx.Observable.interval(1000).map(i =>
    <Counter counter={i} />
  );
});

ReactDOM.render(
  <Timer />,
  document.querySelector('.js-container')
);
```

## Learn more

Cycle-React is a React-style implementation of Cycle.js, so we have the same
concept of handling user interactions. Learn more on:
http://cycle.js.org/dialogue.html

In addition, we're working on the documentation site for Cycle-React with more
useful examples, too. Stay tuned!

## React Native

To use Cycle-React with React Native, import Cycle-React with
`cycle-react/native`.
Example can be found at [examples/native](/examples/native)

```js
var {component} = require('cycle-react/native');
var Rx = require('rx');
var Hello = component('Hello', () =>
  Rx.Observable.just(<Text>Hello!</Text>)
);
```

## FAQ

### Can I use Cycle-React with Flux (e.g. [redux](https://github.com/gaearon/redux))

Absolutely. Since Cycle-React's `component` creates native React components,
there's nothing stopping you from using Flux architecture.

**HOWEVER**, we don't really recommend to use Flux when you already had Rx or
other event stream libraries at your disposal. Instead, we recommend the MVI
architecture which also achieves unidirectional data flow. See
["Reactive MVC and the Virtual DOM"](http://futurice.com/blog/reactive-mvc-and-the-virtual-dom)
and ["Good bye Flux, welcome Bacon/Rx?"](https://medium.com/@milankinen/good-bye-flux-welcome-bacon-rx-23c71abfb1a7)
for more details.

### Can I use Cycle-React with [react-hot-loader](https://github.com/gaearon/react-hot-loader)?

Yes. And no extra configuration needed.

[Example](https://github.com/cycle-react-examples/react-hot-boilerplate)

### Can I use Cycle-React with other React components and libraries?

Yes. You can also integrate Cycle-React with your current React apps. Because
`component` creates the native React component for you.

Examples for integrating Cycle-React with other libraries are work in progress.

Meanwhile, See ["Working with React"](/docs/working-with-react.md)
for guidelines.

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
