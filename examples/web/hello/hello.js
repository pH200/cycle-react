import React from 'react';
import ReactDOM from 'react-dom';
import { useInteractions } from 'cycle-react/rxjs';
import { map } from 'rxjs/operators'

const [interactions, useCycle] = useInteractions(
  '', // initial state
  {onNameChange: map(ev => currentState => ev.target.value)}
);


function View() {
  const name = useCycle();
  return (
    <div>
      <label>Name:</label>
      <input type="text"
             onChange={interactions('onNameChange')} />
      <hr />
      <h1>Hello {name}</h1>
    </div>
  );
}

ReactDOM.render(
  <View />,
  document.querySelector('.js-container')
);
