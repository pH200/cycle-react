// https://github.com/Reactive-Extensions/rx-node/blob/master/index.js
'use strict';
var Rx = require('rx');
var Observable = Rx.Observable;
/**
 * Converts a flowing stream to an Observable sequence.
 * @param {Stream} stream A stream to convert to a observable sequence.
 * @param {String} [finishEventName] Event that notifies about closed stream. ("end" by default)
 * @returns {Observable} An observable sequence which fires on each 'data' event as well as handling 'error' and finish events like `end` or `finish`.
 */
module.exports = function fromStream(stream, finishEventName) {
  stream.pause();

  finishEventName || (finishEventName = 'end');

  return Observable.create(function (observer) {
    function dataHandler (data) {
      observer.onNext(data);
    }

    function errorHandler (err) {
      observer.onError(err);
    }

    function endHandler () {
      observer.onCompleted();
    }

    stream.addListener('data', dataHandler);
    stream.addListener('error', errorHandler);
    stream.addListener(finishEventName, endHandler);

    stream.resume();

    return function () {
      stream.removeListener('data', dataHandler);
      stream.removeListener('error', errorHandler);
      stream.removeListener(finishEventName, endHandler);
    };
  }).publish().refCount();
}
