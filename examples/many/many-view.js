const Cycle = require('cycle-react');
const React = require('react');
const PureRenderMixin = require('react/addons').addons.PureRenderMixin;
const ManyItem = require('./many-component');

function manyView(items$, interactions) {
  const TopButtons = React.createClass({
    mixins: [PureRenderMixin],
    render() {
      return <div>
        <button className="add-one-btn"
                onClick={interactions.listener('AddOne')}>
          Add New Item
        </button>
        <button className="add-many-btn"
                onClick={interactions.listener('AddMany')}>
          Add Many Items
        </button>
      </div>;
    }
  });

  function vrenderItem(item) {
    return <ManyItem className="item" key={item.id}
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
      {itemsData.map(vrenderItem)}
    </div>;
  });
}

module.exports = manyView;
