const createEventSubject = require('../../../src/adapter/rxjs/event-subject');

describe('createEventSubject', () => {
  it('should have onEvent', () => {
    const subject = createEventSubject();
    expect(typeof subject.onEvent).toBe('function');
  });

  it('should be a subject', () => {
    const subject = createEventSubject();
    expect(typeof subject.next).toBe('function');
    expect(typeof subject.error).toBe('function');
    expect(typeof subject.complete).toBe('function');
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
