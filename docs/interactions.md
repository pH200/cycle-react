# Interactions API

## interactions.get

Get the event observable from interactions collection.

Example:

```js
Cycle.applyToDOM('.js-container', function computer(interactions) {
  // get(eventName: string): Observable<any>
  return interactions.get('OnMyInput')
    .map(ev => ev.target.value)
    .startWith('')
    .map(inputValue =>
      <input type="text"
             value={inputValue}
             onChange={interactions.listener('OnMyInput')} />
    );
});
```

## interactions.listener

Create an event listener for receiving events from React components.

Example:

```js
// listener(eventName: string): (ev: any) => void
<input type="text" onChange={interactions.listener('OnMyInput')} />
```
