# Working with React

You can ignore following guidelines if you're not going to work with other
React components. And it's perfectly fine if you want to do that, Cycle-React
provides you everything essential for rolling your own components. However,
if you have to work with other React components or libraries, these guidelines
could be helpful.

## Event handler

If you have used Cycle.js (not Cycle-React), you must have known that DOM
`dispatchEvent` and the selector API are used for dealing with interactions
for the [Cycle Web driver](http://cycle.js.org/basic-examples.html).
However, React components use event handler(from props) instead of
DOM events for child-parent communications. As a result, Cycle-React provides
interactions API that different from Cycle.js for receiving these events. You
must use event handlers for handling events in Cycle-React.

In addition, the Observables inside of the `events` object from your Cycle-React
components will be converted to event handlers.

Example:

```js
// Define event for the component
let MyElement = Cycle.component('MyElement', function definition() {
  return {
    view: Rx.Observable.just(<h3 className="myelement">My Element</h3>),
    events: {
      // The event observable
      onTickEvent: Rx.Observable.interval(500)
    }
  }
});
// Subscribing events
<MyElement onTickEvent={interactions.listener('OnTickEvent')} />
// Getting observable for the event
interactions.get('OnTickEvent'); // Observable<T>
```

## Lifecycle events

You can query your component's
[lifecycle events](https://facebook.github.io/react/docs/component-specs.html)
through the `interactions` collection. The key for the lifecycle event is the
event name with the `React_` prefix.

Note: Although Cycle-React provides all lifecycle events available, the only
two reasonable events are `componentDidMount` and `componentDidUpdate`.
You should not manipulate the DOM element directly except from these two events.

Example:

```js
let MyElement = Cycle.component('MyElement', function (interactions, props, self) {
  // Get the lifecycle event collection for componentDidMount
  let componentDidMountObservable = interactions.get('React_componentDidMount');

  return componentDidMountObservable.map(() => {
    // Find the DOM node from "self"
    let node = ReactDOM.findDOMNode(self);
    // ...
    return <div>The element</div>;
  });
});
```

Keys for lifecycle events:

- React_componentWillMount
- React_componentDidMount
- React_componentWillReceiveProps
- React_componentWillUpdate
- React_componentDidUpdate
- React_componentWillUnmount

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

The third parameter of `definitionFn` is `self`, which represents `this` of
your created React class.

Normally, you don't want to use this. However, it might be required for
working with some React components.

Example:

```js
let Navigation = require('react-router').Navigation;
let options = {
  mixins: [Navigation]
};
let MyElement = Cycle.component('MyElement', function (_1, _2, self) {
  return Rx.Observable.just(<div onClick={() => self.goBack()}>Go back</div>);
}, options);
```

## react-hot-loader

Cycle-React supports
[react-hot-loader](https://github.com/gaearon/react-hot-loader).

Cycle-React overrides `forceUpdate` when `module.hot == true`
(webpack hot module enabled). No extra configuration needed.
This overriding behavior only affects the component created by Cycle-React
and has no effect if webpack-hot-module was disabled.
