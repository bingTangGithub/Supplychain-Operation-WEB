import React, { Component } from 'react';
import { Popover, Button, Modal } from 'antd';
import { browserHistory, Link } from 'react-router';
import { DeepClone } from '@xinguang/common-tool';
import ListPage from '../../../../components/ListPage';
import './index.scss';

class View extends Component {
  constructor(props) {
    super(props);

    this.state = {
      productStatus: { 0: '上架', 1: '下架' },
      verifyStatus: { 1: '待审核', 2: '未通过', 3: '通过' },
      operateTypeObj: {
        上架: 'onSale',
        下架: 'offSale',
        审核: 'verify',
        // 删除: 'delete',
        // 编辑: 'edit',
      },
      groundingBtn: {
        type: 'primary',
        label: '上架',
        icon: 'arrow-up',
      },
      undercarriageBtn: {
        type: 'default',
        label: '下架',
        icon: 'arrow-down',
      },
      verify: {
        type: 'default',
        label: '审核',
        icon: 'eye-o',
      },
      // editBtn: {
      //   type: 'default',
      //   label: '编辑',
      //   icon: 'edit',
      // },
      // deleteBtn: {
      //   type: 'danger',
      //   label: '删除',
      //   icon: 'delete',
      // },
      btnArr: {
        1: {
          0: ['verify'],
          1: ['verify'],
        },
        3: {
          0: ['undercarriageBtn'],
          1: ['groundingBtn'],
        },
      },
    };
  }

