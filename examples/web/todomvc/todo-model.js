import cuid from 'cuid';
import { Map } from 'immutable';
import { map } from 'rxjs/operators'

export function makeModel() {
  return {
    changeInput: map(content => todosData => todosData.set('input', content)),
    clearInput: map(() => todosData => todosData.set('input', '')),
    insertTodo: map(todoTitle => (todosData) => {
      return todosData.withMutations(m => {
        m.update('list', list => list.push(Map({
          id: cuid(),
          title: todoTitle,
          completed: false
        })));
        m.set('input', '');
      });
    }),
    editTodo: map(({id, content}) => todosData => {
      return todosData.update('list', list => {
        const index = list.findIndex(item => item.get('id') === id);
        return list.setIn([index, 'title'], content);
      });
    }),
    toggleTodo: map(id => todosData => {
      return todosData.update('list', list => {
        const index = list.findIndex(item => item.get('id') === id);
        return list.updateIn([index, 'completed'], completed => !completed);
      });
    }),
    toggleAll: map(() => todosData => {
      const allAreCompleted = todosData.get('list')
        .every(item => item.get('completed'));
      return todosData.update(
        'list',
        list => list.map(item => item.set('completed', !allAreCompleted)).toList()
      );
    }),
    deleteTodo: map(todoid => todosData => {
      const index = todosData.get('list').findIndex(item => item.get('id') === todoid);
      return todosData.deleteIn(['list', index]);
    }),
    deleteCompleted: map(() => todosData => {
      return todosData.update(
        'list',
        list => list.filter(item => !item.get('completed')).toList()
      );
    })
  }
}
