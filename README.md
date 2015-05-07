# cycle-react

An [RxJS Observable](https://github.com/Reactive-Extensions/RxJS) interface
to [Facebook's React](http://facebook.github.io/react/).

This is an experiment project for implementing
[Cycle.js](https://github.com/staltz/cycle) by using
[React](https://github.com/facebook/react) as backend.

cycle-react is a fork of Cycle.js. Cycle.js is an awesome framework with
remarkable concepts built-in. The only difference between Cycle.js and cycle-react
is Cycle.js rendering [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
while cycle-react rendering React elements.

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
        h('input.myinput', {attributes: {type: 'text'}}),
        h('hr'),
        h('h1', 'Hello ' + name)
      ]);
    });
}

Cycle.applyToDOM('.js-container', computer);
```

Custom elements:

```js
var Cycle = require('cycle-react');
var React = Cycle.React;
var Rx = Cycle.Rx;
var h = Cycle.h;

// "createReactClass" returns native react class which can be used normally
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
//  React.createElement(Timer),
//  document.querySelector('.js-container'));
```

## Build standalone js

```
NODE_ENV=production npm run dist
```

## TODO

- documentations
- fix renderAsHTML
- fix examples
- more tests
