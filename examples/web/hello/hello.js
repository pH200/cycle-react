const Cycle = require('cycle-react');
const React = require('react');

function computer(interactions) {
  return interactions.get('OnInputChange')
    .map((ev) => ev.target.value)
    .startWith('')
    .map((name) => (
      <div>
        <label>Name:</label>
        <input type="text"
               onChange={interactions.listener('OnInputChange')} />
        <hr />
        <h1>Hello {name}</h1>
      </div>
    ));
}

Cycle.applyToDOM('.js-container', computer);
