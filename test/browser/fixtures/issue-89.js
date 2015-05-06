'use strict';
let Cycle = require('../../../src/cycle');
let {Rx, h} = Cycle;

function myelement(interactions, props$) {
  return {
    vtree$: props$
      .map(p => p.content)
      .distinctUntilChanged()
      .map(content => h('h3.myelementclass', content))
  };
}

function makeModelNumber$() {
  return Rx.Observable.of(123, 456).controlled();
}

function viewWithContainerFn(number$, MyElement) {
  return number$.map(number =>
    h('div', [
      h(MyElement, {content: String(number)})
    ])
  );
}

function viewWithoutContainerFn(number$, MyElement) {
  return number$.map(number =>
    h(MyElement, {content: String(number)})
  );
}

module.exports = {
  myelement,
  makeModelNumber$,
  viewWithContainerFn,
  viewWithoutContainerFn
};
