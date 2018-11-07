import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Spin, message, Card, Form, Button, Row, Col, Tree, Tag } from 'antd';
import GoodsModal from './GoodsModal';
import Breadcrumb from '../../../../components/Breadcrumb';
import formComp from '../../../../components/formComp';
import './index.scss';

const TreeNode = Tree.TreeNode;
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
    this.props.form.resetFields();
    this.props.resetImgValue();
    this.props.resetBackCateList({ checked: [], data: [] });
    this.props.resetSpuItemList({ selected: [], data: [] });

    const { mode, type, frontCateId } = this.getRouterInfo();
    type === 'child' && this.props.loadBackCate(0);
    mode === 'edit' && this.props.loadDetail(frontCateId);
  }

  onLoadData = (treeNode) => {
    const { key, parentIdList, children } = treeNode.props.dataRef;
    if (children) {
      return new Promise((resolve) => resolve());
    }
    return this.props.loadBackCate(key, parentIdList);
  }

  onSelect = (selectedKeys) => this.props.resetBackCateList({ checked: selectedKeys })

  onCheck = (checkedKeys) => this.props.resetBackCateList(checkedKeys)

  getRouterInfo = () => {
    const { state: routerInfo = {
      mode: 'new',
      type: 'parent',
    } } = this.props.router.location;
    return routerInfo;
  }

  getFormItems(list) {
    const __props = this.props;
    const { getFieldDecorator } = this.props.form;

    return list.map((formItemConfig) => {
      const { formItemCfg, inputOpt, fieldOpt, judgeRequired } = formItemConfig;
      const { id } = formItemCfg;

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
      </FormItem>);
    });
  }

  getTitle = () => {
    const { mode, type } = this.getRouterInfo();
    return {
      'new-parent':  '新增分类',
      'edit-parent':  '编辑分类',
      'new-child': '新增子分类',
      'edit-child':  '编辑子分类',
    }[`${mode}-${type}`] || '新增分类';
  }

  getImgUpload = (cfgItem, disabled) => {
    const __props = this.props;
    const { formItemCfg, inputOpt } = cfgItem;
    const item = formComp[inputOpt.type]({
      ...inputOpt.getProps(__props),
      id: formItemCfg.id,
      disabled,
    });

    return this.getCustomFormItem({ cfgItem, disabled, item });
  }

  getCustomFormItem = ({ cfgItem, disabled, item }) => {
    const { labelCol, wrapperCol } = formItemLayout;
    const { formItemCfg, required } = cfgItem;

    return (<div key={formItemCfg.id}>
      <Row type="flex" style={{ marginBottom: 24 }}>
        <Col {...labelCol} className="ant-form-item-label img-list">
          {required && <span className="img-list-required">* </span>}
          <span className="img-list-label">{formItemCfg.label} : </span>
        </Col>
        <Col {...wrapperCol}>
          {item}
          {!disabled && <div style={{ color: 'rgba(0,0,0,.43)' }}>{formItemCfg.extra}</div>}
        </Col>
      </Row>
    </div>);
  }

  getChildCateInfo = () => {
    const { type } = this.getRouterInfo();
    if (type === 'parent') return undefined;

    const {
      backCateInfo,
      backCateList,
      checkedBackCateList,
      spuItemsInfo,
      spuItemList,
      tagDelete,
    } = this.props;

    const backCateItem = (<Tree
      loadData={this.onLoadData}
      onCheck={this.onCheck}
      checkedKeys={checkedBackCateList}
      onSelect={this.onSelect}
      selectedKeys={checkedBackCateList}
      checkable
      checkStrictly
      multiple
    >
      {this.renderTreeNodes(backCateList)}
    </Tree>);

    const spuItems = (<div className="spu-items">
      {spuItemList.map(({ spuId, spuName, operateType }) => {
        if (operateType !== 'delete') {
          return (<Tag
            key={spuId}
            color="#faad14"
            closable
            style={{ height: '26px', lineHeight: '24px' }}
            afterClose={() => tagDelete({ spuId, operateType: 'delete' })}
          >{spuName}</Tag>);
        }
        return '';
      })}
      <Button onClick={() => this.showGoodsModal(true)}>选择商品</Button>
    </div>);

    const backCateElem = this.getCustomFormItem({ cfgItem: backCateInfo, item: backCateItem });
    const spuItemsElem = this.getCustomFormItem({ cfgItem: spuItemsInfo, item: spuItems });
    return [backCateElem, spuItemsElem];
  }

  editDetails = () => {
    const {
      baseInfoList,
      frontCateImg,
      extraInfoList,
    } = this.props;

    const childInfo = this.getChildCateInfo();

    return {
      base: this.getFormItems(baseInfoList),
      img: this.getImgUpload(frontCateImg),
      rule:  this.getFormItems(extraInfoList),
      childInfo,
      btn: [
        <Button key="save" type="primary" htmlType="submit" size="large" >保存</Button>,
        <Button key="cancel" type="default" size="large" onClick={this.handleCancel}>取消</Button>,
      ],
    };
  }

  handleCancel = () => { browserHistory.push('/Manage/FrontCateList'); }

  handleGoodsModalOK = () => {
    this.props.saveTempSpuList();
    this.showGoodsModal(false);
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (err) return message.error('信息输入不正确');

      const { mode, type, parentId, frontCateId } = this.getRouterInfo();
      const resultData = {
        ...values,
        frontCateImg: [{}, ...this.props.values.frontCateImg].pop().url,
      };
      if (mode === 'new' && type === 'parent') {
        resultData.parentId = '0';
      }
      if (mode === 'edit') {
        resultData.frontCateId = frontCateId;
      }
      if (type === 'child') {
        resultData.parentId = parentId;
        resultData.endCateList = this.props.checkedBackCateList;
        resultData.spuItemList = this.props.spuItemList;
      }

      return this.props.handleSubmit(resultData)
        .then((response) => response && response.success && browserHistory.push('/Manage/FrontCateList'));
    });
  }

  showGoodsModal = (status) => {
    this.props.showGoodsModal(status);
    if (status) {
      const { search, goodsModal: { searchParams } } = this.props;
      search(searchParams);
    }
  }

  renderTreeNodes = (data) => data.map((item) => {
    if (item.children) {
      return (
        <TreeNode title={item.title} key={item.key} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </TreeNode>
      );
    }
    return <TreeNode {...item} dataRef={item} />;
  });

  render() {
    const {
      loading,
      goodsModalVisible,
      showGoodsModal,
      goodsModal,
      search,
      changeSearch,
      tagDelete,
      addSpuList,
    } = this.props;
    const elements = this.editDetails();

    return (
      <div className="m-frontcate-edit" style={{ width: '100%', padding: 16 }}>
        <Spin spinning={loading}>
          <Breadcrumb title="商品管理 > 前端分类 > 分类编辑" />
          <div className="product-detail-form" id="product-detail-form">
            <Form onSubmit={this.handleSubmit}>
              <Card title={this.getTitle()} className="form-section">
                { elements.base }
                { elements.img }
                { elements.rule }
                { elements.childInfo }
              </Card>
              <div style={{ textAlign: 'center' }}>
                { elements.btn }
              </div>
            </Form>
          </div>
        </Spin>
        <GoodsModal
          {...goodsModal}
          visible={goodsModalVisible}
          onCancel={() => showGoodsModal(false)}
          onOk={() => this.handleGoodsModalOK()}
          search={search}
          changeSearch={changeSearch}
          tagDelete={tagDelete}
          addSpuList={addSpuList}
        />
      </div>
    );
  }
}

const WrappedView = Form.create({
  mapPropsToFields: (props) => props.values,
  onFieldsChange: (props, fields) => {
    const { ValuesChange } = props;
    Object.keys(fields).forEach((fieldName) => {
      const params = { totalId: fieldName, formData: fields[fieldName] };
      ValuesChange(params);
    });
  },
})(View);
export default WrappedView;
