# Changelog

## 0.25.0

Breaking change: shouldComponentUpdate is now built-in and no longer being
able to be overridden by mixins

Breaking change: like
[Cycle.js 0.22](https://github.com/staltz/cycle/releases/tag/v0.22.0),
`event.detail` is now used instead of `event.data`

Breaking change: `interaction.get` is now implemented as:

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
