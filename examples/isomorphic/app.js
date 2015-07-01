'use strict';
let Cycle = require('../../src/cycle');
let React = require('react');

function renderMenu(onRouteClick) {
  return <ul>
    <li><a href="/" onClick={onRouteClick}>Home</a></li>
    <li><a href="/about" onClick={onRouteClick}>About</a></li>
  </ul>;
}

function renderHomePage(onRouteClick) {
  return <section className="home">
    <h1>The homepage</h1>
    <p>Welcome to our spectacular web page with literally nothing special here.</p>
    {renderMenu(onRouteClick)}
  </section>;
}

function renderAboutPage(onRouteClick) {
  return <section className="about">
    <h1>Read more about us</h1>
    <p>This is the page where we describe ourselves.</p>
    <p>In reality, I have no idea what I'm doing.</p> {/*'close quote*/}
    {renderMenu(onRouteClick)}
  </section>;
}

let App = Cycle.component('App', function (interactions, props) {
  let routeFromClick$ = interactions.get('RouteClick')
    .doOnNext(ev => ev.preventDefault())
    .map(ev => ev.currentTarget.attributes.href.value);

  let ongoingContext$ = props.get('context')
    .merge(routeFromClick$).scan((acc, x) => {
      acc.route = x;
      return acc;
    });

  return ongoingContext$
    .map(({route}) => {
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', route);
      }
      let onRouteClick = interactions.listener('RouteClick');
      switch (route) {
        case '/': return renderHomePage(onRouteClick);
        case '/about': return renderAboutPage(onRouteClick);
        default: return <div>Unknown page {route}</div>
      }
    });
});

module.exports = {
  App
};
