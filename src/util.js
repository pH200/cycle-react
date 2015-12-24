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
      var eventHandler = self.props[eventName];
      if (eventHandler) {
        eventHandler(evData);
      }
    }
  };
}

module.exports = {
  subscribeEventObservables: function subscribeEventObservables(events, self, subscribe) {
    var eventNames = Object.keys(events);
    var eventSubscriptions = [];
    for (var i = 0; i < eventNames.length; i++) {
      var eventName = eventNames[i];
      var eventObs = events[eventName];
      eventSubscriptions.push(
        subscribe(eventObs, makeDispatchFunction(eventName, self))
      );
    }
    return eventSubscriptions;
  },
  createLifecycleSubjects: function createLifecycleSubjects(createEventSubject) {
    return new LifecycleSubjects(createEventSubject);
  }
};
