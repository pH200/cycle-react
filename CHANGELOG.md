# Changelog

## 0.24.0

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

If you've ever tried to set `ref` for the element with cycle-react, you're
probably encountered this following error:

```
Invariant Violation: addComponentAsRefTo(...): Only a ReactOwner can have refs.
This usually means that you're trying to add a ref to a component that doesn't
have an owner (that is, was not created inside of another component's `render`
method).
```

This is because cycle-react evaluates the vtree(ReactElement) inside the Rx
subscription instead of `ReactClass.prototype.render`. Now, this error can
be avoided by sending the lazy value of vtree with the option
`{bindThis: true}` set.

Example:

```js
Cycle.createReactClass('MyElement', (_1, _2, self) => {
  // Send lambda instead of plain vtree
  return Rx.Observable.just(() => <input ref="myInput" />);
}, {bindThis: true});
// The bindThis option must be set
```

## 0.23.0

Add feature: Support react-hot-loader

cycle-react now overrides `forceUpdate` when `module.hot == true`
(webpack hot module enabled). No extra configuration needed.
This overriding behavior only affects the ReactClass created by cycle-react
and has no effect if webpack-hot-module was disabled.

Add feature: createReactClass options, see docs/api.md for details

Change: "react" is moved to peer dependencies

## 0.22.0

Add feature: props.get('\*') for custom elements

props.get('\*') returns the Observable of the whole properties object,
as given to the custom element in the parent vtree context.

Additionally, props equals to props.get('\*') in cycle-react. Which means you
can skip `.get('*')` and get the Observable of the properties object.
This shortcut is not available for the original Cycle.js.

Add feature: createEventSubject, a helper for using Rx subject as event handler

Details can be found at API docs.

## 0.21.0

The alpha.
