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
const MyElement = Cycle.component('MyElement', function definition() {
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
through the third parameter `lifecycle` for definitionFn.

The key for the lifecycle event is the lifecycle name itself.

Note: Although Cycle-React provides all lifecycle events from React, the only
two reasonable events are `componentDidMount` and `componentDidUpdate`.
You should not manipulate the DOM element directly except from these two events.

Example:

```js
const MyElement = Cycle.component('MyElement', function (interactions, props, lifecycles) {
  // Get the observable for componentDidMount
  const componentDidMountObservable = lifecycles.componentDidMount;

  return componentDidMountObservable.map(() => {
    // Event handler for componentDidMountEvent
    return <div>The element</div>;
  });
});
```

Supported lifecycle events:

- componentWillMount
- componentDidMount
- componentWillReceiveProps
- componentWillUpdate
- componentDidUpdate
- componentWillUnmount

## Refs

Use [Interactions API](/docs/interactions.md) to generate callback function for
[refs](https://facebook.github.io/react/docs/refs-and-the-dom.html).

Example:

```js
const MyElement = Cycle.component(
  'MyElement',
  (interactions) =>
    interactions
      .get('onRefUpdate')
      // Handling with ref callback
      // Function parameter is the DOM element
      .do((textInput) => textInput.focus())
      .startWith('')
      .map(() => (
        // Listening ref with interactions
        <input type="text"
               ref={interactions.listener('onRefUpdate')} />
      ))
);
```

## react-hot-loader

Cycle-React supports
[react-hot-loader](https://github.com/gaearon/react-hot-loader).

Cycle-React overrides `forceUpdate` when `module.hot == true`
(webpack hot module enabled). No extra configuration needed.
This overriding behavior only affects the component created by Cycle-React
and has no effect if webpack-hot-module was disabled.
