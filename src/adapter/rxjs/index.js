const createEventSubject = require('./event-subject');
const makePropsObservable = require('./props');
const CompositeDisposable = require('./CompositeDisposable');

module.exports = function createAdapter() {
  return {
    createEventSubject: createEventSubject,
    makePropsObservable: makePropsObservable,
    CompositeDisposable: CompositeDisposable,
    next(observer, value) {
      return observer.next(value);
    },
    complete(observer) {
      return observer.complete();
    },
    isObservable(observable) {
      return observable && typeof observable.subscribe === 'function';
    }
  };
};
