const Rx = require('rx');

module.exports = function createEventSubject() {
  const subject = new Rx.Subject();
  subject.onEvent = function onEvent(value) {
    subject.onNext(value);
  };
  return subject;
}
