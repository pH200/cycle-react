var createReactClass = require('./create-react-class');

function digestDefinitionFnOutput(output) {
  var newValue$;
  var dispose;
  var customEvents;
  if (output && output.hasOwnProperty('viewData') &&
    typeof output.viewData.subscribe === 'function')
  {
    newValue$ = output.viewData;
    dispose = output.dispose;
    customEvents = output.events;
  } else if (output && typeof output.subscribe === 'function') {
    newValue$ = output;
  } else {
    throw new Error(
      'definitionFn given to render or component must return an ' +
      'Observable of values, or an object containing such ' +
      'Observable named as `viewData`');
  }
  return {
    newValue$: newValue$,
    dispose: dispose,
    customEvents: customEvents || {}
  };
}

function RefsGetter(componentSelf) {
  this.componentSelf = componentSelf;
}
RefsGetter.prototype.get = function get(name) {
  return this.componentSelf.refs[name];
}

function createCycleComponent(definitionFn, interactions, propsSubject$, lifecycles, self) {
  return digestDefinitionFnOutput(
    definitionFn(
      interactions,
      propsSubject$,
      new RefsGetter(self),
      lifecycles
    )
  );
}

function createRenderer(React, rootTagName, templateFn) {
  return function render() {
    var viewData = this.state ? this.state.newValue : null;
    var hasNewValue = this.hasNewValue;

    if (hasNewValue) {
      return templateFn(viewData, this.interactions);
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
