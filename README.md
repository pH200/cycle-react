# cycle-react

An [RxJS Functional](https://github.com/Reactive-Extensions/RxJS) interface
to [Facebook's React](http://facebook.github.io/react/).

cycle-react allows you to write [React](https://github.com/facebook/react)
applications in functional style.
No classes, no mixins and no boilerplates. In addition,
cycle-react is immutable and use
[PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html)
internally by default.

On the other hand, cycle-react is a React-style implementation of a beautiful
framework called [Cycle.js](https://github.com/staltz/cycle).

## Installing

```
npm install cycle-react
```

## Example

```js
var Cycle = require('cycle-react');
var h = Cycle.h;

function computer(interactions) {
  return interactions.get('.myinput', 'input')
    .map(function (ev) {
      return ev.target.value;
    })
    .startWith('')
    .map(function (name) {
      return h('div', [
        h('label', 'Name:'),
        h('input.myinput', {type: 'text'}),
        h('hr'),
        h('h1', 'Hello ' + name)
      ]);
    });
}

Cycle.applyToDOM('.js-container', computer);
```

The input of the `computer` is `interactions`, a collection containing all possible
user interaction events happening on elements on the DOM, which you can query using `interactions.get(selector, eventType)`. Function `applyToDOM` will take your `computer` function and plug it with the `user` function and solve the fixed point equation `vtree$ == computer(user(vtree$))`, where `vtree$` is an Observable of virtual DOM elements, the output of the `computer`. The result of this is Human-Computer Interaction, i.e. your UI program, happening under the container element selected by `'.js-container'`.

## Custom element example

```js
var Cycle = require('cycle-react');
var React = Cycle.React;
var Rx = Cycle.Rx;
var h = Cycle.h;

// "createReactClass" returns a native react class which can be used normally
// by "React.createElement" and "Cycle.applyToDOM".
var CounterText = Cycle.createReactClass('CounterText',
  function (interactions, props$) {
    return props$.get('counter').map(function (counter) {
      return h('h3', String(counter));
    });
  }
);

var Timer = Cycle.createReactClass('Timer', function () {
  return Rx.Observable.interval(1000).map(function (i) {
    return h(CounterText, {counter: i});
  });
});

Cycle.applyToDOM('.js-container', Timer);
// or
// React.render(
//   React.createElement(Timer),
//   document.querySelector('.js-container'));
```

## But you said no classes

`createReactClass` transforms your `computer()` function into a ReactClass. So,
you get a ReactClass but without writing a class definition. The point is that
ReactClass **is** a function indeed and it should always be used as a
function object, because you don't `new`, `extends` or `this` to access
properties. In fact, we don't want you to that.

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
