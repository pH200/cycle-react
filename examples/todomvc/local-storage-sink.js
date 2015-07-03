module.exports = function localStorageSink(todosData) {
  // Observe all todos data and save them to localStorage
  let todosList = todosData.list.toJS();
  localStorage.setItem('todos-cycle-react@2', JSON.stringify(todosList));
};
