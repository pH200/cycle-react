const Cycle = require('cycle-react');
const Rx = Cycle.Rx;

function manyModel(intentions) {
  function createRandomItem() {
    let hexColor = Math.floor(Math.random() * 16777215).toString(16);
    while (hexColor.length < 6) {
      hexColor = '0' + hexColor;
    }
    hexColor = '#' + hexColor;
    const randomWidth = Math.floor(Math.random() * 800 + 200);
    return {
      color: hexColor,
      width: randomWidth
    };
  }

  function reassignId(item, index) {
    return {
      id: index,
      color: item.color,
      width: item.width
    };
  }

  const addItemMod$ = intentions.addItem$.map(amount => listItems => {
    const newItems = [];
    for (let i = 0; i < amount; i++) {
      newItems.push(createRandomItem());
    }
    return listItems.concat(newItems).map(reassignId);
  });

  const removeItemMod$ = intentions.removeItem$.map(id => listItems => {
    return listItems
      .filter((item) => item.id !== id)
      .map(reassignId);
  });

  const colorChangedMod$ = intentions.changeColor$.map(x => listItems => {
    listItems[x.id].color = x.color;
    return listItems;
  });

  const widthChangedMod$ = intentions.changeWidth$.map(x => listItems => {
    listItems[x.id].width = x.width;
    return listItems;
  });

  return Rx.Observable.merge(
      addItemMod$, removeItemMod$, colorChangedMod$, widthChangedMod$
    )
    .startWith([{id: 0, color: 'red', width: 300}])
    .scan((listItems, modification) => modification(listItems));
}

module.exports = manyModel;
