const r = require('react').createElement;
const renderer = require('react-test-renderer');
const {component} = require('../../');
const {Observable} = require('rx');

describe('Component', () => {
  jest.useRealTimers();
  afterEach(done => setTimeout(done, 1));

  it('should recognize and create simple element that is registered', () => {
    // Make simple custom element
    const MyElement = component('MyElement', () =>
      Observable.just(r('h3', {className: 'myelementclass'}))
    );
    // Use the custom element
    const comp = renderer.create(r(MyElement));
    
    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should render inner state and properties independently', () => {
    // Make custom element with internal state, and properties as input
    const number$ = Observable.range(1, 10).controlled();
    const MyElement = component('MyElement', (interactions, props) =>
      Observable.combineLatest(
        props.get('color'),
        number$,
        (color, number) => r('h3', {className: 'stateful-element', style: {color}}, String(number))
      )
    );
    // Use the custom element
    function definitionFn() {
      return Observable.just('#00FF00')
        .startWith('#FF0000')
        .map(color => r(MyElement, {color}));
    }

    const testRoot = r(component('test', definitionFn));
    const comp = renderer.create(testRoot);
    number$.request(8);
    
    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should have Observable properties object as props.get("*")', () => {
    // Make custom element
    const MyElement = component('MyElement', (interactions, props) =>
      props.get('*').map(propsObj => {
        expect(typeof propsObj).toBe('object');
        expect(propsObj.color).toBe('#FF0000');
        expect(propsObj.content).toBe('Hello world');

        const style = {color: propsObj.color};
        return r('h3', {className: "inner-element", style}, String(propsObj.content));
      })
    );

    const testRoot = r(MyElement, {color: "#FF0000", content: "Hello world"});
    const comp = renderer.create(testRoot);

    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should recognize and create two unrelated elements', () => {
    // Make the first custom element
    const MyElement1 = component('MyElement1', () =>
      Observable.just(r('h1', {className: 'myelement1class'}))
    );
    // Make the second custom element
    const MyElement2 = component('MyElement2', () =>
      Observable.just(r('h2', {className: 'myelement2class'}))
    );
    // Use the custom elements
    const testRoot = r('div', null, r(MyElement1), r(MyElement2));
    const comp = renderer.create(testRoot);

    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should recognize and create a nested custom elements', () => {
    // Make the inner custom element
    const Inner = component('Inner', () =>
      Observable.just(r('h3', {className: "innerClass"}))
    );
    // Make the outer custom element
    const Outer = component('Outer', () =>
      Observable.just(
        r('div', {className: 'outerClass'}, r(Inner))
      )
    );
    // Use the custom elements
    const testRoot = r(Outer);
    const comp = renderer.create(testRoot);

    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should catch interactions coming from custom element', (done) => {
    const number$ = Observable.of(123, 456).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () => ({
      view: Observable.just(r('h3', {className: "myelementclass"}, 'foobar')),
      events: {
        onMyEvent: number$
      }
    }));
    // Use the custom element
    const Root = component('Root', (interactions) => {
      interactions.get('myevent').subscribe(x => {
        expect(comp.toJSON()).toMatchSnapshot();
        expect(x).toBe(x, 123);

        done();
      });
      const vtree$ = Observable.just(
        r(MyElement, {onMyEvent: interactions.listener('myevent')})
      );
      return vtree$;
    });
    
    const comp = renderer.create(r(Root));
    
    expect(comp.toJSON()).toMatchSnapshot();

    number$.request(1);
  });

  it('should not miss custom events from a list of custom elements', () => {
    jest.useRealTimers();
    // Make custom element
    const Slider = component('Slider', (interactions, props) => {
      const remove$ = interactions.get('click').map(() => true);
      const id$ = props.get('id').shareReplay(1);
      const vtree$ = id$.map(id =>
        r('h3', {className: 'internalslider', onClick: interactions.listener('click')}, String(id))
      );
      return {
        view: vtree$,
        events: {
          onRemove: remove$.withLatestFrom(id$, (r, id) => id)
        }
      };
    });

    const sequence$ = Observable.of(
      [{id: 23}],
      [{id: 23}, {id: 45}]
    ).controlled();

    function computer(interactions) {
      const eventData$ = interactions.get('remove');
      return sequence$
        .concat(eventData$)
        .scan((items, x) => {
          if (typeof x === 'object') {
            return x;
          }
          return items.filter((item) => item.id !== x);
        })
        .map(items =>
          r('div',
            {className: 'allSliders'},
            items.map(item => r(Slider, {
              id: item.id,
              key: item.id,
              className: 'slider',
              onRemove: interactions.listener('remove')
            })))
        );
    }

    const testRoot = r(component('test', computer));
    const comp = renderer.create(testRoot);

    // Simulate clicks
    sequence$.request(2);
    
    const tree1 = comp.toJSON();
    expect(tree1).toMatchSnapshot();

    tree1.children[0].props.onClick();
    const tree2 = comp.toJSON();
    expect(tree2).toMatchSnapshot();

    tree2.children[0].props.onClick();
    const tree3 = comp.toJSON();
    expect(tree3).toMatchSnapshot();

    expect(tree3.children).toBeNull();
  });

  it('should recognize nested vtree as properties.get("children")', () => {
    // Make simple custom element
    const SimpleWrapper = component('SimpleWrapper', (interactions, props) =>
      props.get('children').map(children =>
        r('div', {className: 'wrapper'}, children)
      )
    );
    // Use the custom element
    const testRoot = r(SimpleWrapper, null,
      r('h1', null, 'Hello'),
      r('h2', null, 'World')
    );
    const comp = renderer.create(testRoot);
    
    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should recognize changes on a mutable collection given as props', () => {
    const MyElement = component('MyElement', (interactions, props) =>
      props.get('list', () => false).map(list =>
        r('ol', null, list.map(value =>
          r('li', {
            key: value,
            className: 'test-item'
          }, value)
        ))
      )
    );

    function computer(interactions) {
      let counter = 0;
      const clickMod$ = interactions.get('click')
        .map(() => `item${++counter}`)
        .map(random => function mod(data) {
          data.push(random);
          return data;
        });
      return clickMod$
        .startWith([])
        .scan((data, modifier) => modifier(data))
        .map(data =>
          r('div', {className: 'root'},
            r('button', {onClick: interactions.listener('click')}, 'add new item'),
            r(MyElement, {list: data})
          )
        );
    }

    const testRoot = r(component('test', computer));
    const comp = renderer.create(testRoot);
    
    const tree1 = comp.toJSON();
    expect(tree1).toMatchSnapshot();

    // Click button
    tree1.children[0].props.onClick();
    const tree2 = comp.toJSON();
    expect(tree2).toMatchSnapshot();

    tree2.children[0].props.onClick();
    const tree3 = comp.toJSON();
    expect(tree3).toMatchSnapshot();
  });

  it('should distinct property changes for props.get', () => {
    const MyElement = component('MyElement', (interactions, props) =>
      props.get('list').map(list =>
        r('ol', null, list.map(value =>
          r('li', {
            key: value,
            className: 'test-item'
          }, value)
        ))
      )
    );

    function computer(interactions) {
      let counter = 0;
      const clickMod$ = interactions.get('click')
        .map(() => `item${++counter}`)
        .map(random => function mod(data) {
          data.push(random);
          return data;
        });
      return clickMod$
        .startWith([])
        .scan((data, modifier) => modifier(data))
        .map(data =>
          r('div', {className: 'root'},
            r('button', {onClick: interactions.listener('click')}, 'add new item'),
            r(MyElement, {list: data})
          )
        );
    }

    const testRoot = r(component('test', computer));
    const comp = renderer.create(testRoot);
    
    const tree1 = comp.toJSON();
    expect(tree1).toMatchSnapshot();

    // Click button
    tree1.children[0].props.onClick();
    const tree2 = comp.toJSON();
    expect(tree2).toMatchSnapshot();

    tree2.children[0].props.onClick();
    const tree3 = comp.toJSON();
    expect(tree3).toMatchSnapshot();
  });

  it('should emit events even when dynamically evolving', (done) => {
    const number$ = Observable.of(123, 456).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () => {
      // Here the vtree changes from <h3> to <button>, the myevent should
      // be emitted on <button> and not from the original <h3>.
      return {
        view: customElementSwitch$.map(number => {
          if (number === 0) {
            return r('h3', {className: 'myelementclass'}, 'foo');
          }
          return r('button', {className: 'myelementclass'}, 'bar');
        }),
        events: {
          onMyEvent: number$
        }
      };
    });
    // Use the custom element
    const Root = component('Root', (interactions) => {
      const onmyevent$ = interactions.get('myevent');
      const vtree$ = Observable.just(
        r(MyElement, {onMyEvent: interactions.listener('myevent')})
      );
      onmyevent$.subscribe((x) => {
        expect(x).toBe(123);

        done();
      });
      return vtree$;
    });

    customElementSwitch$.request(1);
    
    const comp = renderer.create(r(Root));
    
    expect(comp.toJSON()).toMatchSnapshot();

    customElementSwitch$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();

    number$.request(1);
  });

  it('should emit events for dynamic event handlers', function (done) {
    const number$ = Observable.of(123, 456).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () => ({
      view: Observable.just(r('h3', {className: 'myelementclass'}, 'foo')),
      events: {
        onMyEvent: number$
      }
    }));
    // Use the custom element
    const Root = component('Root', (interactions) => {
      const onmyevent$ = interactions.get('myevent');
      const vtree$ = customElementSwitch$.map(number => {
        if (number === 0) {
          return r(MyElement);
        }
        return r(MyElement, {onMyEvent: interactions.listener('myevent')});
      });
      onmyevent$.subscribe((x) => {
        expect(x).toBe(456);

        done();
      });
      return vtree$;
    });
    customElementSwitch$.request(1);

    const comp = renderer.create(r(Root));
    // Make assertions
    number$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();
    // pop event handler
    customElementSwitch$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();
    // emit event
    number$.request(1);
  });

  it('should not silently catch exceptions inside of custom elements', () => {
    const vtreeController$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () =>
      vtreeController$.map(control => {
        if (control === 0) {
          return r('h3', {className: 'myelementclass'});
        }
        throw new Error('The error');
      })
    );
    // Use the custom element
    const comp = renderer.create(r(MyElement));

    // Make assertions
    vtreeController$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();

    // Throw exception inside vtree$
    expect(() => vtreeController$.request(1)).toThrowError('The error');
  });

  it('should dispose vtree$ after destruction', () => {
    const log = [];
    const number$ = Observable.range(1, 2).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () =>
      number$
        .do(i => log.push(i))
        .map(i => r('h3', {className: 'myelementclass'}, i))
    );
    // Use the custom element
    const vtree$ = customElementSwitch$.map(theSwitch =>
      theSwitch === 0 ? r(MyElement) : r('div')
    );
    const testRoot = r(component('test', () => vtree$));
    const comp = renderer.create(testRoot);

    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();

    // Destroy the element
    customElementSwitch$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();
    // Try to trigger onNext of myelement's vtree$
    number$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();
    expect(log.length).not.toBe(2);
  });

  it('should not emit events after destruction', () => {
    const log = [];
    const number$ = Observable.range(1, 3).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () => ({
      view: Observable.just(r('h3', {className: 'myelementclass'})),
      events: {
        onMyEvent: number$.do(i => log.push(i))
      }
    }));
    // Use the custom element
    const vtree$ = customElementSwitch$.map(theSwitch => {
      function onMyEvent(ev) {
        expect(ev === 1 || ev === 2).toBeTruthy();
        expect(ev).not.toBe(3);
      }
      return theSwitch === 0 ? r(MyElement, {onMyEvent}) : r('div');
    });
    const testRoot = r(component('test', () => vtree$));
    const comp = renderer.create(testRoot);
    
    // Make assertions
    customElementSwitch$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();

    // Trigger the event
    number$.request(1);
    number$.request(1);

    // Destroy the element
    customElementSwitch$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();

    // Trigger event after the element has been destroyed
    number$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();
    expect(log.length).not.toBe(3);
  });

  it('should dispose Disposable from custom element after destruction', () => {
    const log = [];
    const number$ = Observable.range(1, 2).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () => {
      const subscription = number$.subscribe(i => log.push(i));
      return {
        view: Observable.just(r('h3', {className: 'myelementclass'})),
        dispose: subscription
      };
    });
    // Use the custom element
    const vtree$ = customElementSwitch$.map(theSwitch =>
      theSwitch === 0 ? r(MyElement) : r('div')
    );
    const testRoot = r(component('test', () => vtree$));
    renderer.create(testRoot);

    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    expect(log.length).toBe(1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger subscription inside myelement
    number$.request(1);
    expect(log.length).not.toBe(2);
  });

  it('should call dispose from custom element after destruction', () => {
    const log = jest.fn();
    const number$ = Observable.range(1, 2).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    const subscription = number$.subscribe(log);
    const dispose = jest.fn(() => subscription.dispose());
    // Make simple custom element
    const MyElement = component('MyElement', () => {
      return {
        view: Observable.just(r('h3', {className: 'myelementclass'})),
        dispose: dispose
      };
    });
    // Use the custom element
    const vtree$ = customElementSwitch$.map(theSwitch =>
      theSwitch === 0 ? r(MyElement) : r('div')
    );
    const testRoot = r(component('test', () => vtree$));
    renderer.create(testRoot);

    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    expect(log).toHaveBeenCalledTimes(1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger subscription inside myelement
    number$.request(1);
    expect(log).not.toHaveBeenCalledTimes(2);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  it('should dispose the vtree$ which created by Observable.using', () => {
    const log = jest.fn();
    const number$ = Observable.range(1, 2).controlled();
    const customElementSwitch$ = Observable.range(0, 2).controlled();
    // Make simple custom element
    const MyElement = component('MyElement', () =>
      Observable.using(
        () => number$.subscribe(log),
        () => number$.map(() => r('h3', {className: 'myelementclass'})
      )
    ));
    // Use the custom element
    const vtree$ = customElementSwitch$.map(theSwitch =>
      theSwitch === 0 ? r(MyElement) : r('div')
    );
    const testRoot = r(component('test', () => vtree$));
    const comp = renderer.create(testRoot);

    // Make assertions
    customElementSwitch$.request(1);
    number$.request(1);
    expect(comp.toJSON()).toMatchSnapshot();
    expect(log).toHaveBeenCalledTimes(1);

    // Destroy the element
    customElementSwitch$.request(1);
    // Try to trigger subscription inside myelement
    number$.request(1);
    expect(log).not.toHaveBeenCalledTimes(2);
  });
});
