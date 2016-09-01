'use strict';
var Rx = require('rx');

function createEventSubject() {
  var subject = new Rx.Subject();
  subject.onEvent = function onEvent() {
    subject.onNext.apply(subject, Array.prototype.slice.call(arguments));
  };
  return subject;
}

module.exports = createEventSubject;
