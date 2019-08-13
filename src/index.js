const {
  scan,
  startWith,
  createEventSubject,
  mergeObservable } = require('./rxjs-adapter');
const { safeWarn } = require('./util');
const makeInteractions = require('./interactions');
const { useState, useEffect } = require('react');

function defaultMapStateObservable(observable) {
  return scan(function scan(state, mod) {
    if (typeof mod === 'function') {
      return mod(state);
    } else {
      safeWarn('Interaction is not defined as operator (function).');
    }
  })(observable);
}

function useInteractions(initialState, defineInteractions, sinks, mapStateObservable) {
  const interactions = makeInteractions(createEventSubject);
  const interactionList = Array.isArray(sinks) ? sinks : [];
  const names = Object.keys(defineInteractions);
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const definitionFn = defineInteractions[name];
    const interactionObs = interactions.get(name);
    const mappedInteractionObs = definitionFn.call(
      defineInteractions,
      interactionObs
    );
    if (!mappedInteractionObs) {
      throw new Error(`Interaction ${name} is undefined.`);
    }
    if (typeof mappedInteractionObs.subscribe !== 'function') {
      throw new Error(`Interaction ${name} does not return Observable.`);
    }
    interactionList.push(mappedInteractionObs);
  }
  
  const cycle = {
    subscribe() {
      const observable = startWith(initialState)(mergeObservable(interactionList));
      const mappedObs = mapStateObservable
        ? mapStateObservable(observable)
        : defaultMapStateObservable(observable);
      const subscription = mappedObs.subscribe(function next(value) {
        cycle.setState(value);
      });
      return function unsubscribe() {
        subscription.unsubscribe();
      };
    },
    // setState: To be replaced in useCycle.
    setState() {
      safeWarn('setState is called before component is mounted');
    },
    interactions
  };
  const subscribe = cycle.subscribe.bind(cycle);
  function useCycle() {
    const [state, setState] = useState(initialState);
    cycle.setState = setState;
    useEffect(subscribe, []);
    return state;
  }
  return [interactions, useCycle];
}

module.exports = {
  useInteractions
};
