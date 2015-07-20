const Cycle = require('cycle-react');
const Rx = Cycle.Rx;

function manyIntent(interactions) {
  const addOneBtnClick$ = interactions.get('AddOne');
  const addManyBtnClick$ = interactions.get('AddMany');
  const addItem$ = Rx.Observable.merge(
    addOneBtnClick$.map(() => 1),
    addManyBtnClick$.map(() => 1000)
  );
  const changeColor$ = interactions.get('ItemChangeColor');
  const changeWidth$ = interactions.get('ItemChangeWidth');
  const removeItem$ = interactions.get('ItemDestroy');

  return {
    addItem$,
    changeColor$,
    changeWidth$,
    removeItem$
  };
}

module.exports = manyIntent;
