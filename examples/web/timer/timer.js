import {component} from 'cycle-react/rxjs';
import React from 'react';
import ReactDOM from 'react-dom';
import {Observable} from 'rxjs/Rx';

// "component" returns native react class which can be used normally
// by "React.createElement".
const Counter = component('Counter', function (interactions, props) {
  return props.pluck('counter')
    .map(counter => <h3>Seconds Elapsed: {counter}</h3>);
});

const Timer = component('Timer', function () {
  return Observable.interval(1000).map(i => <Counter counter={i} />);
});

ReactDOM.render(
  React.createElement(Timer),
  document.querySelector('.js-container')
);
