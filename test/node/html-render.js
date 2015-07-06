'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let cheerio = require('cheerio');
let Cycle = require('../../src/cycle');
let {Rx, React} = Cycle;

describe('renderAsHTML()', function () {
  it('should output HTML when given a simple vtree stream', function (done) {
    let vtree$ = Rx.Observable.just(
      <div className="test-element">Foobar</div>
    );
    let html$ = Cycle.renderAsHTML(vtree$);
    html$.subscribe(function (html) {
      let $ = cheerio.load(html);
      assert.ok($('*').first().is('div.test-element'));
      assert.strictEqual($('div.test-element').length, 1);
      assert.strictEqual($('div.test-element').text(), 'Foobar');
      done();
    });
  });

  it('should not emit events', function (done) {
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
    let html$ = Cycle.renderAsHTML(MyElement);
    html$.subscribe(function (html) {
      let $ = cheerio.load(html);
      assert.ok($('*').first().is('div.test-element'));
      assert.strictEqual($('div.test-element').length, 1);
      assert.strictEqual($('div.test-element').text(), 'Foobar');
      assert.notStrictEqual(log, 123);
      done();
    });
  });

  it('should render a simple nested custom element as HTML', function (done) {
    let MyElement = Cycle.component('MyElement', function () {
      return Rx.Observable.just(<h3 className="myelementclass" />);
    });
    let vtree$ = Rx.Observable.just(
      <div className="test-element"><MyElement /></div>
    );
    let html$ = Cycle.renderAsHTML(vtree$);
    html$.subscribe(function (html) {
      let $ = cheerio.load(html);
      assert.ok($('*').first().is('div.test-element'));
      assert.strictEqual($('div.test-element').length, 1);
      assert.ok($('div.test-element').children().is('h3.myelementclass'));
      done();
    });
  });

  it('should render double nested custom elements as HTML', function (done) {
    let MyElement = Cycle.component('MyElement', function () {
      return Rx.Observable.just(<h3 className="myelementclass" />);
    });
    let NiceElement = Cycle.component('NiceElement', function () {
      return Rx.Observable.just(
        <div className="a-nice-element">
          foobar
          <MyElement />
        </div>
      );
    });
    let vtree$ = Rx.Observable.just(
      <div className="test-element"><NiceElement /></div>
    );
    let html$ = Cycle.renderAsHTML(vtree$);
    html$.subscribe(function (html) {
      let $ = cheerio.load(html);
      assert.ok($('*').first().is('div.test-element'));
      assert.strictEqual($('div.test-element').length, 1);
      assert.ok($('div.test-element').children().is('div.a-nice-element'));
      assert.strictEqual($('div.a-nice-element').children().first().text(), 'foobar');
      assert.ok($('div.a-nice-element').children().eq(1).is('h3.myelementclass'));
      done();
    });
  });

  it('should render a nested custom element with props as HTML', function (done) {
    let MyElement = Cycle.component('MyElement', function (_, props) {
      return props.get('foobar').map(foobar =>
        <h3 className="myelementclass">{String(foobar).toUpperCase()}</h3>
      );
    });
    let vtree$ = Rx.Observable.just(
      <div className="test-element">
        <MyElement foobar="yes" />
      </div>
    );
    let html$ = Cycle.renderAsHTML(vtree$);
    html$.subscribe(function (html) {
      let $ = cheerio.load(html);
      assert.ok($('*').first().is('div.test-element'));
      assert.strictEqual($('div.test-element').length, 1);
      assert.ok($('div.test-element').children().is('h3.myelementclass'));
      assert.strictEqual($('h3.myelementclass').text(), 'YES');
      done();
    });
  });
});