  componentDidMount() {
    this.resetPageData(this.props, this.props.route.path.toLowerCase());
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.route.path !== nextProps.route.path) {
      this.resetPageData(nextProps, nextProps.route.path.toLowerCase());
    }
  }

  componentWillUnmount() {
    this.props.reset();
  }

  getPopoverContent = (showObj) => {
    const { record: { skuInfo }, keyArray, valArray } = showObj;
    return (
      <div
        style={{ width: '400px', maxHeight: '272px', overflow: 'scroll', lineHeight: '30px', textAlign: 'center' }}
      >
        {
          // 标题
          <div className="ant-row" style={{ background: '#F3F3F3' }}>
            {
              keyArray.map((item) =>
                <div className="ant-col-12" key={item}>{item}</div>
              )
            }
          </div>
        }
        {
          // 具体数据
          skuInfo.length === 0 ? <div className="ant-row" >暂无详情</div> :

            skuInfo.map((item) => (
              <div
                className="ant-row"
                key={item.skuId}
                style={{ border: '1px solid grey' }}
              >
                {
                  valArray.map((valItem) => {
                    const { specList } = item; // 规格列表
                    const eachValItem = item[valItem];
                    let result;
                    switch (valItem) {
                      case 'specs' :
                        result = (<div className="ant-col-12" key={eachValItem} >
                          { specList.map(({ specValue }) => specValue).join(' ，') }
                        </div>);
                        break;
                      case 'price':
                        result = (<div className="ant-col-12" key={eachValItem} >
                          { (eachValItem / 100).toFixed(2) }
                        </div>);
                        break;
                      default:
                        result = (<div className="ant-col-12" key={eachValItem} >
                          { eachValItem }
                        </div>);
                    }
                    return result;
                  })
                }
              </div>
            ))
        }
      </div>
    );
  }

  resetPageData = (props, pageName) => {
    // props.reset();
    props.setSearchParams({ data: [] });

    const targetParams = {
      productlist: {
        pageNo: 1,
        pageSize: 10,
        verifyStatus: undefined,
      },
      verifylist: {
        pageNo: 1,
        pageSize: 10,
        verifyStatus: '1',
      },
    }[pageName];
    props.search(targetParams).then(() => {
      pageName === 'productlist' && props.getShopList();
    });

    setTimeout(() => props.setSearchParams({
      searchParams: targetParams,
      pageName,
    }), 0);
  }

  productOperate = (reqObj) => {
    const that = this;
    const {
      spuId,
      operateType,
      shopId,
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
      shopId,
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

  operateStatus = (record, label) => {
    const { spuId, shopId } = record;
    const { operateTypeObj } = this.state;
    const operateType = operateTypeObj[label];
    const reqObj = {
      spuId,
      operateType,
      modalShow: true,
      shopId,
    };

    switch (operateType) {
      case 'verify':
        browserHistory.push(`/Manage/ProductDetailEdit/verify@@${spuId}@@${shopId}`);
        break;
      case 'edit':
        browserHistory.push(`/Manage/ProductDetailEdit/edit@@${spuId}@@${shopId}`);
        break;
      case 'delete':
        this.props.modalShowChange(reqObj);
        break;
      default: // 上架、下架操作
        this.canOperate(reqObj);
    }
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
    const { btnArr, productStatus, content, verifyStatus } = this.state;
    const { modalShow, modalText, shopList } = this.props;
    const columns = [
      {
        label: '商品编码',
        name: 'spuId',
        search: true,
        pattern: /^[0-9]*$/,
        patternMsg: '只能输入数字',
      },
      {
        label: '商品名称',
        name: 'spuName',
        hidden: true,
        search: true,
        max: 64,
      },
      {
        label: '店铺名称',
        name: 'shopId',
        search: true,
        hidden: true,
        type: 'select',
        data: shopList,
      },
      {
        label: '商品名称',
        name: 'name',
        render: (text, record) => {
          const { imageUrl, name, spuId, shopId } = record;
          return (
            <Link to={`/Manage/ProductDetailEdit/detail@@${spuId}@@${shopId}`} style={{ width: '100%' }}>
              <div style={{ float: 'left', marginRight: '6px' }}>
                <span><img src={`${imageUrl}?x-oss-process=image/resize,m_lfit,w_50,h_50,limit_1`} alt="" /></span>
              </div>
              <div style={{ float: 'left', marginTop: '9px' }}>
                <p>{name}</p>
              </div>
            </Link>
          );
        },
      },
      {
        label: '分类',
        name: 'categoryName',
      },
      {
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
      },
      {
        label: '价格(￥)',
        name: 'showPrice',
        render: (text, record) => {
          const showObj = {
            record,
            keyArray: ['规格', '价格'],
            valArray: ['specs', 'price'],
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
      },
      {
        label: '销售状态',
        name: 'saleStatus',
        search: true,
        type: 'select',
        data: productStatus,
        render: (text) => productStatus[text],
      },
      {
        label: '审核状态',
        name: 'verifyStatus',
        search: true,
        type: 'select',
        data: { 2: '未通过', 3: '通过' },
        render: (text) => verifyStatus[text],
      },
      {
        label: '店铺名称',
        name: 'shopName',
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          if (record.verifyStatus === '2') {
            return <div />;
          }
          const btnShowArr = ((btnArr[record.verifyStatus] || {})[record.saleStatus] || []).map((item) =>
            this.state[item]
          );
          return (
            <span>
              {
                btnShowArr.map((item) => (
                  <Button
                    key={item.label}
                    style={{ marginLeft: '20px' }}
                    {...item}
                    onClick={this.operateStatus.bind(this, record, item.label)}
                  >{item.label}</Button>
                ))
              }
            </span>
          );
        },
      },

    ];

    // const buttons = [
    //   {
    //     label: '添加',
    //     onClick: () => {
    //       browserHistory.push('/Manage/ProductDetailEdit/new');
    //     },
    //   },
    // ];

    const isVerifyList = this.props.route.path.toLowerCase() === 'verifylist';
    return (
      <div style={{ width:'100%' }} className="m-productList">
        <ListPage
          {...this.props}
          noSearch={isVerifyList}
          title={`当前位置：${isVerifyList ? '待审核商品' : '商品列表'}`}
          columns={columns}
          rowKey="spuId"
          // buttons={buttons}
        />
        <Modal
          title=""
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          visible={modalShow}
        >
          <p style={{ textAlign: 'center' }}>{modalText}</p>
        </Modal>
      </div>
    );
  }
}

export default View;
