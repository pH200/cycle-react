const createEventSubject = require('./event-subject');
const makePropsObservable = require('./props');
const CompositeDisposableRx4 = require('./CompositeDisposableRx4');

module.exports = function createAdapter() {
  return {
    createEventSubject: createEventSubject,
    makePropsObservable: makePropsObservable,
    CompositeDisposable: CompositeDisposableRx4,
    next(observer, value) {
      return observer.onNext(value);
    },
    complete(observer) {
      return observer.onCompleted();
    },
    isObservable(observable) {
      return observable && typeof observable.subscribe === 'function';
    }
  };
};
