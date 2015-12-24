var util = require('./util');
var subscribeEventObservables = util.subscribeEventObservables;
var createLifecycleSubjects = util.createLifecycleSubjects;
var makeInteractions = require('./interactions');

function createReactClass(
  React,
  Adapter,
  createCycleComponent,
  createRenderer,
  isTemplateComponent
) {
  var makePropsObservable = Adapter.makePropsObservable;
  var createEventSubject = Adapter.createEventSubject;
  var CompositeDisposable = Adapter.CompositeDisposable;
  var createDisposable = Adapter.createDisposable;
  var subscribe = Adapter.subscribe;

  return function component(displayName,
                            definitionFn,
                            templateFn,
                            componentOptions) {
    if (typeof displayName !== 'string') {
      throw new Error('Invalid displayName');
    }
    if (typeof definitionFn !== 'function') {
      throw new Error('Invalid definitionFn');
    }
    if (isTemplateComponent && typeof templateFn !== 'function') {
      throw new Error('Invalid templateFn');
    }
    var options = (
      // option isTemplateComponent (y): 4th argument (n): 3rd argument
      isTemplateComponent ? componentOptions : templateFn
    ) || {};
    // The option for the default root element type.
    var rootTagName = options.rootTagName || 'div';

    var reactClassProto = {
      displayName: displayName,
      getInitialState: function getInitialState() {
        this.hotLoaderHasMounted = false;
        return {
          newValue: null
        };
      },
      _subscribeCycleComponent: function _subscribeCycleComponent() {
        var self = this;
        this.hasNewValue = false;
        this.disposable = new CompositeDisposable();
        var propsSubject$ = makePropsObservable(this.props);
        this.propsSubject$ = propsSubject$;
        var interactions = makeInteractions(createEventSubject);
        this.interactions = interactions;
        var lifecycles = isTemplateComponent ?
          createLifecycleSubjects(createEventSubject) :
          null;
        this.lifecycles = lifecycles;

        var cycleComponent = createCycleComponent(
          definitionFn,
          interactions,
          propsSubject$,
          lifecycles,
          this
        );
        this.cycleComponent = cycleComponent;
        var newValue$ = cycleComponent.newValue$;
        var subscription = subscribe(newValue$, function onNextValue(newValue) {
          self.hasNewValue = true;
          self.setState({newValue: newValue});
        });

        this.disposable.add(propsSubject$);
        this.disposable.add(subscription);

        var cycleComponentDispose = cycleComponent.dispose;
        if (cycleComponentDispose) {
          if (typeof cycleComponentDispose === 'function') {
            this.disposable.add(createDisposable(cycleComponentDispose));
          } else if (typeof cycleComponentDispose.dispose === 'function') {
            this.disposable.add(cycleComponentDispose);
          }
        }
      },
      _unsubscribeCycleComponent: function _unsubscribeCycleComponent() {
        if (this.propsSubject$) {
          this.propsSubject$.onCompleted();
        }
        if (this.disposable) {
          this.disposable.dispose();
        }
      },
      _subscribeCycleEvents: function _subscribeCycleEvents() {
        var subscriptions = subscribeEventObservables(
          this.cycleComponent.customEvents,
          this,
          subscribe
        );
        if (subscriptions.length > 0) {
          for (var i = 0; i < subscriptions.length; i++) {
            this.disposable.add(subscriptions[i]);
          }
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
        if (isTemplateComponent) {
          this.lifecycles.componentWillMount.onNext();
        }
      },
      componentDidMount: function componentDidMount() {
        this._subscribeCycleEvents();
        this.hotLoaderHasMounted = true;
        if (isTemplateComponent) {
          this.lifecycles.componentDidMount.onNext();
        }
      },
      componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
        this.propsSubject$.onNext(nextProps);
        if (isTemplateComponent) {
          this.lifecycles.componentWillReceiveProps.onNext(nextProps);
        }
      },
      componentWillUpdate: function componentWillUpdate(nextProps) {
        if (isTemplateComponent) {
          this.lifecycles.componentWillUpdate.onNext(nextProps);
        }
      },
      componentDidUpdate: function componentDidUpdate(prevProps) {
        if (isTemplateComponent) {
          this.lifecycles.componentDidUpdate.onNext(prevProps);
        }
      },
      componentWillUnmount: function componentWillUnmount() {
        // componentWillUnmount is not being called for the server context
        if (isTemplateComponent) {
          this.lifecycles.componentWillMount.onCompleted();
          this.lifecycles.componentDidMount.onCompleted();
          this.lifecycles.componentWillReceiveProps.onCompleted();
          this.lifecycles.componentWillUpdate.onCompleted();
          this.lifecycles.componentDidUpdate.onCompleted();
          this.lifecycles.componentWillUnmount.onNext();
          this.lifecycles.componentWillUnmount.onCompleted();
        }
        this._unsubscribeCycleComponent();
      },
      render: createRenderer(React, rootTagName, templateFn)
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
        if (this.hotLoaderHasMounted) {
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
