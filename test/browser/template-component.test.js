const r = require('react').createElement;
const renderer = require('react-test-renderer');
const {viewComponent} = require('../../src/rxjs');
const {Observable} = require('rxjs/Rx');
const controlled = require('./lib/controlled');
const {range} = require('lodash');

function just(value) {
  return Observable.of(value);
}

describe('Template Component', () => {
  jest.useRealTimers();
  afterEach(done => setTimeout(done, 1));

  it('should recognize and create simple element that is registered', () => {
    // Make simple custom element
    const MyElement = viewComponent(
      'MyElement',
      () => just('myelementclass'),
      (className) => r('h3', {className})
    );

    const comp = renderer.create(r(MyElement));
    const tree = comp.toJSON();
    
    // Make assertions
    expect(tree).toMatchSnapshot();
    expect(tree.props.className).toBe('myelementclass');
  });

  it('should render inner state and properties independently', () => {
    // Make custom element with internal state, and properties as input
    const number$ = controlled(range(1, 11)).observable;
    const MyElement = viewComponent(
      'MyElement',
      (interactions, props) => Observable.combineLatest(
        props.pluck('color'),
        number$,
        (color, number) => ({color, number})
      ),
      ({color, number}) => r('h3', {className: 'stateful-element', style: {color}}, number)
    );
    const Root = viewComponent(
      'Root',
      () => just('#00FF00').startWith('#FF0000'),
      (color) => r(MyElement, {color})
    );
    
    const comp = renderer.create(r(Root));

    number$.request(8);
    // Make assertions
    expect(comp.toJSON()).toMatchSnapshot();
  });

  it('should be able to query and use refs', (done) => {
    const viewController$ = Observable.merge(
      just(1).delay(20),
      just(2).delay(40),
      just(3).delay(60)
    );
    const MyElement = viewComponent(
      'MyElement',
      (interactions, _2, lifecycles) => {
        lifecycles.componentDidUpdate
          .combineLatest(interactions.get('onRefUpdate'), () => {})
          .scan(acc => acc + 1, 0)
          .subscribe(count => {
            if (count === 3) {
              done();
            }
          });
        return viewController$;
      },
      (value, {onRefUpdate}) => r('h3', {ref: onRefUpdate}, value)
    );

    renderer.create(r(MyElement));
  });

  it('should trigger the componentWillMount lifecycle', (done) => {
    const MyElement = viewComponent(
      'MyElement',
      (_1, _2, lifecycles) => {
        lifecycles
          .componentWillMount
          .subscribe(done);
        return just(1);
      },
      () => r('h3')
    );
    renderer.create(r(MyElement));
  });

  it('should trigger the componentDidMount lifecycle', (done) => {
    const MyElement = viewComponent(
      'MyElement',
      (interactions, _2, lifecycles) => {
        lifecycles
          .componentDidMount
          .combineLatest(interactions.get('onRefUpdate'), (_, ref) => ref)
          .subscribe(() => {
            done();
          });
        return just(1);
      },
      (_, {onRefUpdate}) => r('h3', {ref: onRefUpdate})
    );
    renderer.create(r(MyElement));
  });

  it('should trigger the componentDidUpdate lifecycle', () => {
    const log = jest.fn();
    const number$ = controlled([1, 2]).observable;
    // Make simple custom element
    const MyElement = viewComponent(
      'MyElement',
      (_1, _2, lifecycles) => {
        lifecycles
          .componentDidUpdate
          .subscribe(log);
        return number$;
      },
      (n) => r('h3', null, n)
    );
    // Use the custom element
    renderer.create(r(MyElement));
    
    // Make assertions
    number$.request(1);
    expect(log).toHaveBeenCalledTimes(1);

    // Update the element
    number$.request(1);
    expect(log).toHaveBeenCalledTimes(2);
  });

  it('should trigger the componentWillUnmount lifecycle', function (done) {
    const number$ = controlled([1, 2]).observable;
    // Make simple custom element
    const MyElement = viewComponent(
      'MyElement',
      (_1, _2, lifecycles) => {
        const onCompleted = jest.fn();
        lifecycles.componentDidMount
          .withLatestFrom(number$, (_, num) => num)
          .subscribe(
            num => expect(num).toBe(1),
            () => { throw new Error('should not throw error'); },
            onCompleted
          );
        lifecycles.componentWillUnmount
          .subscribe(() => {
            expect(onCompleted).toHaveBeenCalledTimes(1);
            done();
          });
        return just(1);
      },
      () => r('h3')
    );
    const Root = viewComponent(
      'Root',
      () => number$,
      (n) => n === 1 ? r(MyElement) : r('div')
    );
    // Use the custom element
    renderer.create(r(Root));
    // Make assertions
    number$.request(1);
    // Update the element
    number$.request(1);
  });
});
