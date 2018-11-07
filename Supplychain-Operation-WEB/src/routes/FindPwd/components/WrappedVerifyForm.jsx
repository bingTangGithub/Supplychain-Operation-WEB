import React, { Component } from 'react';
import { Form, Button } from 'antd';
import { createFormItem } from '../../index';

const FormItem = Form.Item;

class VerifyForm extends Component {
  onClick = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onClick(values);
      }
    });
  }

  onCodeClick = () => {
    const me = this;
    return new Promise(((resolve) => {
      me.props.form.validateFields(['loginName', 'phone'], (err, values) => {
        if (!err) {
          me.props.code({
            ...values,
            codeType: 'f',
          }).then((isSuccess) => {
            resolve(isSuccess);
          });
        } else {
          resolve(false);
        }
      });
    }));
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="fp-form">
        <FormItem>
          {createFormItem({
            getFieldDecorator,
            require: true,
            icon: 'user',
            type: 'text',
            label: '账号',
            name: 'loginName',
          })}
        </FormItem>
        <FormItem>
          {
            createFormItem({
              getFieldDecorator,
              require: true,
              icon: 'phone',
              type: 'captcha',
              label: '手机号',
              name: 'phone',
              onClick: this.onCodeClick.bind(this),
              phone: true,
            })
          }
        </FormItem>
        <FormItem>
          {createFormItem({
            getFieldDecorator,
            require: true,
            icon: 'lock',
            type: 'text',
            label: '验证码',
            name: 'code',
            max: 6,
          })}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            className="fp-form-button"
            onClick={this.onClick.bind(this)}
            loading={this.props.loading}
          >
            确定
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const WrappedVerifyForm = Form.create()(VerifyForm);

export default WrappedVerifyForm;
