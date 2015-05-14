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

function makeDispatchFunction(elementGetter, eventName, handler) {
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
      if (handler) {
        handler(event);
      }
      element.dispatchEvent(event);
    } else {
      console.warn(
        eventName +
        ' event dispatched after the element has been destroyed'
      );
    }
  };
}

function composingEventObservables(events, handlers, elementGetter) {
  var eventNames = Object.keys(events);
  var eventObservables = [];
  for (var i = 0; i < eventNames.length; i++) {
    var eventName = eventNames[i];
    if (/\$$/.test(eventName) && eventName !== 'vtree$') {
      var eventObs = events[eventName];
      eventObservables.push(
        eventObs.doOnNext(
          makeDispatchFunction(
            elementGetter,
            eventName.slice(0, -1),
            handlers[eventName]
          )
        )
      );
    }
  }
  return eventObservables;
}

function composingCustomEventAttributes(props) {
  if (!props) {
    return {};
  }
  var propNames = Object.keys(props);
  var eventHandlers = {};
  for (var i = 0; i < propNames.length; i++) {
    var propName = propNames[i];
    if (/^on.+\$$/.test(propName)) {
      var handler = props[propName];
      if (typeof handler === 'function') {
        eventHandlers[propName.slice(2)] = handler;
      }
    }
  }
  return eventHandlers;
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

function createReactClass(
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
      var interactions = makeInteractions(this.rootElemSubject$);
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
      var eventHandlers = composingCustomEventAttributes(this.props);
      var eventObservables = composingEventObservables(
        this.cycleComponent.customEvents,
        eventHandlers,
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
      this.hasMounted = true;
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
      var node = React.findDOMNode(this);
      this.rootElemSubject$.onNext(node);
    },
    componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
      this.propsSubject$.onNext(nextProps);
    },
    render: function render() {
      if (this.state && this.state.vtree) {
        if (bindThis && typeof this.state.vtree === 'function') {
          // invoke literal is sufficient even though `addComponentAsRefTo`
          // might has something to do with `this`
          return this.state.vtree();
        }
        return this.state.vtree;
      }
      return React.createElement(rootTagName);
    }
  };

  if (Array.isArray(options.mixins)) {
    reactClassProto.mixins = options.mixins;
  } else {
    // https://facebook.github.io/react/docs/pure-render-mixin.html
    // This works perfectly because the state is always set by the new vtree.
    reactClassProto.mixins = [PureRenderMixin];
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

module.exports = createReactClass;
