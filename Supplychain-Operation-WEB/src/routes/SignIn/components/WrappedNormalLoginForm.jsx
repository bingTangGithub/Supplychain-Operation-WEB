/**
 * Created by kakeiChen on 2017/9/1.
 */
import React, { Component } from 'react';
import { Form, Input, Icon, Button } from 'antd';

const FormItem = Form.Item;

const createFormItem = (opts) => {
  const rules = [];
  if (opts.require) {
    rules.push({ required: true, message: `请输入${opts.label}` });
  }
  if (opts.max) {
    rules.push({ max: opts.max, message: `${opts.label}必须小于${opts.max}个字` });
  }
  if (opts.min) {
    rules.push({ min: opts.min, message: `${opts.label}必须大于${opts.min}个字` });
  }
  if (opts.pattern) {
    rules.push({ pattern: opts.pattern, message: opts.patternMsg });
  }
  if (opts.phone) {
    rules.push({ pattern: /^1[345678][0-9]{9}$/, message: '请输入正确的手机格式' });
  }
  return opts.getFieldDecorator(opts.name, {
    rules,
  })(<Input prefix={<Icon type={opts.icon} style={{ fontSize: 13 }} />} type={opts.type} placeholder={opts.label} />);
};

class NormalLoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bel:false,
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      let newValues = values;
      newValues = {
        ...newValues,
        type:'username',
      };
      if (!err) {
        this.props.login(newValues);
      }
    });
  }

  showFindPwd = () => {
    this.props.willShowFindPwd();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <div className="login-logo-wrapper">
            <div className="login-logo"><img src="/logo-w.png" style={{ width: 120 }} alt="logo丢了" /></div>
            <div className="login-logo-text">供应链服务商后台</div>
          </div>
          <FormItem>
            {createFormItem({
              getFieldDecorator,
              require: true,
              icon: 'user',
              type: 'text',
              label: '账号',
              name: 'username',
            })}
          </FormItem>
          <FormItem>
            {createFormItem({
              getFieldDecorator,
              require: true,
              icon: 'lock',
              type: 'password',
              label: '密码',
              name: 'password',
            })}
          </FormItem>
          <FormItem>
            <div className="login-fp">
              <a role="button" tabIndex={-42} onClick={this.showFindPwd.bind(this)}>忘记密码</a>
            </div>
            <Button type="primary" htmlType="submit" className="login-form-button" loading={this.props.loading}>
              登录
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create()(NormalLoginForm);
export default WrappedNormalLoginForm;
