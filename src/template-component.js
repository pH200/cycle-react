const createReactClass = require('./create-react-class');

function digestDefinitionFnOutput(output, isObservable) {
  if (output && output.hasOwnProperty('viewData') && isObservable(output.viewData)) {
    return {
      newValue$: output.viewData,
      dispose: output.dispose,
      customEvents: output.events
    };
  }
  if (output && isObservable(output)) {
    return {
      newValue$: output
    };
  }
  throw new Error(
    'definitionFn given to render or component must return an ' +
    'Observable of values, or an object containing such ' +
    'Observable named as `viewData`');
}

function createCycleComponent(isObservable, definitionFn, interactions, propsSubject$, lifecycles) {
  return digestDefinitionFnOutput(
    definitionFn(
      interactions,
      propsSubject$,
      lifecycles
    ),
    isObservable
  );
}

function createRenderer(React, rootTagName, templateFn) {
  return function render() {
    const viewData = this.state ? this.state.newValue : null;
    const hasNewValue = this.hasNewValue;

    if (hasNewValue) {
      return templateFn(viewData, this.interactions._getCurrentListeners());
    }
    return React.createElement(rootTagName);
  };
}

function createTemplateComponent(React, Adapter) {
  return createReactClass(
    React,
    Adapter,
    createCycleComponent,
    createRenderer,
    true
  );
}

module.exports = createTemplateComponent;
