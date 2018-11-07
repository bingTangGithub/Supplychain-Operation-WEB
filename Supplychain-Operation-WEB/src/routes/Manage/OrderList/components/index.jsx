/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import OrderListPage from '../../../../components/OrderListPage';
import './style.scss';
import { fenToYuan } from '../../../../util';

const now = new Date().getTime();
const minTime = now -
  (moment(now).hour() * 3600000) -
  (moment(now).minute() * 60000) -
  (moment(now).second() * 1000) -
  moment(now).millisecond() -
  (24 * 3600000 * 11);
class View extends Component {
  componentDidMount() {
    this.props.search(this.props.searchParams);
  }

  componentWillUnmount() {
    this.props.reset();
  }

  // search(params) {
  //   this.props.search(params);
  // }

  showMarge = (record) => {
    let str;
    if (record.orderProductList && record.orderProductList.length > 0) {
      return record.orderProductList.map((item, index) => {
        str = item.productName;
        return (<div className="product" key={`product${index}`} >
          <div className="product-img" >
            <img src={item.img} alt={str} width="80" height="80" />
          </div>
          <div className="name-and-sku" >
            <p>{str}</p>
            <p><span>{item.specList && item.specList.map(
              (item2, index2) => (
                <span
                  className="sku-list"
                  key={`sku${index2}`}
                >{item2.specName}:{item2.specValue}&nbsp;&nbsp;&nbsp;&nbsp;</span>
              )
            )}</span></p>
          </div>
          <div className="productPrice FL vertical-text-center">
            <span>{fenToYuan(item.productPrice, 2)}</span>
          </div>
          <div className="productNumber FL vertical-text-center">
            <span>{item.productNumber}</span>
          </div>
        </div>
        );
      });
    }
    return (<div>
      none
    </div>);
  }

  render() {
    const {
      data,
      page,
      buyerList,
    } = this.props;

    const columns = [
      {
        label: '联系电话',
        search: true,
        hidden:true,
        name: 'buyerNickname',
      },
      {
        label: '订单编号',
        search: true,
        hidden:true,
        name: 'orderNo',
        max: 30,
      },
      {
        label: '订单信息',
        name: 'storeCode',
        max: 30,
        className:'order-info',
        render:(text, record) => {
          const objc = {
            children:<div>
              <div className="order-info" >
                {this.showMarge(record)}
              </div>
              <div className="order-info-top">
                <span>{record.createTime}</span>
                <span>订单编号：{record.orderNo}</span>
                <span>卖家名称: {record.shopName}</span>
                <span hidden>联系电话：{record.buyerNickname}</span>
                <span style={{ display: record.buyer ? 'inline' : 'none' }}>
                  商家名称: {record.buyer}
                  {
                    record.receiverType === '1' ? <span className="vip-tag">VIP</span> : null
                  }
                </span>
              </div>
            </div>,
            props: {},
          };
          objc.props.colSpan = 3;
          return objc;
        },
      },
      {
        label: '单价（元）',
        name: 'productPrice',
        className:'productPrice',
        render: (value) => {
          const obj = {
            children: value,
            props: {},
          };
          obj.props.colSpan = 0;
          return obj;
        },
      },
      {
        label: '数量',
        name: 'productNumber',
        className:'productNumber',
        render: (value) => {
          const obj = {
            children: value,
            props: {},
          };
          obj.props.colSpan = 0;
          return obj;
        },
      },
      {
        label: '商家名称',
        name: 'buyerId',
        type: 'select',
        valueName: 'id',
        displayName: 'name',
        showSearch: true,
        search: true,
        action: this.props.fetchBuyerList,
        // action: (param) => {
        //   if (param.name.trim()) {
        //     return this.props.fetchBuyerList(param);
        //   }
        //   return new Promise((resolve) => resolve());
        // },
        resetSelect: this.props.resetBuyerlist,
        page: buyerList,
        hidden: true,
      },
      {
        label: '收货地址',
        name: 'orderAddress',
        search:false,
        className:'pd010',
      },
      {
        label: '订单状态',
        name: 'orderStatus',
        key: 'orderStatus',
      },
      {
        label: '优惠券（元）',
        name: 'discount',
        key: 'discount',
      },
      {
        label: '应收款（元）',
        name: 'orderAmountTotal',
        key: 'orderAmountTotal',
      },
      {
        label: '下单时间',
        name:'createTime',
        type:'twodateRange',
        minTime,
        allowClear: false,
        search: true,
        hidden:true,
      },
      {
        label: '操作',
        name: 'action',
        render: (text, record) => (
          <span>
            <Link
              to={`/Manage/OrderDetail/${record.orderNo}&&${record.shopId}`}
              className="add-btn ant-btn ant-btn-primary"
            >查看详情
            </Link>
          </span>
        ),
      },
    ];

    return (
      <div style={{ width:'100%' }} className="m-orderList">
        <OrderListPage
          {...this.props}
          title="当前位置：订单管理&gt;订单列表"
          columns={columns}
          data={data.list}
          page={page}
          TableClassName="order"
          rowKey="orderNo"
        />
      </div>
    );
  }
}

export default View;
