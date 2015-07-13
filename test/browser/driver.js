'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let {run} = require('./lib/cycle');
let Cycle = require('../../');
let {Rx, React} = Cycle;

function createRenderTarget() {
  let element = document.createElement('div');
  element.className = 'cycletest';
  document.body.appendChild(element);
  return element;
}

describe('Cycle.js Driver', function () {
  beforeEach(function () {
    let testDivs = Array.prototype.slice.call(document.querySelectorAll('.cycletest'));
    testDivs.forEach(function (x) {
      if (x.remove) {
        x.remove();
      }
    });
  });

  it('should render to DOM', function (done) {
    let [requests, responses] = run(function () {
      var MyElement = React.createClass({
        render() {
          return <h3 className="myelementclass">Foobar</h3>;
        }
      });

      return {
        DOM: Rx.Observable.just(MyElement)
      };
    }, {
      DOM: Cycle.makeDOMDriver(createRenderTarget())
    });

    responses.DOM.get(':root').first().subscribe(function (root) {
      let myElement = document.querySelector('.myelementclass');
      assert.notStrictEqual(myElement, null);
      assert.notStrictEqual(typeof myElement, 'undefined');
      assert.strictEqual(myElement.tagName, 'H3');
      responses.dispose();
      done();
    });
  });

  it('should accept definitionFn for driver request', function (done) {
    let [requests, responses] = run(function () {
      function component() {
        return Rx.Observable.just(<h3 className="myelementclass">Foobar</h3>);
      }
      return {
        DOM: Rx.Observable.just(component)
      };
    }, {
      DOM: Cycle.makeDOMDriver(createRenderTarget())
    });

    responses.DOM.get(':root').first().subscribe(function (root) {
      let myElement = document.querySelector('.myelementclass');
      assert.notStrictEqual(myElement, null);
      assert.notStrictEqual(typeof myElement, 'undefined');
      assert.strictEqual(myElement.tagName, 'H3');
      responses.dispose();
      done();
    });
  });

  it('should do nothing with no request', function () {
    let [requests, responses] = run(function () {
      return {};
    }, {
      DOM: Cycle.makeDOMDriver(createRenderTarget())
    });

    responses.DOM.get(':root').subscribe(function (root) {
      throw new Error('Should not render');
    });
    responses.dispose();
  });
});
