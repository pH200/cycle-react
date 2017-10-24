# Cycle-React API

- [`component`](#component)

### <a id="component"></a> `component(displayName, definitionFn, [options])`

Takes a `definitionFn` function which outputs an Observable of React
elements, and returns a native React component which can be used normally
by `React.createElement`.

The given `definitionFn` function takes two parameters as input, in this order:
`interactions` and `properties`. `interactions` is a collection of all events
happening on the user-defined event handlers. You must query this collection with
`interactions.get(eventName)` in order to get an Observable of
interactions of type `eventName`. And create the event handlers with
`interactions.listener(eventName)`.

The second parameter, `properties`, contains Observables representing properties
of the custom element, given from the parent context.
`properties.get('foo')` will return the Observable `foo$`.

The `definitionFn` must output an object containing the property `view`
as an Observable. If the output object contains other Observables, then
they are treated as custom events of the custom element.

The `options` is optional and can be ignored in most cases.

options example:

    component('displayName', definitionFn, {
      propTypes: null,
      disableHotLoader: false
    });

#### Arguments:

- `displayName :: String` a name for identifying the React component.
- `definitionFn :: Function` the implementation for the custom element. This function takes up to three arguments: `interactions`, `props` and `lifecycles`. This function should return an Observable.
- `[options] :: Object` the options for component.

- - -
