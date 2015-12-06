const Cycle = require('cycle-react');
const React = require('react');
const ReactDOM = require('react-dom');

const Root = Cycle.component('Root', function computer(interactions) {
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
});

ReactDOM.render(
  <Root />,
  document.querySelector('.js-container')
);
