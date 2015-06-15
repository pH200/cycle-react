'use strict';
var React = require('react');
var Rx = require('rx');
var digestDefinitionFnOutput = require('./util').digestDefinitionFnOutput;
var makeInteractions = require('./interactions').makeInteractions;
var createCustomEventWithOption = require('./create-custom-event');

function makeDispatchFunction(elementGetter, eventName, handler, noDispatch) {
  return function dispatchCustomEvent(evData) {
    var element = elementGetter();
    var event = createCustomEventWithOption(eventName, {
      detail: evData,
      bubbles: true,
      cancelable: true
    }, element, noDispatch);
    if (element) {
      if (handler) {
        // invoke the event handler from props
        handler(event);
      }
      if (!noDispatch) {
        // dispatch DOM event by default
        element.dispatchEvent(event);
      }
    } else {
      console.warn(
        eventName +
        ' event dispatched after the element has been destroyed'
      );
    }
  };
}

function composingEventObservables(events, handlerGetter, elementGetter, noDispatch) {
  var eventNames = Object.keys(events);
  var eventObservables = [];
  for (var i = 0; i < eventNames.length; i++) {
    var eventName = eventNames[i];
    var eventObs = events[eventName];
    eventObservables.push(
      eventObs.doOnNext(
        makeDispatchFunction(
          elementGetter,
          eventName,
          handlerGetter(eventName),
          noDispatch
        )
      )
    );
  }
  return eventObservables;
}

function getEventHandlerGetter(self) {
  return function eventHandlerGetter(eventName) {
    if (!self.props) {
      return null;
    }
    var eventHandler = self.props['on' + eventName];
    if (eventHandler) {
      if (typeof eventHandler === 'function') {
        return eventHandler;
      } else {
        throw new Error('on' + eventName + ' handler must be a function.');
      }
    }
    var caseConvertedName =
      'on' + eventName.substr(0, 1).toUpperCase() + eventName.substr(1);
    var caseConvertedHandler = self.props[caseConvertedName];
    if (caseConvertedHandler) {
      if (typeof caseConvertedHandler === 'function') {
        return caseConvertedHandler;
      } else {
        throw new Error(caseConvertedName + ' handler must be a function.');
      }
    }
    return null;
  };
}

function createGetPropFn(propsSubject$) {
  return function getProp(propName, comparer) {
    if (propName === '*') {
      return propsSubject$;
    }
    var prop$ = propsSubject$.map(function mapProp(p) {
      return p[propName];
    });
    if (comparer) {
      return prop$.distinctUntilChanged(Rx.helpers.identity, comparer);
    }
    return prop$.distinctUntilChanged();
  };
}

function component(
  displayName,
  definitionFn,
  options,
  observer,
  eventObserver) {
  if (typeof displayName !== 'string') {
    throw new Error('Invalid displayName');
  }
  if (typeof definitionFn !== 'function') {
    throw new Error('Invalid definitionFn');
  }
  options = options || {};
  // The option for the default root element type.
  var rootTagName = options.rootTagName || 'div';
  // The option for passing "this" to definitionFn
  var bindThis = !!options.bindThis;
  // The option for skipping DOM dispatchEvent
  var noDOMDispatchEvent = !!options.noDOMDispatchEvent;

  var reactClassProto = {
    displayName: displayName,
    getInitialState: function getInitialState() {
      this.hasMounted = false;
      return {vtree: null};
    },
    _subscribeCycleComponent: function () {
      var self = this;
      this.disposable = new Rx.CompositeDisposable();
      var propsSubject$ = new Rx.BehaviorSubject(this.props);
      propsSubject$.get = createGetPropFn(propsSubject$);
      this.propsSubject$ = propsSubject$;
      this.rootElemSubject$ = new Rx.ReplaySubject(1);
      var interactions = makeInteractions(
        this.rootElemSubject$.distinctUntilChanged()
      );
      var cycleComponent = digestDefinitionFnOutput(
        bindThis ?
        definitionFn(interactions, this.propsSubject$, this) :
        definitionFn(interactions, this.propsSubject$)
      );
      this.cycleComponent = cycleComponent;
      this.cycleComponentDispose = cycleComponent.dispose;
      this.onMount = cycleComponent.onMount;
      var vtree$ = cycleComponent.vtree$;
      var vtreeDoSet$ = vtree$.doOnNext(function onNextVTree(vtree) {
        self.setState({vtree: vtree});
      });
      var subscription = observer ?
        vtreeDoSet$.subscribe(observer) : vtreeDoSet$.subscribe();
      this.disposable.add(this.propsSubject$);
      this.disposable.add(this.rootElemSubject$);
      this.disposable.add(subscription);
    },
    _unsubscribeCycleComponent: function () {
      if (this.propsSubject$) {
        this.propsSubject$.onCompleted();
      }
      if (this.rootElemSubject$) {
        this.rootElemSubject$.onCompleted();
      }
      if (this.cycleComponentDispose) {
        var dispose = this.cycleComponentDispose;
        if (typeof dispose === 'function') {
          this.disposable.add(Rx.Disposable.create(dispose));
        } else if (typeof dispose.dispose === 'function') {
          this.disposable.add(dispose);
        }
      }
      if (this.disposable) {
        this.disposable.dispose();
      }
    },
    _subscribeCycleEvents: function () {
      var self = this;
      var eventObservables = composingEventObservables(
        this.cycleComponent.customEvents,
        getEventHandlerGetter(self),
        function getCurrentElement() {
          return React.findDOMNode(self);
        },
        noDOMDispatchEvent
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
      this.hasMounted = true;
    },
    shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
      // Only care about the state since the props have been observed.
      return this.state !== nextState;
    },
    componentWillMount: function componentWillMount() {
      this._subscribeCycleComponent();
    },
    componentWillUnmount: function componentWillUnmount() {
      this._unsubscribeCycleComponent();
    },
    componentDidMount: function componentDidMount() {
      this._subscribeCycleEvents();
    },
    componentDidUpdate: function componentDidUpdate() {
      // This action should be fast since React will cache the result of findDOMNode
      // facebook/react/src/renderers/dom/client/ReactMount.js#getNodeFromInstance
      var node = React.findDOMNode(this);
      this.rootElemSubject$.onNext(node);
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      this.propsSubject$.onNext(nextProps);
    },
    render: function render() {
      if (this.state && this.state.vtree) {
        if (bindThis && typeof this.state.vtree === 'function') {
          // `this` is bound automatically by React.createClass so the element
          // will have the owner set by this component
          return this.state.vtree();
        }
        return this.state.vtree;
      }
      return React.createElement(rootTagName);
    }
  };

  if (Array.isArray(options.mixins)) {
    reactClassProto.mixins = options.mixins;
  }
  if (options.propTypes) {
    reactClassProto.propTypes = options.propTypes;
  }
  // Override forceUpdate for react-hot-loader
  if (options._testForceHotLoader ||
    (!options.disableHotLoader && module.hot))
  {
    reactClassProto.forceUpdate = function hotForceUpdate(callback) {
      if (this.hasMounted) {
        this._unsubscribeCycleComponent();
        this._subscribeCycleComponent();
        this._subscribeCycleEvents();
      }
      if (callback) {
        callback();
      }
    };
  }

  return React.createClass(reactClassProto);
}

module.exports = component;
