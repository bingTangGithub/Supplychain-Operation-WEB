import React from 'react';
import {
  Form,
  Input,
  Modal,
  Row,
  Button,
  Checkbox,
} from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { createFormItem, mapPropsToFields, onFieldsChange } from '../../components';
import ModalTags from '../ModalTags';

const FormItem = Form.Item;


const ModalForm = Form.create({
  mapPropsToFields,
  onFieldsChange,
})(
  (props) => {
    const {
      labelInfo = {},
      getCurLabelList,
      setLabelValError,
      setLabelValue,
      setLabelInputVisible,
      visible,
      onCancel,
      onCreate,
      title,
      fields,
      form,
      formWidth,
      cusTitle,
      confirmLoading,
      hasModalTags,
      tags,
      getCurTags,
      canAddTag,
      isCommonFormStyle,
      setTagValError,
      isTagValError,
      setTagValue,
      tagInputValue,
      setTagInputVisible,
      tagInputVisible,
      hasDefAddr,
      onDefAddrChange,
      defAddrChecked,
    } = props;
    const {
      labelList,
      canAddLabel,
      isLabelValError,
      labelInputValue,
      labelInputVisible,
      limitMax,
    } = labelInfo;
    const { getFieldDecorator, validateFields } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const save = () => {
      validateFields({ force: true }, (err, values) => {
        if (!err && !isTagValError && !isLabelValError) {
          onCreate(values);
        }
      });
    };

    const isEdit = () => !!(props.values && props.values.id);

    const geneForm = (fieldsTemp) => (
      <Scrollbars
        autoHeight
        autoHeightMin={100}
        autoHeightMax={550}
      >
        <Form layout="horizontal">
          <FormItem label="" {...formItemLayout} style={{ display: 'none' }}>
            {getFieldDecorator('id', {
            })(
              <Input type="hidden" />
            )}
          </FormItem>
          <Row>
            {
              fieldsTemp.map((item) => (
                createFormItem({
                  field: item,
                  form,
                  formItemLayout,
                  inputOpts: {
                  },
                })
              ))
            }
          </Row>
          {
            hasModalTags ?
              (
                <ModalTags
                  label="规格"
                  canAddTag={canAddTag}
                  tags={tags}
                  getCurTags={getCurTags}
                  setTagValError={setTagValError}
                  isTagValError={isTagValError}
                  setTagValue={setTagValue}
                  tagInputValue={tagInputValue}
                  setTagInputVisible={setTagInputVisible}
                  tagInputVisible={tagInputVisible}
                />
              )
              : <div />
          }
          {
            hasModalTags ?
              (
                <ModalTags
                  label="标签"
                  canAddTag={canAddLabel}
                  tags={labelList}
                  getCurTags={getCurLabelList}
                  setTagValError={setLabelValError}
                  isTagValError={isLabelValError}
                  setTagValue={setLabelValue}
                  tagInputValue={labelInputValue}
                  setTagInputVisible={setLabelInputVisible}
                  tagInputVisible={labelInputVisible}
                  tagsMaxLength={limitMax}
                />
              )
              : <div />
          }
        </Form>
      </Scrollbars>
    );

    return !isCommonFormStyle ? (
      <Modal
        width={formWidth || 1000}
        visible={visible}
        title={cusTitle || ((isEdit() ? '修改' : '新增') + title)}
        okText="保存"
        onCancel={onCancel}
        onOk={save}
        maskClosable={false}
        footer={[
          <Button key="submit" size="large" type="primary" onClick={save} loading={confirmLoading}>
            保存
          </Button>,
          <Button size="large" key="back" onClick={onCancel}>取消</Button>,
        ]}
      >
        {geneForm(fields)}
      </Modal>
    ) : (<div>
      {geneForm(fields)}
      {
        <div className="saveButton">
          {
            hasDefAddr ? (
              <FormItem>
                <Checkbox onChange={onDefAddrChange} checked={defAddrChecked}>默认发货地址</Checkbox>
              </FormItem>
            ) : (<div />)
          }

          <FormItem>
            <Button key="submit" size="large" type="primary" onClick={save} loading={confirmLoading}>保存</Button>
          </FormItem>
        </div>
      }
    </div>);
  }
);
export default ModalForm;
