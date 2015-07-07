'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let cheerio = require('cheerio');
let Cycle = require('../../src/cycle');
let {Rx, React} = Cycle;

describe('Server-side rendering', function () {
  it('should output HTML when given a simple component', function () {
    let Root = Cycle.component('Root', () => Rx.Observable.just(
      <div className="test-element">Foobar</div>
    ));
    let html = React.renderToStaticMarkup(React.createElement(Root));
    assert.strictEqual(html, '<div class="test-element">Foobar</div>');
  });

  it('should not emit events', function () {
    var log = 0;
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(
          <div className="test-element">Foobar</div>
        ),
        events: {
          myevent: Rx.Observable.just(123).doOnNext(n => log = n)
        }
      };
    });
    let html = React.renderToStaticMarkup(React.createElement(MyElement));
    assert.strictEqual(html, '<div class="test-element">Foobar</div>');
    assert.notStrictEqual(log, 123);
  });

  it('should render a simple nested component as HTML', function () {
    let MyElement = Cycle.component('MyElement', () => Rx.Observable.just(
      <h3 className="myelementclass" />
    ));
    let Root = Cycle.component('Root', () => Rx.Observable.just(
      <div className="test-element"><MyElement /></div>
    ));
    let html = React.renderToStaticMarkup(React.createElement(Root));
    assert.strictEqual(html, '<div class="test-element"><h3 class="myelementclass"></h3></div>');
  });

  it('should render a nested custom element with props as HTML', function () {
    let MyElement = Cycle.component('MyElement', function (_, props) {
      return props.get('foobar').map(foobar =>
        <h3 className="myelementclass">{String(foobar).toUpperCase()}</h3>
      );
    });
    let Root = Cycle.component('Root', () => Rx.Observable.just(
      <div className="test-element">
        <MyElement foobar="yes" />
      </div>
    ));
    let html = React.renderToStaticMarkup(React.createElement(Root));
    assert.strictEqual(html, '<div class="test-element"><h3 class="myelementclass">YES</h3></div>');
  });
});
