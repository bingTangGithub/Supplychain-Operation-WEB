import React, { Component } from 'react';
import { Form, Button } from 'antd';
import { Link } from 'react-router';

const FormItem = Form.Item;

class LoginForm extends Component {
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields(() => {
    });
  }
  render() {
    const { onClick } = this.props;
    return (
      <Form onSubmit={this.handleSubmit} className="fp-form">
        <FormItem>
          <div>密码设置成功！</div>
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" className="fp-form-button" onClick={onClick}>
            <Link to="/SignIn">去登录</Link>
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedLoginForm = Form.create()(LoginForm);

export default WrappedLoginForm;
