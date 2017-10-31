const React = require('react');
const ReactDOMServer = require('react-dom/server');
const express = require('express');
const browserify = require('browserify');
const serialize = require('serialize-javascript');
const Rx = require('rx');
const fromStream = require('../lib/rx-fromstream');
const {App} = require('./app');

function wrapVTreeWithHTMLBoilerplate(vtree, context, clientBundle) {
  return `<!doctype html>
  <html>
  <head>
    <title>Cycle-React Isomorphism Example</title>
  </head>
  <body>
    <div class="app-container">${vtree}</div>
    <script>window.appContext = ${serialize(context)};</script>
    <script>${clientBundle}</script>
  </body>
  </html>
  `;
}

const clientBundle$ = Rx.Observable.just('./client.js')
  .tap(js => console.log('Compiling client bundle ' + js))
  .flatMap(js => {
    const bundleStream = browserify()
      .transform('babelify')
      .transform({global: true}, 'uglifyify')
      .add(js)
      .bundle();
    return fromStream(bundleStream).reduce((acc, x) => acc + x);
  })
  .tap(() => console.log('Client bundle successfully compiled.'))
  .shareReplay(1);
// pre-compile bundle
// clientBundle$.subscribe();

const server = express();

server.use(function (req, res) {
  // Ignore favicon requests
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }

  console.log(`req: ${req.method} ${req.url}`);

  const context = {route: req.url};
  const componentHtml = ReactDOMServer.renderToString(
    React.createElement(App, {context: context})
  );
  const html$ = Rx.Observable.combineLatest(
    Rx.Observable.just(componentHtml),
    Rx.Observable.just(context),
    clientBundle$,
    wrapVTreeWithHTMLBoilerplate
  );
  html$.take(1).subscribe(html => res.send(html));
});

const port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);
