import React, { Component } from 'react';
import { AutoComplete } from 'antd';

export default class Input extends Component {
  // static propTypes = {
  //   onChange: PropTypes.func,
  //   // value: PropTypes.string,
  //   disabled: PropTypes.bool,
  //   buttonText: PropTypes.string,
  //   buttonClick: PropTypes.func,
  // }

  constructor(props) {
    super(props);
    let value = props.value || undefined;
    if (typeof value === 'number') {
      value = `${value}`;
    }
    this.state = { value };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      let value = nextProps.value || undefined;
      if (typeof value === 'number') {
        value = `${value}`;
      }
      this.setState({ value });
    }
  }

  handleChange(value) {
    this.props.onChange(value);
  }

  render() {
    const {
      disabled,
      changed,
      placeholder,
    } = this.props;

    return (
      !changed ?
        <AutoComplete
          {...this.props}
          value={this.state.value}
          onChange={this.handleChange.bind(this)}
        >
          {
            disabled &&
            <input
              className="ant-input"
              title={this.state.value}
              style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}
              placeholder={placeholder}
            />
          }
        </AutoComplete>
        :
        <span>
          <span>
            <input
              // className="ant-input"
              style={{
                display:'inline',
                width:'80%',
                border:'none',
                padding: '4px 7px',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden' }}
              title={this.state.value || '-'}
              // value={this.state.value || '-'}
              disabled
            />
          </span>
          <span style={{ color:'#f12719', maxWidth:'20%', float:'right', padding:'0 8px', background:'#eee' }}>
              已变更
          </span>
        </span>
    );
  }
}
