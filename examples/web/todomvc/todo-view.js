import {component} from 'cycle-react/rxjs';
import React from 'react';
import TodoItem from './todo-item';

const Header = component('Header', function (interactions, props) {
  const onInputSubmit = interactions.get('onSubmit')
    .do(e => e.preventDefault())
    .map(e => e.target.elements.newTodo.value);
  const onInputKeyUp = interactions.get('onKeyUp');
  const onInputChange = interactions.get('onChange');

  return {
    view: props.pluck('input').map(input =>
      <header>
        <h1>todos</h1>
        <form className="new-todo-form"
              onSubmit={interactions.listener('onSubmit')}>
          <input className="new-todo"
                 type="text"
                 onKeyUp={interactions.listener('onKeyUp')}
                 onChange={interactions.listener('onChange')}
                 value={input}
                 placeholder="What needs to be done?"
                 autoFocus={true}
                 name="newTodo" />
        </form>
      </header>
    ),
    events: {
      onInputSubmit,
      onInputKeyUp,
      onInputChange
    }
  };
});

const MainSection = component('MainSection', function (interactions, props) {
  const onItemNewContent = interactions.get('onNewContent');
  const onItemToggle = interactions.get('onToggle');
  const onItemDestroy = interactions.get('onDestroy');
  const onToggleAll = interactions.get('onToggleAll');

  return {
    view: props.distinctUntilChanged().map(({list, filterFn}) => {
      const allCompleted = list.reduce((x, y) => x && y.get('completed'), true);
      const style = {display: list.size ? 'inherit' : 'none'};
      return <section className="main" style={style}>
        <input className="toggle-all"
               type="checkbox"
               checked={allCompleted}
               onChange={interactions.listener('onToggleAll')} />
        <ul className="todo-list">
          {list
            .filter(filterFn)
            .map(item =>
              <TodoItem key={item.get('id')}
                        todoid={item.get('id')}
                        content={item.get('title')}
                        completed={item.get('completed')}
                        onNewContent={interactions.listener('onNewContent')}
                        onToggle={interactions.listener('onToggle')}
                        onDestroy={interactions.listener('onDestroy')} />
            ).toArray()}
        </ul>
      </section>;
    }),
    events: {
      onItemNewContent,
      onItemToggle,
      onItemDestroy,
      onToggleAll
    }
  };
});

const CompleteButton = component('CompleteButton', function (interactions, props) {
  const onClearCompleted = interactions.get('onClick');

  return {
    view: props.pluck('amountCompleted').map(amountCompleted => {
      if (amountCompleted > 0) {
        return <button className="clear-completed"
                       onClick={interactions.listener('onClick')}>
          Clear completed ({amountCompleted})
        </button>;
      }
      return <div />;
    }),
    events: {
      onClearCompleted
    }
  };
});

const Footer = component('Footer', function (interactions, props) {
  const onClearCompleted = interactions.get('onClearCompleted');
  const view = props.distinctUntilChanged().map(({list, filter}) => {
    const amountCompleted = list.count(item => item.get('completed'));
    const amountActive = list.size - amountCompleted;
    const style = {display: list.size ? 'inherit' : 'none'};

    return <footer className="footer" style={style}>
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
                      onClearCompleted={interactions.listener('onClearCompleted')} />
    </footer>;
  });
  return {
    view,
    events: {
      onClearCompleted
    }
  };
});

export default function view(todos$, interactions) {
  return todos$.map(todos =>
    <div>
      <Header input={todos.input}
              onInputSubmit={interactions.listener('onInputSubmit')}
              onInputKeyUp={interactions.listener('onInputKeyUp')}
              onInputChange={interactions.listener('onInputChange')} />
      <MainSection list={todos.list}
                   filterFn={todos.filterFn}
                   onItemNewContent={interactions.listener('onItemNewContent')}
                   onItemToggle={interactions.listener('onItemToggle')}
                   onItemDestroy={interactions.listener('onItemDestroy')}
                   onToggleAll={interactions.listener('onToggleAll')} />
      <Footer list={todos.list}
              filter={todos.filter}
              onClearCompleted={interactions.listener('onClearCompleted')} />
    </div>
  );
}
