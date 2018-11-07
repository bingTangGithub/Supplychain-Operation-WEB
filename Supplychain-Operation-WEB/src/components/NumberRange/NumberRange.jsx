import React, { Component } from 'react';
import { Row, Col } from 'antd';
import PropTypes from 'prop-types';
import InputNumber from '../InputNumber';

export default class NumberRange extends Component {
  static propTypes = {
    value: PropTypes.array,
    startMin: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    endMin: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    startMax: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    endMax: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    label: PropTypes.string,
  }

  static defaultProps = {
    value: undefined,
    startMin: undefined,
    endMin: undefined,
    startMax: undefined,
    endMax: undefined,
    label: '',
  }

  constructor(props) {
    super(props);
    const value = props.value || [];
    this.state = {
      startMin : props.startMin,
      endMin: props.endMin,
      startMax: props.startMax,
      endMax: props.endMax,
      value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value || [];
      this.setState({
        ...this.state,
        value,
        endMin: value[0] || nextProps.endMin,
        startMax: value[1] || nextProps.endMin || 1000000000000000,
      });
    }
  }

  onStartChange(value) {
    this.props.onChange([value, this.state.value[1]]);
  }

  onEndChange(value) {
    this.props.onChange([this.state.value[0], value]);
  }

  render() {
    const {
      startMin,
      endMin,
      startMax = 1000000000000000,
      endMax = 1000000000000000,
      value,
    } = this.state;
    const {
      label,
    } = this.props;

    return (
      <Row span={24}>
        <Col span={11}>
          <InputNumber
            min={startMin}
            max={startMax}
            placeholder={`请输入${label.replace(/\(.*\)/, '')}初始值`}
            value={value[0]}
            onChange={this.onStartChange.bind(this)}
          />
        </Col>
        <Col span={2} style={{ textAlign: 'center' }}>
          ~
        </Col>
        <Col span={11}>
          <InputNumber
            min={endMin}
            max={endMax}
            placeholder={`请输入${label.replace(/\(.*\)/, '')}结束值`}
            value={value[1]}
            onChange={this.onEndChange.bind(this)}
          />
        </Col>
      </Row>
    );
  }
}
