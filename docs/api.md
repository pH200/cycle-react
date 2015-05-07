
# `Cycle` object API

- [`applyToDOM`](#applyToDOM)

- [`renderAsHTML`](#renderAsHTML)

- [`createReactClass`](#createReactClass)

- [`createEventSubject`](#createEventSubject)

- [`React`](#React)

- [`Rx`](#Rx)

- [`h`](#h)

### <a id="applyToDOM"></a> `applyToDOM(container, computer)`

Takes a `computer` function which outputs an Observable of React
elements, and renders that into the DOM element indicated by `container`,
which can be either a CSS selector or an actual element. At the same time,
provides the `interactions` input to the `computer` function, which is a
collection of all possible events happening on all elements which were
rendered. You must query this collection with
`interactions.get(selector, eventName)` in order to get an Observable of
interactions of type `eventName` happening on the element identified by
`selector`.
Example: `interactions.get('.mybutton', 'click').map(ev => ...)`

#### Arguments:

- `container :: String|HTMLElement` the DOM selector for the element (or the element itself) to contain the rendering of the VTrees.
- `computer :: Function` a function that takes `interactions` as input and outputs an Observable of React elements.

- - -

### <a id="renderAsHTML"></a> `renderAsHTML(vtree$)`

Converts a given Observable of React elements (`vtree$`) into an
Observable of corresponding HTML strings (`html$`). The provided `vtree$`
must complete (must call onCompleted on its observers) in finite time,
otherwise the output `html$` will never emit an HTML string.

#### Arguments:

- `vtree$ :: RxObservable` Observable of React elements.

#### Return:

*(Rx.Observable)* an Observable emitting a string as the HTML renderization of the React element.

- - -

### <a id="createReactClass"></a> `createReactClass(tagName, computer)`

Takes a `computer` function which outputs an Observable of React
elements, and returns a converted React class which can be used normally
by `React.createElement` and "Cycle.applyToDOM".

**IMPORTANT** A React class should be used as a function object instead of
class in cycle-react apps. If you found yourself writing `this.`,
you're doing it wrong.

"React class" shares the same terminology as Cycle's "custom element".

The given `computer` function takes two parameters as input, in this order:
`interactions` and `properties`. The former works just like it does in the
`computer` function given to `applyToDOM`, and the later contains
Observables representing properties of the custom element, given from the
parent context. `properties.get('foo')` will return the Observable `foo$`.

The `computer` must output an object containing the property `vtree$`
as an Observable. If the output object contains other Observables, then
they are treated as custom events of the custom element.

#### Arguments:

- `tagName :: String` a name for identifying the React class.
- `computer :: Function` the implementation for the custom element. This function takes two arguments: `interactions`, and `properties`, and
should output an object of Observables.

- - -

### <a id="createEventSubject"></a> `createEventSubject()`

Creates a subject with an `onEvent` method bind to the subject.
This subject is useful if you don't want to use `interactions.get`. And
prefer catching events by providing `subject.onEvent` directly to the
event handler of the element.

Example: `<button onClick={eventSubject.onEvent} />`

To subscribe a user-defined event, append "on" before the event name
with $ prefix.

Example: `<MyElement onMyEvent$={eventSubject.onEvent}` />

#### Return:

*(Rx.Subject)* a subject with a instance method "onEvent"

- - -

### <a id="React"></a> `React`

A shortcut to the root object of React.

- - -

### <a id="Rx"></a> `Rx`

A shortcut to the root object of [RxJS](https://github.com/Reactive-Extensions/RxJS).

- - -

### <a id="h"></a> `h`

This is a helper for creating VTrees in Views. The API is identical to
[virtual-hyperscript](
https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript)
but returns React element tree instead.

- - -

