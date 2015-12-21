let Rx = require('rx');
let {Map, fromJS} = require('immutable');

module.exports = function getSource() {
  let storedTodosList = JSON.parse(localStorage.getItem('todos-cycle-react@2'));
  let initialTodosData = fromJS({
    list: storedTodosList || [],
    input: '',
    filter: '',
    filterFn: () => true // allow anything
  });
  return Rx.Observable.just(initialTodosData);
};
