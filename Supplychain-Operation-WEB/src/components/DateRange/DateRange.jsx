import React, { Component } from 'react';
import { DatePicker, Row, Col } from 'antd';
import moment from 'moment';

export default class DateRange extends Component {
  // static propTypes = {
  //   // value: PropTypes.array,
  //   onChange: PropTypes.func,
  // }

  state = {
    startValue: null,
    endValue: null,
    endOpen: false,
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value || {};
      this.setState(Object.assign({}, this.state, {
        startValue: value[0],
        endValue: value[1],
      }));
    }
  }

  onChange(field, value) {
    this.setState({
      [field]: value,
    });
  }

  onStartChange(value) {
    this.onChange('startValue', value);
    this.props.onChange({
      startValue: value,
      endValue: this.state.endValue,
    });
  }

  onEndChange(value) {
    this.onChange('endValue', value);
    this.props.onChange({
      startValue: this.state.startValue,
      endValue: value,
    });
  }

  disabledStartDate(startValue) {
    const endValue = this.state.endValue;
    const { minTime = 0 } = this.props;
    if (startValue && !endValue) {
      return startValue.valueOf() > Date.now();
    }
    if (!startValue) {
      return false;
    }
    return startValue.valueOf() > (moment(moment(endValue).format('YYYY-MM-DD')).valueOf() + 86400000) ||
      startValue.valueOf() > Date.now() || startValue.valueOf() < minTime;
    // (new Date().setDate(new Date().getDate() + 1))
  }

  disabledEndDate(endValue) {
    const startValue = this.state.startValue;
    if (!startValue && endValue) {
      return endValue.valueOf() > Date.now();
    }
    if (!endValue) {
      return false;
    }
    return endValue.valueOf() < (moment(moment(startValue).format('YYYY-MM-DD')).valueOf()) ||
      endValue.valueOf() > Date.now();
  }

  handleStartOpenChange(open) {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange(open) {
    this.setState({ endOpen: open });
  }

  render() {
    const { startValue, endValue } = this.state;
    const { allowClear } = this.props;
    return (
      <Row span={24}>
        <Col span={11}>
          <DatePicker
            disabledDate={this.disabledStartDate.bind(this)}
            format="YYYY-MM-DD"
            value={startValue}
            allowClear={allowClear}
            placeholder="请选择开始日期"
            onChange={this.onStartChange.bind(this)}
            onOpenChange={this.handleStartOpenChange.bind(this)}
          />
        </Col>
        <Col span={2} style={{ textAlign: 'center' }}>
          ~
        </Col>
        <Col span={11}>
          <DatePicker
            disabledDate={this.disabledEndDate.bind(this)}
            format="YYYY-MM-DD"
            value={endValue}
            allowClear={allowClear}
            placeholder="请选择结束日期"
            onChange={this.onEndChange.bind(this)}
            onOpenChange={this.handleEndOpenChange.bind(this)}
          />
        </Col>
      </Row>
    );
  }
}
