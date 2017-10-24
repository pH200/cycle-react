const Rx = require('rx');

module.exports = function makePropsObservable(props) {
  return new Rx.BehaviorSubject(props);
}
