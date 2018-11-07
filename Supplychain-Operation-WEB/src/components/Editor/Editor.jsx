import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './style.scss';

export default class Editor extends Component {
  // static propTypes = {
  //   onChange: PropTypes.func,
  // }

  constructor(props) {
    super(props);
    this.state = { value: '' };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value || '';
      this.setState({ value });
    }
  }

  handleChange(value) {
    let newValue = value;
    if (value === '<p><br></p>') {
      newValue = '';
    }
    this.props.onChange(newValue);
  }

  render() {
    return (
      <ReactQuill
        {...this.props}
        theme="snow"
        value={this.state.value}
        onChange={this.handleChange.bind(this)}
      />
    );
  }
}
