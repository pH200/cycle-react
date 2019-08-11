import { fromJS } from 'immutable';

export function getSource() {
  const storedTodosList = JSON.parse(localStorage.getItem('todos-cycle-react@2'));
  const initialTodosData = fromJS({
    list: storedTodosList || [],
    input: '',
    filter: '',
    filterFn: () => true // allow anything
  });
  return initialTodosData;
}
