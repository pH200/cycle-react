let Cycle = require('cycle-react');
let React = require('react');
let Rx = Cycle.Rx;
let ESC_KEY = 27;

let TodoItem = Cycle.component('TodoItem', function (interactions, props) {
  function onSubmitHandler(e) {
    e.preventDefault();
    /*eslint-disable dot-notation */
    interactions.listener('onSubmit')(e.target.elements['contentedit'].value);
    /*eslint-enable dot-notation */
  }

  let id$ = props.get('todoid').shareReplay(1);
  let onChange$ = interactions.get('onChange');
  let editContent$ = props.get('content')
    .merge(onChange$.map(ev => ev.target.value));
  let startEdit$ = interactions.get('onDoubleClick');
  let stopEdit$ = interactions.get('onKeyUp')
    .filter(e => e.keyCode === ESC_KEY)
    .merge(interactions.get('onBlur'))
    .map(e => e.target.value)
    .merge(interactions.get('onSubmit'));
  let editing$ = Rx.Observable.merge(
    startEdit$.map(() => true),
    stopEdit$.map(() => false)
  ).startWith(false);

  let vtree$ = props.combineLatest(
    editContent$,
    editing$,
    function (todo, editContent, editing) {
      let className = (todo.completed ? 'completed ' : '') +
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
        .withLatestFrom(id$, (ev, id) => id),
      onNewContent: stopEdit$
        .distinctUntilChanged()
        .withLatestFrom(id$, (content, id) => ({
          id, content
        }))
    }
  };
});

module.exports = TodoItem;
