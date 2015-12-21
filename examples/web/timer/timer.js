const Cycle = require('cycle-react');
const React = require('react');
const ReactDOM = require('react-dom');
const Rx = require('rx');

// "component" returns native react class which can be used normally
// by "React.createElement".
const Counter = Cycle.component('Counter', function (interactions, props) {
  return props.get('counter')
    .map(counter => <h3>Seconds Elapsed: {counter}</h3>);
});

const Timer = Cycle.component('Timer', function () {
  return Rx.Observable.interval(1000).map(i => <Counter counter={i} />);
});

ReactDOM.render(
  React.createElement(Timer),
  document.querySelector('.js-container')
);
