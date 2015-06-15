'use strict';
/* global describe, it, beforeEach */
let assert = require('assert');
let Cycle = require('../../src/cycle');
let {Rx, h} = Cycle;

function createRenderTarget() {
  let element = document.createElement('div');
  element.className = 'cycletest';
  document.body.appendChild(element);
  return element;
}

describe('Custom Elements', function () {
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
      return Rx.Observable.just(h('h3.myelementclass'));
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(h('div.toplevel', [h(MyElement, {key: 1})]));
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
          return h('h3.stateful-element',
            {style: {'color': color}},
            String(number)
          );
        }
      );
    });
    // Use the custom element
    function definitionFn() {
      return Rx.Observable.just('#00FF00')
        .startWith('#FF0000')
        .map(color =>
          h('div', [
            h(MyElement, {key: 1, 'color': color})
          ])
        );
    }
    Cycle.applyToDOM(createRenderTarget(), definitionFn);
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
    let MyElement = Cycle.component('myElement', function (interactions, props) {
      return props.get('*').map(propsObj => {
        assert.strictEqual(typeof propsObj, 'object');
        assert.notStrictEqual(propsObj, null);
        assert.strictEqual(propsObj.color, '#FF0000');
        assert.strictEqual(propsObj.content, 'Hello world');
        return h('h3.inner-element',
          {style: {color: propsObj.color}},
          String(propsObj.content)
        );
      });
    });
    let vtree$ = Rx.Observable.just(
      h('div', [
        h(MyElement, {color: '#FF0000', content: 'Hello world'})
      ])
    );
    let domUI = Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
      return Rx.Observable.just(h('h1.myelement1class'));
    });
    // Make the second custom element
    let MyElement2 = Cycle.component('MyElement2', function () {
      return Rx.Observable.just(h('h2.myelement2class'));
    });
    // Use the custom elements
    let vtree$ = Rx.Observable.just(
      h('div', [
        h(MyElement1), h(MyElement2)
      ])
    );
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
      return Rx.Observable.just(h('h3.innerClass'));
    });
    // Make the outer custom element
    let Outer = Cycle.component('Outer', function () {
      return Rx.Observable.just(
        h('div.outerClass', [
          h(Inner, {key: 1})
        ])
      );
    });
    // Use the custom elements
    let vtree$ = Rx.Observable.just(h('div', [h(Outer, {key: 2})]));
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
        view: Rx.Observable.just(h('h3.myelementclass', 'foobar')),
        events: {
          myevent: number$
        }
      };
    });
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      let vtree$ = Rx.Observable.just(h('div.toplevel', [
        h(MyElement, {key: 1})
      ]));
      interactions.get('.myelementclass', 'myevent').subscribe(x => {
        assert.strictEqual(x.detail, 123);
        done();
      });
      return vtree$;
    });
    Cycle.applyToDOM(createRenderTarget(), Root);
    // Make assertions
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    number$.request(1);
  });

  it('should catch customized-events by using EventSubject', function (done) {
    let number$ = Rx.Observable.of(123, 456).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(h('h3.myelementclass', 'foobar')),
        events: {
          myevent: number$
        }
      };
    });
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      let onmyevent$ = interactions.getEventSubject('onmyevent');
      let vtree$ = Rx.Observable.just(h('div.toplevel', [
        h(MyElement, {
          key: 1,
          onmyevent: interactions.getEventSubject('onmyevent').onEvent
        })
      ]));
      onmyevent$.subscribe(x => {
        assert.strictEqual(x.detail, 123);
        done();
      });
      return vtree$;
    });
    Cycle.applyToDOM(createRenderTarget(), Root);
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
      let remove$ = interactions.get('.internalslider', 'click')
        .map(() => true);
      let id$ = props.get('id').shareReplay(1);
      let vtree$ = id$
        .map(id => h('h3.internalslider', String(id)));
      return {
        view: vtree$,
        events: {
          remove: remove$.withLatestFrom(id$, (r, id) => id)
        }
      };
    });

    let sequence$ = Rx.Observable.of(
      [{id: 23}],
      [{id: 23}, {id: 45}]
    ).controlled();
    function computer(interactions) {
      let eventData$ = interactions
        .get('.internalslider', 'remove')
        .map(event => event.detail);
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
          h('div.allSliders', items.map(
            item => h(Slider, {id: item.id, className: 'slider'}))
          )
        );
    }

    Cycle.applyToDOM(createRenderTarget(), computer);

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
        return h('div.wrapper', children);
      });
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(h('div.toplevel', [
      h(SimpleWrapper, [
        h('h1', 'Hello'), h('h2', 'World')
      ])
    ]));
    let domUI = Cycle.applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    let wrapper = document.querySelector('.wrapper');
    assert.notStrictEqual(wrapper, null);
    assert.notStrictEqual(typeof wrapper, 'undefined');
    assert.strictEqual(wrapper.tagName, 'DIV');
  });

  it('should recognize changes on a mutable collection given as props', function () {
    let MyElement = Cycle.component('MyElement', function (interactions, props) {
      return props.get('list', () => false).map(list =>
        h('div', [
          h('ol', list.map(value => h('li.test-item', null, value)))
        ])
      );
    });

    function computer(interactions) {
      let counter = 0;
      let clickMod$ = interactions.get('.button', 'click')
        .map(() => `item${++counter}`)
        .map(random => function mod(data) {
          data.push(random);
          return data;
        });
      return clickMod$
        .startWith([])
        .scan((data, modifier) => modifier(data))
        .map(data => h('.root', [
          h('button.button', 'add new item'),
          h(MyElement, {key: 0, list: data})
        ]));
    }

    Cycle.applyToDOM(createRenderTarget(), computer);

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
        h('div', [
          h('ol', list.map(value => h('li.test-item', null, value)))
        ])
      );
    });

    function computer(interactions) {
      let counter = 0;
      let clickMod$ = interactions.get('.button', 'click')
        .map(() => `item${++counter}`)
        .map(random => function mod(data) {
          data.push(random);
          return data;
        });
      return clickMod$
        .startWith([])
        .scan((data, modifier) => modifier(data))
        .map(data => h('.root', [
          h('button.button', 'add new item'),
          h(MyElement, {key: 0, list: data})
        ]));
    }

    Cycle.applyToDOM(createRenderTarget(), computer);

    document.querySelector('.button').click();
    document.querySelector('.button').click();
    let items = document.querySelectorAll('li.test-item');
    assert.strictEqual(items.length, 0);
  });

  // TODO: Test interactions when we found a better way to catch
  // all events by selector
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
            return h('h3.myelementclass', 'foo');
          }
          return h('button.myelementclass', 'bar');
        }),
        events: {
          myevent: number$
        }
      };
    });
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      let onmyevent$ = interactions.getEventSubject('onmyevent');
      let vtree$ = Rx.Observable.just(
        h('div.toplevel', [
          h(MyElement, {
            key: 1,
            onMyevent: interactions.getEventSubject('onmyevent').onEvent
          })
        ])
      );
      onmyevent$.subscribe(function (x) {
        assert.strictEqual(x.detail, 123);
        done();
      });
      return vtree$;
    });
    customElementSwitch$.request(1);
    Cycle.applyToDOM(createRenderTarget(), Root);
    // Make assertions
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');
    customElementSwitch$.request(1);
    number$.request(1);
  });

  it('should not silently catch exceptions inside of custom elements', function () {
    let vtreeController$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return vtreeController$.map(control => {
        if (control === 0) {
          return h('h3.myelementclass');
        }
        throw new Error('The error');
      });
    });
    // Use the custom element
    let vtree$ = Rx.Observable.just(h('div.toplevel', [h(MyElement, {key: 1})]));
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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

  it('should accept vtree as function if bindThis was set', function (done) {
    let vtreeController$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function (_1, _2, self) {
      vtreeController$.subscribe(() => {
        let editField = Cycle.React.findDOMNode(self.refs.theRef);
        assert.notStrictEqual(editField, null);
        assert.strictEqual(editField.tagName, 'H3');
        done();
      })
      return Rx.Observable.just(() => h('h3.myelementclass', {ref: 'theRef'}));
    }, {bindThis: true});
    Cycle.applyToDOM(createRenderTarget(), MyElement);
    // Make assertions
    vtreeController$.request(1);
  });

  it('should not dispatch event if noDOMDispatchEvent was set', function (done) {
    let number$ = Rx.Observable.of(123, 456).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return {
        view: Rx.Observable.just(h('h3.myelementclass', 'foobar')),
        events: {
          myevent: number$
        }
      };
    }, {noDOMDispatchEvent: true});
    // Use the custom element
    let Root = Cycle.component('Root', function (interactions) {
      let vtree$ = Rx.Observable.just(h(MyElement, {
        onmyevent(ev) {
          // Assert events
          assert.strictEqual(ev.type, 'myevent');
          assert.strictEqual(ev.preventDefault, (void 0));
          assert.ok(ev.detail === 123 || ev.detail === 456);
          assert.strictEqual(ev.target.tagName, 'H3');
          assert.strictEqual(ev.target.innerHTML, 'foobar');
          if (ev.detail === 456) {
            done();
          }
        }
      }));

      interactions.get('.myelementclass', 'myevent').subscribe(x => {
        // Throw error for DOM event
        done(new Error('Should not dispatch DOM event'));
      });

      return vtree$;
    });

    Cycle.applyToDOM(createRenderTarget(), Root);
    number$.request(2);
  });

  it('should dispose vtree$ after destruction', function () {
    let log = [];
    let number$ = Rx.Observable.range(1, 2).controlled();
    let customElementSwitch$ = Rx.Observable.range(0, 2).controlled();
    // Make simple custom element
    let MyElement = Cycle.component('MyElement', function () {
      return number$
        .do(i => log.push(i))
        .map(i => h('h3.myelementclass', String(i)));
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        h('div.toplevel', [h(MyElement, {key: 1})]) :
        h('div.toplevel', []);
    })
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
        view: Rx.Observable.just(h('h3.myelementclass')),
        events: {
          myevent$: number$.do(i => log.push(i))
        }
      };
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        h('div.toplevel', [h(MyElement, {key: 1})]) :
        h('div.toplevel', []);
    })
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
    // Make assertions
    customElementSwitch$.request(1);
    let myElement = document.querySelector('.myelementclass');
    assert.notStrictEqual(myElement, null);
    assert.notStrictEqual(typeof myElement, 'undefined');
    assert.strictEqual(myElement.tagName, 'H3');

    Rx.Observable.fromEvent(myElement, 'myevent')
      .take(3)
      .subscribe(function (ev){
        assert.notStrictEqual(ev.detail, 3);
      });

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
        view: Rx.Observable.just(h('h3.myelementclass')),
        dispose: subscription
      };
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        h('div.toplevel', [h(MyElement, {key: 1})]) :
        h('div.toplevel', []);
    })
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
        view: Rx.Observable.just(h('h3.myelementclass')),
        dispose: () => {
          log2 = 'bar';
          subscription.dispose();
        }
      };
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        h('div.toplevel', [h(MyElement, {key: 1})]) :
        h('div.toplevel', []);
    })
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
        () => number$.map(() => h('h3.myelementclass'))
      );
    });
    // Use the custom element
    let vtree$ = customElementSwitch$.map(theSwitch => {
      return theSwitch === 0 ?
        h('div.toplevel', [h(MyElement, {key: 1})]) :
        h('div.toplevel', []);
    })
    Cycle.applyToDOM(createRenderTarget(), () => vtree$);
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
});
