var Rx = require('rx');
var createEventSubject = require('./event-subject');
var makePropsObservable = require('./props');

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
