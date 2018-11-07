import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Spin, message, Card, Form, Button, Row, Col, Alert } from 'antd';
import _cloneDeep from 'lodash.clonedeep';
import Breadcrumb from '../../../../components/Breadcrumb';
import formComp, { iconMinusPlus } from '../../../../components/formComp';
import SkuCfg from './SkuCfg';
import VerifyCfg from './VerifyCfg';
import './index.scss';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { xs: { span: 24 }, sm: { span: 6 } },
  wrapperCol: { xs: { span: 24 }, sm: { span: 14 } },
};

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editStatus: false,
    };
  }
  componentDidMount() {
    this.resetDetailPage(this.props);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id) {
      this.resetDetailPage(nextProps);
    }
  }

  getFormItems(list) {
    const __props = this.props;
    const { params: { id: spuId } } = __props;
    const { getFieldDecorator } = this.props.form;

    return list.map((formItemConfig) => {
      const { isShow, click2Edit, allowEdit, formItemCfg, inputOpt, fieldOpt, btnList, judgeRequired } = formItemConfig;
      const { id, label } = formItemCfg;

      // 隐藏字段
      if (isShow === false) return false;

      // 不可编辑字段
      if (spuId !== 'new' && allowEdit === false) return this.getDisabledNode(id, label);

      // 编辑模式 - 需要点击后修改
      if (spuId !== 'new' && click2Edit) return this.getDisabledNode(id, label, true);

      // 正常编辑模式
      const { getProps, props } = inputOpt;
      const inputProps = getProps ? getProps(__props) : props;
      const rules = [...fieldOpt.rules];
      judgeRequired && judgeRequired(__props) && rules.push({ required: true, message: '必填' });
      return (<FormItem
        key={id}
        {...formItemLayout}
        {...formItemCfg}
      >
        {getFieldDecorator(id, { ...fieldOpt, rules })(
          formComp[inputOpt.type](inputProps)
        )}
        { btnList && btnList.map(
          ({ type, getProps: getBtnProps }) => iconMinusPlus[type](getBtnProps(__props))
        ) }
      </FormItem>);
    });
  }

  getDisabledNode = (id, label, click2Edit) => {
    const { labelCol, wrapperCol } = formItemLayout;
    const [moduleId, partId] = id.split('-');
    const data = this.props.submitValues[moduleId];

    const getValue = {
      standardFlag: (dataId, dataValue) => (dataValue === true ? '标准商品（以售价结算）' : '非标准商品（以单价和重量结算）'),
      saleDate: (dataId, dataValue) => `${dataValue[0]} 到 ${dataValue[1]}`,
      areaList: (dataId, dataValue) =>
        dataValue.map(({ label: areaLabel }) => areaLabel).join('，'),
      // dataValue.map(({ code, label: areaLabel }) => <div key={code}>{areaLabel}</div>),
      categoryId: () => this.props.submitValues.categoryName,
      carriageId: (dataId, dataValue) => {
        const target = this.props.carriageList.find(({ value }) => value === dataValue);
        return target ? target.label : dataValue;
      },
      attributeList: (dataId, dataValue, part) => dataValue.find((v) => v.attributeId === part).attributeValue,
    }[moduleId] || ((dataId, dataValue) => dataValue);

    return ((data || data === false) && <div key={id}>
      <Row type="flex" style={{ marginBottom: 24 }}>
        <Col {...labelCol} className="ant-form-item-label img-list">
          <span className="img-list-label">{label} : </span>
        </Col>
        <Col {...wrapperCol}>
          <div>
            <div className="area-list-disabled" style={{ display: 'inline-block' }}>
              { getValue(moduleId, data, partId) }
            </div>
            {click2Edit &&
              (<Button onClick={() => this.props.editFormItem(id)} type="primary" ghost>
                重置
              </Button>)}
          </div>
        </Col>
      </Row>
    </div>);
  }

  getSpecFormItems(list) {
    let formItemList = [];
    list.forEach(({ title, children }) => {
      if (title) formItemList.push(title);
      if (children) formItemList = [...formItemList, ...children];
    });
    return this.getFormItems(formItemList);
  }

  getImgUpload = (cfgList, disabled) => {
    const __props = this.props;
    const { labelCol, wrapperCol } = formItemLayout;

    return cfgList.map((cfgItem) => {
      const { formItemCfg, inputOpt } = cfgItem;
      return (<div key={formItemCfg.id}>
        <Row type="flex" style={{ marginBottom: 24 }}>
          <Col {...labelCol} className="ant-form-item-label img-list">
            <span className="img-list-required">* </span>
            <span className="img-list-label">{formItemCfg.label} : </span>
          </Col>
          <Col {...wrapperCol}>
            {formComp[inputOpt.type]({
              ...inputOpt.getProps(__props),
              id: formItemCfg.id,
              disabled,
            })}
            {!disabled && <div style={{ color: 'rgba(0,0,0,.43)' }}>{formItemCfg.extra}</div>}
          </Col>
        </Row>
      </div>);
    });
  }

  setEditStatus = (status) => {
    const { resetSpec, updateSpecThings, resetSpecThings, setEditStatus } = this.props;
    // status || this.props.form.resetFields();
    const resetEditStatus = (eStatus) => {
      setEditStatus(eStatus);
      this.setState({ editStatus: eStatus });
    };

    status && resetSpec()
      .then(() => {
        updateSpecThings({ value: [this.props.submitValues.categoryId] });
        resetSpecThings();
        resetEditStatus(status);
      });

    status || resetEditStatus(status);
  }

  resetDetailPage = (props) => {
    const [operate, id] = props.params.id.split('@@');

    if (operate === 'new') {
      props.form.resetFields();
      props.newProduct();

      props.loadCateList()
        .then(() => props.loadTagList());
      // .then(() => props.loadAreaList())
      // .then(() => props.loadCarriageList());
    } else {
      props.loadProductDetail(id)
        .then(() => props.loadTagList())
        // .then(() => props.loadAreaList())
        // .then(() => props.loadCarriageList())
        .then(() => {
          if (operate === 'edit') {
            this.setEditStatus(true);
          }
        });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      // console.log('handleSubmit:values', values);
      if (err) return message.error('信息输入不正确');
      this.props.validateAllValues(values);
      try {
        const [, id] = this.props.params.id.split('@@');
        this.props.handleSubmit(id)
          .then((success) => success && browserHistory.push('/Manage/ProductList'));
      } catch (submitErr) {
        console.log('提交失败', submitErr);
      }
      // .then(() => );
      return true;
    });
  }

  handleInputProps(formItemList) {
    const formItemListCloned = _cloneDeep(formItemList);
    return formItemListCloned.map((formItemConfig) => {
      const { inputOpt } = formItemConfig;

      Object.keys(inputOpt.props).forEach((item) => {
        const value = inputOpt.props[item];
        if (typeof value === 'string' && /props@@/.test(value)) {
          const paramList = value.split('@@');
          paramList.shift();
          const trueValue = (
            (props, list) => {
              let temp = props;
              list.forEach((pItem) => {
                temp = temp[pItem];
              });
              return temp;
            }
          )(this.props, paramList);
          inputOpt.props[item] = trueValue;
        }
      });

      return formItemConfig;
    });
  }

  editDetails = (status) => {
    const {
      baseInfoList,
      otherAttrList,
      saleRuleList,
      detailList,
      specInfoList,
      skuList,
      skuInfoChange,
    } = this.props;

    const baseFormItems = this.getFormItems(baseInfoList);
    baseFormItems.splice(
      1 + baseInfoList.findIndex((item) => (item.formItemCfg.id === 'categoryId')),
      0,
      this.getSpecFormItems(specInfoList),
    );

    const standardFlag = this.props.form.getFieldValue('standardFlag') === '1';
    const elements = {
      base: baseFormItems,
      attr: this.getFormItems(otherAttrList),
      rule: this.getFormItems(saleRuleList),
      detail: this.getImgUpload(detailList),
      btn: [<Button key="save" type="primary" htmlType="submit" size="large" >保存</Button>],
    };
    skuList.length && elements.rule.push(
      <SkuCfg key="SkuCfg" dataSource={skuList} skuInfoChange={skuInfoChange} standardFlag={standardFlag} />
    );
    status === 'edit'
      && elements.btn.push(<Button key="cancel" onClick={() => this.setEditStatus(false)} size="large" >取消</Button>);

    return elements;
  }

  showDetails = (hasBtn) => {
    const {
      baseInfoList,
      saleRuleList,
      detailList,
      skuList,
      skuInfoChange,
      submitValues: { attributeList = [] },
    } = this.props;

    const getElements = (list) => list.map((formItemConfig) => {
      const { formItemCfg: { id, label } } = formItemConfig;
      return this.getDisabledNode(id, label);
    });
    const standardFlag = this.props.form.getFieldValue('standardFlag') === '1';
    const result = {
      base: getElements(baseInfoList),
      attr: attributeList.map(
        ({ attributeId, attributeName }) => this.getDisabledNode(`attributeList-${attributeId}`, attributeName)
      ),
      rule: getElements(saleRuleList),
      detail: this.getImgUpload(detailList, true),
    };
    skuList.length && result.rule.push(
      <SkuCfg key="SkuCfg" dataSource={skuList} disabled skuInfoChange={skuInfoChange} standardFlag={standardFlag} />
    );
    hasBtn && (result.btn = <Button onClick={() => this.setEditStatus(true)} type="primary" size="large" >编辑</Button>);
    return result;
  }

  alertElemt = () => {
    const {
      originData = {},
    } = this.props;
    const { verifyStatus, reason } = originData;

    let verifyStatusAlert = '';
    switch (verifyStatus) {
      case '1': // 待审核
        verifyStatusAlert = (<Alert
          message="审核状态：待审核"
          description="请尽快审核"
          type="warning"
          showIcon
        />);
        break;
      case '2': // 不通过
        verifyStatusAlert = (<Alert
          message="审核状态：不通过"
          description={`修改建议：${reason}`}
          type="error"
          showIcon
        />);
        break;
      case '3': // 通过
        verifyStatusAlert = <Alert message="审核状态：通过" type="success" showIcon />;
        break;
      default:
        break;
    }
    return verifyStatusAlert;
  }

  render() {
    const {
      shopname,
      varifyRecord,
      changeVarifyRecord,
      verifyLoading,
      verifySubmit,
      originData = {},
    } = this.props;
    const { verifyStatus } = originData;
    const [, spuId, shopId] = this.props.params.id.split('@@');
    // const [operate, spuId, shopId] = this.props.params.id.split('@@');
    // const { editStatus } = this.state;

    const elements = this.showDetails(false);
    // operate === 'new' && (elements = this.editDetails('new'));
    // operate === 'detail' && !editStatus && (elements = this.showDetails(false));
    // operate === 'edit' && !editStatus && (elements = this.showDetails(true));
    // operate === 'edit' && editStatus && (elements = this.editDetails('edit'));

    return (
      <div className="m-product-detail" style={{ width: '100%', padding: 16 }}>
        <Spin spinning={this.props.loading}>
          <Breadcrumb title="商品管理 > 商品列表 > 商品详情" />
          <div className="product-detail-form" id="product-detail-form">
            {this.alertElemt()}
            {shopname && <div className="product-detail-shopname">
              所属店铺：{ shopname }
            </div>}
            <Form onSubmit={this.handleSubmit}>
              <Card title="基础信息" className="form-section">
                { elements.base }
              </Card>
              {elements.attr.length
                ? <Card title="其他属性" className="form-section">
                  { elements.attr }
                </Card>
                : ''
              }
              {elements.rule.length
                ? <Card title="销售规则" className="form-section">
                  { elements.rule }
                </Card>
                : ''
              }
              <Card title="详情描述" className="form-section">
                { elements.detail }
              </Card>
              <div style={{ textAlign: 'center' }}>
                { elements.btn }
              </div>
            </Form>
            {verifyStatus === '1' && <VerifyCfg
              spuId={spuId}
              shopId={shopId}
              verifyLoading={verifyLoading}
              verifySubmit={verifySubmit}
              varifyRecord={varifyRecord}
              changeVarifyRecord={changeVarifyRecord}
            />}
          </div>
        </Spin>
      </div>
    );
  }
}

