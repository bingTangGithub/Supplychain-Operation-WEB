/* eslint-disable no-self-compare */
import React, { Component } from 'react';
import { InputNumber as AntdInputNumber } from 'antd';
import { Link } from 'react-router';
import PropTypes from 'prop-types';

function formatMoney(num) {
  const numStr = `${num}`;
  const nums = numStr.split('.');

  const integer = (nums[0]).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  return nums.length > 1 ? `${integer}.${nums[1]}` : integer;
}

function isEmpty(value) {
  if (value === undefined || value === '' || value !== value || value === null || value === 'NaN') {
    return true;
  }
  return false;
}

export default class InputNumber extends Component {
  static propTypes = {
    max: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    money: PropTypes.bool,
    min: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    precision: PropTypes.number,
  }

  static defaultProps = {
    max: 10000000000000000,
    min: -Infinity,
    money: false,
    placeholder: '',
    disabled: false,
    precision: 2,
  }

  constructor(props) {
    super(props);
    const value = typeof (props.value) === 'number' ? (props.value) : (props.value || undefined);
    this.state = {
      value,
      min: props.min,
      max: props.max,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      min: nextProps.min,
      max: nextProps.max,
    }, () => {
      if ('value' in nextProps) {
        const value = typeof (nextProps.value) === 'number' ? (nextProps.value) : (nextProps.value || undefined);
        this.setState({ value });
      }
    });
  }

  handleChange(value) {
    let val;
    if (typeof value === 'string') {
      val = `${value}`;
    } else {
      val = value;
    }
    this.props.onChange(val);
  }

  formatter = (val) => {
    let value = val;
    if (value) {
      value = (`${value}`).replace(/[^.\-\d]/g, '');
      let precision = 0;
      const valueStr = `${value}`;
      const index = valueStr.indexOf('.');
      if (index >= 0) {
        precision = valueStr.length - valueStr.indexOf('.') - 1;
      }
      if (precision > this.props.precision) {
        value = (`${value}`).slice(0, index + 1 + this.props.precision);
      }
    }
    value = (`${value}`).replace(/,/g, '');
    return value;
  };

  renderDisabled = () => {
    const { href, value, render } = this.props;
    let html = '';
    if (render) {
      html = render(value);
      html = isEmpty(html) ? <span className="fe-blank-holder">-</span> : html;
    } else {
      html = <span>{isEmpty(value) ? <span className="fe-blank-holder">-</span> : value}</span>;
    }
    if (href && !isEmpty(value)) {
      html = <Link to={href}>{html}</Link>;
    }
    return html;
  };

  render() {
    const {
      money,
      placeholder,
      disabled,
      inputWidth,
      addonBefore = '',
      addonAfter = '',
      readonly,
    } = this.props;

    const { max = 10000000000000000, min } = this.state;

    const style = {};

    if (inputWidth) {
      style.width = inputWidth;
    }

    if (addonBefore) {
      style.marginLeft = 4;
    }

    if (addonAfter) {
      style.marginRight = 4;
    }
    const _min = typeof min === 'number' ? min : (+min || undefined);

    return (
      <div>
        <span>{addonBefore}</span>
        {
          disabled ? this.renderDisabled() :
            (
              <AntdInputNumber
                style={style}
                disabled={readonly}
                max={+max}
                min={_min}
                placeholder={placeholder}
                money={money}
                onChange={this.handleChange.bind(this)}
                value={this.state.value}
                formatter={(val) => {
                  const value = this.formatter(val);
                  return money ? formatMoney(value) : value;
                }}
                parser={(val) => (this.formatter(val))}
              />
            )
        }
        <span>{addonAfter}</span>
      </div>
    );
  }
}
