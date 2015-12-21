let Rx = require('rx');
let cuid = require('cuid');
let {Map} = require('immutable');

function getFilterFn(route) {
  switch (route) {
    case '/active': return task => task.get('completed') === false;
    case '/completed': return task => task.get('completed') === true;
    default: return () => true; // allow anything
  }
}

function determineFilter(todosData, route) {
  return todosData.withMutations(m => {
    m.set('filter', route.replace('/', '').trim());
    m.set('filterFn', getFilterFn(route));
  });
}

function makeModification$(intent) {
  let changeInputMod$ = intent.changeInput$.map((content) => (todosData) => {
    return todosData.set('input', content);
  });

  let clearInputMod$ = intent.clearInput$.map(() => (todosData) => {
    return todosData.set('input', '');
  });

  let insertTodoMod$ = intent.insertTodo$.map((todoTitle) => (todosData) => {
    return todosData.withMutations(m => {
      m.update('list', list => list.push(Map({
        id: cuid(),
        title: todoTitle,
        completed: false
      })));
      m.set('input', '');
    });
  });

  let editTodoMod$ = intent.editTodo$.map((evdata) => (todosData) => {
    return todosData.update('list', list => {
      let index = list.findIndex(item => item.get('id') === evdata.id);
      return list.setIn([index, 'title'], evdata.content);
    });
  });

  let toggleTodoMod$ = intent.toggleTodo$.map((todoid) => (todosData) => {
    return todosData.update('list', list => {
      let index = list.findIndex(item => item.get('id') === todoid);
      return list.updateIn([index, 'completed'], completed => !completed);
    });
  });

  let toggleAllMod$ = intent.toggleAll$.map(() => (todosData) => {
    let allAreCompleted = todosData.get('list')
      .every(item => item.get('completed'));
    return todosData.update(
      'list',
      list => list.map(item => item.set('completed', !allAreCompleted)).toList()
    );
  });

  let deleteTodoMod$ = intent.deleteTodo$.map((todoid) => (todosData) => {
    let index = todosData.get('list').findIndex(item => item.get('id') === todoid);
    return todosData.deleteIn(['list', index]);
  });

  let deleteCompletedsMod$ = intent.deleteCompleteds$.map(() => (todosData) => {
    return todosData.update(
      'list',
      list => list.filter(item => !item.get('completed')).toList()
    );
  });

  return Rx.Observable.merge(
    insertTodoMod$, deleteTodoMod$, toggleTodoMod$, toggleAllMod$,
    changeInputMod$, clearInputMod$, deleteCompletedsMod$, editTodoMod$
  );
}

function todoModel(intent, source) {
  let modification$ = makeModification$(intent);
  let route$ = Rx.Observable.just('/').merge(intent.changeRoute$);

  return source.concat(modification$)
    .scan((todosData, modFn) => modFn(todosData))
    .combineLatest(route$, determineFilter)
    .map(todosData => todosData.toObject())
    .shareReplay(1);
}

module.exports = todoModel;
