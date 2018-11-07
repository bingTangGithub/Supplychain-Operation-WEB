import React, { Component } from 'react';
import { Table, Popconfirm } from 'antd';
import InputNumber from '../../../../components/InputNumber';

class TableRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLimit:null,
    };
  }
  onSelectChange = (selectSkuId) => {
    this.props.changeSku(selectSkuId);
  };
  handleChange = (value, name, record, parentRecord) => {
    this.props.setSku(value, name, record, parentRecord);
  };
  check = () => {
    if (this.props.onChange) {
      this.props.onChange(this.state.value);
    }
  };
  expandedRowRender = (record) => {
    const selectSkuId = this.props.selectSkuId;
    const rowSelection = {
      selectedRowKeys: selectSkuId,
      onChange: this.onSelectChange,
    };
    const columnsSku = [{
      title: 'SKU编码',
      dataIndex: 'skuId',
    },
    { title: '规格',
      dataIndex: 'specs',
      render: (text, record1) => {
        const spec = JSON.parse(record1.specs);
        return spec[0].specValue;
      },
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      render: (text, record1) => {
        if (record1.unitPrice === null) {
          return '';
        }
        return (record1.unitPrice / 100).toFixed(2);
      },
    },
    {
      title: '活动单价',
      dataIndex: 'activityUnitPrice',
      render: (text, record1) => {
        const max = record1.unitPrice === null ? 0 : (record1.unitPrice / 100);
        const isShow = record1.unitPrice === null;
        return (<div className="example-input">
          <InputNumber
            min={0}
            max={max}
            precision={2}
            value={text}
            onChange={(value) => {
              this.handleChange(value, 'activityUnitPrice', record1, record);
            }}
            onPressEnter={this.check}
            disabled={this.props.statuShow || isShow}
          />
        </div>);
      },
    },
    { title: '售价',
      dataIndex: 'sellingPrice',
      render: (text, record1) => ((text || record1.price) / 100).toFixed(2),
    },
    { title: '活动售价',
      dataIndex: 'activityPrice',
      render: (text, record1) =>
        (<div className="example-input">
          <InputNumber
            min={0}
            max={(record1.price / 100)}
            precision={2}
            value={text}
            onChange={(value) => {
              this.handleChange(value, 'activityPrice', record1, record);
            }}
            onPressEnter={this.check}
            disabled={this.props.statuShow}
          />
        </div>)
      ,
    },
    { title: '实际库存',
      dataIndex: 'quantity',
    },
    { title: '活动已售',
      dataIndex: 'soldActivityInventory',
    },
    { title: '活动库存',
      dataIndex: 'activityInventory',
      render: (text, record1) => {
        if (record1.soldActivityInventory === undefined) {
          record1.soldActivityInventory = null;
        }
        return (<div className="example-input">
          <InputNumber
            value={text}
            disabled={!this.props.isinventoryLock || this.props.inventeryDis}
            min={0}
            max={record1.quantity + record1.soldActivityInventory}
            precision={0}
            step={1}
            onChange={(value) => {
              this.handleChange(value, 'activityInventory', record1, record);
            }}
          />
        </div>);
      },
    },
    { title: '账号限购数',
      dataIndex: 'uidMaxBuyCount',
      render: (text, record1) => {
        const max1 = !this.props.isinventoryLock ? record1.quantity : Number(record1.activityInventory);
        return (<div className="example-input">
          <InputNumber
            max={max1}
            value={text}
            disabled={!this.props.isUidLimit || this.props.statuShow}
            min={0}
            precision={0}
            step={1}
            onChange={(value) => {
              this.handleChange(value, 'uidMaxBuyCount', record1, record);
            }}
          />
        </div>);
      },
    }];
    return (
      <Table
        rowSelection={rowSelection}
        rowKey={'skuId'}
        columns={columnsSku}
        pagination={false}
        dataSource={record.skuInfo}
      />
    );
  };
  // 在Table中删除商品
  proDel = (spuId) => {
    const index = this.props.selectedRowKeys.indexOf(spuId);
    this.props.dataSource.splice(index, 1);
    this.props.selectedRowKeys.splice(index, 1);
    const arr = [];
    this.props.dataSource.forEach((item) => {
      item.skuInfo.forEach((item1) => {
        arr.push(item1.skuId);
      });
    });
    this.props.selectSkuId.forEach((item) => {
      if (arr.indexOf(item) === -1) {
        this.props.selectSkuId.splice(arr.indexOf(item), 1);
      }
    });
    // 这块儿代码不要删
    this.setState({
      // dataSource: this.props.dataSource,
      // selectedRowKeys: this.props.selectedRowKeys,
    });
  };
  render() {
    const columnsSpu = [
      {
        title: '商品ID',
        dataIndex: 'spuId',
      },
      {
        title: '商品名称',
        dataIndex: 'name',
      },
      {
        title: '操作',
        render: (text, value) => (
          <span>
            <Popconfirm
              title="是否确认移除?"
              okText="确认"
              cancelText="取消"
              onConfirm={() => this.proDel(value.spuId)}
            >
              <span>
                <a
                  hidden={this.props.statuShow}
                >移除</a>
              </span>
            </Popconfirm>

          </span>
        ),
      },
    ];
    return (
      <Table
        rowKey={'spuId'}
        columns={columnsSpu}
        expandedRowRender={this.expandedRowRender}
        dataSource={this.props.dataSource}
      />
    );
  }
}

export default TableRow;

