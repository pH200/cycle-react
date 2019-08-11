import React from 'react';

export const TodoContext = React.createContext({
  changeInput: todoText => {},
  clearInput: () => {},
  insertTodo: todoText => {},
  editTodo: (id, content) => {},
  toggleTodo: id => {},
  toggleAll: () => {},
  deleteTodo: id => {},
  deleteCompleted: () => {}
});
