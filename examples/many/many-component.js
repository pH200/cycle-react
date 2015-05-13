var Cycle = require('cycle-react');
var Rx = Cycle.Rx;
var h = Cycle.h;

function manyComponent(interactions, props) {
  var id$ = props.get('itemid').shareReplay(1);
  var color$ = props.get('color').startWith('#888').shareReplay(1);
  var width$ = props.get('width').startWith(200).shareReplay(1);
  var vtree$ = Rx.Observable
    .combineLatest(id$, color$, width$, function (id, color, width) {
      var style = {
        border: '1px solid #000',
        background: 'none repeat scroll 0% 0% ' + color,
        width: width + 'px',
        height: '70px',
        display: 'block',
        padding: '20px',
        margin: '10px 0px'
      };
      return h('div.item', {style: style}, [
        h('input.color-field', {
          type: 'text',
          value: color,
          onChange: interactions.listener('OnChangeColor')
        }),
        h('div.slider-container', [
          h('input.width-slider', {
            type: 'range', min: '200', max: '1000',
            value: width,
            onChange: interactions.listener('OnChangeWidth')
          })
        ]),
        h('div.width-content', String(width)),
        h('button.remove-btn', {
          onClick: interactions.listener('OnRemoveClick')
        }, 'Remove')
      ]);
    });
  var destroy$ = interactions.get('OnRemoveClick')
    .withLatestFrom(id$, (ev, id) => id);
  var changeColor$ = interactions.get('OnChangeColor')
    .withLatestFrom(id$, (ev, id) => ({
      id: id,
      color: ev.target.value
    }));
  var changeWidth$ = interactions.get('OnChangeWidth')
    .withLatestFrom(id$, (ev, id) => ({
      id: id,
      width: ev.target.value | 0
    }));

  return {
    view: vtree$,
    events: {
      onDestroy: destroy$,
      onChangeColor: changeColor$,
      onChangeWidth: changeWidth$
    }
  };
}

var ManyItem = Cycle.component('ManyItem', manyComponent);

module.exports = ManyItem;
