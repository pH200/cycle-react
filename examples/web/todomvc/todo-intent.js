let {Rx} = require('cycle-react');
let ESC_KEY = 27;

function todoIntent(interactions) {
  return {
    changeRoute$: Rx.Observable.fromEvent(window, 'hashchange')
      .map(ev => ev.newURL.match(/\#[^\#]*$/)[0].replace('#', ''))
      .startWith(window.location.hash.replace('#', '')),
    changeInput$: interactions.get('onInputChange')
      .map(ev => ev.target.value),
    clearInput$: interactions.get('onInputKeyUp')
      .filter(ev => ev.keyCode === ESC_KEY),
    insertTodo$: interactions.get('onInputSubmit')
      .map(value => String(value).trim())
      .filter(value => value !== ''),
    editTodo$: interactions.get('onItemNewContent'),
    toggleTodo$: interactions.get('onItemToggle'),
    toggleAll$: interactions.get('onToggleAll'),
    deleteTodo$: interactions.get('onItemDestroy'),
    deleteCompleteds$: interactions.get('onClearCompleted')
  };
}

module.exports = todoIntent;
