var React = Cycle.React;
var Rx = Cycle.Rx;
var h = Cycle.h;

// "createReactClass" returns native react class which can be used normally
// by "React.createElement" and "Cycle.applyToDOM".
var CounterText = Cycle.createReactClass('CounterText',
  function (interactions, props$) {
    return props$.get('counter').map(function (counter) {
      return h('h3', String(counter));
    });
  }
);

var Timer = Cycle.createReactClass('Timer', function () {
  return Rx.Observable.interval(1000).map(function (i) {
    return h(CounterText, {counter: i});
  });
});

// Cycle.applyToDOM('.js-container', Timer);
// or
// React.render(
//  React.createElement(Timer),
//  document.querySelector('.js-container'));
