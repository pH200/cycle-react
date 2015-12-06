'use strict';
let Cycle = require('../../');
let React = require('react');
let ReactDOMServer = require('react-dom/server');
let express = require('express');
let browserify = require('browserify');
let serialize = require('serialize-javascript');
let {Rx} = Cycle;
let fromStream = require('../lib/rx-fromstream');
let {App} = require('./app');

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

let clientBundle$ = Rx.Observable.just('./client.js')
  .tap(js => console.log('Compiling client bundle ' + js))
  .flatMap(js => {
    let bundleStream = browserify()
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

let server = express();

server.use(function (req, res) {
  // Ignore favicon requests
  if (req.url === '/favicon.ico') {
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    res.end();
    return;
  }

  console.log(`req: ${req.method} ${req.url}`);

  let context = {route: req.url};
  let componentHtml = ReactDOMServer.renderToString(
    React.createElement(App, {context: context})
  );
  let html$ = Rx.Observable.combineLatest(
    Rx.Observable.just(componentHtml),
    Rx.Observable.just(context),
    clientBundle$,
    wrapVTreeWithHTMLBoilerplate
  );
  html$.take(1).subscribe(html => res.send(html));
});

let port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);
