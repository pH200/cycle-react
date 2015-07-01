'use strict';
let Cycle = require('../../src/cycle');
let React = require('react');
let express = require('express');
let browserify = require('browserify');
let serialize = require('serialize-javascript');
let {Rx} = Cycle;
let {App} = require('./app');

function wrapVTreeWithHTMLBoilerplate(vtree, context, clientBundle) {
  return `<!doctype html>
  <html>
  <head>
    <title>Cycle Isomorphism Example</title>
  </head>
  <body>
    <div class="app-container">
      ${vtree}
    </div>
    <script>window.appContext = ${serialize(context)};</script>
    <script>${clientBundle}</script>
  </body>
  </html>
  `;
}

let clientBundle$ = Rx.Observable.create(observer => {
  console.log('Compiling client bundle...');
  let bundleStream = browserify()
    .transform('babelify')
    .transform({global: true}, 'uglifyify')
    .add('./client.js')
    .bundle();
  bundleStream.on('data', function (data) {
    observer.onNext(data);
  });
  bundleStream.on('error', function (err) {
    observer.onError(err);
  });
  bundleStream.on('end', function () {
    observer.onCompleted();
    console.log('Client bundle successfully compiled.');
  });
}).reduce((acc, x) => acc + x).shareReplay(1);
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
  let html$ = Cycle.renderAsHTML(
    Rx.Observable.just(React.createElement(App, {context: context}))
  ).combineLatest(
    Rx.Observable.just(context),
    clientBundle$,
    wrapVTreeWithHTMLBoilerplate
  );
  html$.take(1).subscribe(html => res.send(html));
});

let port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);
