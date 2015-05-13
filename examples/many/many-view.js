var Cycle = require('cycle-react');
var h = Cycle.h;
var ManyItem = require('./many-component');

function manyView(items$, interactions) {
  function vrenderTopButtons() {
    return h('div.topButtons', [
      h('button.add-one-btn', {
        onClick: interactions.listener('AddOne')
      }, 'Add New Item'),
      h('button.add-many-btn', {
        onClick: interactions.listener('AddMany')
      }, 'Add Many Items'),
    ]);
  }

  function vrenderItem(itemData) {
    return h(ManyItem, {
      className: 'item',
      itemid: itemData.id,
      color:  itemData.color,
      width:  itemData.width,
      key: itemData.id,
      onChangeColor: interactions.listener('ItemChangeColor'),
      onChangeWidth: interactions.listener('ItemChangeWidth'),
      onDestroy: interactions.listener('ItemDestroy')
    });
  }

  return items$
    .map(function (itemsData) {
      return h('div.everything', {}, [
        vrenderTopButtons(),
        itemsData.map(vrenderItem)
      ]);
    });
}

module.exports = manyView;
