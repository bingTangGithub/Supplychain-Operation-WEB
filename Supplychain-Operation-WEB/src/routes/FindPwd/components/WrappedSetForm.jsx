import React, { Component } from 'react';
import { Form, Button } from 'antd';
import { createFormItem } from '../../index';

const FormItem = Form.Item;

class SetForm extends Component {
  onClick = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onClick({
          ...values,
          identity: this.props.identity,
        });
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSubmit} className="fp-form">
        <FormItem>
          {createFormItem({
            getFieldDecorator,
            require: true,
            icon: 'lock',
            type: 'password',
            label: '密码',
            name: 'newPassword',
            min: 6,
            max: 20,
            pattern: /^[0-9a-zA-Z]*$/,
            patternMsg: '密码只能是数字或英文大小写',
            validator: (rule, value, callback) => {
              const form = this.props.form;
              if (value && form.getFieldValue('pwdConfirm')) {
                form.validateFields(['pwdConfirm'], { force: true });
              }
              callback();
            },
          })}
        </FormItem>
        <FormItem>
          {createFormItem({
            getFieldDecorator,
            require: true,
            icon: 'lock',
            type: 'password',
            label: '密码确认',
            name: 'pwdConfirm',
            min: 6,
            max: 20,
            validator: (rule, value, cbk) => {
              const form = this.props.form;
              if (value && value !== form.getFieldValue('newPassword')) {
                cbk('两次密码输入不一致');
              } else {
                cbk();
              }
            },
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

const WrappedSetForm = Form.create()(SetForm);

export default WrappedSetForm;
