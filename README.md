# cycle-react

An [RxJS](https://github.com/Reactive-Extensions/RxJS) functional interface
to [Facebook's React](http://facebook.github.io/react/).

cycle-react allows you to write [React](https://github.com/facebook/react)
applications in functional style.
No classes, no mixins and no boilerplates. In addition,
cycle-react is immutable and uses
[PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html)
internally by default.

Additionally, cycle-react is also a React-style implementation of a beautiful
framework called [Cycle.js](https://github.com/staltz/cycle).

## Installing

```
npm install cycle-react
```

## Example

```js
let Cycle = require('cycle-react');
let React = Cycle.React;

function computer(interactions) {
  return interactions.get('.myinput', 'input')
    .map(ev => ev.target.value)
    .startWith('')
    .map(name =>
      <div>
        <label>Name:</label>
        <input className="myinput" type="text"></input>
        <hr />
        <h1>Hello {name}</h1>
      </div>
    );
}

Cycle.applyToDOM('.js-container', computer);
```

The input of the `computer` is `interactions`, a collection containing all
possible user interaction events happening on elements on the DOM, which you
can query using `interactions.get(selector, eventType)`.

The output of the `computer` is `IObservable<ReactElement>`
(a reactive sequence of elements, in other words, view).

Function `applyToDOM` subscribes that Observable of elements and renders the
elements to DOM, by using `React.createClass` and `React.render` internally.

Notice that although `React.createClass` is mentioned here, you don't have to
use it. That's why cycle-react was made. We took functions over classes
and mutable states.

The description of the concept behind `applyToDOM` can be found at
[Cycle.js](https://github.com/staltz/cycle)'s page.

## Custom element example

```js
let Cycle = require('cycle-react');
let React = Cycle.React;
let Rx = Cycle.Rx;

// "createReactClass" returns a native react class which can be used normally
// by "React.createElement" and "Cycle.applyToDOM".
let CounterText = Cycle.createReactClass('CounterText',
  function (interactions, props$) {
    return props$.get('counter').map(counter => <h3>{counter}</h3>);
  }
);

let Timer = Cycle.createReactClass('Timer', function () {
  return Rx.Observable.interval(1000).map(i =>
    <CounterText counter={i}></CounterText>
  );
});

Cycle.applyToDOM('.js-container', Timer);
// or
// React.render(
//   React.createElement(Timer),
//   document.querySelector('.js-container'));
```

You can use `h` and without JSX just like you did in Cycle.js.
This was made possible by
[react-hyperscript](https://github.com/mlmorg/react-hyperscript).

[The example](https://github.com/pH200/cycle-react/blob/master/examples/timer/timer.js).

## But you said no classes

`createReactClass` transforms your `computer()` function into a ReactClass. So,
you get a ReactClass but without writing a class definition. The point is that
ReactClass **is** a function indeed and it should always be used as a
function object, because you don't `new`, `extends` or `this` to access
properties. In fact, we don't want you to do that.

Apps written in cycle-react are `this`-less. You won't find a single `this`
in the examples.

## Learn more

cycle-react shares the same API as Cycle.js, except of doing custom elements.
A more comprehensive README can be found at
https://github.com/staltz/cycle

## Build standalone js

```
NODE_ENV=production npm run dist
```

## Disclaimer

### Work in progress

Just like Cycle.js, changes to API will occur before 1.0.
