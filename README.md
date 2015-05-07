# react-rx

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

## TODO

- fix examples
- more tests
