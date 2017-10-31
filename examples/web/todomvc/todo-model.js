import {Observable} from 'rxjs/Rx';
import cuid from 'cuid';
import {Map} from 'immutable';

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
  const changeInputMod$ = intent.changeInput$.map((content) => (todosData) => {
    return todosData.set('input', content);
  });

  const clearInputMod$ = intent.clearInput$.map(() => (todosData) => {
    return todosData.set('input', '');
  });

  const insertTodoMod$ = intent.insertTodo$.map((todoTitle) => (todosData) => {
    return todosData.withMutations(m => {
      m.update('list', list => list.push(Map({
        id: cuid(),
        title: todoTitle,
        completed: false
      })));
      m.set('input', '');
    });
  });

  const editTodoMod$ = intent.editTodo$.map((evdata) => (todosData) => {
    return todosData.update('list', list => {
      const index = list.findIndex(item => item.get('id') === evdata.id);
      return list.setIn([index, 'title'], evdata.content);
    });
  });

  const toggleTodoMod$ = intent.toggleTodo$.map((todoid) => (todosData) => {
    return todosData.update('list', list => {
      const index = list.findIndex(item => item.get('id') === todoid);
      return list.updateIn([index, 'completed'], completed => !completed);
    });
  });

  const toggleAllMod$ = intent.toggleAll$.map(() => (todosData) => {
    const allAreCompleted = todosData.get('list')
      .every(item => item.get('completed'));
    return todosData.update(
      'list',
      list => list.map(item => item.set('completed', !allAreCompleted)).toList()
    );
  });

  const deleteTodoMod$ = intent.deleteTodo$.map((todoid) => (todosData) => {
    const index = todosData.get('list').findIndex(item => item.get('id') === todoid);
    return todosData.deleteIn(['list', index]);
  });

  const deleteCompletedsMod$ = intent.deleteCompleteds$.map(() => (todosData) => {
    return todosData.update(
      'list',
      list => list.filter(item => !item.get('completed')).toList()
    );
  });

  return Observable.merge(
    insertTodoMod$, deleteTodoMod$, toggleTodoMod$, toggleAllMod$,
    changeInputMod$, clearInputMod$, deleteCompletedsMod$, editTodoMod$
  );
}

function todoModel(intent, source) {
  const modification$ = makeModification$(intent);
  const route$ = Observable.of('/').merge(intent.changeRoute$);

  return source.concat(modification$)
    .scan((todosData, modFn) => modFn(todosData))
    .combineLatest(route$, determineFilter)
    .map(todosData => todosData.toObject())
    .shareReplay(1);
}

export default todoModel;
