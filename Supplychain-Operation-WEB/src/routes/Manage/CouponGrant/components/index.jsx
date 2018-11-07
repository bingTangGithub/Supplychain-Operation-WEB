import React from 'react';
import { message } from 'antd';
import { browserHistory } from 'react-router';
import detail from '../../../../decorators/detail';
import DetailPage from '../../../../components/DetailPage';
import TableList from '../../../../components/TableList';

const View = (props) => {
  const {
    record,
    save,
    addCoupon,
    delCoupon,
    addPhone,
    delPhone,
  } = props;
  const {
    coupons,
    phones,
  } = record;

  // 将优惠券ID以及手机号码处理成两个数组，用于接口请求以及下面添加优惠券以及手机号码时的逻辑判断
  const coupons1 = record.coupons.map((couopon) => couopon.couponId);
  const phonse1 = record.phones.map((phone) => phone.phoneNumber);

  const clearPage = () => {
    record.coupons = [];
    record.phones = [];
  };

  const submit = (form) => {
    if (coupons.length === 0) {
      message.error('优惠券为必填项');
    } else if (phones.length === 0) {
      message.error('手机号为必填项');
    } else {
      form.validateFields({ force: true }, (err) => {
        if (!err) {
          save({ couponIds:coupons1, phones:phonse1 }).then((success) => {
            if (success) {
              browserHistory.push('/Manage/CouponGrant');
              message.success('优惠券发放成功');
            }
          });
          clearPage();
        } else {
          clearPage();
        }
      });
    }
  };

  const columnsCoupon = [{
    title: '优惠券ID',
    dataIndex: 'couponId',
  }, {
    title: '优惠券名称',
    dataIndex: 'couponName',
  }, {
    title: '优惠券剩余数量',
    dataIndex: 'quantity',
  }, {
    title: '操作',
    dataIndex: 'operate',
    render: (text, value, index) => (
      <span>
        <span>
          <a onClick={() => delCoupon(index)} tabIndex={value.couponId} role="button">
              删除
          </a>
        </span>
      </span>
    ),
  }];

  const columnsPhone = [{
    title: '手机号',
    dataIndex: 'phoneNumber',
  }, {
    title: '操作',
    dataIndex: 'operate',
    width: 110,
    render: (text, value, index) => (
      <span>
        <span>
          <a onClick={() => delPhone(index)} tabIndex={value.index} role="button">
              删除
          </a>
        </span>
      </span>
    ),
  }];

  const buttons = [
    {
      label: '确定发放',
      type: 'primary',
      onClick: (form) => {
        submit(form);
      },
    },
  ];

  const fields = [
    {
      label: '选择优惠券',
      name: '',
      type: 'title',
    },
    {
      label: '优惠券ID',
      name: 'couponIds',
      type: 'search',
      simple: true,
      showSearch: true,
      onSearch: (value) => {
        if (value.toString() === '') {
          message.error('请输入优惠券ID');
        } else if (value.toString().indexOf(' ') > -1) {
          message.error('优惠券ID不能包含空格');
        } else if (coupons1.indexOf(value) > -1) {
          message.error('请勿添加相同的优惠券');
        } else if (coupons1.length >= 5) {
          message.error('优惠券最多添加5张');
        } else {
          addCoupon({ couponIds: [value] });
        }
      },
    },
    {
      label: '优惠券',
      name: 'couponList',
      component: TableList,
      simple: true,
      data: coupons,
      index: 'couponId',
      rowKey: 'couponId',
      columns: columnsCoupon,
    },
    {
      label: '确定发放对象',
      name: 'grantObject',
      type: 'title',
    },
    {
      label: '用户手机号',
      name: 'phone1',
      type: 'search',
      simple: true,
      phone: true,
      onSearch: (value) => {
        if (value.toString() === '') {
          message.error('请输入手机号码');
        } else if (phonse1.length >= 5) {
          message.error('手机号最多输入5个');
        } else {
          // 添加时间戳作为rowKey
          addPhone({ phoneNumber: value, timeStamp: new Date().valueOf() });
        }
      },
    },
    {
      label: '手机号',
      name: 'phoneList',
      simple: true,
      component: TableList,
      rowKey: 'timeStamp',
      data: phones,
      columns: columnsPhone,
    },
  ];

  return (
    <DetailPage
      title={'优惠券发放'}
      {...props}
      values={record}
      fields={fields}
      buttons={buttons}
    />
  );
};

export default detail(View);

