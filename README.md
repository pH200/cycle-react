# react-rx

An [RxJS Observable](https://github.com/Reactive-Extensions/RxJS) interface
to [Facebook's React](http://facebook.github.io/react/).

This is an experiment project for implementing
[Cycle.js](https://github.com/staltz/cycle) by using
[React](https://github.com/facebook/react) as backend.

react-rx is a fork of Cycle.js. Cycle.js is an awesome framework with
remarkable concepts built-in. The only difference between Cycle.js and react-rx
is Cycle.js rendering [virtual-dom](https://github.com/Matt-Esch/virtual-dom)
while react-rx rendering React elements.

## Installing

```
npm install react-rx
```

## Example

```js
var ReactRx = require('react-rx');
var h = ReactRx.h;

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

ReactRx.applyToDOM('.js-container', computer);
```

Custom elements:

```js
var ReactRx = require('react-rx');
var React = ReactRx.React;
var Rx = ReactRx.Rx;
var h = ReactRx.h;

// "createReactClass" returns native react class which can be used normally
// by "React.createElement" and "ReactRx.applyToDOM".
var CounterText = ReactRx.createReactClass('CounterText',
  function (interactions, props$) {
    return props$.get('counter').map(function (counter) {
      return h('h3', String(counter));
    });
  }
);

var Timer = ReactRx.createReactClass('Timer', function () {
  return Rx.Observable.interval(1000).map(function (i) {
    return h(CounterText, {counter: i});
  });
});

ReactRx.applyToDOM('.js-container', Timer);
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
