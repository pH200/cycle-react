'use strict';
/* global describe, it, beforeEach */
const assert = require('assert');
const Cycle = require('../../');
const applyToDOM = require('./lib/apply-to-dom');
const Rx = require('rx');
const React = require('react');
const ReactDOM = require('react-dom');
const templateComponent = Cycle.templateComponent;

const {just} = Rx.Observable;

function createRenderTarget() {
  const element = document.createElement('div');
  element.className = 'cycletest';
  document.body.appendChild(element);
  return element;
}

function renderComponent(element, TheComponent) {
  ReactDOM.render(React.createElement(TheComponent), element);
}

describe('Template Component', function () {
  beforeEach(function () {
    const testDivs = Array.prototype.slice.call(document.querySelectorAll('.cycletest'));
    testDivs.forEach(function (x) {
      if (x.remove) {
        x.remove();
      }
    });
  });

  it('should recognize and create simple element that is registered', function () {
    // Make simple custom element
    const MyElement = templateComponent(
      'MyElement',
      () => just('myelementclass'),
      (className) => <h3 className={className} />
    );
    renderComponent(createRenderTarget(), MyElement);
    // Make assertions
    const myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
  });

  it('should render inner state and properties independently', function () {
    // Make custom element with internal state, and properties as input
    const number$ = Rx.Observable.range(1, 10).controlled();
    const MyElement = templateComponent('MyElement', function (interactions, props) {
      return Rx.Observable.combineLatest(
        props.get('color'),
        number$,
        (color, number) => ({color, number})
      );
    }, ({color, number}) => (
      <h3 className="stateful-element" style={{color}}>
        {String(number)}
      </h3>
    ));
    const Root = templateComponent(
      'Root',
      () => just('#00FF00').startWith('#FF0000'),
      (color) => <MyElement color={color} />
    );
    applyToDOM(createRenderTarget(), Root);
    number$.request(8);
    // Make assertions
    const myElement = document.querySelector('.stateful-element');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    assert.strictEqual(myElement.textContent, '8');
    assert.strictEqual(myElement.style.color, 'rgb(0, 255, 0)');
  });

  it('should be able to query and use refs', function (done) {
    let viewController$ = Rx.Observable.merge(
      just(1).delay(20),
      just(2).delay(40),
      just(3).delay(60)
    );
    let MyElement = templateComponent(
      'MyElement',
      (_1, _2, refs, lifecycles) => {
        lifecycles.componentDidUpdate
          .scan(acc => acc + 1, 0)
          .subscribe(count => {
            let editField = ReactDOM.findDOMNode(refs.get('theRef'));
            assert.notStrictEqual(editField, null);
            assert.strictEqual(editField.tagName, 'H3');
            if (count === 3) {
              done();
            }
          });
        return viewController$;
      },
      (value) => <h3 ref="theRef">{value}</h3>
    );

    applyToDOM(createRenderTarget(), MyElement);
  });

  it('should trigger the componentWillMount lifecycle', function (done) {
    let MyElement = templateComponent(
      'MyElement',
      (_1, _2, _3, lifecycles) => {
        lifecycles
          .componentWillMount
          .subscribe(done);
        return just(1);
      },
      () => <h3 className="myelementclass" />
    );
    applyToDOM(createRenderTarget(), MyElement);
  });

  it('should trigger the componentDidMount lifecycle', function (done) {
    let MyElement = templateComponent(
      'MyElement',
      (_1, _2, refs, lifecycles) => {
        lifecycles
          .componentDidMount
          .subscribe(() => {
            const node = ReactDOM.findDOMNode(refs.get('root'));
            assert.ok(node);
            assert.strictEqual(node.tagName, 'H3');
            done();
          });
        return just(1);
      },
      () => <h3 ref="root" />
    );
    applyToDOM(createRenderTarget(), MyElement);
  });

  it('should trigger the componentDidUpdate lifecycle', function () {
    let log = 0;
    let number$ = Rx.Observable.range(1, 2).controlled();
    // Make simple custom element
    let MyElement = templateComponent(
      'MyElement',
      (_1, _2, _3, lifecycles) => {
        lifecycles
          .componentDidUpdate
          .subscribe(() => log++);
        return number$;
      },
      (n) => <h3 className="myelementclass">{n}</h3>
    );
    // Use the custom element
    applyToDOM(createRenderTarget(), MyElement);
    // Make assertions
    number$.request(1);
    assert.strictEqual(log, 1);

    // Update the element
    number$.request(1);
    assert.strictEqual(log, 2);
  });

  it('should trigger the componentWillUnmount lifecycle', function (done) {
    let number$ = Rx.Observable.range(1, 2).controlled();
    // Make simple custom element
    let MyElement = templateComponent(
      'MyElement',
      (_1, _2, _3, lifecycles) => {
        let calledOnCompleted = false;
        lifecycles.componentDidMount
          .withLatestFrom(number$, (_, num) => num)
          .subscribe(
            num => assert.strictEqual(num, 1),
            err => assert.ifError(err),
            () => calledOnCompleted = true
          );
        lifecycles.componentWillUnmount
          .subscribe(() => {
            assert.ok(calledOnCompleted);
            done();
          });
        return just(1);
      },
      () => <h3 className="myelementclass">element</h3>
    );
    let Root = Cycle.component('Root', function () {
      return number$.map(n => n === 1 ?
        (<MyElement />) :
        (<div>empty</div>)
      );
    });
    // Use the custom element
    applyToDOM(createRenderTarget(), Root);
    // Make assertions
    number$.request(1);
    // Update the element
    number$.request(1);
  });
});
