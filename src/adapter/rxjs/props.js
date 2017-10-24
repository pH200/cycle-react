const {BehaviorSubject} = require('rxjs/BehaviorSubject');

module.exports = function makePropsObservable(props) {
  return new BehaviorSubject(props);
}
