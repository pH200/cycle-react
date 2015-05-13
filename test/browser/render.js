'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let Cycle = require('../../src/cycle');
let Fixture89 = require('./fixtures/issue-89');
let {Rx, h} = Cycle;

function createRenderTarget() {
  let element = document.createElement('div');
  element.className = 'cycletest';
  document.body.appendChild(element);
  return element;
}

describe('Rendering', function () {
  beforeEach(function () {
    let testDivs = Array.prototype.slice.call(document.querySelectorAll('.cycletest'));
    testDivs.forEach(function (x) {
      if (x.remove) {
        x.remove();
      }
    });
  });

  describe('Cycle.applyToDOM', function () {
    it('should accept a DOM element as input', function () {
      let element = createRenderTarget();
      assert.doesNotThrow(function () {
        Cycle.applyToDOM(element, () => Rx.Observable.empty());
      });
    });

    it('should accept a string selector to an existing element as input', function () {
      let id = 'testShouldAcceptSelectorToExisting';
      let element = createRenderTarget();
      element.id = id;
      assert.doesNotThrow(function () {
        Cycle.applyToDOM('#' + id, () => Rx.Observable.empty());
      });
    });

    it('should not accept a selector to an unknown element as input', function () {
      assert.throws(function () {
        Cycle.applyToDOM('#nonsenseIdToNothing', () => Rx.Observable.empty());
      }, /Cannot render into unknown element/);
    });

    it('should throw if definitionFn returns bad output', function () {
      assert.throws(function () {
        Cycle.applyToDOM(createRenderTarget(), () => ({}));
      }, /definitionFn given to/);
    });

    it('should not accept a number as input', function () {
      assert.throws(function () {
        Cycle.applyToDOM(123);
      }, /Given container is not a DOM element neither a selector string/);
    });

    it('should convert a simple virtual-dom <select> to DOM element', function () {
      let vtree$ = Rx.Observable.just(h('select.my-class', [
        h('option', {value: 'foo'}, 'Foo'),
        h('option', {value: 'bar'}, 'Bar'),
        h('option', {value: 'baz'}, 'Baz')
      ]));
      Cycle.applyToDOM(createRenderTarget(), () => vtree$);
      let selectEl = document.querySelector('.my-class');
      assert.notStrictEqual(selectEl, null);
      assert.notStrictEqual(typeof selectEl, 'undefined');
      assert.strictEqual(selectEl.tagName, 'SELECT');
    });

    it('should accept a ReactClass as definitionFn', function () {
      let MyElement = Cycle.createReactClass('MyElement', function () {
        return Rx.Observable.just(h('h3.myelementclass'));
      });
      Cycle.applyToDOM(createRenderTarget(), MyElement);
      let myelement = document.querySelector('.myelementclass');
      assert.notStrictEqual(myelement, null);
      assert.notStrictEqual(typeof myelement, 'undefined');
      assert.strictEqual(myelement.tagName, 'H3');
    });

    it('should catch interaction events', function (done) {
      function computer(interactions) {
        let vtree$ = Rx.Observable.just(h('h3.myelementclass', 'Foobar'));
        interactions.get('.myelementclass', 'click').subscribe(ev => {
          assert.strictEqual(ev.type, 'click');
          assert.strictEqual(ev.target.innerHTML, 'Foobar');
          done();
        });
        return vtree$;
      }
      Cycle.applyToDOM(createRenderTarget(), computer);
      // Make assertions
      let myElement = document.querySelector('.myelementclass');
      assert.notStrictEqual(myElement, null);
      assert.notStrictEqual(typeof myElement, 'undefined');
      assert.strictEqual(myElement.tagName, 'H3');
      assert.doesNotThrow(function () {
        myElement.click();
      });
    });

    it('should catch events by using EventSubject', function (done) {
      function computer() {
        let onClick$ = Cycle.createEventSubject();
        let vtree$ = Rx.Observable.just(
          h('h3.myelementclass', {
            onClick: onClick$.onEvent
          }, 'Foobar')
        );
        onClick$.subscribe(ev => {
          assert.strictEqual(ev.type, 'click');
          assert.strictEqual(ev.target.innerHTML, 'Foobar');
          done();
        });
        return vtree$;
      }
      Cycle.applyToDOM(createRenderTarget(), computer);
      // Make assertions
      let myElement = document.querySelector('.myelementclass');
      assert.notStrictEqual(myElement, null);
      assert.notStrictEqual(typeof myElement, 'undefined');
      assert.strictEqual(myElement.tagName, 'H3');
      assert.doesNotThrow(function () {
        myElement.click();
      });
    });

    it('should not set props.className to the root element', function () {
      let MyElement = Cycle.createReactClass('MyElement', Fixture89.myelement);
      let vtree$ = Rx.Observable.just(h(MyElement, {className: 'ERR'}));
      Cycle.applyToDOM(createRenderTarget(), () => vtree$);
      // Make assertions
      let myElement = document.querySelector('.myelementclass');
      assert.notStrictEqual(myElement, null);
      assert.notStrictEqual(typeof myElement, 'undefined');
      assert.strictEqual(myElement.className.indexOf('ERR'), -1);
    });

    it('should accept a view wrapping a custom element (#89)', function () {
      let MyElement = Cycle.createReactClass('MyElement', Fixture89.myelement);
      let number$ = Fixture89.makeModelNumber$();
      let vtree$ = Fixture89.viewWithContainerFn(number$, MyElement);
      Cycle.applyToDOM(createRenderTarget(), () => vtree$);

      number$.request(1);
      let myelement1 = document.querySelector('.myelementclass');
      assert.notStrictEqual(myelement1, null);
      assert.strictEqual(myelement1.tagName, 'H3');
      assert.strictEqual(myelement1.innerHTML, '123');

      number$.request(1);
      let myelement2 = document.querySelector('.myelementclass');
      assert.notStrictEqual(myelement2, null);
      assert.strictEqual(myelement2.tagName, 'H3');
      assert.strictEqual(myelement2.innerHTML, '456');
    });

    it('should accept a view with custom element as the root of vtree$', function () {
      let MyElement = Cycle.createReactClass('MyElement', Fixture89.myelement);
      let number$ = Fixture89.makeModelNumber$();
      let vtree$ = Fixture89.viewWithoutContainerFn(number$, MyElement);
      assert.doesNotThrow(() => {
        Cycle.applyToDOM(createRenderTarget(), () => vtree$);
        number$.request(1);
      });
    });
  });
});
