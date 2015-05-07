'use strict';
var React = require('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var Rx = require('rx');
var digestDefinitionFnOutput = require('./util').digestDefinitionFnOutput;

function makeInteractions(rootElem$) {
  return {
    get: function get(selector, eventName, isSingle) {
      if (typeof selector !== 'string') {
        throw new Error('interactions.get() expects first argument to be a ' +
          'string as a CSS selector');
      }
      if (typeof eventName !== 'string') {
        throw new Error('interactions.get() expects second argument to be a ' +
          'string representing the event type to listen for.');
      }

      return rootElem$
        .flatMapLatest(function flatMapDOMUserEventStream(rootElem) {
          if (!rootElem) {
            return Rx.Observable.empty();
          }
          var klass = selector.replace('.', '');
          var klassRegex = new RegExp('\\b' + klass + '\\b');
          if (klassRegex.test(rootElem.className)) {
            return Rx.Observable.fromEvent(rootElem, eventName);
          }
          if (isSingle) {
            var targetElement = rootElem.querySelector(selector);
            if (targetElement) {
              return Rx.Observable.fromEvent(targetElement, eventName);
            }
          } else {
            var targetElements = rootElem.querySelectorAll(selector);
            if (targetElements && targetElements.length > 0) {
              return Rx.Observable.fromEvent(targetElements, eventName);
            }
          }
          return Rx.Observable.empty();
        });
    }
  };
}

function makeDispatchFunction(elementGetter, eventName) {
  return function dispatchCustomEvent(evData) {
    //console.log('%cdispatchCustomEvent ' + eventName,
    //  'background-color: #CCCCFF; color: black');
    var event;
    try {
      event = new Event(eventName);
    } catch (err) {
      event = document.createEvent('Event');
      event.initEvent(eventName, true, true);
    }
    event.data = evData;
    var element = elementGetter();
    if (element) {
      element.dispatchEvent(event);
    } else {
      console.warn(
        eventName +
        ' event dispatched after the element has been destroyed'
      );
    }
  };
}

function composingEventObservables(events, elementGetter) {
  var eventNames = Object.keys(events);
  var eventObservables = [];
  for (var i = 0; i < eventNames.length; i++) {
    var eventName = eventNames[i];
    if (/\$$/.test(eventName) && eventName !== 'vtree$') {
      var eventObs = events[eventName];
      eventObservables.push(
        eventObs.doOnNext(
          makeDispatchFunction(elementGetter, eventName.slice(0, -1))
        )
      );
    }
  }
  return eventObservables;
}

function fixClassName(className) {
  return function innerFixClassName(vtree) {
    if (!className) {
      return vtree;
    }
    var props = vtree.props;
    if (typeof props.className !== 'string' ||
      props.className === '') {
      props.className = className;
    } else {
      props.className = props.className + ' ' + className;
    }
    return vtree;
  };
}

function createGetPropFn(propsSubject$) {
  return function getProp(propName, comparer) {
    var prop$ = propsSubject$.map(function mapProp(p) {
      return p[propName];
    });
    if (comparer) {
      return prop$.distinctUntilChanged(Rx.helpers.identity, comparer);
    }
    return prop$.distinctUntilChanged();
  };
}

function createReactClass(
  displayName,
  definitionFn,
  rootTagName,
  observer,
  eventObserver) {
  if (typeof displayName !== 'string') {
    throw new Error('Invalid displayName');
  }
  if (typeof definitionFn !== 'function') {
    throw new Error('Invalid definitionFn');
  }
  return React.createClass({
    displayName: displayName,
    // https://facebook.github.io/react/docs/pure-render-mixin.html
    // This works perfectly because we're only setting vtree for the state.
    mixins: [PureRenderMixin],
    getInitialState: function getInitialState() {
      return {vtree: null};
    },
    componentWillMount: function componentWillMount() {
      var self = this;
      this.disposable = new Rx.CompositeDisposable();
      var propsSubject$ = new Rx.BehaviorSubject(this.props);
      propsSubject$.get = createGetPropFn(propsSubject$);
      this.propsSubject$ = propsSubject$;
      this.rootElemSubject$ = new Rx.ReplaySubject(1);
      var interactions = makeInteractions(this.rootElemSubject$);
      var cycleComponent = digestDefinitionFnOutput(
        definitionFn(interactions, this.propsSubject$)
      );
      this.cycleComponent = cycleComponent;
      this.onMount = cycleComponent.onMount;
      var vtree$ = cycleComponent.vtree$;
      if (this.props.className) {
        vtree$ = vtree$.doOnNext(fixClassName(this.props.className));
      }
      var vtreeDoSet$ = vtree$.doOnNext(function onNextVTree(vtree) {
        self.setState({vtree: vtree});
      });
      var subscription = observer ?
        vtreeDoSet$.subscribe(observer) : vtreeDoSet$.subscribe();
      this.disposable.add(this.propsSubject$);
      this.disposable.add(this.rootElemSubject$);
      this.disposable.add(subscription);
    },
    componentWillUnmount: function componentWillUnmount() {
      this.propsSubject$.onCompleted();
      this.rootElemSubject$.onCompleted();
      this.disposable.dispose();
    },
    componentDidMount: function componentDidMount() {
      // Subscribe events
      var self = this;
      var eventObservables = composingEventObservables(
        this.cycleComponent.customEvents,
        function getCurrentElement() {
          return React.findDOMNode(self);
        }
      );
      if (eventObservables.length > 0) {
        var eventSubscription;
        if (eventObserver) {
          eventSubscription =
            Rx.Observable.merge(eventObservables).subscribe(eventObserver);
        } else {
          eventSubscription =
            Rx.Observable.merge(eventObservables).subscribe();
        }
        this.disposable.add(eventSubscription);
      }
      // Notify new rootElem
      var node = React.findDOMNode(this);
      this.rootElemSubject$.onNext(node);
      if (this.onMount) {
        this.onMount(node);
      }
    },
    componentDidUpdate: function componentDidUpdate() {
      var node = React.findDOMNode(this);
      this.rootElemSubject$.onNext(node);
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      this.propsSubject$.onNext(nextProps);
    },
    render: function render() {
      if (this.state) {
        return this.state.vtree;
      }
      return React.createElement(rootTagName ? rootTagName : 'div');
    }
  });
}

module.exports = createReactClass;
