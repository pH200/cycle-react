var util = require('./util');
var digestDefinitionFnOutput = util.digestDefinitionFnOutput;
var createLifecycleSubjects = util.createLifecycleSubjects;
var makeInteractions = require('./interactions');

function createReactClass(React, Adapter) {
  var makePropsObservable = Adapter.makePropsObservable;
  var createEventSubject = Adapter.createEventSubject;
  var CompositeDisposable = Adapter.CompositeDisposable;
  var createDisposable = Adapter.createDisposable;
  var doOnNext = Adapter.doOnNext;
  var subscribe = Adapter.subscribe;
  var subscribeAll = Adapter.subscribeAll;

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

  function composingEventObservables(events, self) {
    var eventNames = Object.keys(events);
    var eventObservables = [];
    for (var i = 0; i < eventNames.length; i++) {
      var eventName = eventNames[i];
      var eventObs = events[eventName];
      eventObservables.push(
        doOnNext(eventObs, makeDispatchFunction(eventName, self))
      );
    }
    return eventObservables;
  }

  return function component(
    displayName,
    definitionFn,
    componentOptions
  ) {
    if (typeof displayName !== 'string') {
      throw new Error('Invalid displayName');
    }
    if (typeof definitionFn !== 'function') {
      throw new Error('Invalid definitionFn');
    }
    var options = componentOptions || {};
    // The option for the default root element type.
    var rootTagName = options.rootTagName || 'div';

    var reactClassProto = {
      displayName: displayName,
      getInitialState: function getInitialState() {
        this.hasMounted = false;
        return {vtree: null};
      },
      _subscribeCycleComponent: function _subscribeCycleComponent() {
        var self = this;
        this.disposable = new CompositeDisposable();
        var propsSubject$ = makePropsObservable(this.props);
        this.propsSubject$ = propsSubject$;
        var interactions = makeInteractions(createEventSubject);
        this.interactions = interactions;
        var lifecycles = createLifecycleSubjects(createEventSubject);
        this.lifecycles = lifecycles;
        var cycleComponent = digestDefinitionFnOutput(
          definitionFn(interactions, propsSubject$, this, lifecycles)
        );
        this.cycleComponent = cycleComponent;
        this.cycleComponentDispose = cycleComponent.dispose;
        this.onMount = cycleComponent.onMount;
        var vtree$ = cycleComponent.vtree$;
        var subscription = subscribe(vtree$, function onNextVTree(vtree) {
          self.setState({vtree: vtree});
        });

        this.disposable.add(propsSubject$);
        this.disposable.add(subscription);
      },
      _unsubscribeCycleComponent: function _unsubscribeCycleComponent() {
        if (this.propsSubject$) {
          this.propsSubject$.onCompleted();
        }
        if (this.cycleComponentDispose) {
          var dispose = this.cycleComponentDispose;
          if (typeof dispose === 'function') {
            this.disposable.add(createDisposable(dispose));
          } else if (typeof dispose.dispose === 'function') {
            this.disposable.add(dispose);
          }
        }
        if (this.disposable) {
          this.disposable.dispose();
        }
      },
      _subscribeCycleEvents: function _subscribeCycleEvents() {
        var self = this;
        var eventObservables = composingEventObservables(
          this.cycleComponent.customEvents,
          self
        );
        if (eventObservables.length > 0) {
          var eventSubscription = subscribeAll(eventObservables);
          this.disposable.add(eventSubscription);
        }
      },
      shouldComponentUpdate: function shouldComponentUpdate(nextProps, nextState) {
        // Only care about the state since the props have been observed.
        return this.state !== nextState;
      },
      componentWillMount: function componentWillMount() {
        // componentWillMount is called for both client and server
        // https://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount
        this._subscribeCycleComponent();
        this.lifecycles.componentWillMount.onEvent();
      },
      componentDidMount: function componentDidMount() {
        this._subscribeCycleEvents();
        if (this.onMount) {
          this.onMount(this);
        }
        this.hasMounted = true;
        this.lifecycles.componentDidMount.onEvent();
      },
      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.propsSubject$.onNext(nextProps);
        this.lifecycles.componentWillReceiveProps.onEvent(nextProps);
      },
      componentWillUpdate: function componentWillUpdate(nextProps) {
        this.lifecycles.componentWillUpdate.onEvent(nextProps);
      },
      componentDidUpdate: function componentDidUpdate(prevProps) {
        this.lifecycles.componentDidUpdate.onEvent(prevProps);
      },
      componentWillUnmount: function componentWillUnmount() {
        // componentWillUnmount is not being called for server
        this._unsubscribeCycleComponent();
        this.lifecycles.componentWillUnmount.onEvent();
      },
      render: function render() {
        if (this.state && this.state.vtree) {
          // TODO: Remove this block in the future releases
          if (typeof this.state.vtree === 'function' &&
              typeof console !== 'undefined')
          {
            console.warn(
              'Support for using the function as view is ' +
              'deprecated and will be soon removed.'
            );
            return React.cloneElement(this.state.vtree());
          }
          return React.cloneElement(this.state.vtree);
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
  };
}

module.exports = createReactClass;
