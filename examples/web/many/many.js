import makeModel from './many-model';
import {ManyItem, TopButtons} from './many-component';
import {useInteractions} from 'cycle-react/rxjs';
import React from 'react';
import ReactDOM from 'react-dom';
import {fromJS} from 'immutable';

const model = makeModel();
const [interactions, useCycle] = useInteractions(
  fromJS([{id: 0, color: 'red', width: 300}]),
  {
    Add: model.addItemMod,
    ItemChangeColor: model.colorChangedMod,
    ItemChangeWidth: model.widthChangedMod,
    ItemDestroy: model.removeItemMod
  }
);

function renderItem(item) {
  return (
    <ManyItem className="item"
              key={item.id}
              itemid={item.id}
              color={item.color}
              width={item.width}
              onChangeColor={interactions.listener('ItemChangeColor')}
              onChangeWidth={interactions.listener('ItemChangeWidth')}
              onRemove={interactions.listener('ItemDestroy')} />
  );
}

function View() {
  const itemsData = useCycle();
  return (
    <div>
      <TopButtons onAddOne={interactions.listener('Add')}
                  onAddMany={interactions.listener('Add')} />
      {itemsData.toJS().map(renderItem)}
    </div>
  );
}

ReactDOM.render(
  <View />,
  document.querySelector('.js-container')
);
