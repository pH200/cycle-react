'use strict';
const Cycle = require('cycle-react');
const React = require('react');
const TodoItem = require('./todo-item');

module.exports = function view(todos$, interactions) {
  const Header = Cycle.component('Header', function (_, props) {
    function onSubmitHandler(e) {
      e.preventDefault();
      /*eslint-disable dot-notation */
      interactions.listener('onInputSubmit')(e.target.elements['newTodo'].value);
      /*eslint-enable dot-notation */
    }
    return props.get('input').map(input =>
      <header id="header">
        <h1>todos</h1>
        <form className="new-todo-form"
              onSubmit={onSubmitHandler}>
          <input id="new-todo"
                 type="text"
                 onKeyUp={interactions.listener('onInputKeyUp')}
                 onChange={interactions.listener('onInputChange')}
                 value={input}
                 placeholder="What needs to be done?"
                 autoFocus={true}
                 name="newTodo" />
        </form>
      </header>
    );
  });

  const MainSection = Cycle.component('MainSection', function (_, props) {
    return props.distinctUntilChanged().map(({list, filterFn}) => {
      let allCompleted = list.reduce((x, y) => x && y.completed, true);
      let style = {display: list.size ? '' : 'none'};
      return <section id="main" style={style}>
        <input id="toggle-all"
               type="checkbox"
               checked={allCompleted}
               onChange={interactions.listener('onToggleAll')} />
        <ul id="todo-list">
          {list
            .filter(filterFn)
            .map(item =>
              <TodoItem key={item.get('id')}
                        todoid={item.get('id')}
                        content={item.get('title')}
                        completed={item.get('completed')}
                        onNewContent={interactions.listener('onItemNewContent')}
                        onToggle={interactions.listener('onItemToggle')}
                        onDestroy={interactions.listener('onItemDestroy')} />
            ).toArray()}
        </ul>
      </section>;
    });
  });

  const CompleteButton = Cycle.component('CompleteButton', function (_, props) {
    return props.map(({amountCompleted, onClearCompleted}) => {
      if (amountCompleted > 0) {
        return <button id="clear-completed"
                       onClick={onClearCompleted}>
          Clear completed ({amountCompleted})
        </button>;
      }
      return <div />;
    });
  });

  const Footer = Cycle.component('Footer', function (_, props) {
    return props.distinctUntilChanged().map(({list, filter}) => {
      let amountCompleted = list.count(item => item.get('completed'));
      let amountActive = list.size - amountCompleted;
      let style = {display: list.size ? '' : 'none'};

      return <footer id="footer" style={style}>
        <span id="todo-count">
          <strong>{amountActive} item{amountActive !== 1 ? 's' : ''} left</strong>
        </span>
        <ul id="filters">
          <li>
            <a className={filter === '' ? 'selected' : ''}
               href="#/">
              All
            </a>
          </li>
          <li>
            <a className={filter === 'active' ? 'selected' : ''}
               href="#/active">
              Active
            </a>
          </li>
          <li>
            <a className={filter === 'completed' ? 'selected' : ''}
               href="#/completed">
              Completed
            </a>
          </li>
        </ul>
        <CompleteButton amountCompleted={amountCompleted}
                        onClearCompleted={interactions.listener('onClearCompleted')} />
      </footer>;
    });
  });

  return todos$.map(todos =>
    <div>
      <Header input={todos.input} />
      <MainSection list={todos.list} filterFn={todos.filterFn} />
      <Footer list={todos.list} filter={todos.filter} />
    </div>
  );
};
