const { merge, Subject } = require('rxjs');
const { scan, startWith } = require('rxjs/operators');

module.exports = {
  scan,
  startWith,
  createEventSubject() {
    const subject = new Subject();
    subject.onEvent = function onEvent(value) {
      subject.next(value);
    };
    return subject;
  },
  mergeObservable(array) {
    return merge.apply(merge, array);
  }
};
