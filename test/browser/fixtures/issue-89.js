'use strict';
let Rx = require('rx');
let React = require('react');

function myelement(interactions, props) {
  return props
    .map(p => p.content)
    .distinctUntilChanged()
    .map(content => <h3 className="myelementclass">{content}</h3>);
}

function makeModelNumber$() {
  return Rx.Observable.of(123, 456).controlled();
}

function viewWithContainerFn(number$, MyElement) {
  return number$.map(number =>
    <div>
      <MyElement content={String(number)} />
    </div>
  );
}

function viewWithoutContainerFn(number$, MyElement) {
  return number$.map(number =>
    <MyElement content={String(number)} />
  );
}

module.exports = {
  myelement,
  makeModelNumber$,
  viewWithContainerFn,
  viewWithoutContainerFn
};
