'use strict';
const Cycle = require('cycle-react');
const React = require('react');
const TodoItem = require('./todo-item');

const Header = Cycle.component('Header', function (interactions, props) {
  let onInputSubmit = interactions.get('onSubmit')
    .do(e => e.preventDefault())
    .map(e => e.target.elements.newTodo.value);
  let onInputKeyUp = interactions.get('onKeyUp');
  let onInputChange = interactions.get('onChange');

  return {
    view: props.get('input').map(input =>
      <header id="header">
        <h1>todos</h1>
        <form className="new-todo-form"
              onSubmit={interactions.listener('onSubmit')}>
          <input id="new-todo"
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

const MainSection = Cycle.component('MainSection', function (interactions, props) {
  let onItemNewContent = interactions.get('onNewContent');
  let onItemToggle = interactions.get('onToggle');
  let onItemDestroy = interactions.get('onDestroy');
  let onToggleAll = interactions.get('onToggleAll');

  return {
    view: props.distinctUntilChanged().map(({list, filterFn}) => {
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

const CompleteButton = Cycle.component('CompleteButton', function (interactions, props) {
  let onClearCompleted = interactions.get('onClick');

  return {
    view: props.get('amountCompleted').map(amountCompleted => {
      if (amountCompleted > 0) {
        return <button id="clear-completed"
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

const Footer = Cycle.component('Footer', function (interactions, props) {
  let onClearCompleted = interactions.get('onClearCompleted');
  let view = props.distinctUntilChanged().map(({list, filter}) => {
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
  return {
    view,
    events: {
      onClearCompleted
    }
  };
});

module.exports = function view(todos$, interactions) {
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
};
