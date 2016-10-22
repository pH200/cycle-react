const createEventSubject = require('../../src/rx/event-subject');

describe('createEventSubject', () => {
  it('should have onEvent', () => {
    const subject = createEventSubject();
    expect(typeof subject.onEvent).toBe('function');
  });

  it('should be a subject', () => {
    const subject = createEventSubject();
    expect(typeof subject.onNext).toBe('function');
    expect(typeof subject.onError).toBe('function');
    expect(typeof subject.onCompleted).toBe('function');
    expect(typeof subject.subscribe).toBe('function');
  });

  it('should have onEvent bound', (done) => {
    const subject = createEventSubject();
    const onEvent = subject.onEvent;

    subject.subscribe((value) => {
      expect(value).toBe(1);
      done();
    });

    onEvent(1);
  });
});
