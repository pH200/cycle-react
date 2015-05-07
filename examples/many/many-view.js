function manyView(items$) {
  var h = Cycle.h;

  function vrenderTopButtons() {
    return h('div.topButtons', [
      h('button.add-one-btn', 'Add New Item'),
      h('button.add-many-btn', 'Add Many Items'),
    ]);
  }

  function vrenderItem(itemData) {
    return h(ManyItem, {
      className: 'item',
      itemid: itemData.id,
      color:  itemData.color,
      width:  itemData.width,
      key: itemData.id
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
