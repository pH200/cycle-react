'use strict';
var Rx = require('rx');

function createEventSubject() {
  var subject = new Rx.Subject();
  subject.onEvent = function onEvent(value) {
    subject.onNext(value);
  };
  return subject;
}

module.exports = createEventSubject;
