import {component} from 'cycle-react/rxjs';
import React from 'react';
import {Observable} from 'rxjs/Rx';
const ESC_KEY = 27;

const TodoItem = component('TodoItem', function (interactions, props) {
  function onSubmitHandler(e) {
    e.preventDefault();
    /*eslint-disable dot-notation */
    interactions.listener('onSubmit')(e.target.elements['contentedit'].value);
    /*eslint-enable dot-notation */
  }

  const id$ = props.pluck('todoid');
  const onChange$ = interactions.get('onChange');
  const editContent$ = props.pluck('content')
    .merge(onChange$.map(ev => ev.target.value));
  const startEdit$ = interactions.get('onDoubleClick');
  const stopEdit$ = interactions.get('onKeyUp')
    .filter(e => e.keyCode === ESC_KEY)
    .merge(interactions.get('onBlur'))
    .map(e => e.target.value)
    .merge(interactions.get('onSubmit'));
  const editing$ = Observable.merge(
    startEdit$.map(() => true),
    stopEdit$.map(() => false)
  ).startWith(false);

  const vtree$ = props.combineLatest(
    editContent$,
    editing$,
    function (todo, editContent, editing) {
      const className = (todo.completed ? 'completed ' : '') +
        (editing ? 'editing' : '');
      if (editing) {
        return <li className={className}>
          <form className="editform"
                onSubmit={onSubmitHandler}>
            <input className="edit"
                   name="contentedit"
                   autoFocus={true}
                   value={editContent}
                   onChange={interactions.listener('onChange')}
                   onKeyUp={interactions.listener('onKeyUp')}
                   onBlur={interactions.listener('onBlur')} />
          </form>
        </li>;
      }
      return <li className={className}>
        <div className="view">
          <input className="toggle"
                 type="checkbox"
                 checked={!!todo.completed}
                 onChange={interactions.listener('onToggle')} />
          <label onDoubleClick={interactions.listener('onDoubleClick')}>
            {todo.content}
          </label>
          <button className="destroy"
                  onClick={interactions.listener('onDestroy')} />
        </div>
      </li>;
    }
  );
  return {
    view: vtree$,
    events: {
      onToggle: interactions.get('onToggle')
        .withLatestFrom(id$, (ev, id) => id),
      onDestroy: interactions.get('onDestroy')
        .merge(stopEdit$.filter(content => content.trim() === ''))
        .withLatestFrom(id$, (ev, id) => id),
      onNewContent: stopEdit$
        .filter(content => content.trim() !== '')
        .withLatestFrom(id$, (content, id) => ({
          id,
          content: content.trim()
        }))
    }
  };
});

export default TodoItem;
