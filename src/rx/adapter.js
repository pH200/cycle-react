const Rx = require('rx');
const createEventSubject = require('./event-subject');
const makePropsObservable = require('./props');

module.exports = function createAdapter() {
  return {
    createEventSubject: createEventSubject,
    makePropsObservable: makePropsObservable,
    CompositeDisposable: Rx.CompositeDisposable,
    createDisposable: Rx.Disposable.create,
    subscribe: function subscribe(observable, onNext) {
      return observable.subscribe(onNext);
    }
  };
};
