'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let Cycle = require('../../');
let applyToDOM = require('./lib/apply-to-dom');
let {Rx, React} = Cycle;
let ReactDOM = require('react-dom');

function createRenderTarget() {
  let element = document.createElement('div');
  element.className = 'cycletest';
  document.body.appendChild(element);
  return element;
}

describe('Component', function () {
  beforeEach(function () {
    let testDivs = Array.prototype.slice.call(document.querySelectorAll('.cycletest'));
    testDivs.forEach(function (x) {
      if (x.remove) {
        x.remove();
      }
    });
  });

  it('should recognize and create simple element that is registered', function () {
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return Rx.Observable.just(<h3 className="myelementclass" />);
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(<MyElement />);
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
  });

  it('should render inner state and properties independently', function () {
    // Make custom element with internal state, and properties as input
    let number$ = Rx.Observable.range(1, 10).controlled();
    let MyElement = Cycle.component('MyElement', function (interactions, props) {
      return Rx.Observable.combineLatest(
        props.get('color'),
        number$,
        function (color, number) {
          let style = {color: color};
          return <h3 className="stateful-element" style={style}>
            {String(number)}
          </h3>;
        }
      );
    });
    // Use the custom element
    function definitionFn() {
      return Rx.Observable.just('#00FF00')
        .startWith('#FF0000')
        .map(color => <MyElement color={color} />);
    }
    applyToDOM(createRenderTarget(), definitionFn);
    number$.request(8);
    // Make assertions
    let myElement = document.querySelector('.stateful-element');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    assert.strictEqual(myElement.textContent, '8');
    assert.strictEqual(myElement.style.color, 'rgb(0, 255, 0)');
  });

  it('should have Observable properties object as props.get(\'*\')', function () {
    // Make custom element
    let MyElement = Cycle.component('MyElement', function (interactions, props) {
      return props.get('*').map(propsObj => {
        assert.strictEqual(typeof propsObj, 'object');
        assert.notStrictEqual(propsObj, null);
        assert.strictEqual(propsObj.color, '#FF0000');
        assert.strictEqual(propsObj.content, 'Hello world');
        let style = {color: propsObj.color};
        return <h3 className="inner-element" style={style}>
          {String(propsObj.content)}
        </h3>;
      });
    });
    let vtree$ = Rx.Observable.just(
      <MyElement color="#FF0000" content="Hello world" />
    );
    let domUI = applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    let myElement = document.querySelector('.inner-element');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    assert.strictEqual(myElement.textContent, 'Hello world');
    assert.strictEqual(myElement.style.color, 'rgb(255, 0, 0)');
  });

  it('should recognize and create two unrelated elements', function () {
    // Make the first custom element
    let MyElement1 = Cycle.component('MyElement1', function () {
      return Rx.Observable.just(<h1 className="myelement1class" />);
    });
    // Make the second custom element
    let MyElement2 = Cycle.component('MyElement2', function () {
      return Rx.Observable.just(<h2 className="myelement2class" />);
    });
    // Use the custom elements
    let vtree$ = Rx.Observable.just(
      <div>
        <MyElement1 />
        <MyElement2 />
      </div>
    );
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    let myElement1 = document.querySelector('.myelement1class');
    let myElement2 = document.querySelector('.myelement2class');
    assert.notStrictEqual(myElement1, null);
    assert.notStrictEqual(typeof myElement1, 'undefined');
    assert.strictEqual(myElement1.tagName, 'H1');
    assert.notStrictEqual(myElement2, null);
    assert.notStrictEqual(typeof myElement2, 'undefined');
    assert.strictEqual(myElement2.tagName, 'H2');
  });

  it('should recognize and create a nested custom elements', function () {
    // Make the inner custom element
    let Inner = Cycle.component('Inner', function () {
      return Rx.Observable.just(<h3 className="innerClass" />);
    });
    // Make the outer custom element
    let Outer = Cycle.component('Outer', function () {
      return Rx.Observable.just(
        <div className="outerClass">
          <Inner />
        </div>
      );
    });
    // Use the custom elements
    let vtree$ = Rx.Observable.just(<Outer />);
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    let innerElement = document.querySelector('.innerClass');
    assert.notStrictEqual(innerElement, null);
    assert.notStrictEqual(typeof innerElement, 'undefined');
    assert.strictEqual(innerElement.tagName, 'H3');
  });

  it('should catch interactions coming from custom element', function (done) {
    let number$ = Rx.Observable.of(123, 456).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(<h3 className="myelementclass">foobar</h3>),
        events: {
          onMyEvent: number$
        }
      };
    });
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      interactions.get('myevent').subscribe(x => {
        assert.strictEqual(x, 123);
        done();
      });
      let vtree$ = Rx.Observable.just(
        <MyElement onMyEvent={interactions.listener('myevent')} />
      );
      return vtree$;
    });
    applyToDOM(createRenderTarget(), Root);
    // Make assertions
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    number$.request(1);
  });

  it('should not miss custom events from a list of custom elements', function () {
    // Make custom element
    let Slider = Cycle.component('Slider', function (interactions, props) {
      let remove$ = interactions.get('click').map(() => true);
      let id$ = props.get('id').shareReplay(1);
      let vtree$ = id$.map(id =>
        <h3 className="internalslider"
            onClick={interactions.listener('click')}>
          {String(id)}
        </h3>
      );
      return {
        view: vtree$,
        events: {
          onRemove: remove$.withLatestFrom(id$, (r, id) => id)
        }
      };
    });

    let sequence$ = Rx.Observable.of(
      [{id: 23}],
      [{id: 23}, {id: 45}]
    ).controlled();
    function computer(interactions) {
      let eventData$ = interactions.get('remove');
      return sequence$
        .concat(eventData$)
        .scan((items, x) => {
          if (typeof x === 'object') {
            return x;
          } else {
            return items.filter((item) => item.id !== x);
          }
        })
        .map(items =>
          <div className="allSliders">
            {items.map(item =>
              <Slider id={item.id}
                      key={item.id}
                      className="slider"
                      onRemove={interactions.listener('remove')} />
            )}
          </div>
        );
    }

    applyToDOM(createRenderTarget(), computer);

    // Simulate clicks
    sequence$.request(2);
    document.querySelector('.internalslider').click();
    document.querySelector('.internalslider').click();

    // Make assertion
    let sliders = document.querySelectorAll('.internalslider');
    assert.strictEqual(sliders.length, 0);
  });

  it('should recognize nested vtree as properties.get(\'children\')', function () {
    // Make simple custom element
    let SimpleWrapper = Cycle.component('SimpleWrapper', function (interactions, props) {
      return props.get('children').map(children => {
        return <div className="wrapper">{children}</div>;
      });
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(
      <SimpleWrapper>
        <h1>Hello</h1>
        <h2>World</h2>
      </SimpleWrapper>
    );
    let domUI = applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    let wrapper = document.querySelector('.wrapper');
    assert.notStrictEqual(wrapper, null);
    assert.notStrictEqual(typeof wrapper, 'undefined');
    assert.strictEqual(wrapper.tagName, 'DIV');
  });

  it('should recognize changes on a mutable collection given as props', function () {
    let MyElement = Cycle.component('MyElement', function (interactions, props) {
      return props.get('list', () => false).map(list =>
        <ol>
          {list.map(value =>
            <li key={value} className="test-item">{value}</li>
          )}
        </ol>
      );
    });

    function computer(interactions) {
      let counter = 0;
      let clickMod$ = interactions.get('click')
        .map(() => `item${++counter}`)
        .map(random => function mod(data) {
          data.push(random);
          return data;
        });
      return clickMod$
        .startWith([])
        .scan((data, modifier) => modifier(data))
        .map(data =>
          <div className="root">
            <button className="button"
                    onClick={interactions.listener('click')}>
              add new item
            </button>
            <MyElement list={data} />
          </div>
        );
    }

    applyToDOM(createRenderTarget(), computer);

    document.querySelector('.button').click();
    document.querySelector('.button').click();
    let items = document.querySelectorAll('li.test-item');
    assert.strictEqual(items.length, 2);
    assert.strictEqual(items[0].textContent, 'item1');
    assert.strictEqual(items[1].textContent, 'item2');
  });

  it('should distinct property changes for props.get', function () {
    let MyElement = Cycle.component('MyElement', function (interactions, props) {
      return props.get('list').map(list =>
        <ol>
          {list.map(value =>
            <li key={value} className="test-item">{value}</li>
          )}
        </ol>
      );
    });

    function computer(interactions) {
      let counter = 0;
      let clickMod$ = interactions.get('click')
        .map(() => `item${++counter}`)
        .map(random => function mod(data) {
          data.push(random);
          return data;
        });
      return clickMod$
        .startWith([])
        .scan((data, modifier) => modifier(data))
        .map(data =>
          <div className="root">
            <button className="button"
                    onClick={interactions.listener('click')}>
              add new item
            </button>
            <MyElement list={data} />
          </div>
        );
    }

    applyToDOM(createRenderTarget(), computer);

    document.querySelector('.button').click();
    document.querySelector('.button').click();
    let items = document.querySelectorAll('li.test-item');
    assert.strictEqual(items.length, 0);
  });

  it('should emit events even when dynamically evolving', function (done) {
    let number$ = Rx.Observable.of(123, 456).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      // Here the vtree changes from <h3> to <button>, the myevent should
      // be emitted on <button> and not from the original <h3>.
      return {
        view: customElementSwitch$.map(number => {
          if (number === 0) {
            return <h3 className="myelementclass">foo</h3>;
          }
          return <button className="myelementclass">bar</button>;
        }),
        events: {
          onMyEvent: number$
        }
      };
    });
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      let onmyevent$ = interactions.get('myevent');
      let vtree$ = Rx.Observable.just(
        <MyElement onMyEvent={interactions.listener('myevent')} />
      );
      onmyevent$.subscribe(function (x) {
        assert.strictEqual(x, 123);
        done();
      });
      return vtree$;
    });
    customElementSwitch$.request(1);
    applyToDOM(createRenderTarget(), Root);
    // Make assertions
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    customElementSwitch$.request(1);
    number$.request(1);
  });

  it('should emit events for dynamic event handlers', function (done) {
    let number$ = Rx.Observable.of(123, 456).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(<h3 className="myelementclass">foo</h3>),
        events: {
          onMyEvent: number$
        }
      };
    });
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      let onmyevent$ = interactions.get('myevent');
      let vtree$ = customElementSwitch$.map(number => {
        if (number === 0) {
          return <MyElement />;
        }
        return <MyElement onMyEvent={interactions.listener('myevent')} />;
      });
      onmyevent$.subscribe(function (x) {
        assert.strictEqual(x, 456);
        done();
      });
      return vtree$;
    });
    customElementSwitch$.request(1);
    applyToDOM(createRenderTarget(), Root);
    // Make assertions
    number$.request(1);
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    // pop event handler
    customElementSwitch$.request(1);
    // emit event
    number$.request(1);
  });

  it('should not silently catch exceptions inside of custom elements', function () {
    let vtreeController$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return vtreeController$.map(control => {
        if (control === 0) {
          return <h3 className="myelementclass" />;
        }
        throw new Error('The error');
      });
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(<MyElement />);
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    vtreeController$.request(1);
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);

    // Throw exception inside vtree$
    assert.throws(
      () => vtreeController$.request(1),
      /The error/
    );
  });

  it('should accept vtree as function and "ref"', function (done) {
    let vtreeController$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function (_1, _2, self) {
      vtreeController$.subscribe(() => {
        let editField = ReactDOM.findDOMNode(self.refs.theRef);
        assert.notStrictEqual(editField, null);
        assert.strictEqual(editField.tagName, 'H3');
        done();
      });
      return Rx.Observable.just(() =>
        <h3 className="myelementclass"
            ref="theRef" />
      );
    });
    applyToDOM(createRenderTarget(), MyElement);
    // Make assertions
    vtreeController$.request(1);
  });

  it('should dispose vtree$ after destruction', function () {
    let log = [];
    let number$ = Rx.Observable.range(1, 2).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return number$
        .do(i => log.push(i))
        .map(i => <h3 className="myelementclass">{i}</h3>);
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        <MyElement /> :
        <div />;
    });
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    assert.strictEqual(log.length, 1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger onNext of myelement's vtree$
    number$.request(1);
    let destroyedElement = document.querySelector('.myelementclass');
    assert.strictEqual(destroyedElement, null);
    assert.notStrictEqual(log.length, 2);
  });

  it('should not emit events after destruction', function () {
    let log = [];
    let number$ = Rx.Observable.range(1, 3).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(<h3 className="myelementclass" />),
        events: {
          onMyEvent: number$.do(i => log.push(i))
        }
      };
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      function onMyEventHandler(ev) {
        assert.ok(ev === 1 || ev === 2);
        assert.notStrictEqual(ev, 3);
      }
      return theSwitch === 0 ?
        <MyElement onMyEvent={onMyEventHandler} /> :
        <div />;
    });
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    customElementSwitch$.request(1);
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');

    // Trigger the event
    number$.request(1);
    number$.request(1);

    // Destroy the element
    customElementSwitch$.request(1);
    let destroyedElement = document.querySelector('.myelementclass');
    assert.strictEqual(destroyedElement, null);

    // Trigger event after the element has been destroyed
    number$.request(1);
    assert.notStrictEqual(log.length, 3);
  });

  it('should dispose Disposable from custom element after destruction', function () {
    let log = [];
    let number$ = Rx.Observable.range(1, 2).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      let subscription = number$.subscribe(i => log.push(i));
      return {
        view: Rx.Observable.just(<h3 className="myelementclass" />),
        dispose: subscription
      };
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        <MyElement /> :
        <div />;
    });
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    assert.strictEqual(log.length, 1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger subscription inside myelement
    number$.request(1);
    assert.notStrictEqual(log.length, 2);
  });

  it('should call dispose from custom element after destruction', function () {
    let log = [];
    let log2 = 'notbar';
    let number$ = Rx.Observable.range(1, 2).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      let subscription = number$.subscribe(i => log.push(i));
      return {
        view: Rx.Observable.just(<h3 className="myelementclass" />),
        dispose: () => {
          log2 = 'bar';
          subscription.dispose();
        }
      };
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        <MyElement /> :
        <div />;
    });
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    assert.strictEqual(log.length, 1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger subscription inside myelement
    number$.request(1);
    assert.notStrictEqual(log.length, 2);
    assert.strictEqual(log2, 'bar');
  });

  it('should dispose the vtree$ which created by Observable.using', function () {
    let log = [];
    let number$ = Rx.Observable.range(1, 2).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      let subscription = number$.subscribe(i => log.push(i));
      return Rx.Observable.using(
        () => subscription,
        () => number$.map(() => <h3 className="myelementclass" />)
      );
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        <MyElement /> :
        <div />;
    });
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.strictEqual(log.length, 1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger subscription inside myelement
    number$.request(1);
    assert.notStrictEqual(log.length, 2);
  });

  it('should trigger the React_componentWillMount interaction', function (done) {
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function (interactions) {
      interactions.get('React_componentWillMount')
        .subscribe(done);
      return Rx.Observable.just(<h3 className="myelementclass" />);
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(<MyElement />);
    applyToDOM(createRenderTarget(), () => vtree$);
  });

  it('should trigger the React_componentDidMount interaction', function (done) {
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function (interactions, props, self) {
      interactions
        .get('React_componentDidMount')
        .do(() => {
          let node = ReactDOM.findDOMNode(self);
          assert.ok(node);
          assert.strictEqual(node.tagName, 'H3');
        })
        .subscribe(done);
      return Rx.Observable.just(<h3 className="myelementclass" />);
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(<MyElement />);
    applyToDOM(createRenderTarget(), () => vtree$);
  });

  it('should trigger the React_componentDidUpdate interaction', function () {
    let log = 0;
    let number$ = Rx.Observable.range(1, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function (interactions) {
      interactions.get('React_componentDidUpdate')
        .subscribe(() => log++);
      return number$.map(n => <h3 className="myelementclass">{n}</h3>);
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(<MyElement />);
    applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    number$.request(1);
    assert.strictEqual(log, 1);

    // Update the element
    number$.request(1);
    assert.strictEqual(log, 2);
  });
});
