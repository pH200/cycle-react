const {subscribeEventObservables, createLifecycleSubjects} = require('./util');
const makeInteractions = require('./interactions');

function createReactClass(
  React,
  Adapter,
  createCycleComponent,
  createRenderer,
  isTemplateComponent
) {
  const {
    makePropsObservable,
    createEventSubject,
    CompositeDisposable,
    createDisposable,
    subscribe,
    isObservable
  } = Adapter;

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

    const options = (
      // option isTemplateComponent (y): 4th argument (n): 3rd argument
      isTemplateComponent ? componentOptions : templateFn
    ) || {};
    // The option for the default root element type.
    const rootTagName = options.rootTagName || 'div';
    // Use React.PureComponent by default (>= 15.3.0)
    const PureComponent = React.PureComponent || React.Component;

    class ReactClass extends PureComponent {
      constructor(props) {
        super(props);
        this.hasNewValue = false;
        this.state = {
          newValue: null
        };
      }
      _subscribeCycleComponent() {
        this.disposable = new CompositeDisposable();
        this.propsSubject$ = makePropsObservable(this.props);
        this.interactions = makeInteractions(createEventSubject);
        this.lifecycles = isTemplateComponent ?
          createLifecycleSubjects(createEventSubject) :
          null;

        this.cycleComponent = createCycleComponent(
          isObservable,
          definitionFn,
          this.interactions,
          this.propsSubject$,
          this.lifecycles
        );
        const subscription = subscribe(
          this.cycleComponent.newValue$,
          (newValue) => {
            this.hasNewValue = true;
            this.setState({newValue: newValue})
          });

        this.disposable.add(this.propsSubject$);
        this.disposable.add(subscription);

        const cycleComponentDispose = this.cycleComponent.dispose;
        if (cycleComponentDispose) {
          if (typeof cycleComponentDispose === 'function') {
            this.disposable.add(createDisposable(cycleComponentDispose));
          } else if (typeof cycleComponentDispose.dispose === 'function') {
            this.disposable.add(cycleComponentDispose);
          }
        }
      }
      _unsubscribeCycleComponent() {
        if (this.propsSubject$) {
          this.propsSubject$.onCompleted();
        }
        if (this.disposable) {
          this.disposable.dispose();
        }
      }
      _subscribeCycleEvents() {
        const subscriptions = subscribeEventObservables(
          this.cycleComponent.customEvents,
          this,
          subscribe
        );
        if (subscriptions.length > 0) {
          for (let i = 0; i < subscriptions.length; i++) {
            this.disposable.add(subscriptions[i]);
          }
        }
      }
      shouldComponentUpdate(nextProps, nextState) {
        // Only care about the state since the props have been observed.
        return this.state !== nextState;
      }
      componentWillMount() {
        // componentWillMount is called for both client and server
        // https://facebook.github.io/react/docs/component-specs.html#mounting-componentwillmount
        this._subscribeCycleComponent();
        if (isTemplateComponent) {
          this.lifecycles.componentWillMount.onNext();
        }
      }
      componentDidMount() {
        this._subscribeCycleEvents();
        if (isTemplateComponent) {
          this.lifecycles.componentDidMount.onNext();
        }
      }
      componentWillReceiveProps(nextProps) {
        this.propsSubject$.onNext(nextProps);
        if (isTemplateComponent) {
          this.lifecycles.componentWillReceiveProps.onNext(nextProps);
        }
      }
      componentWillUpdate(nextProps) {
        if (isTemplateComponent) {
          this.lifecycles.componentWillUpdate.onNext(nextProps);
        }
      }
      componentDidUpdate(prevProps) {
        if (isTemplateComponent) {
          this.lifecycles.componentDidUpdate.onNext(prevProps);
        }
      }
      componentWillUnmount() {
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
      }
    }
    ReactClass.prototype.render = createRenderer(React, rootTagName, templateFn);

    ReactClass.displayName = displayName;
    if (options.propTypes) {
      ReactClass.propTypes = options.propTypes;
    }

    return ReactClass;
  };
}

module.exports = createReactClass;
