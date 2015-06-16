# Working with React

You can ignore following guidelines if you're not going to work with other
React components. And it's perfectly fine if you want to do that, Cycle-React
provides you everything essential for rolling your own components. However,
if you have to work with other React components or libraries, these guidelines
could be helpful.

## Event handler

React components use event handler(from props) instead of `dispatchEvent` for
child-parent communications. Cycle-React provides EventSubject for receiving
these events. It's a Subject with an instance method `onEvent` and it has a
[simple](/src/event-subject.js)
implementation.
Details of using event handlers in Cycle-React can be found at
[interactions.getEventSubject](/docs/interactions.md#interactions.getEventSubject).

In addition, the properties inside of `events` object from your custom
element will be converted to event handlers of the rendered element.

Example:

```js
let MyElement = Cycle.component('MyElement', function definition() {
  return {
    view: Rx.Observable.just(<h3 className="myelement">My Element</h3>),
    events: {
      // The event observable
      tickEvent: Rx.Observable.interval(500)
    }
  }
});
// Cycle-React would also try to
// emit onTickEvent if ontickEvent was not found
<MyElement ontickEvent={myEventHandler} />
// You can still use interactions.get for Cycle-React's components
interactions.get('.myelement', 'tickEvent').map(...);
```

## Mixins

Working with mixins could make your Cycle-React apps written in a
less-functional style. However, it might be needed if you want to take
advantage of other React components.

`opts.mixins` is the mixins property used by React.createClass in
Cycle-React internally. This value must be an array.

Example:

```js
let options = {
  mixins: []
};
let MyElement = Cycle.component('MyElement', function () {
  // ...
}, options);
```

## this

`opts.bindThis` will pass the third parameter `self` to `definitionFn`.
`self` represents `this` of your created React class.
Normally, you don't want to use this. However, it might be required for
working with some React components.

Example:

```js
let Navigation = require('react-router').Navigation;
let options = {
  mixins: [Navigation],
  bindThis: true
};
let MyElement = Cycle.component('MyElement', function (_1, _2, self) {
  return Rx.Observable.just(<div onClick={() => self.goBack()}>Go back</div>)
}, options);
```

## Refs

If you've ever tried to set `ref` to the element with Cycle-React, you've
probably encountered this following error:

```
Invariant Violation: addComponentAsRefTo(...): Only a ReactOwner can have refs.
This usually means that you're trying to add a ref to a component that doesn't
have an owner (that is, was not created inside of another component's `render`
method).
```

This is because Cycle-React evaluates the vtree(ReactElement) inside the Rx
subscription instead of `Component.prototype.render`. In order to fix this,
you can return the lazy value of ReactElement with the option
`{bindThis: true}` set.

Example:

```js
let options = {
  // The bindThis option must be set
  bindThis: true
};
let MyElement = Cycle.component('MyElement', (_1, _2, self) => {
  // Return lambda instead of plain vtree
  return Rx.Observable.just(() => <input ref="myInput" />);
}, options);
```

## react-hot-loader

Cycle-React supports
[react-hot-loader](https://github.com/gaearon/react-hot-loader).

Cycle-React overrides `forceUpdate` when `module.hot == true`
(webpack hot module enabled). No extra configuration needed.
This overriding behavior only affects the component created by Cycle-React
and has no effect if webpack-hot-module was disabled.
