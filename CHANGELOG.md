# Changelog

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
