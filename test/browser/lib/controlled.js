const {Subject} = require('rxjs/Subject');
const {range} = require('lodash');

module.exports = function controlled(values) {
  const subject = new Subject();
  let startIndex = 0;
  function request(number) {
    if (number <= 0) {
      return;
    }
    const from = startIndex;
    const to = Math.min(from + number, values.length);
    if (from >= values.length) {
      return;
    }
    for (const i of range(from, to)) {
      subject.next(values[i]);
    }
    if (to === values.length) {
      subject.complete();
    }

    startIndex = to;
  }
  const observable = subject.asObservable();
  observable.request = request;
  return {
    observable,
    request
  };
};
