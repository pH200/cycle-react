const Cycle = require('cycle-react');
const Rx = Cycle.Rx;
const React = require('react');

const ManyItem = Cycle.component('ManyItem', function (interactions, props) {
  const id$ = props.get('itemid').shareReplay(1);
  const color$ = props.get('color').startWith('#888').shareReplay(1);
  const width$ = props.get('width').startWith(200).shareReplay(1);
  const vtree$ = Rx.Observable
    .combineLatest(id$, color$, width$, function (id, color, width) {
      const style = {
        border: '1px solid #000',
        background: 'none repeat scroll 0% 0% ' + color,
        width: width + 'px',
        height: '70px',
        display: 'block',
        padding: '20px',
        margin: '10px 0px'
      };
      return <div className="item" key={id} style={style}>
        <input className="color-field"
               type="text"
               value={color}
               onChange={interactions.listener('OnChangeColor')} />
        <div><input className="width-slider"
               type="range"
               min="200"
               max="1000"
               value={width}
               onChange={interactions.listener('OnChangeWidth')} /></div>
        <div>{width}</div>
        <button className="remove-btn"
                onClick={interactions.listener('OnRemoveClick')}>
          Remove
        </button>
      </div>;
    });
  const destroy$ = interactions.get('OnRemoveClick')
    .withLatestFrom(id$, (ev, id) => id);
  const changeColor$ = interactions.get('OnChangeColor')
    .withLatestFrom(id$, (ev, id) => ({
      id: id,
      color: ev.target.value
    }));
  const changeWidth$ = interactions.get('OnChangeWidth')
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
});

module.exports = ManyItem;
