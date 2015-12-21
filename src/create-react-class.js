var util = require('./util');
var digestDefinitionFnOutput = util.digestDefinitionFnOutput;
var createLifecycleSubjects = util.createLifecycleSubjects;
var makeInteractions = require('./interactions');
var ReactRenderScheduler = require('./rx/react-render-scheduler');

// Use a special object to distinguish between a render that results in an empty vtree,
// or having not rendered a vTree.  This matters with the render scheduler and how it delays
// applying the vtree.
var noVtree = {};

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

  return function component(displayName,
                            definitionFn,
                            componentOptions) {
    if (typeof displayName !== 'string') {
      throw new Error('Invalid displayName');
    }
    if (typeof definitionFn !== 'function') {
      throw new Error('Invalid definitionFn');
    }
    var options = componentOptions || {};
    // The option for the default root element type.
    var rootTagName = options.rootTagName || 'div';
    var enableRenderScheduler = !!options.renderScheduler;

    var reactClassProto = {
      displayName: displayName,
      getInitialState: function getInitialState() {
        this.hasMounted = false;
        return {
          vtree: null,
          lastScheduledId: -1
        };
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
        if (enableRenderScheduler) {
          this.renderScheduler = new ReactRenderScheduler();
        }

        var cycleComponent = digestDefinitionFnOutput(
          definitionFn(
            interactions,
            propsSubject$,
            this,
            lifecycles,
            this.renderScheduler
          )
        );
        this.cycleComponent = cycleComponent;
        this.cycleComponentDispose = cycleComponent.dispose;
        this.onMount = cycleComponent.onMount;
        this._renderedVtree = noVtree;
        var vtree$ = cycleComponent.vtree$;

        if (enableRenderScheduler) {
          var schedulerReadySubscription = subscribe(
            this.renderScheduler.scheduledReadySubject,
            function onHasScheduled(lastScheduledId) {
              if (!self.renderScheduler.isProcessing) {
                self.setState({
                  lastScheduledId: lastScheduledId
                });
              }
            }
          );
          this.disposable.add(schedulerReadySubscription);
        }

        var subscription = subscribe(vtree$, function onNextVTree(vtree) {
          if (self.renderScheduler && self.renderScheduler.isProcessing) {
            self._renderedVtree = vtree;
          } else {
            self.setState({vtree: vtree});
          }
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
        this.lifecycles.componentWillMount.onNext();
      },
      componentDidMount: function componentDidMount() {
        this._subscribeCycleEvents();
        if (this.onMount) {
          this.onMount(this);
        }
        this.hasMounted = true;
        this.lifecycles.componentDidMount.onNext();
      },
      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.propsSubject$.onNext(nextProps);
        this.lifecycles.componentWillReceiveProps.onNext(nextProps);
      },
      componentWillUpdate: function componentWillUpdate(nextProps) {
        this.lifecycles.componentWillUpdate.onNext(nextProps);
      },
      componentDidUpdate: function componentDidUpdate(prevProps) {
        this.lifecycles.componentDidUpdate.onNext(prevProps);
      },
      componentWillUnmount: function componentWillUnmount() {
        // componentWillUnmount is not being called for the server context
        this.lifecycles.componentWillMount.onCompleted();
        this.lifecycles.componentDidMount.onCompleted();
        this.lifecycles.componentWillReceiveProps.onCompleted();
        this.lifecycles.componentWillUpdate.onCompleted();
        this.lifecycles.componentDidUpdate.onCompleted();
        this.lifecycles.componentWillUnmount.onNext();
        this.lifecycles.componentWillUnmount.onCompleted();
        this._unsubscribeCycleComponent();
      },
      render: function render() {
        var vtree = this.state ? this.state.vtree : null;
        if (this.renderScheduler && this.renderScheduler.hasNew) {
          this._renderedVtree = noVtree;
          this.renderScheduler.runScheduled();
          if (this._renderedVtree !== noVtree) {
            vtree = this._renderedVtree;
          }
        }

        if (vtree) {
          if (typeof vtree === 'function') {
            return React.cloneElement(vtree());
          }
          return React.cloneElement(vtree);
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
      (!options.disableHotLoader && module.hot)) {
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
