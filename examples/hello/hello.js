var Cycle = require('cycle-react');
var h = Cycle.h;

function computer(interactions) {
  return interactions.get('OnInputChange')
    .map(function (ev) {
      return ev.target.value;
    })
    .startWith('')
    .map(function (name) {
      return h('div', [
        h('label', 'Name:'),
        h('input.myinput', {
          type: 'text',
          onChange: interactions.listener('OnInputChange')
        }),
        h('hr'),
        h('h1', 'Hello ' + name)
      ]);
    });
}

Cycle.applyToDOM('.js-container', computer);
