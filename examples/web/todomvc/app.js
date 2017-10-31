import React from 'react';
import ReactDOM from 'react-dom';
import {component} from 'cycle-react/rxjs';
import todoIntent from './todo-intent';
import model from './todo-model';
import view from './todo-view';
import localStorageSink from './local-storage-sink';
import source from './todo-source';

const Root = component('Root', function computer(interactions) {
  const intent = todoIntent(interactions);
  const todos$ = model(intent, source());
  todos$.subscribe(localStorageSink);
  return view(todos$, interactions);
});

ReactDOM.render(
  <Root />,
  document.querySelector('.todoapp')
);
