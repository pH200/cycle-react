const Rx = require('rx');
const r = require('react').createElement;

function myelement(interactions, props) {
  return props
    .map(p => p.content)
    .distinctUntilChanged()
    .map(content => r('h3', {className: 'myelementclass'}, content));
}

function makeModelNumber$() {
  return Rx.Observable.of(123, 456).controlled();
}

function viewWithContainerFn(number$, MyElement) {
  return number$.map(number =>
    r('div', null, r(MyElement, {content: String(number)}))
  );
}

function viewWithoutContainerFn(number$, MyElement) {
  return number$.map(number =>
    r(MyElement, {content: String(number)})
  );
}

module.exports = {
  myelement,
  makeModelNumber$,
  viewWithContainerFn,
  viewWithoutContainerFn
};
