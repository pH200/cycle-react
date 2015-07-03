# Changelog

## 1.0.0-beta3

Add feature: `props.getAll()` returns the Observable of the whole properties object
[#10]

> Alternatively, you can use `props.get('*')` or simply `props` for the exact same effect.

Breaking change: `props.get(propertyName)` uses (x === y) comparison instead of
deep-equal comparison for the target property

> Use `props.get('*')` or `props` if you have changes inside a nested object.

> Alternatively, you can provide the customized comparer by
`props.get(name, (x, y) => {})`

Breaking change: The `h` hyperscript helper has been removed [#11]

Breaking change: Interactions API no longer uses selector for querying events
[#8, #12]

> The selector API cannot handle both Cycle-React components and other React
components that use event handlers. We want to keep the compatibility with
the original React while not confusing developers. Therefore, the selector API
has been removed in favor of event handler API.

> The migration guide can be found below.

Breaking change: `on` prefix is no longer appended to event handlers for
Cycle-React components

Breaking change: Event detail is no longer wrapped by CustomEvent

Breaking change: The option "noDOMDispatchEvent" has been removed since
Cycle-React no longer dispatches events from DOM right now

### BEFORE

```js
// Component:
let MyComponent = Cycle.component('MyComponent', function (interactions, props) {
  let vtree$ = interactions.get('.myinput', 'change')
    .map(ev => ev.target.value)
    .startWith('')
    .map(name =>
      <div>
        <input className="myinput" type="text" />
        <h1>Hello {name}</h1>
      </div>
    );
  return {
    view: vtree$,
    events: {
      myComponentTick: Rx.Observable.interval(1000)
    }
  };
});
// Intentions:
interactions.subject('tick').map(ev => ev.detail);
// View:
<MyComponent onMyComponentTick={interactions.subject('tick').onEvent} />
```

### AFTER

```js
// Component:
let MyComponent = Cycle.component('MyComponent', function (interactions, props) {
  // You must use `get` to query events
  // and use `listener` to create event handlers.
  let vtree$ = interactions.get('OnMyInputChange')
    .map(ev => ev.target.value)
    .startWith('')
    .map(name =>
      <div>
        <input className="myinput" type="text"
               onChange={interactions.listener('OnMyInputChange')} />
        <h1>Hello {name}</h1>
      </div>
    );
  return {
    view: vtree$,
    events: {
      // The event handler is no longer auto-prefixed by "on"
      onMyComponentTick: Rx.Observable.interval(1000)
    }
  };
});
// Intentions:
// Event arguments from Cycle-React components are no longer
// wrapped by CustomEvent.
interactions.subject('tick').map(ev => ev);
// View:
// Use interactions.listener(name) to create event handler
<MyComponent onMyComponentTick={interactions.listener('tick')} />
```

### Migration

1. Append the "on" prefix to every event observables inside events object
2. Rewrite the code that used `interactions.get(selector, eventType)` by using
`interactions.get(eventName)` and `interactions.listener(eventName)` like the
example above
3. Replace `interactions.subject(name).onEvent` with `interactions.listener(name)`
4. Replace
`interactions.subject(name)` and `interactions.getEventSubject(name)`
with `interactions.get(name)`
5. Replace `ev.detail` with `ev`

## 0.27.0

Breaking change: Rename "createReactClass" to "component"

For migrating to 0.27, simply replace the string "createReactClass"
to "component".

Fix: Remove unnecessary update on `props` change

Add feature: New option "noDOMDispatchEvent" for skipping DOM dispatchEvent

Use "noDOMDispatchEvent" if you want to handle events by using event handlers
completely instead of using `interactions.get` API.

## 0.26.0

Breaking change: Cycle v0.23(or v1.0 API) compatibility changes

### BEFORE

```js
var MyComponent = CycleReact.createReactClass('MyComponent',
  function (interactions, props) {
    var destroy$ = interactions.get('.remove-btn', 'click');
    var id$ = props.get('itemid');
    // ...
    return {
      vtree$: Rx.Observable.just(<h3>view</h3>),
      destroy$: destroy$,
      changeColor$: changeColor$,
      changeWidth$: changeWidth$
    };
  }
);
```

```js
// Event handler usage
// See docs/interactions.md
<MyComponent onChangeColor$={interactions.subject('onChangeColor').onEvent} />
```

### AFTER

```js
var MyComponent = CycleReact.createReactClass('MyComponent',
  function (interactions, props) {
    var destroy$ = interactions.get('.remove-btn', 'click');
    var id$ = props.get('itemid');
    // ...
    return {
      view: Rx.Observable.just(<h3>view</h3>),
      events: {
        destroy: destroy$,
        changeColor: changeColor$,
        changeWidth: changeWidth$
      }
    };
  }
);
```

```js
// Event handler usage
// See docs/interactions.md
<MyComponent onChangeColor={interactions.subject('onChangeColor').onEvent} />
```

### Migration

1. Replace the return of the definition function from return
{vtree$, myEvent$, ...} to return {view: vtree$, events: ...},
where events: ... is an object where keys are the event name (notice no more
dollar sign $ convention!) and values are Observables
2. Remove the $ sign from event handlers
3. You're good to go

Unlike Cycle.js 0.23 which `interactions` and `props` are replaced by drivers,
Cycle-React keeps these parameters because Cycle-React allows you to create
React components outside the context of `Cycle.run`.

Additionally, Cycle-React will keep `applyToDOM` and `renderAsHTML` for
simple web-app development usage.

Add feature: Cycle.js driver

See docs/cycle-js-driver.md for details.

## 0.25.0

Breaking change: shouldComponentUpdate is now built-in and no longer being
able to be overridden by mixins

Breaking change: like
[Cycle.js 0.22](https://github.com/staltz/cycle/releases/tag/v0.22.0),
`event.detail` is now used instead of `event.data`

Breaking change: `interactions.get` is now implemented as:

```
Rx.Observable.fromEvent(RootElement, eventName)
  .filter(e => e.target.matches(selector))
```

Instead of:

```
Rx.Observable.fromEvent(RootElement.querySelector(selector), eventName)
```

## 0.24.0

Breaking change: createEventSubject has been removed

Use `interactions.getEventSubject(name)` and
`interactions.subject(name)`(alias) instead. It's a better design to have
event subscriptions stay within the interactions. See `interactions.md` for
details.

Add feature: Disposable element

Sometimes, it's not an easy task to manage all your disposables by
using `Observable.using`. This new property of custom-element allows
you to dispose resources when React triggered the `componentWillUnmount`
lifecycle method.

```js
Cycle.createReactClass('MyElement', () => {
  return {
    vtree$: ...,
    dispose: function dispose() {
      // This function will be called during the
      // componentWillUnmount lifecycle event
    }
    // You can set Rx.Disposable objects(e.g. subscription)
    // instead of function to the dispose property, too.
  }
});
```

Add feature: Refs compatibility

See `working-with-react.md` for details.

## 0.23.0

Add feature: Support react-hot-loader

Cycle-React now overrides `forceUpdate` when `module.hot == true`
(webpack hot module enabled). No extra configuration needed.
This overriding behavior only affects the ReactClass created by Cycle-React
and has no effect if webpack-hot-module was disabled.

Add feature: createReactClass options, see docs/api.md for details

Change: "react" is moved to peer dependencies

## 0.22.0

Add feature: props.get('\*') for custom elements

props.get('\*') returns the Observable of the whole properties object,
as given to the custom element in the parent vtree context.

Additionally, props equals to props.get('\*') in Cycle-React. Which means you
can skip `.get('*')` and get the Observable of the properties object.
This shortcut is not available for the original Cycle.js.

Add feature: createEventSubject, a helper for using Rx subject as event handler

Details can be found at API docs.

## 0.21.0

The alpha.
