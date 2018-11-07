import React, { Component } from 'react';
import { Popover, Button, Modal, Tag } from 'antd';
import { DeepClone } from '@xinguang/common-tool';
import ListPage from '../../../../components/ListPage';
import './index.scss';

class GoodsModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productStatus: { 0: '上架', 1: '下架' },
    };
  }

  getPopoverContent = (showObj) => {
    const { record, keyArray, valArray } = showObj;
    const { skuInfo } = record;
    return (
      <div
        style={{ width: '400px', maxHeight: '272px', overflow: 'scroll', lineHeight: '30px', textAlign: 'center' }}
      >
        <div className="ant-row" style={{ background: '#F3F3F3' }}>
          {keyArray.map((item) => <div className="ant-col-12" key={item}>{item}</div>)}
        </div>
        { // 具体数据
          skuInfo.length === 0
            ? <div className="ant-row" >暂无详情</div>
            : skuInfo.map((item) => (
              <div
                className="ant-row"
                key={item.skuId}
                style={{ border: '1px solid grey' }}
              >{valArray.map((valItem) => {
                  const eachValItem = item[valItem];
                  const sign = (valItem === 'sellingPrice' ? (eachValItem / 100).toFixed(2) : eachValItem);
                  return valItem === 'specs' ?
                    <div className="ant-col-12" key={eachValItem} >
                      {
                        JSON.parse(item.specs).map((eachSpec, index) => {
                          if (index === 0) {
                            return eachSpec.specValue;
                          }
                          return ` ，${eachSpec.specValue}`;
                        })
                      }
                    </div>

                    : <div className="ant-col-12" key={eachValItem} >
                      { sign }
                    </div>;
                })}
              </div>
            ))
        }
      </div>
    );
  }

  productOperate = (reqObj) => {
    const that = this;
    const {
      spuId,
      operateType,
    } = reqObj;
    const {
      productOperate,
      search,
      operateData,
      modalShowChange,
      data,
    } = that.props;
    const reqOperateObj = {
      operateType,
      spuId,
    };

    // 请求操作接口状态的操作
    productOperate(reqOperateObj).then((response) => {
      // 操作成功
      if (response && response.success) {
        const { saleStatus } = response.data;
        data.forEach((item, index) => {
          if (item.spuId === spuId) {
            // 若是删除操作，刷新列表
            if (operateType === 'delete') {
              search(that.props.searchParams);
            } else {
              // 若是上架、下架时修改状态
              const operatedItem = { ...data[index], saleStatus };
              const dataClone = DeepClone.deepClone(data);
              dataClone[index] = operatedItem;
              operateData(dataClone);
            }
            modalShowChange({ modalShow:false });
          }
        });
      }
    });
  }

  canOperate = (reqObj) => {
    const that = this;
    that.props.modalShowChange(reqObj);
  }

  handleOk = () => {
    this.productOperate(this.props.operatedObj);
  }

  handleCancel = () => {
    this.props.modalShowChange({ modalShow:false });
  }

  popoverShow = (showObj) => {
    const content = this.getPopoverContent(showObj);
    this.setState({
      content,
    });
  }
  render() {
    const { content, productStatus } = this.state;
    const { visible, onCancel, onOk, tempSpuItemList, tagDelete, addSpuList } = this.props;
    const columns = [
      {
        label: '商品ID',
        name: 'spuId',
        search: true,
        pattern: /^[0-9]*$/,
        patternMsg: '只能输入数字',
      }, {
        label: '商品名称',
        name: 'spuName',
        search: true,
        max: 32,
        render: (text, record) => {
          const { imageUrl, name } = record;
          return (
            <div style={{ width: '100%' }}>
              <div style={{ float: 'left', marginRight: '6px' }}>
                <span><img src={imageUrl} alt="" style={{ width: 25 }} /></span>
              </div>
              <div style={{ float: 'left', marginTop: '15px' }}>
                <p>{name}</p>
              </div>
            </div>
          );
        },
      }, {
        label: '关联状态',
        name: 'inFrontCate',
        hidden: true,
        search: true,
        type: 'select',
        data: { 1: '未归前端分类' },
      }, {
        label: '后台分类',
        name: 'categoryName',
      }, {
        label: '库存',
        name: 'totalStock',
        render: (text, record) => {
          const showObj = {
            record,
            keyArray: ['规格', '账面库存'],
            valArray: ['specs', 'quantity'],
          };
          return (
            <Popover
              content={content}
              title=""
              trigger="hover"
            >
              <a target="#" role="button" tabIndex={0} onMouseOver={this.popoverShow.bind(this, showObj)}> {text}</a>
            </Popover>
          );
        },
      }, {
        label: '价格(￥)',
        name: 'showPrice',
        render: (text, record) => {
          const showObj = {
            record,
            keyArray: ['规格', '价格'],
            valArray: ['specs', 'sellingPrice'],
          };
          return (
            <Popover
              content={content}
              title=""
              trigger="hover"
            >
              <a target="#" role="button" tabIndex={0} onMouseOver={this.popoverShow.bind(this, showObj)}>
                {(text / 100).toFixed(2)}</a>
            </Popover>
          );
        },
      }, {
        label: '上架状态',
        name: 'saleStatus',
        render: (text) => (
          <span>{productStatus[text]}</span>
        ),
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => (<Button
          icon="plus-circle-o"
          onClick={() => { addSpuList(record); }}
        >加入</Button>),
      },
    ];

    const showList = tempSpuItemList.filter(({ operateType }) => operateType !== 'delete');

    return (
      <Modal
        title="选择商品"
        visible={visible}
        onOk={onOk}
        onCancel={onCancel}
        width={980}
        bodyStyle={{ maxHeight: '635px' }}
      >
        <div className="goods-modal-spu-list">
          <ListPage
            {...this.props}
            columns={columns}
            rowKey="spuId"
          />
        </div>
        <div className="goods-modal-spu-items">
          {showList.length
            ? showList.map(({ spuId, spuName, timeStamp }) => (<Tag
              key={`${spuId}-${timeStamp}`}
              color="#faad14"
              closable
              style={{ height: '26px', lineHeight: '24px', float: 'left' }}
              afterClose={() => tagDelete({ spuId, operateType: 'delete', temp: true })}
            >{spuName}</Tag>))
            : <span style={{ color: '#9e9e9e', fontWeight: 'lighter' }}>请加入需要关联该前端分类的商品</span>
          }
        </div>
      </Modal>
    );
  }
}

export default GoodsModal;
