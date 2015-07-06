const Cycle = require('cycle-react');
const Rx = Cycle.Rx;
const React = require('react');
const ManyItem = require('./many-component');

function manyView(items$, interactions) {
  const TopButtons = Cycle.component('TopButtons', () => Rx.Observable.just(
    <div>
      <button className="add-one-btn"
              onClick={interactions.listener('AddOne')}>
        Add New Item
      </button>
      <button className="add-many-btn"
              onClick={interactions.listener('AddMany')}>
        Add Many Items
      </button>
    </div>
  ));

  function renderItem(item) {
    return <ManyItem className="item"
                     key={item.id}
                     itemid={item.id}
                     color={item.color}
                     width={item.width}
                     onChangeColor={interactions.listener('ItemChangeColor')}
                     onChangeWidth={interactions.listener('ItemChangeWidth')}
                     onDestroy={interactions.listener('ItemDestroy')} />;
  }

  return items$.map(function renderElements(itemsData) {
    return <div>
      <TopButtons />
      {itemsData.map(renderItem)}
    </div>;
  });
}

module.exports = manyView;
