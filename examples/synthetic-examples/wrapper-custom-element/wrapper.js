var h = Cycle.h;
var Rx = Cycle.Rx;

var WrapperElement = Cycle.createReactClass('WrapperElement',
  function (interactions, props) {
    return props.get('children')
      .map(function (children) {
        return h('div.wrapper', {
          style: {backgroundColor: 'lightgray'}
        }, children);
      });
  }
);

Cycle.applyToDOM('.js-container', function computer() {
  return Rx.Observable.just(
    h('div.everything', [
      h(WrapperElement, {key: 1}, [
        h('h3', 'I am supposed to be inside a gray box.')
      ])
    ])
  );
});
