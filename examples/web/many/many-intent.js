import {component} from 'cycle-react/rxjs';
import {Observable} from 'rxjs/Rx';

function manyIntent(interactions) {
  const addOneBtnClick$ = interactions.get('AddOne');
  const addManyBtnClick$ = interactions.get('AddMany');
  const addItem$ = Observable.merge(
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

export default manyIntent;
