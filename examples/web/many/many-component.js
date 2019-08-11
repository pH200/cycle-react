import React from 'react';

export function ManyItem(props) {
  const style = {
    border: '1px solid #000',
    background: 'none repeat scroll 0% 0% ' + props.color,
    width: props.width + 'px',
    height: '70px',
    display: 'block',
    padding: '20px',
    margin: '10px 0px'
  };
  function onRemoveClick() {
    props.onRemove(props.itemid);
  }
  function onChangeColor(ev) {
    props.onChangeColor({
      id: props.itemid,
      color: ev.target.value
    });
  }
  function onChangeWidth(ev) {
    props.onChangeWidth({
      id: props.itemid,
      width: ev.target.value | 0
    });
  }
  return <div className="item" key={props.itemid} style={style}>
    <input className="color-field"
            type="text"
            value={props.color}
            onChange={onChangeColor} />
    <div><input className="width-slider"
            type="range"
            min="200"
            max="1000"
            value={props.width}
            onChange={onChangeWidth} /></div>
    <div>{props.width}</div>
    <button className="remove-btn"
            onClick={onRemoveClick}>
      Remove
    </button>
  </div>;
}

export function TopButtons(props) {
  function onAddOne() {
    props.onAddOne(1);
  }
  function onAddMany() {
    props.onAddMany(1000);
  }
  return (
    <div>
      <button className="add-one-btn"
              onClick={onAddOne}>
        Add New Item
      </button>
      <button className="add-many-btn"
              onClick={onAddMany}>
        Add Many Items
      </button>
    </div>
  );
}
