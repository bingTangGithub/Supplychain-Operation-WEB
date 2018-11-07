import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Button, Modal, Popconfirm, message, Upload } from 'antd';
import { DeepClone } from '@xinguang/common-tool';
import detail from '../../../../decorators/detail';
import DetailPage from '../../../../components/DetailPage';
import ListPage from '../../../../components/ListPage';
import TableRow from './TableRow';
import { getBaseUrl } from '../../../../util';

import './style.scss';

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      productVisible: false,
      setVisible: false,
      importErr: false,
      skuString: null,
      proList: this.props.pro,
      proList1: [],
      selectedRowKeys: [],
      data: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.pro) !== JSON.stringify(this.props.pro)) {
      const arr = [];
      nextProps.pro.forEach((item) => {
        arr.push(item.spuId);
      });
      this.setState({
        proList: nextProps.pro,
        selectedRowKeys: arr,
      });
    }
  }
  //  组件销毁后清除tableRow中的数据
  componentWillUnmount() {
    this.props.clearProps();
  }
  onSelectChange = (selectedRowKeys) => {
    const bb = new Set(selectedRowKeys);
    this.setState({
      selectedRowKeys:[...bb],
    });
    this.handleSetTimeOut();
  };
  onChange = (value) => {
    this.setState({ value });
  };
  onCheck = (checkedKeys) => {
    this.setState({ checkedKeys });
  };
  setSku = (value, name, record, parentRecord) => {
    const spuId = parentRecord.spuId;
    const skuId = record.skuId;
    const selectedSpu = this.state.proList.find((item) => item.spuId === spuId);
    const selectedSku = selectedSpu.skuInfo.find((item) => item.skuId === skuId);
    selectedSku[name] = value;
    this.setState({
      ...this.state,
      proList: DeepClone.deepClone(this.state.proList),
    });
  };
  // 批量设置时处理数据
  setHandOk = () => {
    this.setState({
      setVisible: false,
    });
    this.state.proList.forEach((item) => {
      item.skuInfo.forEach((item1) => {
        if (this.props.selectSkuId.indexOf(item1.skuId) > -1) {
          if (item1.soldActivityInventory === undefined) {
            item1.soldActivityInventory = null;
          }
          if (this.props.setRecord.activityPrice.value !== '') {
            if (this.props.setRecord.activityPrice.value >= (item1.price / 100)) {
              item1.activityPrice = (item1.price / 100);
            } else {
              item1.activityPrice = this.props.setRecord.activityPrice.value;
            }
          }
          if (this.props.setRecord.activityUnitPrice.value !== '') {
            if (this.props.setRecord.activityUnitPrice.value >= (item1.unitPrice / 100)) {
              item1.activityUnitPrice = (item1.unitPrice / 100);
            } else {
              item1.activityUnitPrice = this.props.setRecord.activityUnitPrice.value;
            }
          }
          if (this.props.setRecord.activityInventory.value !== '') {
            if (this.props.setRecord.activityInventory.value > (item1.quantity + item1.soldActivityInventory)) {
              item1.activityInventory = (item1.quantity + item1.soldActivityInventory);
            } else {
              item1.activityInventory = this.props.setRecord.activityInventory.value;
            }
          }
          if (this.props.setRecord.uidMaxBuyCount.value !== '') {
            if (this.props.setRecord.activityInventory.value) {
              if (this.props.setRecord.activityInventory.value > item1.quantity) {
                if (this.props.setRecord.uidMaxBuyCount.value > this.props.setRecord.activityInventory.value) {
                  item1.uidMaxBuyCount = item1.quantity;
                } else if (this.props.setRecord.uidMaxBuyCount.value <= this.props.setRecord.activityInventory.value &&
                  this.props.setRecord.uidMaxBuyCount.value > item1.quantity) {
                  item1.uidMaxBuyCount = item1.quantity;
                } else {
                  item1.uidMaxBuyCount = this.props.setRecord.uidMaxBuyCount.value;
                }
              } else if (this.props.setRecord.uidMaxBuyCount.value > this.props.setRecord.activityInventory.value &&
                this.props.setRecord.activityInventory.value <= item1.quantity) {
                item1.uidMaxBuyCount = this.props.setRecord.activityInventory.value;
              } else {
                item1.uidMaxBuyCount = this.props.setRecord.uidMaxBuyCount.value;
              }
            } else if (this.props.setRecord.uidMaxBuyCount.value > item1.quantity) {
              item1.uidMaxBuyCount = item1.quantity;
            } else {
              item1.uidMaxBuyCount = this.props.setRecord.uidMaxBuyCount.value;
            }
          }
        }
      });
    });
    if (this.props.record.status.value === 1) {
      this.state.proList.forEach((item) => {
        item.skuInfo.forEach((item1) => {
          if (item1.soldActivityInventory === undefined) {
            item1.soldActivityInventory = null;
          }
          if (this.props.selectSkuId.indexOf(item1.skuId) > -1) {
            if ((item1.activityInventory + this.props.setRecord.addInventory.value) <=
              (item1.quantity + item1.soldActivityInventory)) {
              item1.activityInventory += this.props.setRecord.addInventory.value;
            } else {
              item1.activityInventory = (item1.quantity + item1.soldActivityInventory);
            }
          }
        });
      });
    }
    this.clearSetModal();
  };
  setHandCancle = () => {
    this.setState({
      setVisible: false,
    });
    this.clearSetModal();
  };
  getButtons = () => {
    const { params, confirmLoading, record } = this.props;
    let buttons = [];
    const isHidden = record.status.value === 2;
    const btnMap = {
      edit: {
        label: '编辑',
        type: 'primary',
        onClick: () => browserHistory.push({
          pathname: `/Manage/ActivityDetail/${params.id}`,
          state: { mode: 'edit' },
        }),
        loading: confirmLoading,
        hidden: isHidden,
      },
      save: {
        label: '保存',
        type: 'primary',
        onClick: (form) => this.handleSubmit(form),
        loading: confirmLoading,
        hidden: isHidden,
      },
      cancel: {
        label: '取消',
        type: 'default',
        onClick: () => browserHistory.goBack(),
      },
    };

    buttons = [btnMap.save, btnMap.cancel];
    if (params.id === '0') {
      // buttons保持不变
    } else if (location.state && location.state.mode === 'view') {
      buttons = [btnMap.edit, btnMap.cancel];
    }
    return buttons;
  };
  getBtnHTML = () => {
    const { record } = this.props;
    const uploadProps = {
      name: 'file',
      defaultFileList: [],
      action: `${getBaseUrl()}/sku/template/import`,
      headers: {
        authorization: localStorage.getItem('accessToken'),
      },
      onChange: this.handleUploadChange,
      beforeUpload: this.handleBeforeUpload,
      // 点击移除文件时的回调，返回值为 false 时不移除
      onRemove: () => true,
    };
    const isShow = record.status.value === 1 && record.inventoryLock.value === '2';
    return (
      <div>
        <Button
          type="primary"
          onClick={this.showProModal}
          disabled={record.status.value === 1 || record.status.value === 2}
        >选择商品</Button>

        <Button
          type="primary"
          onClick={this.showSetModal}
          disabled={record.status.value === 2 || isShow}
        >批量设置</Button>

        <Button
          type="primary"
          disabled={record.status.value === 1 || record.status.value === 2}
          onClick={() => { this.props.loadFile(); }}
        >下载导入模板</Button>
        <Popconfirm
          title="确认清空?"
          okText="确认"
          cancelText="取消"
          onConfirm={this.clearProList}
        >
          <Button
            type="primary"
            disabled={record.status.value === 1 || record.status.value === 2}
          >清空</Button>
        </Popconfirm><br />

        <Upload
          showUploadList={false}
          {...uploadProps}
          ref={(c) => { this.upload = c; }}
        >
          <Button
            // style={{ top:'14px' }}
            type="primary"
            disabled={record.status.value === 1 || record.status.value === 2}
          >批量导入</Button>
        </Upload>
      </div>
    );
  }
  getColumns = () => {
    const { sortData } = this.props;
    const sort = JSON.parse(JSON.stringify(sortData).replace(/categoryId/g, 'value')
      .replace(/categoryName/g, 'label').replace(/categoryKids/g, 'children')
      .replace(/\[\]/g, null));
    return [
      {
        label: '后台分类',
        type: 'Cascader',
        name: 'categoryId',
        display: this.displayRender,
        value: '',
        hidden: true,
        data: sort,
        search: true,
        changeOnSelect: true,
      },
      {
        label: '商品ID',
        name: 'spuId',
        search: true,
        max: 18,
      },
      {
        label: '商品名',
        name: 'spuName',
        search: true,
        hidden: true,
        max: 64,
      },
      {
        label: '商品名',
        name: 'name',
      },
    ];
  };
  getFields = ({ isinventoryLock1, isUidLimit1, isView }) => {
    const { record } = this.props;
    const isDisabled = record.status.value === 1 || record.status.value === 2;
    const inventeryDis1 = record.status.value === 2;
    return [
      {
        type: 'title',
        label: '当前活动为“上线”状态，仅“活动库存”字段可编辑',
        className: 'warning',
        hidden: !(record.status.value === 1),
      },
      {
        label: '基本信息',
        name: 'baseInfo',
        type: 'title',
      },
      {
        label: '状态',
        name: 'status',
        hidden: true,
        data: { 0: '未上线', 1: '已上线', 2: '已下线' },
      },
      {
        label: '名称',
        name: 'name',
        required: true,
        charLimit: true,
        simpleHalf: true,
        max: 20,
        disabled: isDisabled,
      },
      {
        label: '描述',
        name: 'description',
        type: 'textarea',
        charLimit: true,
        simpleHalf: true,
        max: 30,
        disabled: isDisabled,
      },
      {
        label: '备注',
        name: 'remark',
        type: 'textarea',
        charLimit: true,
        simpleHalf: true,
        max: 30,
        disabled: isDisabled,
      },
      {
        label: '活动规则',
        type: 'title',
      },
      {
        label: '活动时间',
        name: 'activityTime',
        type: 'datetimeRange',
        simpleHalf: true,
        required: true,
        disabled: isDisabled,
      },
      {
        label: '活动类型',
        name: 'type',
        type: 'select',
        simpleHalf: true,
        required: true,
        data: { 1: '限时特价' },
        disabled: isDisabled,
      },
      {
        label: '活动商品',
        type: 'title',
      },
      {
        label: '锁定活动库存',
        name: 'inventoryLock',
        type: 'select',
        simpleHalf: true,
        required: true,
        disabled: isDisabled,
        data: { 1: '是', 2: '否' },
        onChange: () => {
          this.clearLock();
        },
      },
      {
        label: '按账号限购',
        name: 'uidLimitBuy',
        type: 'select',
        simpleHalf: true,
        required: true,
        disabled: isDisabled,
        data: { 1: '是', 2: '否' },
        onChange: () => {
          this.clearMaxBuy();
        },
      },
      {
        label: '活动商品',
        name: 'buttons',
        type: 'html',
        simpleHalf: true,
        html: this.getBtnHTML(),
      },
      {
        name: 'activityPro',
        simpleTabel: true,
        component: TableRow,
        dataSource: this.state.proList,
        selectedRowKeys: this.state.selectedRowKeys,
        isinventoryLock: isinventoryLock1,
        inventeryDis: inventeryDis1,
        isUidLimit: isUidLimit1,
        activityPrice: record.activityPrice,
        activityUnitPrice: record.activityUnitPrice,
        changeSku: this.props.changeSku,
        setSku: this.setSku.bind(this),
        statuShow: isDisabled,
        data: this.state.data,
        minStatus: record.status.value === 1,
        selectSkuId: this.props.selectSkuId,
      },
      {
        label: '玩法说明',
        type: 'title',
      },
      {
        label: '玩法说明',
        name: 'activityDesc',
        type: 'textarea',
        simpleHalf: true,
        disabled: isDisabled,
        max: 1000,
      },
    ].map((item) => {
      const newItem = { ...item };
      if (isView) {
        newItem.disabled = true;
      }
      return newItem;
    });
  };
  getFieldSet = ({ isHidden }) => {
    const { record } = this.props;
    return [{
      label:'活动单价',
      name: 'activityUnitPrice',
      type: 'number',
      simpleSetting: true,
      hidden: isHidden,
    }, {
      label:'活动售价',
      name: 'activityPrice',
      type: 'number',
      simpleSetting: true,
      hidden: isHidden,
    }, {
      label: '活动库存',
      name: 'activityInventory',
      type: 'number',
      precision: 0,
      simpleSetting: true,
      hidden: isHidden || record.inventoryLock.value === '2',
    }, {
      label: '账号限购数',
      name: 'uidMaxBuyCount',
      type: 'number',
      precision: 0,
      simpleSetting: true,
      hidden: isHidden || record.uidLimitBuy.value === '2',
    }, {
      label: '追加活动库存',
      name: 'addInventory',
      type: 'number',
      precision: 0,
      simpleSetting: true,
      hidden: !isHidden,
    }];
  };
  clearLock = () => {
    this.state.proList.forEach((item) => {
      item.skuInfo.forEach((item1) => {
        item1.activityInventory = null;
      });
    });
  };
  clearMaxBuy = () => {
    this.state.proList.forEach((item) => {
      item.skuInfo.forEach((item1) => {
        item1.uidMaxBuyCount = null;
      });
    });
  };
  handleSetTimeOut = () => {
    setTimeout(this.handleProlist1, 1);
  };
  handleProlist1 = () => {
    const aa = this.props.proData.filter((item) => {
      if (this.state.selectedRowKeys.indexOf(item.spuId) > -1) {
        return true;
      }
      return false;
    });
    this.setState({
      proList1: this.state.proList1.concat(aa),
    });
    const result = [];
    const obj = {};
    this.state.proList1.forEach((item) => {
      if (!obj[item.spuId]) {
        result.push(item);
        obj[item.spuId] = true;
      }
    });
    this.setState({
      proList1: result,
    });
  };
  clearSetModal = () => {
    this.props.setRecord.uidMaxBuyCount.value = '';
    this.props.setRecord.activityInventory.value = '';
    this.props.setRecord.activityPrice.value = '';
    this.props.setRecord.activityUnitPrice.value = '';
    this.props.setRecord.addInventory.value = '';
  };
  showSetModal = () => {
    this.setState({
      setVisible: true,
    });
  };
  showProModal = () => {
    this.testSelect();
    const aa = [];
    this.props.pro.forEach((item) => {
      aa.push(item.spuId);
    });
    this.setState({
      productVisible: true,
      // selectedRowKeys: this.state.selectedRowKeys.concat(aa),
    });
    this.props.loadSort({ platform: 1 });
    // this.props.loadFrontSort();
    this.props.loadPro({
      saleStatus: 0,
      pageNo: 1,
      pageSize: 10,
    });
  };
  proHandCancle = () => {
    const arr = [];
    this.state.proList.forEach((item) => {
      arr.push(item.spuId);
    });
    this.setState({
      productVisible: false,
      selectedRowKeys: arr,
    });
  };
  proHandOk = () => {
    this.proStart();
  };
  proHand = () => {
    // this.state.proList.forEach((item) => {
    //   item.skuInfo.forEach((item1) => {
    //     item1.sellingPrice /= 100;
    //   });
    // });
    const aa = this.state.proList.filter((item) => {
      if (this.state.selectedRowKeys.indexOf(item.spuId) > -1) {
        return true;
      }
      return false;
    });
    const result = [];
    const obj = {};
    aa.forEach((item) => {
      if (!obj[item.spuId]) {
        result.push(item);
        obj[item.spuId] = true;
      }
    });
    this.setState({
      productVisible: false,
      proList: result,
    });
  };
  clearProList = () => {
    this.setState({
      proList: [],
      selectedRowKeys: [],
    });
  };
  proStart = () => {
    //  将proList数组中的spuId筛选出来放在数组bb中
    const bb = [];
    this.state.proList.forEach((item) => {
      bb.push(item.spuId);
    });
    // 判断proList1中是否包含有proList中没有的数据，并将其抽出来放在数组aa中
    const aa = this.state.proList1.filter((item) => {
      if (bb.indexOf(item.spuId) > -1) {
        return false;
      }
      return true;
    });
    // proList内添加数组aa，并作为展示到tableRow中的数据源
    this.setState({
      proList: this.state.proList.concat(aa),
    });
    setTimeout(this.proHand, 1);
  };
  // 删除商品后处理与剩余商品与勾选项一致
  testSelect = () => {
    this.setState({
      proList1: this.state.proList,
    });
    const arr = this.state.proList.filter((item) => {
      if (this.state.selectedRowKeys.indexOf(item.spuId) > -1) {
        return true;
      }
      return false;
    });
    const arr1 = [];
    arr.filter((item) => arr1.push(item.spuId));
    this.setState({
      selectedRowKeys: arr1,
    });
  };
  importOk = () => {
    this.setState({
      importErr: false,
    });
  };
  importCancle = () => {
    this.setState({
      importErr: false,
    });
  };
  displayRender = (label) => label[label.length - 1];

  judgeIsEdit = () => {
    const { state = {} } = this.props.location;
    return !!(+this.props.params.id && state.mode !== 'view');
  };

  judgeIsView = (isEdit) => !!(+this.props.params.id && !isEdit);

  handleUploadChange = (info) => { // 上传中、完成、失败都会调用这个函数
    if (info.file.status === 'done') {
      if (info.file.response.passFlag === true) {
        const list = info.file.response.spuInfos;
        list.forEach((item) => {
          item.skuInfo.forEach((item1) => {
            item1.activityPrice /= 100;
            item1.activityUnitPrice /= 100;
          });
        });
        message.success('操作成功');
        this.setState({
          proList: this.state.proList.concat(list),
        });
        const result = [];
        const obj = {};
        this.state.proList.forEach((item) => {
          if (!obj[item.spuId]) {
            result.push(item);
            obj[item.spuId] = true;
          }
        });
        result.forEach((item) => {
          item.skuInfo.forEach((item1) => {
            if (this.props.record.inventoryLock.value === '2') {
              item1.activityInventory = null;
            }
            if (this.props.record.uidLimitBuy.value === '2') {
              item1.uidMaxBuyCount = null;
            }
          });
        });
        this.setState({
          proList: result,
        });
        const arr = [];
        this.state.proList.forEach((item) => {
          arr.push(item.spuId);
        });
        const arr1 = new Set(arr);
        this.setState({
          selectedRowKeys: [...arr1],
        });
      } else if (info.file.response.code === 'FI0005') {
        const skuList = info.file.response.skuIdList.join('、');
        message.error(info.file.response.message);
        this.setState({
          importErr: true,
          skuString: skuList,
        });
      } else {
        message.error(info.file.response.message);
      }
      this.upload.setState({
        fileList: [...this.upload.state.fileList].slice(0, -1), // 清空上传文件列表
      });
    }
  };

  handleBeforeUpload = (file) => { // 上传文件之前的钩子，参数为上传的文件
    const suffix = file.name.split('.').pop();
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('文件大小不能超过5MB', 3);
      return false;
    }
    if (suffix === 'xlsx' || suffix === 'xls') {
      return true;
    }
    message.error('请选择Excel文件', 3);
    return false;
  };

  handleSubmit = (form) => {
    const { save, record } = this.props;
    form.validateFields({ force: true }, (err) => {
      if (!err) {
        const skuList = [];
        this.state.proList.forEach((item) => {
          item.skuInfo.forEach((item1) => {
            item1.spuId = item.spuId;
            // 如果返回的数据中有shopId则不设置shopId，如果没有则使用sku数组外的shopId
            if (!item1.shopId) {
              item1.shopId = item.shopId;
            }
            skuList.push(item1);
          });
        });
        if (skuList.length === 0) {
          message.error('请选择活动商品');
        } else if (this.props.params.id !== '0') {
          save(Object.assign({}, record, { skuList }, { id:this.props.params.id })).then((success) => {
            if (success) {
              browserHistory.push('/Manage/Activity');
            }
          });
        } else {
          save(Object.assign({}, record, { skuList })).then((success) => {
            if (success) {
              browserHistory.push('/Manage/Activity');
            }
          });
        }
      }
    });
  };

  render() {
    const {
      record,
      changeRecord,
      page,
      location,
      changeSearch,
      searchParams,
      loadPro,
      setValue,
      setRecord,
    } = this.props;
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    location.state = location.state || {};

    const isEdit = this.judgeIsEdit();
    const isView = this.judgeIsView(isEdit);
    const buttons = this.getButtons();
    const columns = this.getColumns();
    const isinventoryLock1 = record.inventoryLock.value.toString() === '1';
    const isUidLimit1 = record.uidLimitBuy.value.toString() === '1';
    const fields = this.getFields({ isinventoryLock1, isUidLimit1, isView });

    const isHidden = record.status.value === 1;
    const fieldSet = this.getFieldSet({ isHidden });
    return (
      <div style={{ width: '100%' }}>
        <Modal
          title="选择商品"
          visible={this.state.productVisible}
          onOk={this.proHandOk}
          onCancel={this.proHandCancle}
          width={1000}
        >
          <div className="m-checkoutList">
            <ListPage
              rowKey={'spuId'}
              columns={columns}
              rowSelection={rowSelection}
              changeSearch={changeSearch}
              searchParams={searchParams}
              search={loadPro}
              page={page}
              data={this.props.proData}
            />
          </div>
        </Modal>
        <Modal
          title="批量设置"
          visible={this.state.setVisible}
          onOk={this.setHandOk}
          onCancel={this.setHandCancle}
          width={500}
        >
          <DetailPage
            fields={fieldSet}
            values={setRecord}
            changeRecord={setValue}
          />
        </Modal>
        <Modal
          title="提示"
          visible={this.state.importErr}
          onOk={this.importOk}
          onCancel={this.importCancle}
          width={550}
        >
          <h3 style={{ textAlign: 'center' }}>以下SKU编码不存在，请核对后重试，本次导入已撤销</h3><br /><br />
          <p style={{ whiteSpace: 'normal' }}>{this.state.skuString}</p>
        </Modal>
        <DetailPage
          title={'当前页面：限时活动详情'}
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

