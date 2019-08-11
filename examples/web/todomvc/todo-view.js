import React from 'react';
import { TodoItem } from './todo-item';
import { TodoContext } from './todo-context';

function Header(props) {
  function onInputSubmit(e) {
    e.preventDefault();
    props.onInputSubmit(e.target.elements.newTodo.value);
  }
  function onClearInput(e) {
    const ESC_KEY = 27;
    if (e.keyCode === ESC_KEY) {
      props.onClearInput();
    }
  }
  function onInputChange(e) {
    props.onInputChange(e.target.value);
  }

  return (
    <header>
      <h1>todos</h1>
      <form className="new-todo-form"
            onSubmit={onInputSubmit}>
        <input className="new-todo"
                type="text"
                onKeyUp={onClearInput}
                onChange={onInputChange}
                value={props.input}
                placeholder="What needs to be done?"
                autoFocus={true}
                name="newTodo" />
      </form>
    </header>
  );
}

function MainSection(props) {
  const {list, filterFn} = props;
  const allCompleted = list.reduce((x, y) => x && y.get('completed'), true);
  const style = {display: list.size ? 'inherit' : 'none'};
  return (
    <TodoContext.Consumer>
      {(ev) => (
        <section className="main" style={style}>
        <input className="toggle-all"
                type="checkbox"
                checked={allCompleted}
                onChange={ev.toggleAll} />
        <ul className="todo-list">
          {list
            .filter(filterFn)
            .map(item =>
              <TodoItem key={item.get('id')}
                        todoid={item.get('id')}
                        content={item.get('title')}
                        completed={item.get('completed')}
                        onNewContent={ev.editTodo}
                        onToggle={ev.toggleTodo}
                        onDestroy={ev.deleteTodo} />
            ).toArray()}
        </ul>
      </section>
      )}
    </TodoContext.Consumer>
  );
}

function CompleteButton({amountCompleted, onClearCompleted}) {
  if (amountCompleted > 0) {
    return <button className="clear-completed"
                   onClick={onClearCompleted}>
      Clear completed ({amountCompleted})
    </button>;
  }
  return <div />;
}

function Footer(props) {
  const {list, filter, onClearCompleted} = props;
  const amountCompleted = list.count(item => item.get('completed'));
  const amountActive = list.size - amountCompleted;
  const style = {display: list.size ? 'inherit' : 'none'};

  return (
    <footer className="footer" style={style}>
      <span className="todo-count">
        <strong>{amountActive} item{amountActive !== 1 ? 's' : ''} left</strong>
      </span>
      <ul className="filters">
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
                      onClearCompleted={onClearCompleted} />
    </footer>
  );
}

export function Main(props) {
  return (
    <TodoContext.Consumer>
      {(ev) => (
        <div>
          <Header input={props.input}
                  onInputSubmit={ev.insertTodo}
                  onClearInput={ev.clearInput}
                  onInputChange={ev.changeInput} />
          <MainSection list={props.list}
                      filterFn={props.filterFn} />
          <Footer list={props.list}
                  filter={props.filter}
                  onClearCompleted={ev.deleteCompleted} />
        </div>
      )}
    </TodoContext.Consumer>
  );
}
