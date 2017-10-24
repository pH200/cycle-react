const Rx = require('rx');

function isEqual(x, y) {
  return x === y;
}

module.exports = function makePropsObservable(props) {
  var propsSubject$ = new Rx.BehaviorSubject(props);
  propsSubject$.get = function getProp(propName, comparer) {
    if (propName === '*') {
      return propsSubject$;
    }
    return propsSubject$.map(function mapProp(p) {
      return p[propName];
    }).distinctUntilChanged(Rx.helpers.identity, comparer || isEqual);
  };
  propsSubject$.getAll = function getAllProps() {
    return propsSubject$;
  };
  return propsSubject$;
}
