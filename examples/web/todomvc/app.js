import React from 'react';
import ReactDOM from 'react-dom';
import { makeModel } from './todo-model';
import { Main } from './todo-view';
import { TodoContext } from './todo-context';
import localStorageSink from './local-storage-sink';
import source from './todo-source';
import { useInteractions } from 'cycle-react/rxjs';
import { fromEvent } from 'rxjs';
import { map, startWith, scan, tap } from 'rxjs/operators'

function getFilterFn(route) {
  switch (route) {
    case '/active': return task => task.get('completed') === false;
    case '/completed': return task => task.get('completed') === true;
    default: return () => true; // allow anything
  }
}

const sinks = [
  fromEvent(window, 'hashchange')
    .pipe(
      map(ev => ev.newURL.match(/#[^#]*$/)[0].replace('#', '')),
      startWith(window.location.hash.replace('#', '')),
      map(route => todosData => {
        return todosData.withMutations(m => {
          m.set('filter', route.replace('/', '').trim());
          m.set('filterFn', getFilterFn(route));
        });
      })
    )
]

const [interactions, useCycle] = useInteractions(
  source(),
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
