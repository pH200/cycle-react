var path = require('path');
var express = require('express');
var browserify = require('browserify');
var envify = require('envify/custom');
var Rx = require('rx');
var fromStream = require('./lib/rx-fromstream');
var app = express();
app.use(express.static(__dirname));

function add(x, y) {
  return x + y;
}

function compileExample(exampleName, examplePath) {
  var cyclePath = path.resolve(__dirname, '../../src/index.js');
  var cycleRxjsPath = path.resolve(__dirname, '../../src/rxjs.js');

  // shareReplay(1) to cache compiled js
  return Rx.Observable.defer(function () {
    console.log('[' + exampleName + '] compiling');

    var exampleStream = browserify()
      .transform(envify({NODE_ENV: 'production'}))
      .transform('babelify', {presets: ["@babel/preset-env", "@babel/preset-react"]})
      .require(cyclePath, {expose: 'cycle-react'})
      .require(cycleRxjsPath, {expose: 'cycle-react/rxjs'})
      .add(examplePath)
      .bundle();

    return fromStream(exampleStream)
      .reduce(add)
      .tap(function () {
        console.log('[' + exampleName + '] build completed');
      });
  });
}

var examples = {
  hello: compileExample('hello', path.join(__dirname, './hello/hello.js')),
  timer: compileExample('timer', path.join(__dirname, './timer/timer.js')),
  counter: compileExample('counter', path.join(__dirname, './counter/counter.js')),
  many: compileExample('many', path.join(__dirname, './many/many.js')),
  todomvc: compileExample('todomvc', path.join(__dirname, './todomvc/app.js'))
};

function compiledJsRoute(req, res) {
  var exampleName = req.params.example;
  var exampleJs = examples[exampleName];
  if (exampleJs) {
    exampleJs.subscribe(function (js) {
      res.set('Content-Type', 'text/javascript');
      res.send(js);
    });
  } else {
    res.sendStatus(404);
  }
}

app.get('/:example/compiled.js', compiledJsRoute);
app.get('/synthetic-examples/:example/compiled.js', compiledJsRoute);

app.get('/', function (req, res) {
  res.sendFile(path.resolve(__dirname, './lib/examples.html'));
});

var server = app.listen(5566, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
