const { safeWarn } = require('./util');

function makeInteractions(createEventSubject) {
  const subjects = {};

  function get(name) {
    if (name === null || typeof name !== 'string') {
      throw new Error('Invalid name for the interaction collection.');
    }
    if (!subjects[name]) {
      subjects[name] = createEventSubject();
    }
    return subjects[name];
  }

  function listener(name) {
    const eventSubject = subjects[name];
    if (!eventSubject) {
      safeWarn(
        'Listening event "' + name + '" before using interactions.get("' +
        name + '")'
      );
    }
    return (eventSubject || get(name)).onEvent;
  }

  function bindListeners(interactionTypes) {
    const result = {};
    const names = Object.keys(interactionTypes);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      result[name] = listener(interactionTypes[name]);
    }
    return result;
  }

  function bindAllListeners() {
    const result = {};
    const names = Object.keys(subjects);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      result[name] = listener(name);
    }
    return result;
  }

  function _getCurrentListeners() {
    const result = {};
    const names = Object.keys(subjects);
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      result[name] = listener(name);
    }
    return result;
  }

  listener.get = get;
  listener.listener = listener;
  listener.bindListeners = bindListeners ;
  listener.bindAllListeners = bindAllListeners;
  listener._getCurrentListeners = _getCurrentListeners;

  return listener;
}

module.exports = makeInteractions;
