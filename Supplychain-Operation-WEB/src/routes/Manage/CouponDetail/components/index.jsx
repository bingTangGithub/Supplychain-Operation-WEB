import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Button, Modal, Tree, message } from 'antd';
import detail from '../../../../decorators/detail';
import DetailPage from '../../../../components/DetailPage';
import ListPage from '../../../../components/ListPage';

import './style.scss';

const TreeNode = Tree.TreeNode;

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      productVisible: false,
      sortVisible: false,
      proList: this.props.pro,
      sortList: this.props.sort,
      selectedRowKeys: this.props.pro,
      checkedKeys: this.props.sort,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.pro) !== JSON.stringify(this.props.pro)) {
      this.setState({
        proList: nextProps.pro,
        selectedRowKeys: nextProps.pro,
      });
    }
    if (JSON.stringify(nextProps.sort) !== JSON.stringify(this.props.sort)) {
      this.setState({
        sortList: nextProps.sort,
        checkedKeys: nextProps.sort,
      });
    }
  }
  componentWillUnmount() {
    this.props.clearProps();
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  onChange = (value) => {
    this.setState({ value });
  };
  onCheck = (checkedKeys) => {
    this.setState({ checkedKeys });
  };
  getFields = () => {
    const {
      record,
      changeValidTime,
      params,
      location,
    } = this.props;
    location.state = location.state || {};
    const isEdit = !!(+params.id && location.state.mode !== 'view');
    const isView = !!(+params.id && !isEdit);
    return [{
      label: '基本信息',
      name: 'baseInfo',
      type: 'title',
    },
    {
      label: 'ID',
      name: 'couponId',
      hidden: true,
    },
    {
      label: '名称',
      name: 'couponName',
      required: true,
      charLimit: true,
      simpleHalf: true,
      max: 20,
    },
    {
      label: '描述',
      name: 'description',
      type: 'textarea',
      charLimit: true,
      simpleHalf: true,
      max: 30,
    },
    {
      label: '备注',
      name: 'remark',
      type: 'textarea',
      charLimit: true,
      simpleHalf: true,
      max: 30,
    },
    {
      label: '优惠规则',
      name: 'discountRule',
      type: 'title',
    },
    {
      label: '优惠类型',
      name: 'couponType',
      type: 'select',
      simpleHalf: true,
      required: true,
      data: {
        fullcut: '满减券',
        discount: '满折券',
      },
    },
    {
      label: '满额',
      name: 'overPrice',
      type: 'number',
      simpleHalf: true,
      required: true,
      double: record.couponType.value === 'fullcut' ? 'left' : '',
      max: 100000,
    },
    {
      label: '减额',
      name: 'price',
      type: 'number',
      double: 'right',
      simpleHalf: true,
      required: true,
      hidden: record.couponType.value === 'discount',
      max: 9999.99,
      min: 0.01,
    },
    {
      label: '折扣',
      name: 'discount',
      type: 'number',
      double: 'left',
      simpleHalf: true,
      precision: 1,
      max: 10,
      min: 0.1,
      required: true,
      hidden: record.couponType.value === 'fullcut',
      placeholder: '请输入折扣，填写9.5即95折',
    },
    {
      label: '减额封顶',
      name: 'maxPrice',
      type: 'number',
      double: 'right',
      simpleHalf: true,
      hidden: record.couponType.value === 'fullcut',
      max: 100000,
      min: 1,
    },
    {
      label: '领取限制',
      name: 'getLimit',
      type: 'title',
    },
    {
      label: '发券总量',
      name: 'quantity',
      type: 'number',
      max: 1000000,
      min: 1,
      precision: 0,
      simpleHalf: true,
      required: true,
    },
    {
      label: '账号限领数量',
      name: 'receiveUidMax',
      required: true,
      type: 'number',
      min: 1,
      max: 999,
      precision: 0,
      simpleHalf: true,
    },
    {
      label: '领取时间',
      name: 'receiveTime',
      type: 'datetimeRange',
      simpleHalf: true,
      required: true,
    },
    {
      label: '领取对象',
      name: 'customerType',
      type: 'select',
      simpleHalf: true,
      required: true,
      data: {
        all: '所有人',
        new: '新用户',
        old: '老用户',
      },
    },
    {
      label: '使用限制',
      name: 'useLimit',
      type: 'title',
      simpleHalf: true,
    },
    {
      label: '有效时间类型',
      name: 'validTimeType',
      type: 'select',
      simpleHalf: true,
      required: true,
      data: {
        1: '按时间段',
        2: '领取后指定天数内可用',
      },
      onChange: (value) => {
        changeValidTime(value);
      },
    },
    {
      label: '使用时间',
      name: 'useTime',
      type: 'datetimeRange',
      simpleHalf: true,
      required: true,
      hidden: record.validTimeType.value === '2',
    },
    {
      label: '绝对时间',
      name: 'intervalDay',
      type: 'number',
      simpleHalf: true,
      required: true,
      hidden: record.validTimeType.value === '1',
      min: 1,
      max: 366,
    },
    {
      label: '优惠叠加',
      name: 'overlay',
      type: 'select',
      simpleHalf: true,
      data: {
        1: '允许叠加促销',
      },
      required: true,
    },
    {
      label: '可用商品',
      name: 'limitType',
      type: 'select',
      data: {
        allspu: '所有商品',
        // spu: '指定商品',
        // category: '指定分类',
      },
      required: true,
      simpleHalf: true,
    },
    {
      name: 'button2',
      type: 'html',
      float: true,
      simpleHalf: true,
      hidden: record.limitType.value === 'allspu' || record.limitType.value === 'category',
      html: (
        <p>
          <Button type="primary" onClick={this.showProModal} disabled={isView}>选择商品</Button>
          <span style={{ paddingLeft: '15px' }}>
            { this.state.proList.length > 0 ? `已选择 ${this.state.proList.length} 个商品` : '' }
          </span>
        </p>
      ),
    },
    {
      name: 'button1',
      type: 'html',
      float: true,
      simpleHalf: true,
      hidden: record.limitType.value === 'allspu' || record.limitType.value === 'spu',
      html: (
        <p>
          <Button type="primary" onClick={this.showSortModal} disabled={isView}>选择分类</Button>
          <span style={{ paddingLeft: '15px' }}>
            { this.state.sortList.length > 0 ? `已选择 ${this.state.sortList.length} 个分类` : '' }
          </span>
        </p>
      ),
    },
    {
      label: '展示限制',
      name: 'isOpen',
      type: 'select',
      simpleHalf: true,
      required: true,
      data: {
        1: '公开',
        0: '非公开',
      },
    },
    ].map((item) => {
      const newItem = { ...item };
      if (isView) {
        newItem.disabled = true;
      }
      return newItem;
    });
  };
  clearSortList = () => {
    this.setState({
      checkedKeys: [],
    });
  };
  clearProList = () => {
    this.setState({
      selectedRowKeys: [],
    });
  }
  proHandOk = () => {
    this.setState({
      productVisible: false,
      proList: this.state.selectedRowKeys,
    });
    this.proStart();
  }
  proHandCancle = () => {
    this.setState({
      productVisible: false,
      selectedRowKeys: this.state.proList,
    });
  }
  showSortModal = () => {
    this.setState({
      sortVisible: true,
    });
    this.props.loadSort({ platform: 3 });
  }
  sortHandOk = () => {
    this.setState({
      sortVisible: false,
    });
    this.sortSrart();
  }
  sortHandCancle = () => {
    this.setState({
      sortVisible: false,
      checkedKeys: this.state.sortList,
    });
  }
  proStart = () => {
    this.setState({
      proList: this.state.selectedRowKeys,
    });
  }
  sortSrart = () => {
    this.setState({
      sortList: this.state.checkedKeys,
    });
  };
  showProModal = () => {
    this.setState({
      productVisible: true,
    });
    this.props.loadSort({ platform: 3 });
    this.props.loadPro({
      pageNo: 1,
      pageSize: 10,
    });
  };
  displayRender = (label) => label[label.length - 1]
  renderTreeNodes = (data) => data.map((item) => {
    if (item.categoryKids.length > 0) {
      return (
        <TreeNode title={item.categoryName} key={item.categoryId} dataRef={item}>
          {this.renderTreeNodes(item.categoryKids)}
        </TreeNode>
      );
    }
    return <TreeNode {...item} title={item.categoryName} dataRef={item} key={item.categoryId} />;
  });
  render() {
    const {
      record,
      changeRecord,
      save,
      page,
      params,
      location,
      confirmLoading,
      changeSearch,
      searchParams,
      loadPro,
      proData,
      sortData,
    } = this.props;
    const sort = JSON.parse(JSON.stringify(sortData).replace(/categoryId/g, 'value')
      .replace(/categoryName/g, 'label').replace(/categoryKids/g, 'children'));
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    location.state = location.state || {};

    let buttons = [];
    const submit = (form) => {
      form.validateFields({ force: true }, (err) => {
        if (!err) {
          const availableSpuIds = this.state.proList;
          const availableCategoryIds = this.state.sortList;
          if (record.overPrice.value < 0) {
            message.error('满额不能小于0');
          } else if (record.price.value < 0) {
            message.error('减额不能小于0');
          } else if (record.quantity.value < record.receiveUidMax.value) {
            message.error('发券总量不能低于账号限领数量');
          } else if (record.useTime.value[1] && (record.useTime.value[1] < record.receiveTime.value[1])) {
            message.error('使用结束时间不能早于领取结束时间');
          } else if (record.limitType.value === 'spu' && availableSpuIds.length <= 0) {
            message.error('指定商品不能为空');
          } else if (record.limitType.value === 'category' && availableCategoryIds.length <= 0) {
            message.error('指定分类不能为空');
          } else {
            save(Object.assign({}, record, { availableSpuIds }, { availableCategoryIds })).then((success) => {
              if (success) {
                browserHistory.push('/Manage/coupon');
              }
            });
          }
        }
      });
    };

    if (params.id === '0') {
      buttons = [
        {
          label: '保存',
          type: 'primary',
          onClick: (form) => {
            submit(form);
          },
          loading: confirmLoading,
        },
        {
          label: '取消',
          type: 'default',
          onClick: () => browserHistory.push('/Manage/coupon'),
        },
      ];
    } else if (location.state && location.state.mode === 'view') {
      buttons = [
        {
          label: '编辑',
          type: 'primary',
          onClick: () => {
            browserHistory.push({
              pathname: `/Manage/CouponDetail/${params.id}`,
              state: { mode: 'edit' },
            });
          },
          loading: confirmLoading,
          hidden: location.state.status === 'on',
        },
        {
          label: '返回',
          type: 'default',
          onClick: () => browserHistory.push('/Manage/coupon'),
        },
      ];
    } else {
      buttons = [
        {
          label: '保存',
          type: 'primary',
          onClick: (form) => {
            submit(form);
          },
          loading: confirmLoading,
        },
        {
          label: '取消',
          type: 'default',
          onClick: () => browserHistory.push('/Manage/coupon'),
        },
      ];
    }

    const fields = this.getFields();
    const columns = [
      {
        label: '后台分类',
        type: 'Cascader',
        name: 'categoryId',
        display: this.displayRender,
        hidden: true,
        data: sort,
        search: true,
        changeOnSelect: true,
      },
      {
        label: '商品ID',
        name: 'spuId',
        search: true,
      },
      {
        label: '商品名',
        name: 'name',
        search: true,
      },
    ];
    return (
      <div style={{ width: '100%' }}>
        <Modal
          title="选择商品"
          visible={this.state.productVisible}
          onOk={this.proHandOk}
          onCancel={this.proHandCancle}
          width={1000}
        >
          <Button
            type="primary"
            onClick={this.clearProList}
          >
            清空
          </Button>
          <div className="m-checkoutList">
            <ListPage
              rowKey={'spuId'}
              columns={columns}
              rowSelection={rowSelection}
              changeSearch={changeSearch}
              searchParams={searchParams}
              search={loadPro}
              page={page}
              data={proData}
            />
          </div>
        </Modal>
        <Modal
          title="选择分类"
          visible={this.state.sortVisible}
          onOk={this.sortHandOk}
          onCancel={this.sortHandCancle}
          width={500}
        >
          <Button
            type="primary"
            onClick={this.clearSortList}
          >清空
          </Button>
          <Tree
            checkable
            onCheck={this.onCheck}
            checkedKeys={[...this.state.checkedKeys]}
          >
            {this.renderTreeNodes(sortData)}
          </Tree>
        </Modal>
        <DetailPage
          title={'当前位置：优惠券详情'}
          fields={fields}
          buttons={buttons}
          values={record}
          changeRecord={changeRecord}
        />
      </div>
    );
  }
}

export default detail(View);
