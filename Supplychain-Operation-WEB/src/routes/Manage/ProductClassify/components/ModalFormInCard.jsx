import React from 'react';
import {
  Card,
  Form,
  Modal,
  Button,
  Icon,
  Input,
  message,
} from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { createFormItem, mapPropsToFields, onFieldsChange } from '../../../../components';
import ModalTags from '../../../../components/ModalTags';

const FormItem = Form.Item;

const ModalFormInCard = Form.create({
  mapPropsToFields,
  onFieldsChange,
})(
  (props) => {
    const {
      isCommonFormStyle,
      visible,
      form,
      title,
      fields,
      confirmLoading,
      onCancel,
      formWidth,
      cusTitle,
      onCreate,
      modalClass,
    } = props;
    const { validateFields } = form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };

    const save = () => {
      validateFields({ force: true }, (err, values) => {
        let errorNum = 0;
        fields.forEach((eachCard) => {
          // 确保每个 card 中的每个 tag 都没有 error
          const { tagsArray, isAddFieldValError, fields: eachCardFields } = eachCard;
          if (tagsArray && tagsArray.length) {
            tagsArray.forEach((eachTag) => {
              if (eachTag.isTagValError) {
                errorNum += 1;
              }
            });
          } else {
            if (isAddFieldValError) { // 属性的错
              errorNum += 1;
            }
            if (eachCardFields && eachCardFields.length) {
              eachCardFields.forEach((eachProperty) => { // 每个属性
                const { tagsArray: tagsArrayInProperty, value } = eachProperty;
                if (value && tagsArrayInProperty[0].tags.length === 0) {
                  errorNum += 1;
                  message.error('属性选择限制时，至少要加一个属性值');
                }
                tagsArrayInProperty.forEach((eachTag) => { // 每个属性值
                  if (eachTag.isTagValError) {
                    errorNum += 1;
                  }
                });
              });
            }
          }
        });

        if (!err && !errorNum) {
          onCreate(values);
        }
      });
    };

    const showInput = (reqObj) => {
      const {
        canAddField,
        fields: addFields,
        fieldMaxLength,
        setKeysAndValuesInAddField,
      } = reqObj;

      let addedFieldsLen = addFields.length;
      addFields.forEach((item) => {
        if (item.operateType === 'delete') {
          addedFieldsLen -= 1;
        }
      });
      if (canAddField) {
        if (addedFieldsLen < fieldMaxLength) {
          setKeysAndValuesInAddField({ addFieldInputVisible: true }, () => this.input.focus());
        } else {
          // 属性超过 15 个，不能再添加
        }
      } else {
        // 不允许添加
      }
    };

    const isEdit = () => !!(props.values && props.values.id);

    const handleInputConfirm = (reqObj) => {
      const {
        isAddFieldValError,
        addFieldInputValue,
        setKeysAndValuesInAddField,
        addPropertyObj,
      } = reqObj;

      if (isAddFieldValError) {
        return;
      }

      if (addFieldInputValue) {
        addPropertyObj(addFieldInputValue);
      } else {
        // 没输值，不做处理
      }

      setKeysAndValuesInAddField({ addFieldInputValue: '', addFieldInputVisible: false });
    };

    const handleInputChange = (reqObj, e) => {
      const { value } = e.target;
      const {
        addFieldInputValueLenMax,
        setKeysAndValuesInAddField,
      } = reqObj;
      const isAddFieldValError = value.trim().length === 0 || value.length > addFieldInputValueLenMax;

      setKeysAndValuesInAddField({ isAddFieldValError, addFieldInputValue: value });
    };

    const saveInputRef = (input) => input;

    const geneForm = (fieldsTemp) => (
      <Scrollbars
        autoHeight
        autoHeightMin={100}
        autoHeightMax={550}
      >
        <Form layout="horizontal">
          {
            fieldsTemp.map((item) => {
              const {
                cardTitle,
                fields: fieldsInCrad,
                tagsArray,
                canAddField,
                addFieldInputVisible,
                // setKeysAndValuesInAddField,
                addFieldInputValue,
                isAddFieldValError,
                addFieldLabel,
                addFieldInputValueLenMax,
                // addPropertyObj,
                fieldMaxLength, // 最多 15个
              } = item;
              const isButtonDisabled = !(fieldsInCrad.length < fieldMaxLength && canAddField);
              return (
                <Card title={cardTitle} key={`${cardTitle}`} style={{ margin: '30px' }} >
                  {
                    fieldsInCrad.map((each) => {
                      const { operateType } = each;
                      let showDiv;
                      if (operateType !== 'delete') { // 属性中会有删除的
                        const formItem = createFormItem({
                          field: each,
                          form,
                          formItemLayout,
                          inputOpts: {
                          },
                        });

                        const { tagsArray: childrenTagsArray, value } = each; // value 为 true 代表受限

                        // 限制（value为true）属性下的 tags
                        const tags = each && value && childrenTagsArray && childrenTagsArray.length ?
                          childrenTagsArray.map((eachModalTag) =>
                            (<ModalTags
                              key={eachModalTag.label}
                              {...eachModalTag}
                            />)
                          )
                          : <div />;

                        showDiv = (<div key={each.name}> {formItem} {tags} </div>);
                      } else {
                        showDiv = null;
                      }
                      return showDiv;
                    })
                  }
                  {
                    addFieldInputVisible && (
                      <span>
                        <Input
                          ref={saveInputRef}
                          type="text"
                          style={{ width: '20%', margin: '15px 14%' }}
                          value={addFieldInputValue}
                          onChange={handleInputChange.bind(this, item)}
                          onPressEnter={handleInputConfirm.bind(this, item)}
                          onBlur={handleInputConfirm.bind(this, item)}
                        />
                        <div className="error_text" style={{ color: '#ff0000' }}>
                          { isAddFieldValError ? `${addFieldLabel}不能为空，且长度不能大于${addFieldInputValueLenMax}` : '' }</div>
                      </span>
                    )
                  }
                  {
                    canAddField && !addFieldInputVisible ?
                      (
                        <FormItem>
                          <Button
                            onClick={showInput.bind(this, item)}
                            type="dashed"
                            disabled={isButtonDisabled}
                            style={{ width: '20%', margin: '15px 14%' }}
                          >
                            <Icon type="plus" /> {addFieldLabel}
                          </Button>
                        </FormItem>
                      ) : <div />
                  }
                  {
                    tagsArray && tagsArray.length ?
                      tagsArray.map((eachModalTag) =>
                        (<ModalTags
                          key={eachModalTag.label}
                          {...eachModalTag}
                        />)
                      )
                      : <div />
                  }
                </Card>
              );
            })
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
        <div className={modalClass}>
          {geneForm(fields)}
        </div>
      </Modal>
    ) : (<div className={modalClass}>
      {geneForm(fields)}
      {
        <div className="saveButton">
          <FormItem>
            <Button key="submit" size="large" type="primary" onClick={save} loading={confirmLoading}>保存</Button>
          </FormItem>
        </div>
      }
    </div>);
  }
);
export default ModalFormInCard;
