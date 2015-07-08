const Cycle = require('cycle-react');
const Rx = Cycle.Rx;
const React = require('react');
const ManyItem = require('./many-component');

const TopButtons = Cycle.component('TopButtons', function (interactions) {
  let onAddOne = interactions.get('onAddOne');
  let onAddMany = interactions.get('onAddMany');
  return {
    view: Rx.Observable.just(
      <div>
        <button className="add-one-btn"
                onClick={interactions.listener('onAddOne')}>
          Add New Item
        </button>
        <button className="add-many-btn"
                onClick={interactions.listener('onAddMany')}>
          Add Many Items
        </button>
      </div>
    ),
    events: {
      onAddOne,
      onAddMany
    }
  };
});

function manyView(items$, interactions) {
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
      <TopButtons onAddOne={interactions.listener('AddOne')}
                  onAddMany={interactions.listener('AddMany')} />
      {itemsData.map(renderItem)}
    </div>;
  });
}

module.exports = manyView;
