var React = ReactRx.React;
var Rx = ReactRx.Rx;
var h = ReactRx.h;

// "createReactClass" returns native react class which can be used normally
// by "React.createElement" and "ReactRx.applyToDOM".
var CounterText = ReactRx.createReactClass('CounterText',
  function (interactions, props$) {
    return props$.get('counter').map(function (counter) {
      return h('h3', String(counter));
    });
  }
);

var Timer = ReactRx.createReactClass('Timer', function () {
  return Rx.Observable.interval(1000).map(function (i) {
    return h(CounterText, {counter: i});
  });
});

// ReactRx.applyToDOM('.js-container', Timer);
// or
// React.render(
//  React.createElement(Timer),
//  document.querySelector('.js-container'));
