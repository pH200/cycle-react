const {component} = require('../../src/rxjs');
const {Observable} = require('rxjs/Rx');

const r = require('react').createElement;
const ReactDOMServer = require('react-dom/server');

function just(value) {
  return Observable.of(value);
}

describe('Server-side rendering', () => {
  it('should output HTML when given a simple component', () => {
    const Root = component('Root', () => just(
      r('div', {className: 'test-element'}, 'Foobar')
    ));
    const html = ReactDOMServer.renderToStaticMarkup(r(Root));
    expect(html).toBe('<div class="test-element">Foobar</div>');
  });

  it('should not emit events', () => {
    const log = jest.fn();
    const MyElement = component('MyElement', () => ({
      view: just(
        r('div', {className: 'test-element'}, 'Foobar')
      ),
      events: {
        myevent: just(123).do(log)
      }
    }));
    const html = ReactDOMServer.renderToStaticMarkup(r(MyElement));
    expect(html).toBe('<div class="test-element">Foobar</div>');
    expect(log).toHaveBeenCalledTimes(0);
  });

  it('should render a simple nested component as HTML', () => {
    const MyElement = component('MyElement', () => just(
      r('h3', {className: 'myelementclass'})
    ));
    const Root = component('Root', () => just(
      r('div', {className: 'test-element'}, r(MyElement))
    ));
    const html = ReactDOMServer.renderToStaticMarkup(r(Root));
    expect(html).toBe('<div class="test-element"><h3 class="myelementclass"></h3></div>');
  });

  it('should render a nested custom element with props as HTML', () => {
    const MyElement = component('MyElement', (_, props) =>
      props.get('foobar').map(foobar =>
        r('h3', {className: 'myelementclass'}, foobar.toUpperCase())
      )
    );
    const Root = component('Root', () => just(
      r('div', {className: 'test-element'}, r(MyElement, {foobar: 'yes'}))
    ));
    const html = ReactDOMServer.renderToStaticMarkup(r(Root));
    expect(html).toBe('<div class="test-element"><h3 class="myelementclass">YES</h3></div>');
  });
});
