import React from 'react';
import ReactDOM from 'react-dom';
import { makeModel } from './todo-model';
import { getSource } from './todo-source';
import { Main } from './todo-view';
import { TodoContext } from './todo-context';
import { routeSource } from './window-location-source';
import { localStorageSink } from './local-storage-sink';
import { useInteractions } from 'cycle-react/rxjs';
import { scan, tap } from 'rxjs/operators'

const sinks = [routeSource()];
const [interactions, useCycle] = useInteractions(
  getSource(),
  makeModel(),
  sinks,
  stateObservable => {
    return stateObservable.pipe(
      scan(function scan(state, mod) {
        if (typeof mod === 'function') {
          return mod(state);
        } else {
          console.warn('Interaction is not defined as operator (function).');
        }
      }),
      tap(data => localStorageSink(data.toObject()))
    );
  }
);

function View() {
  const state = useCycle();
  return (
    <TodoContext.Provider value={interactions.bindAllListeners()}>
      <Main {...state.toObject()} />
    </TodoContext.Provider>
  );
}

ReactDOM.render(
  <View />,
  document.querySelector('.todoapp')
);
