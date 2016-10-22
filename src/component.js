const createReactClass = require('./create-react-class');

function digestDefinitionFnOutput(output) {
  if (output && output.hasOwnProperty('view') &&
    typeof output.view.subscribe === 'function')
  {
    return {
      newValue$: output.view,
      dispose: output.dispose,
      customEvents: output.events || {}
    }
  }
  if (output && typeof output.subscribe === 'function') {
    return {
      newValue$: output,
      customEvents: {}
    };
  }
  throw new Error(
    'definitionFn given to render or component must return an ' +
    'Observable of React elements, or an object containing such ' +
    'Observable named as `view`');
}

function createCycleComponent(definitionFn, interactions, propsSubject$) {
  return digestDefinitionFnOutput(
    definitionFn(
      interactions,
      propsSubject$
    )
  );
}

function createComponent(React, Adapter) {
  return createReactClass(
    React,
    Adapter,
    createCycleComponent,
    false
  );
}

module.exports = createComponent;
