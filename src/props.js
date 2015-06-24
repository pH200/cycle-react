'use strict';
var Rx = require('rx');

function makeEmptyPropsObservable() {
  var empty = Rx.Observable.empty();
  empty.get = function getProp() {
    return Rx.Observable.empty();
  };
  empty.getAll = function getAll() {
    return Rx.Observable.empty();
  };
  return empty;
}

function makePropsObservable(props) {
  var propsSubject$ = new Rx.BehaviorSubject(props);
  propsSubject$.get = function getProp(propName, comparer) {
    if (propName === '*') {
      return propsSubject$;
    }
    var prop$ = propsSubject$.map(function mapProp(p) {
      return p[propName];
    });
    if (comparer) {
      return prop$.distinctUntilChanged(Rx.helpers.identity, comparer);
    }
    return prop$.distinctUntilChanged();
  };
  propsSubject$.getAll = function getAllProps() {
    return propsSubject$;
  };
  return propsSubject$;
}

module.exports = {
  makeEmptyPropsObservable: makeEmptyPropsObservable,
  makePropsObservable: makePropsObservable
};
