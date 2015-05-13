var Cycle = require('cycle-react');
var Rx = Cycle.Rx;

function manyIntent(interactions) {
  var addOneBtnClick$ = interactions.get('AddOne');
  var addManyBtnClick$ = interactions.get('AddMany');
  var addItem$ = Rx.Observable.merge(
    addOneBtnClick$.map(() => 1),
    addManyBtnClick$.map(() => 1000)
  );
  var changeColor$ = interactions.get('ItemChangeColor');
  var changeWidth$ = interactions.get('ItemChangeWidth');
  var removeItem$ = interactions.get('ItemDestroy');

  return {
    addItem$: addItem$,
    changeColor$: changeColor$,
    changeWidth$: changeWidth$,
    removeItem$: removeItem$
  };
}

module.exports = manyIntent;
