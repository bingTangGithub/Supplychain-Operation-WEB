import React, { Component } from 'react';
import { Link } from 'react-router';
import moment from 'moment';
import ListPage from '../../../../components/ListPage';
import { isArray } from '../../../../util';

import './style.scss';

const now = new Date().getTime();
const minTime = now -
  (moment(now).hour() * 3600000) -
  (moment(now).minute() * 60000) -
  (moment(now).second() * 1000) -
  moment(now).millisecond() -
  (24 * 3600000 * 6);
class View extends Component {
  componentDidMount() {
    this.props.search(this.props.searchParams);
  }

  componentWillUnmount() {
    this.props.reset();
  }

  pageChange = (page) => {
    const {
      search,
      searchParams,
    } = this.props;

    const { confirmDate } = searchParams;
    if (confirmDate && isArray(confirmDate.value)) {
      searchParams.confirmDateStart = moment(confirmDate.value[0]).format('YYYY-MM-DD 00:00:00');
      searchParams.confirmDateEnd = moment(confirmDate.value[1]).format('YYYY-MM-DD 23:59:59');
    }
    search({
      ...searchParams,
      pageNo: page.current,
      pageSize: page.pageSize,
    });
  }

  render() {
    const {
      buyerList,
    } = this.props;
    const columns = [
      {
        label: '商家名称',
        name: 'buyerId',
        type: 'select',
        valueName: 'id',
        displayName: 'name',
        showSearch: true,
        search: true,
        action: this.props.fetchBuyerList,
        resetSelect: this.props.resetBuyerlist,
        page: buyerList,
        hidden: true,
      },
      {
        label: '商家名称',
        name: 'buyer',
      },
      {
        label: '卖家',
        name: 'shopName',
        search: true,
      },
      {
        label: '收款单ID',
        name: 'id',
        search: true,
      },
      {
        label: '联系电话',
        name: 'userPhone',
        hidden: true,
      },
      {
        label: '订单ID',
        name: 'orderNo',
        search: true,
        render:  (text, record) => {
          const { orderNo } = record;
          let orderNoArr = [];
          if (orderNo) {
            orderNoArr = orderNo.split(',');
          }
          return (
            <div> {
              orderNoArr.map((item) =>
                <span key={item}>{item}<br /></span>
              )
            }
            </div>
          );
        },
      },
      {
        label: '收款时间',
        name: 'confirmDate',
        search: true,
        allowClear: false,
        minTime,
        type: 'twodateRange',
        render:  (text, record) => (
          <div>{record.confirmDate ? moment(record.confirmDate).format('YYYY-MM-DD HH:mm:ss') : ''}</div>
        ),
      },
      {
        label: '收款金额',
        name: 'actuallyPayAmount',
        render: (text, record) => (
          <div>￥{(record.actuallyPayAmount / 100).toFixed(2)}</div>
        ),
      },
      {
        title: '操作',
        key: 'action',
        render: (text, record) => (
          <Link
            to={`/Manage/CheckoutDetail/${record.id}`}
            className="add-btn ant-btn ant-btn-primary"
          >查看详情
          </Link>
        ),
      },
    ];

    return (
      <div style={{ width:'100%' }} className="m-checkoutList">
        <ListPage
          {...this.props}
          title="当前位置：收款单列表"
          onChange={this.pageChange}
          columns={columns}
          rowKey="id"
        />
      </div>
    );
  }
}

export default View;
