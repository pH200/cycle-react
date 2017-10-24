const createReactClass = require('./create-react-class');

function digestDefinitionFnOutput(output, isObservable) {
  if (output && output.hasOwnProperty('view') && isObservable(output.view)) {
    return {
      newValue$: output.view,
      unsubscribe: output.unsubscribe,
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
    'Observable of React elements, or an object containing such ' +
    'Observable named as `view`');
}

function createCycleComponent(isObservable, definitionFn, interactions, propsSubject$) {
  return digestDefinitionFnOutput(
    definitionFn(
      interactions,
      propsSubject$
    ),
    isObservable
  );
}

function createRenderer() { 
  return function render() { 
    var vtree = this.state ? this.state.newValue : null; 
 
    if (vtree) { 
      return vtree; 
    }
    return [];
  }; 
}

function createComponent(React, Adapter) {
  return createReactClass(
    React,
    Adapter,
    createCycleComponent,
    createRenderer,
    false
  );
}

module.exports = createComponent;
