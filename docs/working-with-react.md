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

## Lifecycle events

You can query your component's
[lifecycle events](https://facebook.github.io/react/docs/component-specs.html)
through the forth parameter `lifecycle` for definitionFn.

The key for the lifecycle event is the lifecycle name itself.

Note: Although Cycle-React provides all lifecycle events from React, the only
two reasonable events are `componentDidMount` and `componentDidUpdate`.
You should not manipulate the DOM element directly except from these two events.

Example:

```js
let MyElement = Cycle.component('MyElement', function (interactions, props, self, lifecycles) {
  // Get the observable for componentDidMount
  let componentDidMountObservable = lifecycles.componentDidMount;

  return componentDidMountObservable.map(() => {
    // Find the DOM node from "self"
    let node = ReactDOM.findDOMNode(self);
    // ...
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

In order to use refs in React, your JSX elements must be created within a React.render method. However, Observables
do not, by default, get invoked within this render method, making refs unusable.  There are two approaches to fix:

1.  Return an Observable of functions containing the ReactElements.
```js
let MyElement = Cycle.component('MyElement', function (interactions, props) {
  return props.map(() => (
    // Return a wrapper function instead of a raw ReactElement.
    () => <div ref="top-div"></div>
  ));
});
```

2.  Use the render scheduler.  Use a observeOn(renderScheduler) in order to cause the remaining chained observables
to be invoked within the component's render method.
NOTE: Using this scheduler to send events or cause state
changes in another react element will throw an error as per React's restrictions
(no setState during any batched rendering).  It's best to use this scheduler only for rendering elements.
```js
let MyElement = Cycle.component('MyElement', function (interactions, props, self, lifecycles, renderScheduler) {
  return props
    .observeOn(renderScheduler)
    .map(() => <div ref="top-div"></div>);
}, {renderScheduler: true});
```

The advantage of the latter approach is that you can use the scheduler to compose different Observable streams
more easily.  This is useful, if say, one part of your DOM is more expensive to build than others, so you want
to use separate Observables to compose it.

```js
let MyElement = Cycle.component('MyElement', function (interactions, props, self, lifecycles, renderScheduler) {
  var inner$ = props.get('innerText')
    .observeOn(renderScheduler)
    .map((p) => <div ref="inner">{p.innerText}</div>);
  return props.get('outerText')
    .combineLatest(inner$, (outerText, inner) => <div>{outerText} {inner}</div>);
}, {renderScheduler: true});
```

The other advantage of using the scheduler is in 'delaying' actions until after refs have been rendered.

```js
let MyElement = Cycle.component('MyElement', function (interactions, props, self, lifecycles, renderScheduler) {
  return props.observeOn(renderScheduler).map(() => {
    renderScheduler.schedule(null, function () {
      self.refs.theref; // this is now set.  actions that are scheduled during a render will batch immediately after.
    });
    return <div ref="theref"></div>
  });
}, {renderScheduler: true});
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

## react-hot-loader

Cycle-React supports
[react-hot-loader](https://github.com/gaearon/react-hot-loader).

Cycle-React overrides `forceUpdate` when `module.hot == true`
(webpack hot module enabled). No extra configuration needed.
This overriding behavior only affects the component created by Cycle-React
and has no effect if webpack-hot-module was disabled.
