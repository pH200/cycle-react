const {Subject} = require('rxjs/Subject');

module.exports = function createEventSubject() {
  const subject = new Subject();
  subject.onEvent = function onEvent(value) {
    subject.next(value);
  };
  return subject;
};
