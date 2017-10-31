const {component} = require('../../../src/rx');
const React = require('react');

const Menu = component('Menu', function (_, props) {
  return props.pluck('routeClickHandler').map(handler =>
    <ul>
      <li><a href="/" onClick={handler}>Home</a></li>
      <li><a href="/about" onClick={handler}>About</a></li>
    </ul>
  );
});

const HomePage = component('HomePage', function (_, props) {
  return props.pluck('routeClickHandler').map(handler =>
    <section className="home">
      <h1>The homepage</h1>
      <p>Welcome to our spectacular web page with literally nothing special here.</p>
      <Menu routeClickHandler={handler} />
    </section>
  );
});

const AboutPage = component('AboutPage', function (_, props) {
  return props.pluck('routeClickHandler').map(handler =>
    <section className="about">
      <h1>Read more about us</h1>
      <p>This is the page where we describe ourselves.</p>
      <p>In reality, I have no idea what I'm doing.</p> {/*'close quote*/}
      <Menu routeClickHandler={handler} />
    </section>
  );
});

const App = component('App', function (interactions, props) {
  const routeFromClick$ = interactions.get('RouteClick')
    .doOnNext(ev => ev.preventDefault())
    .map(ev => ev.target.attributes.href.value);

  const ongoingContext$ = props.pluck('context')
    .merge(routeFromClick$)
    .scan((state, x) => {
      state.route = x;
      return state;
    });

  return ongoingContext$.map(({route}) => {
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', route);
    }
    const onRouteClick = interactions.listener('RouteClick');
    switch (route) {
      case '/': return <HomePage routeClickHandler={onRouteClick} />;
      case '/about': return <AboutPage routeClickHandler={onRouteClick} />;
      default: return <div>Unknown page {route}</div>;
    }
  });
});

module.exports = {
  App
};
