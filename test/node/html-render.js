'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let cheerio = require('cheerio');
let ReactDOMServer = require('react-dom/server');
let Cycle = require('../../');
let Rx = require('rx');
let React = require('react');

describe('Server-side rendering', function () {
  it('should output HTML when given a simple component', function () {
    let Root = Cycle.component('Root', () => Rx.Observable.just(
      React.createElement('div', {className: 'test-element'}, 'Foobar')
    ));
    let html = ReactDOMServer.renderToStaticMarkup(React.createElement(Root));
    assert.strictEqual(html, '<div class="test-element">Foobar</div>');
  });

  it('should not emit events', function () {
    var log = 0;
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(
          React.createElement('div', {className: 'test-element'}, 'Foobar')
        ),
        events: {
          myevent: Rx.Observable.just(123).doOnNext(n => log = n)
        }
      };
    });
    let html = ReactDOMServer.renderToStaticMarkup(React.createElement(MyElement));
    assert.strictEqual(html, '<div class="test-element">Foobar</div>');
    assert.notStrictEqual(log, 123);
  });

  it('should render a simple nested component as HTML', function () {
    let MyElement = Cycle.component('MyElement', () => Rx.Observable.just(
      React.createElement('h3', {className: 'myelementclass'})
    ));
    let Root = Cycle.component('Root', () => Rx.Observable.just(
      React.createElement('div', {className: 'test-element'}, React.createElement(MyElement))
    ));
    let html = ReactDOMServer.renderToStaticMarkup(React.createElement(Root));
    assert.strictEqual(html, '<div class="test-element"><h3 class="myelementclass"></h3></div>');
  });

  it('should render a nested custom element with props as HTML', function () {
    let MyElement = Cycle.component('MyElement', function (_, props) {
      return props.get('foobar').map(foobar =>
        React.createElement('h3', {className: 'myelementclass'}, String(foobar).toUpperCase())
      );
    });
    let Root = Cycle.component('Root', () => Rx.Observable.just(
      React.createElement('div', {className: 'test-element'}, React.createElement(MyElement, {foobar: 'yes'}))
    ));
    let html = ReactDOMServer.renderToStaticMarkup(React.createElement(Root));
    assert.strictEqual(html, '<div class="test-element"><h3 class="myelementclass">YES</h3></div>');
  });
});
