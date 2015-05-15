let Cycle = require('cycle-react');
let todoIntent = require('./todo-intent');
let model = require('./todo-model');
let view = require('./todo-view');
let localStorageSink = require('./local-storage-sink');
let source = require('./todo-source');

function app(interactions) {
  let intent = todoIntent(interactions);
  let todos$ = model(intent, source());
  todos$.subscribe(localStorageSink);
  return view(todos$, interactions);
}

Cycle.applyToDOM('#todoapp', app);
