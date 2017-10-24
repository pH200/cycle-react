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
    next,
    complete,
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

    class ReactClass extends React.Component {
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
        const subscription = this.cycleComponent.newValue$
          .subscribe((newValue) => {
            this.hasNewValue = true;
            this.setState({newValue: newValue})
          });

        this.disposable.add(this.propsSubject$);
        this.disposable.add(subscription);

        const cycleComponentDispose = this.cycleComponent.unsubscribe;
        if (cycleComponentDispose) {
          if (typeof cycleComponentDispose === 'function' ||
              typeof cycleComponentDispose.unsubscribe === 'function') {
            this.disposable.add(cycleComponentDispose);
          }
        }
      }
      _unsubscribeCycleComponent() {
        if (this.propsSubject$) {
          complete(this.propsSubject$);
        }
        if (this.disposable) {
          this.disposable.unsubscribe();
        }
      }
      _subscribeCycleEvents() {
        const subscriptions = subscribeEventObservables(
          this.cycleComponent.customEvents,
          this
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
          next(this.lifecycles.componentWillMount);
        }
      }
      componentDidMount() {
        this._subscribeCycleEvents();
        if (isTemplateComponent) {
          next(this.lifecycles.componentDidMount);
        }
      }
      componentWillReceiveProps(nextProps) {
        next(this.propsSubject$, nextProps);
        if (isTemplateComponent) {
          next(this.lifecycles.componentWillReceiveProps, nextProps);
        }
      }
      componentWillUpdate(nextProps) {
        if (isTemplateComponent) {
          next(this.lifecycles.componentWillUpdate, nextProps);
        }
      }
      componentDidUpdate(prevProps) {
        if (isTemplateComponent) {
          next(this.lifecycles.componentDidUpdate, prevProps);
        }
      }
      componentWillUnmount() {
        // componentWillUnmount is not being called for the server context
        if (isTemplateComponent) {
          complete(this.lifecycles.componentWillMount);
          complete(this.lifecycles.componentDidMount);
          complete(this.lifecycles.componentWillReceiveProps);
          complete(this.lifecycles.componentWillUpdate);
          complete(this.lifecycles.componentDidUpdate);
          next(this.lifecycles.componentWillUnmount);
          complete(this.lifecycles.componentWillUnmount);
        }
        this._unsubscribeCycleComponent();
      }
    }
    ReactClass.prototype.render = createRenderer(React, templateFn);

    ReactClass.displayName = displayName;
    if (options.propTypes) {
      ReactClass.propTypes = options.propTypes;
    }

    return ReactClass;
  };
}

module.exports = createReactClass;
