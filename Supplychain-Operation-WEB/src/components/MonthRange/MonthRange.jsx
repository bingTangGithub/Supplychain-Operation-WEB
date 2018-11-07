import React, { Component } from 'react';
import { DatePicker, Row, Col } from 'antd';

const MonthPicker = DatePicker.MonthPicker;

export default class MonthRange extends Component {
  state = {
    endOpen: false,
    value: [],
  };

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value || {};
      this.setState(Object.assign({}, this.state, {
        value,
      }));
    }
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = (value) => {
    this.onChange('startValue', value);
    this.props.onChange([value, this.state.value[1]]);
  };

  onEndChange = (value) => {
    this.onChange('endValue', value);
    this.props.onChange([this.state.value[0], value]);
  };

  disabledStartDate = (startValue) => {
    const endValue = this.state.value[1];
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (endValue) => {
    const startValue = this.state.value[0];
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  render() {
    const { value, endOpen } = this.state;
    return (
      <Row span={24}>
        <Col span={11}>
          <MonthPicker
            disabledDate={this.disabledStartDate}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM"
            value={value[0]}
            placeholder="请选择开始月份"
            onChange={this.onStartChange}
            onOpenChange={this.handleStartOpenChange}
          />
        </Col>
        <Col span={2} style={{ textAlign: 'center' }}>
          <span> ~ </span>
        </Col>
        <Col span={11}>
          <MonthPicker
            disabledDate={this.disabledEndDate}
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM"
            value={value[1]}
            placeholder="请结束开始月份"
            onChange={this.onEndChange}
            open={endOpen}
            onOpenChange={this.handleEndOpenChange}
          />
        </Col>
      </Row>
    );
  }
}
