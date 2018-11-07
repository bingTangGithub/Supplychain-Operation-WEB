import React, { Component } from 'react';
import { Form, Input, Button, Modal, Row, Col } from 'antd';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const formItemLayout2 = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

class FindPwdForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bel: false,
    };
  }

  newPwdSave = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      let newValues = values;
      const phone = newValues.findPhone;
      const password = newValues.findPassword;
      delete newValues.findPhone;
      delete newValues.findPassword;
      delete newValues.secondPassword;
      newValues = {
        ...newValues,
        phone,
        password,
      };
      if (!err) {
        this.props.newFindPwdSave(newValues);
      }
    });
  }

  cancel = (e) => {
    e.preventDefault();
    this.props.form.resetFields();
    this.props.closeFindPwd();
  }

  // warn = () => {
  //   Modal.warning({
  //     title: '请联系系统管理员',
  //     content:'4006006700',
  //     okText: '确定',
  //     onOk() {},
  //   });
  // }

  sendCode = (e) => {
    e.preventDefault();
    this.props.form.validateFields(['findPhone'], { force: true }, (err, values) => {
      let newValues = {};
      newValues.phone = values.findPhone;
      newValues = {
        ...newValues,
        type:'f',
      };
      if (!err) {
        this.props.getCheckCode(newValues);
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="找回密码"
        visible={this.props.bel}
        onOk={this.newPwdSave}
        onCancel={this.cancel}
      >
        <Form onSubmit={this.willhave} className="login-form" style={{ background: '#fff' }}>
          <FormItem
            {...formItemLayout}
            label="注册手机号"
          >
            {getFieldDecorator('findPhone', {
              rules: [{
                required: true,
                message: '请输入正确的手机号',
                pattern: /^1[345678][0-9]{9}$/,
              }],
            })(
              <Input style={{ width: '100%' }} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout2}
            label="验证码"
          >
            <Row gutter={8}>
              <Col span={14}>
                {getFieldDecorator('verifyCode', {
                  rules: [{
                    required: true,
                    message: '请输入验证码!',
                  }],
                })(
                  <Input />
                )}
              </Col>
              <Col span={10}>
                <Button onClick={this.sendCode} style={{ width:'100%' }}>获取验证码</Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="新密码"
          >
            {getFieldDecorator('findPassword', {
              rules: [{
                required: true,
                message:'请输入新密码',
              }, {
                message: '请输入字母+数字',
                pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]+$/,
              }, {
                validator: (rule, value, callback) => {
                  const formTwo = this.props.form;
                  if (value && formTwo.getFieldValue('secondPassword')) {
                    formTwo.validateFields(['secondPassword'], { force: true });
                  }
                  callback();
                },
              }, {
                max: 20,
                message: '新密码必须小于等于20位',
              }, {
                min: 8,
                message: '新密码必须大于等于8位',
              }],
            })(
              <Input type="password" placeholder="请输入新的密码" style={{ width: '100%' }} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="确认新密码"
          >
            {getFieldDecorator('secondPassword', {
              rules: [{
                required: true,
                message:'请确认新密码',
              }, {
                message: '请输入字母+数字',
                pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-Z]+$/,
              }, {
                validator: (rule, value, callback) => {
                  const formThree = this.props.form;
                  if (value && value !== formThree.getFieldValue('findPassword')) {
                    callback('两次密码输入不一致');
                  } else {
                    callback();
                  }
                },
              }],
            })(
              <Input type="password" placeholder="请再次输入新的密码" style={{ width: '100%' }} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const FindPwd = Form.create()(FindPwdForm);
export default FindPwd;
