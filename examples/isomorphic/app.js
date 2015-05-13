'use strict';
let Cycle = require('../../src/cycle');
let {h} = Cycle;

function renderMenu(onRouteClick) {
  return h('ul', [
    h('li', [
      h('a', {
        href: '/',
        onClick: onRouteClick
      }, 'Home')
    ]),
    h('li', [
      h('a.link', {
        href: '/about',
        onClick: onRouteClick
      }, 'About')
    ])
  ]);
}

function renderHomePage(onRouteClick) {
  return h('section.home', [
    h('h1', 'The homepage'),
    h('p', 'Welcome to our spectacular web page with literally nothing special here.'),
    renderMenu(onRouteClick)
  ]);
}

function renderAboutPage(onRouteClick) {
  return h('section.about', [
    h('h1', 'Read more about us'),
    h('p', 'This is the page where we describe ourselves.'),
    h('p', 'In reality, I have no idea what I\'m doing.'),
    renderMenu(onRouteClick)
  ]);
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
        default: return h('div', `Unknown page ${route}`);
      }
    });
});

module.exports = {
  App
};
