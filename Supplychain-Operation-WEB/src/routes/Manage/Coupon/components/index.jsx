import React, { Component } from 'react';
import moment from 'moment';
import { browserHistory, Link } from 'react-router';
import { message, Popconfirm } from 'antd';
import ListPage from '../../../../components/ListPage';
import './index.scss';

const timeFormatStr = 'YYYY-MM-DD HH:mm';

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this.props.loadData({
      ...this.props.searchParams,
      ...this.props.page,
    });
  }

  getColumns = () => {
    const {
      updateStatus,
      couponDelete,
      loadData,
    } = this.props;
    return [
      {
        label: 'ID',
        name: 'couponId',
        search: true,
        hidden: true,
      }, {
        label: '优惠券ID',
        name: 'couponId',
      }, {
        label: '名称',
        name: 'couponName',
        search: true,
        render: (text, record) => (
          <Link to={{ pathname: `/Manage/CouponDetail/${record.couponId}`,
            state:{ mode: 'view', status: record.status } }}// 将该条记录的当前状态传过去，可以根据该状态来决定是否展示编辑按钮
          >{text}</Link>
        ),
      }, {
        label: '备注',
        name: 'remark',
      }, {
        label: '类型',
        name: 'couponType',
        type: 'select',
        data: {
          fullcut: '满减券',
          discount: '满折券',
        },
        render: (text, record) => {
          if (record.couponType === 'fullcut') {
            return '满减券';
          }
          return '满折券';
        },
        search: true,
      },
      {
        label: '优惠规则',
        render: (text, record) => {
          const overPrice = record.overPrice / 100;
          const price = record.price / 100;
          if (record.couponType === 'fullcut') {
            return (
              <p>满{overPrice}减{price}元</p>
            );
          }
          return (
            <p>满{overPrice}打{record.discount / 10}折</p>
          );
        },
      }, {
        label: '发放总数',
        name: 'quantity',
      }, {
        label: '已领取',
        name: 'receiveNum',
      }, {
        label: '已使用',
        name: 'useNum',
        type: 'select',
      },
      {
        label: '有效时间',
        name: 'validTime',
        width: 125,
        render: (text, record) => {
          if (record.useTimeStart && record.useTimeEnd) {
            return (
              <div>
                <p>{moment(record.useTimeStart).format(timeFormatStr)}</p>
                <p>{moment(record.useTimeEnd).format(timeFormatStr)}</p>
              </div>
            );
          }
          return (
            <p>自领取后{record.intervalDay}天可使用</p>
          );
        },
      }, {
        label: '状态',
        name: 'status',
        type: 'select',
        data: { on: '启用', up:  '停用' },
        search: true,
        render: (text, record) => {
          if (record.status === 'on') {
            return '启用';
          }
          return '停用';
        },
      }, {
        label: '最近修改人/时间',
        name: 'updateUser',
        width: 125,
        render: (text, record) => (
          <div>
            <p>{record.updateUser}</p>
            <p>{moment(record.updateTime).format(timeFormatStr)}</p>
          </div>
        ),
      }, {
        label: '创建人',
        name: 'createUser',
        hidden: true,
      }, {
        label: '创建人/时间',
        name: 'createUser',
        width: 125,
        render: (text, record) => (
          <div>
            <p>{record.createUser}</p>
            <p>{moment(record.createTime).format(timeFormatStr)}</p>
          </div>
        ),
      }, {
        label: '操作',
        name: 'action',
        width: 130,
        render:(text, record) => {
          const sign = record.status === 'on' ? (
            <Popconfirm
              title="是否确认停用?"
              okText="确认"
              cancelText="取消"
              onConfirm={() => {
                updateStatus({
                  couponId:record.couponId,
                  status:'up',
                }).then((success) => {
                  if (success) {
                    message.success('操作成功');
                    loadData({
                      ...this.props.searchParams,
                      ...this.props.page,
                    });
                  } else {
                    loadData({
                      ...this.props.searchParams,
                      ...this.props.page,
                    });
                  }
                });
              }}
            >
              <span><a>停用</a></span>
            </Popconfirm>
          ) : (
            <span>
              <span>
                <Link to={{ pathname: `/Manage/CouponDetail/${record.couponId}`, state:{ mode: 'edit' } }}>编辑</Link>
              </span>
              <span> | </span>
              <Popconfirm
                title="是否确认启用?"
                okText="确认"
                cancelText="取消"
                onConfirm={() => {
                  updateStatus({
                    couponId:record.couponId,
                    status:'on',
                  }).then((success) => {
                    if (success) {
                      message.success('操作成功');
                      loadData({
                        ...this.props.searchParams,
                        ...this.props.page,
                      });
                    } else {
                      loadData({
                        ...this.props.searchParams,
                        ...this.props.page,
                      });
                    }
                  });
                }}
              >
                <span><a>启用</a></span>
                <span> | </span>
              </Popconfirm>
              <Popconfirm
                title="是否确认删除?"
                okText="确认"
                cancelText="取消"
                onConfirm={() => {
                  couponDelete({
                    couponId:record.couponId,
                  }).then((success) => {
                    if (success) {
                      message.success('操作成功');
                      loadData({
                        ...this.props.searchParams,
                        ...this.props.page,
                      });
                    } else {
                      loadData({
                        ...this.props.searchParams,
                        ...this.props.page,
                      });
                    }
                  });
                }}
              >
                <span><a>删除</a></span>
              </Popconfirm>
            </span>
          );
          return (
            <div>
              {sign}
            </div>
          );
        },
      },
    ];
  }

  getButtons = () => [
    {
      label: '新建',
      onClick: () => browserHistory.push('/Manage/CouponDetail/0'),
    },
  ]

  render() {
    const {
      data,
      loading,
      page,
      loadData,
      changeSearch,
      searchParams,
    } = this.props;

    const breadcrumb = [
      {
        id: '1',
        name: '计算中心',
      }, {
        id: '2',
        name: '提现记录',
      },
    ];

    const columns = this.getColumns();

    const buttons = this.getButtons();

    return (
      <div style={{ width: '100%' }} className="m-coupon m-checkoutList">
        <ListPage
          title={'当前位置：优惠券列表'}
          breadcrumb={breadcrumb}
          columns={columns}
          rowKey={'couponId'}
          data={data}
          loading={loading}
          page={page}
          buttons={buttons}
          search={loadData}
          changeSearch={changeSearch}
          searchParams={searchParams}
        />
      </div>
    );
  }
}

export default View;
