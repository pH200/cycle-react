# Interactions API

## interactions.get

Query the events of interactions collection.

Example:

```js
Cycle.applyToDOM('.js-container', function computer(interactions) {
  // get(selector: string, eventName: string, isSingle?: boolean): Observable<Event>
  return interactions.get('.myinput', 'input')
  ...
});
```

## interactions.getEventSubject

Get a subject with an `onEvent` method bind to the subject from the
collection of interactions.

This subject is useful if you don't want to use `interactions.get`. And
prefer catching events by providing `subject.onEvent` directly to the
event handler of the element.

Example:

```js
// View:
// Don't forget to write `.onEvent`
<input className="editField"
       type="text"
       onInput={interactions.getEventSubject('onEditInput').onEvent} />
// Intent:
// onEditInput matches the name which was provided to input element's onInput
var inputChanged$ = interactions.getEventSubject('onEditInput')
  .map(ev => ev.target.value);
```

To subscribe an event from Cycle-React's custom element,
append "on" before the event name.

Example:

```js
var MyElement = createReactClass('MyElement', function computer() {
  return {
    view: Rx.Observable.just(<h3 className="myelement">My Element</h3>),
    events: {
      // The event observable
      tickEvent: Rx.Observable.interval(500)
    }
  }
});
// Cycle-React would also try to
// emit onTickEvent if ontickEvent was not found
<MyElement ontickEvent={interactions.subject('ontick').onEvent} />
// You can still use interactions.get for custom elements
interactions.get('.myelement', 'tickEvent').map(...);
```

## interactions.subject

The alias of getEventSubject.
