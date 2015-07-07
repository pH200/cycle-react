# Cycle-React

[![Build Status](https://travis-ci.org/pH200/cycle-react.svg?branch=master)](https://travis-ci.org/pH200/cycle-react)

An [RxJS](https://github.com/Reactive-Extensions/RxJS) functional interface
to [Facebook's React](http://facebook.github.io/react/).

Cycle-React allows users to write [React](https://github.com/facebook/react)
applications in functional style and represents their UIs as Observables.
In addition, Cycle-React is immutable and uses
[PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html)
internally by default.

Additionally, Cycle-React is also a React-style implementation of a beautiful
framework called [Cycle.js](https://github.com/cyclejs/cycle-core).

## Installing

```
npm install cycle-react
```

## Example

```js
let Cycle = require('cycle-react');
let React = require('react');

function computer(interactions) {
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
}

Cycle.applyToDOM('.js-container', computer);
```

The input of the `computer` is `interactions`, a collection containing all
user interaction events happening on the user-defined event handlers on the DOM,
which you can query using `interactions.get(eventName)`. And the event handler
can be defined by `interactions.listener(eventName)`.

The output of the `computer` is `Observable<ReactElement>`
(a reactive sequence of elements, in other words, view).

Function `applyToDOM` subscribes that Observable of elements and renders the
elements to DOM, by using `React.createClass` and `React.render` internally.

Notice that although `React.createClass` is mentioned here, you don't have to
use it. That's why Cycle-React was made. We took functions over classes
and mutable states.

You can learn more about the concept behind `applyToDOM` and `Cycle` from
André's amazing presentation:
["What if the user was a function?"](https://youtu.be/1zj7M1LnJV4)

## React component example

```js
let Cycle = require('cycle-react');
let React = require('react');
let Rx = Cycle.Rx;

// "component" returns a native React component which can be used normally
// by "React.createElement" and "Cycle.applyToDOM".
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

Cycle.applyToDOM('.js-container', Timer);
// or
// React.render(
//   React.createElement(Timer),
//   document.querySelector('.js-container'));
```

## Learn more

Cycle-React is a React-style implementation of Cycle.js, so we have the same
concept of handling user interactions. Learn more on:
http://cycle.js.org/dialogue.html

In addition, we're working on the documentation site for Cycle-React with more
useful examples, too. Stay tuned!

## Cycle.js Driver

Cycle.js (not Cycle-React) has the
[driver architecture](http://cycle.js.org/drivers.html) to externalize the
side-effects. Cycle Web, for example, is a driver externalizes DOM environment.
And Cycle-React provides a DOM driver (powered by React, of course)
for Cycle.js, too.

Details can be found at
["Using Cycle-React's DOM driver for Cycle.js"](/docs/cycle-js-driver.md).

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

## License

[The MIT License](/LICENSE)
