import React, { Component } from 'react';
import { Steps, Button, Tabs, Modal, Select, message } from 'antd';
import moment from 'moment';
import { Link } from 'react-router';
import ListPage from '../../../../components/ListPage';
import './index.scss';

const Step = Steps.Step;
const Option = Select.Option;
const TabPane = Tabs.TabPane;

const ORDER_STATUS = ['待发货', '待签收', '已完成', '已关闭'];
const PAY_METHOD = {
  CASH_ON_DELIVERY: '货到付款',
  ONLINE: '在线支付',
};
const CANCEL_TYPE = {
  BUYER : '买家取消',
  SELLER: '卖家取消',
  SYSTEM: '系统取消',
  OPERATOR: '运营取消',
};
class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delModalVisible: false,
      cancelReason: '',
      data: {
        orderAmountTotal: 0,
        logisticsFee: 0,
        payMethod: '',
        createTime: '',
        payTime: '',
        finishTime: '',
        deliveryTime: '',
        orderStatus: '',
        overTime: '',
        buyerNickname: '',
        shopName: '',
        orderNo: '',
        earliestServiceTime: '',
        discountAmount: 0,
        productAmountTotal: 0,
        actuallyPayAmount: 0,
        orderAddress: {
          province: '',
          detailAddress: '',
          phone: '',
          district: '',
          contactName: '',
          city: '',
        },
        orderProductList: [],
      },
    };
  }
  componentDidMount() {
    const {
      sendRequest,
      searchCancelReason,
      routeParams,
      // searchLogistics,
    } = this.props;
    const paramsArr = routeParams.id.split('&&');
    sendRequest({
      orderNo: paramsArr[0],
      shopId: paramsArr[1],
    });
    searchCancelReason();
  }
  componentWillReceiveProps(nextProps) {
    const {
      data,
    } = nextProps;
    if (data && typeof data === 'object') {
      this.setState({
        data,
      });
    }
  }
  cancelOrder() {
    this.setState({
      delModalVisible: true,
    });
  }
  handleCancel() {
    this.setState({
      delModalVisible: false,
    });
  }
  handleOk(orderNo) {
    const {
      cancelOrder,
      sendRequest,
      routeParams,
    } = this.props;
    const that = this;
    const {
      cancelReason,
    } = this.state;
    const paramsArr = routeParams.id.split('&&');
    if (cancelReason) {
      cancelOrder({ orderNo, cancelReason, shopId: paramsArr[1] }).then(() => {
        that.setState({
          delModalVisible: false,
        });
        sendRequest({
          orderNo: paramsArr[0],
          shopId: paramsArr[1],
        });
      });
    } else {
      message.warning('请选择取消理由');
    }
  }
  reasonSelect(cancelReason) {
    this.setState({
      cancelReason,
    });
  }

  toRMB = (moneyFen = 0) => `￥${(moneyFen / 100).toFixed(2)}`;

  render() {
    const {
      data,
    } = this.state;
    const {
      getStorePhone,
    } = this.props;
    const {
      createTime,
      finishTime,
      deliveryTime,
      orderStatus,
      buyerNickname,
      orderNo,
      earliestServiceTime,
      latestServiceTime,
      discountAmount = 0,
      orderAddress: {
        province,
        detailAddress,
        phone,
        district,
        contactName,
        city,
      },
      orderAmountTotal,
      payMethod,
      cancelType,
      cancelReason,
      shopName,
      orderProductList,
      productAmountTotal,
      receiverType,
      buyer,
    } = data;
    const {
      cancelList = [],
    } = this.props;
    let newOrderProductList = [];
    if (orderProductList.length) {
      newOrderProductList = orderProductList.map((val, index) => {
        const obj = val;
        obj.key = index;
        return obj;
      });
    }
    const columns = [
      {
        label: '商品信息',
        name: 'product',
        render: (text, record) => {
          const {
            img,
            productName,
            specList,
          } = record;
          const SPEC = specList.map((val, index) => {
            const {
              specName,
              specValue,
            } = val;
            const key = index;
            return (
              <span key={key}>{specName}：{specValue}</span>
            );
          });
          return (
            <div className="productInfo">
              <img src={img} alt="" />
              <div className="spec">
                <span>{productName}</span>
                {SPEC}
              </div>
            </div>
          );
        },
      }, {
        label: '单价（元）',
        name: 'productPrice',
        render: (text) => (text / 100).toFixed(2),
      }, {
        label: '数量',
        name: 'productNumber',
      }, {
        label: '合计（元）',
        name: 'sum',
        render: (value, row, index) => {
          const obj = {
            children: (<div className="fee">
              <p>{(productAmountTotal / 100).toFixed(2)}</p>
              <p>{PAY_METHOD[payMethod]}</p>
            </div>),
            props: {},
          };
          if (index !== 0) {
            obj.props.colSpan = 0;
          } else {
            obj.props.rowSpan = newOrderProductList.length;
          }
          return obj;
        },
      },
      {
        label: '订单状态',
        render: (value, row, index) => {
          const obj = {
            children: (<span> {ORDER_STATUS[orderStatus - 2]} </span>),
            props: {},
          };
          if (index !== 0) {
            // obj.props.rowSpan = 0;
            obj.props.colSpan = 0;
          } else {
            obj.props.rowSpan = newOrderProductList.length;
          }
          // These two are merged into above cell
          return obj;
        },
      },
    ];
    return (
      <div className="m-orderdetail" id="orderdetail">
        <h2>当前位置：订单管理 &gt; 订单详情</h2>
        <div className="status">
          <div className="currentStatus">当前状态：<span>{ORDER_STATUS[orderStatus - 2]}</span></div>
          { Number(orderStatus) !== 5 && <Steps progressDot current={Number(orderStatus) - 2}>
            {/* <Step title="提交订单" description={moment(createTime).format('YYYY-MM-DD hh:mm:ss')} /> */}
            <Step title="待发货" description={createTime ? moment(createTime).format('YYYY-MM-DD HH:mm:ss') : ''} />
            <Step title="待签收" description={deliveryTime ? moment(deliveryTime).format('YYYY-MM-DD HH:mm:ss') : ''} />
            <Step title="确认收货" description={finishTime ? moment(finishTime).format('YYYY-MM-DD HH:mm:ss') : ''} />
          </Steps> }
          {/* 状态2，待发货 */}
          { Number(orderStatus) === 2 && <div className="cancel">
            <p>
              该订单已经提交，待商家确认后发货
            </p>
            <p>你可以
              <Button type="primary" className="cancelOrder" onClick={this.cancelOrder.bind(this)}>
                取消订单
              </Button>
            </p>
          </div> }
          <Modal
            title=""
            onOk={this.handleOk.bind(this, orderNo)}
            onCancel={this.handleCancel.bind(this)}
            visible={this.state.delModalVisible}
          >
            <p style={{ textAlign: 'center', marginBottom: '20px' }}>您确定要取消该订单吗？取消订单后，不能恢复。</p>
            <Select
              style={{ display: 'block', width: '50%', margin: '0 auto' }}
              onChange={this.reasonSelect.bind(this)}
              placeholder="请选择订单取消的原因"
            >
              {
                cancelList.map((val) => (<Option key={val.value} value={val.value}>{val.label}</Option>))
              }
            </Select>
          </Modal>
          {/* 状态3，待签收 */}
          { Number(orderStatus) === 3 && <div className="cancel">
            <p>商家已经发货，请等待买家确认收货</p>
            <p>你可以
              <Button type="primary" className="cancelOrder" onClick={this.cancelOrder.bind(this)}>
                取消订单
              </Button>
            </p>
          </div> }
          {/* 状态4，已完成 */}
          { Number(orderStatus) === 4 && <div className="cancel">
            <p>本次交易已经成功。</p>
          </div> }
          {/* 状态5，订单取消 */}
          { Number(orderStatus) === 5 && <div className="cancel">
            <p>关闭类型：{CANCEL_TYPE[cancelType]}</p>
            <p>原因：{cancelReason}</p>
          </div> }
        </div>
        <div className="info">
          <Tabs defaultActiveKey="1">
            <TabPane tab="收货信息" key="1">
              <p className="left"><span>收货人：</span>{ contactName }</p>
              <p className="left"><span>收货地址：</span>{ province + city + district + detailAddress }</p>
              <p>期望送达时间：{earliestServiceTime ? moment(earliestServiceTime).format('YYYY-MM-DD HH:mm:ss') : ''}  ~
                { latestServiceTime ? moment(latestServiceTime).format('YYYY-MM-DD HH:mm:ss') : ''}
              </p>
              <p className="left"><span>联系电话：</span>
                {
                  phone || <a
                    role="button"
                    tabIndex="-1"
                    onClick={() => {
                      getStorePhone({ orderNo });
                    }}
                  >点击获取</a>
                }
              </p>
            </TabPane>
            <TabPane tab="物流信息" key="2">
              <p className="right">暂不支持物流信息，敬请期待</p>
            </TabPane>
          </Tabs>
        </div>
        <div className="products">
          <div className="header">
            <span><i>下单时间：</i>{moment(createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            <span><i>订单编号：</i>{orderNo}</span>
            <span><i>联系电话：</i>
              { buyerNickname || <a
                role="button"
                tabIndex="-1"
                onClick={() => {
                  getStorePhone({ orderNo });
                }}
              >点击获取</a>}
            </span>
            <span><i>店铺名称：</i>{shopName}</span>
          </div>
          <div className="header">
            <span><i>订单编号：</i>{orderNo}</span>
          </div>
          <div className="header" style={{ display: buyer ? 'block' : 'none' }}>
            <span><i>商家名称：</i>{buyer}</span>
            {
              receiverType === '1' ? <span className="vip-tag">VIP</span> : null
            }
          </div>
          <ListPage
            rowKey="key"
            data={newOrderProductList}
            columns={columns}
            noSearch
          />
          <div className="priceInfo">
            <div className="discount">优惠券：{ `-${this.toRMB(discountAmount)}` } </div>
            <p>商品总额：<b>{this.toRMB(productAmountTotal)}</b></p>
            <p>应收总额：<b>{this.toRMB(orderAmountTotal)}</b></p>
            {
              Number(orderStatus) === 4 ?
                <p><Link
                  to={`/Manage/CheckoutDetail/otherService&&${this.props.routeParams.id}`}
                  style={{ width: '100%' }}
                >
                  <Button type="primary" className="sendGoods" >查看收款单</Button>
                </Link></p>
                :
                <div />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default View;
