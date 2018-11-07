import React, { Component } from 'react';
import { Row, Col, Button, Input, Icon } from 'antd';
import PropTypes from 'prop-types';

export default class Captcha extends Component {
  static propTypes = {
    // onChange: PropTypes.func,
    onClick: PropTypes.func.isRequired,
    // placeholder: PropTypes.string,
    // icon: PropTypes.string,
    // count: PropTypes.number,
  }

  constructor(props) {
    super(props);
    this.state = {
      text: '获取短信验证码',
      btnDisabled: true,
      counting: false,
      loading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({
        btnDisabled: !value || this.state.counting,
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.setState({
      text: '获取短信验证码',
      btnDisabled: true,
      counting: false,
      loading: false,
    });
  }

  onChange(value) {
    this.props.onChange(value);
  }

  onClick() {
    this.setState({
      ...this.state,
      loading: true,
    });
    this.props.onClick().then((isSuccess) => {
      this.setState({
        ...this.state,
        loading: false,
      });
      if (isSuccess) {
        let count = this.props.count || 60;
        this.timer = setInterval(() => {
          if (count > -1) {
            this.setState({
              text: `重新发送${count}s`,
              btnDisabled: true,
              counting: true,
            });
            count -= 1;
          } else {
            this.setState({
              text: '获取短信验证码',
              btnDisabled: false,
              counting: false,
            });
            clearTimeout(this.timer);
          }
        }, 1000);
      }
    });
  }

  render() {
    const {
      placeholder,
      icon,
    } = this.props;

    return (
      <Row span={24} style={{ textAlign: 'right' }}>
        <Col span={12}>
          <Input
            onChange={this.onChange.bind(this)}
            placeholder={placeholder}
            prefix={<Icon type={icon} style={{ fontSize: 13 }} />}
          />
        </Col>
        <Col span={12}>
          <Button
            type="primary"
            disabled={this.state.btnDisabled}
            onClick={this.onClick.bind(this)}
            loading={this.state.loading}
          >{this.state.text}</Button>
        </Col>
      </Row>
    );
  }
}