const WrappedView = Form.create({
  mapPropsToFields: (props) => props.values,
  onFieldsChange: (props, fields) => {
    // console.log('onFieldsChange:fields', fields);
    const { ValuesChange } = props;
    Object.keys(fields).forEach((fieldName) => {
      const valueStrategy = {
        categoryId: {
          afterChange: (params) => {
            props.updateSpecThings(params);
            props.clearAttrListValue();
          },
        },
        spec: { afterChange: props.updateSpec },
        specValue: { afterChange: props.updateSpecValues },
        attributeList: { afterChange: props.updateAttrList },
        // saleArea: { afterChange: props.addSaleArea },
        //   afterChange: (params) => {
        //     props.addSaleArea(params);
        //     params.value === '1' && (!props.areaList || !props.areaList.length) && props.loadAreaList();
        //   },
        // },
      };
      const onValueChange = ({ params, beforeChange, afterChange }) => {
        beforeChange && beforeChange(params);
        ValuesChange(params);
        afterChange && afterChange(params);
      };
      const fieldNameApart = fieldName.split('-');
      const fieldNameMain = fieldNameApart.shift();
      onValueChange({
        ...valueStrategy[fieldNameMain],
        params: {
          totalId: fieldName,
          mainName: fieldNameMain,
          optsList: fieldNameApart,
          value: fields[fieldName].value,
          formData: fields[fieldName],
        },
      });
    });
  },
})(View);
export default WrappedView;
