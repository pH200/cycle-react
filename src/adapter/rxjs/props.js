const {BehaviorSubject} = require('rxjs/BehaviorSubject');
require('rxjs/add/operator/map');
require('rxjs/add/operator/distinctUntilChanged');

function isEqual(x, y) {
  return x === y;
}

module.exports = function makePropsObservable(props) {
  var propsSubject$ = new BehaviorSubject(props);
  propsSubject$.get = function getProp(propName, comparer) {
    if (propName === '*') {
      return propsSubject$;
    }
    return propsSubject$.map(function mapProp(p) {
      return p[propName];
    }).distinctUntilChanged(comparer || isEqual);
  };
  propsSubject$.getAll = function getAllProps() {
    return propsSubject$;
  };
  return propsSubject$;
}
