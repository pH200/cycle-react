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
      rootTagName: 'div',
      mixins: [],
      propTypes: null,
      disableHotLoader: false
      renderScheduler: false
    });

`opt.rootTagName` is the default tagName for the root element.
Normally, you don't need to set this option if your root element is div or
you have an initial value for the vtree$. Examples:

    // The element for the first render would be <h1 />
    component('displayName', () => Rx.Observable.just(<h1 />), {
      rootTagName: 'div'
    });

    // The element for the first render would be <div></div>,
    // and the second element would be <h1 /> (after 1000ms)
    component('displayName',
      () => Rx.Observable.timer(1000).map(() => <h1 />), {
      rootTagName: 'div'
    });

    // The element for the first render would be <h2 />,
    // and the second element would be <h1 /> (after 1000ms)
    // rootTagName has no effect in this case
    component('displayName',
      () => Rx.Observable.timer(1000)
        .map(() => <h1 />)
        .startWith(<h2 />), {
      rootTagName: 'div'
    });

#### Arguments:

- `displayName :: String` a name for identifying the React component.
- `definitionFn :: Function` the implementation for the custom element. This function takes up to three arguments: `interactions`, `props` and `lifecycles`. This function should return an Observable.
- `[options] :: Object` the options for component.

- - -
