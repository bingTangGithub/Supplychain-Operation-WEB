import React, { Component } from 'react';
import ListPage from '../../../../components/ListPage';
import './index.scss';

class View extends Component {
  componentDidMount() {
    const {
      routeParams: {
        id,
      },
      search,
    } = this.props;

    const index = id.indexOf('otherService');
    let printId;
    let type;

    if (index === -1) { // 通过收款单Id 查询
      printId = id;
      type = '0';
    } else { // 通过订单Id 查询
      printId = id.split('&&')[1];
      type = '1';
    }
    search({ id: printId, type });
  }

  render() {
    const {
      allProductCost,
      logisticsFee,
      shopDiscountAmount,
      payAmount,
      orderAmountTotal,
    } = this.props;
    const columns = [
      {
        label: 'SKU编码',
        name: 'skuId',
      },
      {
        label: '商品名称',
        name: 'productName',
      },
      {
        label: '订单件数',
        name: 'productNumber',
      },
      {
        label: '实际发货数量',
        name: 'numberText',
      },
      {
        label: '单价',
        name: 'unitPrice',
      },
      {
        label: '结算金额',
        name: 'amount',
      },
    ];

    return (
      <div style={{ width:'100%' }} className="m-collectDetail">
        <ListPage
          {...this.props}
          noSearch
          title="当前位置：收款单详情"
          columns={columns}
          rowKey="listId"
        />
        <div className="all-price">
          <div className="should-price">商品总金额：{allProductCost}<span>运费：{logisticsFee} </span></div>
          <div className="discount-price">优惠金额：{shopDiscountAmount} </div>
          <div className="money">
            <div>应收总额：{payAmount}</div>
            <div>实收总额：{orderAmountTotal}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default View;
