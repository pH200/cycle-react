'use strict';
let Cycle = require('../../src/cycle');
let express = require('express');
let browserify = require('browserify');
let serialize = require('serialize-javascript');
let {Rx, h} = Cycle;
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

let clientBundle$ = (() => {
  let replaySubject = new Rx.ReplaySubject(1);
  let bundleString = '';
  let bundleStream = browserify()
    .transform('babelify')
    .transform({global: true}, 'uglifyify')
    .add('./client.js')
    .bundle();
  bundleStream.on('data', function (data) {
    bundleString += data;
  });
  bundleStream.on('end', function () {
    replaySubject.onNext(bundleString);
    replaySubject.onCompleted();
    console.log('Client bundle successfully compiled.');
  });
  return replaySubject;
})();

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
    Rx.Observable.just(h(App, {context: context}))
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
