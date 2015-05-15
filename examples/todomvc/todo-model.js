let {Rx} = require('cycle-react');
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

function mapOrder(item) {
  return item.get('order');
}

function makeModification$(intent) {
  let changeInputMod$ = intent.changeInput$.map((content) => (todosData) => {
    return todosData.set('input', content);
  });

  let clearInputMod$ = intent.clearInput$.map(() => (todosData) => {
    return todosData.set('input', '');
  });

  let insertTodoMod$ = intent.insertTodo$.map((todoTitle) => (todosData) => {
    let maxOrderItem = todosData.get('list').maxBy(mapOrder);
    let order = maxOrderItem ? (maxOrderItem.get('order') + 1) : 0;
    return todosData.withMutations(m => {
      let id = cuid();
      m.setIn(['list', id], Map({
        id: id,
        title: todoTitle,
        completed: false,
        order: order
      }));
      m.set('input', '');
    });
  });

  let editTodoMod$ = intent.editTodo$.map((evdata) => (todosData) => {
    return todosData.setIn(['list', evdata.id, 'title'], evdata.content);
  });

  let toggleTodoMod$ = intent.toggleTodo$.map((todoid) => (todosData) => {
    return todosData.updateIn(['list', todoid, 'completed'], completed => !completed);
  });

  let toggleAllMod$ = intent.toggleAll$.map(() => (todosData) => {
    let allAreCompleted = todosData.get('list')
      .every(item => item.get('completed'));
    return todosData.update(
      'list',
      list => list.map(item => item.set('completed', !allAreCompleted)).toMap()
    );
  });

  let deleteTodoMod$ = intent.deleteTodo$.map((todoid) => (todosData) => {
    return todosData.deleteIn(['list', todoid]);
  });

  let deleteCompletedsMod$ = intent.deleteCompleteds$.map(() => (todosData) => {
    return todosData.update(
      'list',
      list => list.filter(item => !item.get('completed')).toMap()
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
    .map(todosData => {
      let data = todosData.toObject();
      return data;
    })
    .shareReplay(1);
}

module.exports = todoModel;
