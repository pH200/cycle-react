const createReactClass = require('../../src/create-react-class');
const {PropTypes} = require('prop-types');

function noop() {
}

describe('component', () => {
  it('should set propTypes', () => {
    const component = createReactClass({Component: noop}, {}, noop, noop, false);
    const MyElement = component(
      'MyElement',
      noop,
      {propTypes: {foo: PropTypes.any.isRequired}}
    );
    expect(MyElement.propTypes.foo).toBe(PropTypes.any.isRequired);
  });
});
