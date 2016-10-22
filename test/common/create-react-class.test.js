const {component} = require('../../');
const {Observable} = require('rx');

describe('component', () => {
  it('should have a default rootTagName', () => {
    const MyElement = component(
      'MyElement',
      () => Observable.empty()
    );
    const element = MyElement.prototype.render();
    expect(element.type).toBe('div');
  });

  it('should overwrite rootTagName', () => {
    const MyElement = component(
      'MyElement',
      () => Observable.empty(),
      {rootTagName: 'h3'}
    );
    const element = MyElement.prototype.render();
    expect(element.type).toBe('h3');
  });

  it('should not overwrite rootTagName by null options', () => {
    const MyElement = component(
      'MyElement',
      () => Observable.empty(),
      {rootTagName: null}
    );
    const element = MyElement.prototype.render();
    expect(element.type).toBe('div');
  });

  it('should have default mixins', () => {
    const MyElement = component(
      'MyElement',
      () => Observable.empty()
    );
    expect(typeof MyElement.prototype.shouldComponentUpdate).toBe('function');
  });
});
