const { useInteractions } = require('../../../src/rxjs');
const { fromEvent, pipe } = require('rxjs');
const { map, distinctUntilChanged, tap } = require('rxjs/operators');
const React = require('react');

function Menu(props) {
  return (
    <ul>
      <li><a href="/" onClick={props.routeClickHandler}>Home</a></li>
      <li><a href="/about" onClick={props.routeClickHandler}>About</a></li>
    </ul>
  );
}

function HomePage(props) {
  return (
    <section className="home">
      <h1>The homepage</h1>
      <p>Welcome to our spectacular web page with literally nothing special here.</p>
      <Menu routeClickHandler={props.routeClickHandler} />
    </section>
  );
}

function AboutPage(props) {
  return (
    <section className="about">
      <h1>Read more about us</h1>
      <p>This is the page where we describe ourselves.</p>
      <p>In reality, I have no idea what I'm doing.</p> {/*'close quote*/}
      <Menu routeClickHandler={props.routeClickHandler} />
    </section>
  );
}

function createApp(initialState) {
  const sinks = [];
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    sinks.push(
      fromEvent(window, 'popstate').pipe(
        map(() => document.location.pathname),
        tap(route => console.log('pop: ' + route)),
        map(route => () => ({route}))
      )
    );
  }

  const [interactions, useCycle] = useInteractions(
    initialState,
    {
      RouteClick: pipe(
        distinctUntilChanged(),
        tap(route => {
          if (typeof window !== 'undefined') {
            console.log('push: ' + route);
            window.history.pushState(null, '', route);
          }
        }),
        map(route => state => ({route}))
      )
    },
    sinks
  );
  return function App() {
    const state = useCycle();

    function onRouteClick(ev) {
      ev.preventDefault();
      interactions('RouteClick')(ev.target.attributes.href.value);
    }

    const route = state.route;
    switch (route) {
      case '/': return <HomePage routeClickHandler={onRouteClick} />;
      case '/about': return <AboutPage routeClickHandler={onRouteClick} />;
      default: return <div>Unknown page {route}</div>;
    }
  };
}

module.exports = { createApp };
