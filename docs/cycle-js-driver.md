# Using Cycle-React's DOM driver for Cycle.js

## Usage

```js
let Cycle = require('cyclejs');
let CycleReact = require('cycle-react');
let React = require('react');
let Rx = require('rx');

function main(drivers) {
  // The component's definition
  let TimerText = React.createClass({
    render() {
      return <div>Seconds Elapsed: {this.props.seconds}</div>;
    }
  });
  let MainPage = function mainPageComponent() {
    return Rx.Observable.interval(1000)
      .map(i => <TimerText seconds={i} />);
  };

  return {
    // The definition function is required to be wrapped by Observable
    DOM: Rx.Observable.just(MainPage)
  };
}

Cycle.run(main, {
  DOM: CycleReact.makeDOMDriver('.js-container')
});
```

## What's the difference between Cycle-React's applyToDOM and the driver for Cycle.js?

Honestly, there's no difference. They are both essentially `React.render` and
they both render the component from the definition function.

## Why not put the interactions and the observable for properties to the Cycle.js driver, like the original Cycle.js DOM driver did?

Because every Cycle-React component holds their own cycle of user interactions.
Basically, the Cycle-React components are like custom element definitions from
Cycle.js. Since they're using their own driver context instead of the drivers
defined from `Cycle.run`, it would be weird if we merged this context only for
the root definition.

Plus, Cycle-React's `component` was not only designed to be returning the
native React class, but also it can be used without the `Cycle.run`. So it's
weird if we changed the `component` by using drivers without making it
running with `Cycle.run`.
