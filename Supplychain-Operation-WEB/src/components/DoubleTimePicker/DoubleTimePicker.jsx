import React, { Component } from 'react';
import { TimePicker } from 'antd';
import moment from 'moment';
import './doubleTimePicker.css';

export default class DoubleTimePicker extends Component {
  constructor(props) {
    super(props);
    const value = props.value || {
      serviceTimeEnd: {
        value: moment('23:59:59', props.format || 'HH:mm'),
      },
      serviceTimeStart: {
        value: moment('00:00:00', props.format || 'HH:mm'),
      },
    };
    this.state = {
      value,
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const value = nextProps.value || this.state.value;
      this.setState(Object.assign({}, this.state, {
        value,
      }));
    }
  }
  range = (start, end) => {
    const result = [];
    for (let i = start; i <= end; i += 1) {
      result.push(i);
    }
    return result;
  };
  disabledStartHours() {
    const { value } = this.state;
    let hourEnd = value.serviceTimeEnd && value.serviceTimeEnd.value && value.serviceTimeEnd.value.hours();

    if (hourEnd === undefined || hourEnd === null) {
      hourEnd = 24;
    }
    const hours = this.range(0, 23);
    hours.splice(0, hourEnd);
    return hours;
  }
  disabledEndHours() {
    const { value } = this.state;
    let hourStart = value.serviceTimeStart && value.serviceTimeStart.value && value.serviceTimeStart.value.hours();

    if (hourStart === undefined || hourStart === null) {
      hourStart = 0;
    }
    const hours = this.range(0, 23);
    hours.splice(hourStart + 1, 24);
    return hours;
  }
  startChange(time, e) {
    let strTime = e;
    if (!e) {
      strTime = '00:00:00';
    }
    this.setState({
      value: {
        ...this.state.value,
        serviceTimeStart: {
          value: moment(strTime, this.props.format || 'HH:mm'),
        },
      },
    }, () => {
      this.props.onChange(this.state.value);
    });
  }
  endChange(time, e) {
    let strTime = e;
    if (!e) {
      strTime = '23:59:59';
    }
    this.setState({
      value: {
        ...this.state.value,
        serviceTimeEnd: {
          value: moment(strTime, this.props.format || 'HH:mm'),
        },
      },
    }, () => {
      this.props.onChange(this.state.value);
    });
  }

  render() {
    const {
      value,
    } = this.state;
    const {
      format,
      disabled,
    } = this.props;
    return (
      <div style={{ width: '100%' }}>
        <TimePicker
          style={disabled ? { width: '25%' } : {}}
          className="doubleTimePicker"
          value={value.serviceTimeStart.value}
          onChange={this.startChange.bind(this)}
          disabledHours={this.disabledStartHours.bind(this)}
          format={format}
          disabled={disabled}
        />
        <span style={{ display: 'inline-block', width: '10%', textAlign: 'center' }}>~</span>
        <TimePicker
          style={disabled ? { width: '65%' } : {}}
          className="doubleTimePicker"
          value={value.serviceTimeEnd.value}
          onChange={this.endChange.bind(this)}
          disabledHours={this.disabledEndHours.bind(this)}
          disabled={disabled}
          format={format}
        />
      </div>
    );
  }
}
