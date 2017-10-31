import {component} from 'cycle-react/rxjs';
import 'rxjs/Rx';
import React from 'react';
import ReactDOM from 'react-dom';

const Root = component('Root', function computer(interactions) {
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
