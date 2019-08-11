import { map } from 'rxjs/operators'
import { Map } from 'immutable';
import cuid from 'cuid';

function manyModel() {
  function createRandomItem() {
    let hexColor = Math.floor(Math.random() * 16777215).toString(16);
    while (hexColor.length < 6) {
      hexColor = '0' + hexColor;
    }
    hexColor = '#' + hexColor;
    const randomWidth = Math.floor(Math.random() * 800 + 200);
    return Map({
      id: cuid(),
      color: hexColor,
      width: randomWidth
    });
  }

  return {
    addItemMod: map(amount => listItems => {
      return listItems.withMutations(state => {
        for (let i = 0; i < amount; i++) {
          state.push(createRandomItem());
        }
      });
    }),
    removeItemMod: map(id => listItems => {
      return listItems.filter(item => item.id !== id);
    }),
    colorChangedMod: map(x => listItems => {
      const index = listItems.findIndex(item => item.id === x.id);
      return listItems.setIn([index, 'color'], x.color);
    }),
    widthChangedMod: map(x => listItems => {
      const index = listItems.findIndex(item => item.id === x.id);
      return listItems.setIn([index, 'width'], x.width);
    })
  };
}

export default manyModel;
