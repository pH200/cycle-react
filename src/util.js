'use strict';

function LifecycleSubjects(createEventSubject) {
  // Expose observables like properties
  this.componentWillMount = createEventSubject();
  this.componentDidMount = createEventSubject();
  this.componentWillReceiveProps = createEventSubject();
  this.componentWillUpdate = createEventSubject();
  this.componentDidUpdate = createEventSubject();
  this.componentWillUnmount = createEventSubject();
}

function makeDispatchFunction(eventName, self) {
  return function dispatchCustomEvent(evData) {
    if (self.props) {
      const eventHandler = self.props[eventName];
      if (eventHandler) {
        eventHandler(evData);
      }
    }
  };
}

module.exports = {
  subscribeEventObservables(events, self, subscribe) {
    const eventNames = Object.keys(events);
    const eventSubscriptions = [];
    for (let i = 0; i < eventNames.length; i++) {
      const eventName = eventNames[i];
      const eventObs = events[eventName];
      eventSubscriptions.push(
        subscribe(eventObs, makeDispatchFunction(eventName, self))
      );
    }
    return eventSubscriptions;
  },
  createLifecycleSubjects(createEventSubject) {
    return new LifecycleSubjects(createEventSubject);
  }
};
