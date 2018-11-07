import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Form,
  Input,
  Message,
} from 'antd';
import { browserHistory } from 'react-router';
import { common } from '../../store/common';
import { deepClone } from '../../util';
import './style.scss';

const FormItem = Form.Item;

class ApplyReasonForm extends Component {
  componentDidMount() {
    this.props.initCommon();
  }

  onCancel() {
    this.props.hideApplyReason();
    this.props.form.resetFields();
  }

  save = (need) => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let theValues = values;
        const newNeed = deepClone(need);
        if (newNeed.warning) {
          delete newNeed.warning;
        }
        theValues = {
          ...theValues,
          ...newNeed,
        };
        this.props.saveApplyReason(theValues).then((isSuccess) => {
          if (isSuccess) {
            this.props.form.resetFields();
            Message.success('操作成功', 1, () => {
              switch (theValues.type) {
                case 'STORE_CLOSE':
                  browserHistory.push('/Manage/ShopTemporaryCloseList');
                  break;
                case 'STORE_OPEN':
                  browserHistory.push('/Manage/ShopRecoverList');
                  break;
                case 'STORE_QUIT':
                  browserHistory.push('/Manage/ShopQuitList');
                  break;
                default:
                  break;
              }
            });
          }
        });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        {...this.props}
        title={
          <p style={{
            wordWrap:'break-word',
            wordBreak:'break-all',
            whiteSpace: 'normal',
            marginRight:'20px',
          }}
          >
            {this.props.need.warning}
          </p>
        }
        visible={this.props.applyReasonVisible}
        onCancel={this.onCancel.bind(this)}
        onOk={this.save.bind(this, this.props.need)}
        okText="确定"
        cancelText="取消"
        // content={this.props.need.warning}
      >
        <Form>
          <FormItem>
            {getFieldDecorator('applyReason', {
              rules: [{ required: true, message: '请输入申请原因!' }],
            })(
              <Input type="textarea" placeholder="请输入申请原因！" />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  need:state.common.need,
  applyReasonVisible: state.common.applyReasonVisible,
  applyReasonLoading: state.common.applyReasonLoading,
});

const mapDispatchToProps = {
  showApplyReason: common.showApplyReason,
  hideApplyReason: common.hideApplyReason,
  saveApplyReason: common.saveApplyReason,
  initCommon: common.initCommon,
};

const ApplyReason = Form.create()(connect(mapStateToProps, mapDispatchToProps)(ApplyReasonForm));
export default ApplyReason;
