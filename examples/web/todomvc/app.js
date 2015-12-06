let React = require('react');
let ReactDOM = require('react-dom');
let Cycle = require('cycle-react');
let todoIntent = require('./todo-intent');
let model = require('./todo-model');
let view = require('./todo-view');
let localStorageSink = require('./local-storage-sink');
let source = require('./todo-source');

let Root = Cycle.component('Root', function computer(interactions) {
  let intent = todoIntent(interactions);
  let todos$ = model(intent, source());
  todos$.subscribe(localStorageSink);
  return view(todos$, interactions);
});

ReactDOM.render(
  <Root />,
  document.querySelector('.todoapp')
);
