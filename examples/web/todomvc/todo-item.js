import React, {Component} from 'react';

const ESC_KEY = 27;

export class TodoItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editContent: '',
      editing: false
    };
  }
  onSubmitHandler(e) {
    e.preventDefault();
    /*eslint-disable dot-notation */
    this.stopEdit(e.target.elements['contentedit'].value);
    /*eslint-enable dot-notation */
  }
  onChange(ev) {
    this.setState({
      editContent: ev.target.value,
      editing: true
    });
  }
  onKeyUp(ev) {
    if (ev.keyCode === ESC_KEY) {
      this.stopEdit(ev.target.value);
    }
  }
  startEdit() {
    this.setState({
      editContent: this.props.content,
      editing: true
    });
  }
  stopEdit(content) {
    this.setState({
      editContent: content,
      editing: false
    });
    if (content.trim() !== '') {
      this.props.onNewContent({
        id: this.props.todoid,
        content: content.trim()
      });
    }
  }
  render() {
    const className = (this.props.completed ? 'completed ' : '') +
      (this.state.editing ? 'editing' : '');
    if (this.state.editing) {
      return <li className={className}>
        <form className="editform"
              onSubmit={this.onSubmitHandler.bind(this)}>
          <input className="edit"
                name="contentedit"
                autoFocus={true}
                value={this.state.editContent}
                onChange={this.onChange.bind(this)}
                onKeyUp={this.onKeyUp.bind(this)}
                onBlur={ev => this.stopEdit(ev.target.value)} />
        </form>
      </li>;
    }
    return <li className={className}>
      <div className="view">
        <input className="toggle"
              type="checkbox"
              checked={!!this.props.completed}
              onChange={() => this.props.onToggle(this.props.todoid)} />
        <label onDoubleClick={() => this.startEdit()}>
          {this.props.content}
        </label>
        <button className="destroy"
                onClick={() => this.props.onDestroy(this.props.todoid)} />
      </div>
    </li>;
  }
}
