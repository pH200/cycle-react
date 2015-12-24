var createReactClass = require('./create-react-class');

function digestDefinitionFnOutput(output) {
  var newValue$;
  var dispose;
  var customEvents;
  if (output && output.hasOwnProperty('view') &&
    typeof output.view.subscribe === 'function')
  {
    newValue$ = output.view;
    dispose = output.dispose;
    customEvents = output.events;
  } else if (output && typeof output.subscribe === 'function') {
    newValue$ = output;
  } else {
    throw new Error(
      'definitionFn given to render or component must return an ' +
      'Observable of React elements, or an object containing such ' +
      'Observable named as `view`');
  }
  return {
    newValue$: newValue$,
    dispose: dispose,
    customEvents: customEvents || {}
  };
}

function createCycleComponent(definitionFn, interactions, propsSubject$) {
  return digestDefinitionFnOutput(
    definitionFn(
      interactions,
      propsSubject$
    )
  );
}

function createRenderer(React, rootTagName) {
  return function render() {
    var vtree = this.state ? this.state.newValue : null;

    if (vtree) {
      return vtree;
    }
    return React.createElement(rootTagName);
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
