var React = Cycle.React;
var Rx = Cycle.Rx;
var h = Cycle.h;

// "component" returns native react class which can be used normally
// by "React.createElement" and "Cycle.applyToDOM".
var CounterText = Cycle.component('CounterText',
  function (interactions, props) {
    return props.get('counter').map(function (counter) {
      return h('h3', 'Seconds Elapsed: '+ counter);
    });
  }
);

var Timer = Cycle.component('Timer', function () {
  return Rx.Observable.interval(1000).map(function (i) {
    return h(CounterText, {counter: i});
  });
});

Cycle.applyToDOM('.js-container', Timer);
// or
// React.render(
//  React.createElement(Timer),
//  document.querySelector('.js-container'));
