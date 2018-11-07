import React, { Component } from 'react';
import moment from 'moment';
import { browserHistory, Link } from 'react-router';
import ListPage from '../../../../components/ListPage';
import PopConfirm from '../../../../components/PopConfirm';

import './style.scss';

const timeFormatStr = 'YYYY-MM-DD HH:mm';
const statusMap = { 0: '未上线', 1:  '已上线', 2: '已下线' };
const activityRateStatusMap = { 1: '未开始', 2:  '进行中', 3: '已结束' };

class View extends Component {
  componentDidMount() {
    this.props.loadData({
      ...this.props.searchParams,
      ...this.props.page,
      pageNo: 1,
      pageSize: 10,
    });
  }

  render() {
    const {
      data,
      loading,
      page,
      updateStatus,
      activityDelete,
      loadData,
      changeSearch,
      searchParams,
    } = this.props;

    const columns = [
      {
        label: '活动ID',
        name: 'id',
        search: true,
      },
      {
        label: '活动名',
        name: 'name',
        search: true,
      },
      {
        label: '备注',
        name: 'remark',
      },
      {
        label: '活动时间',
        name: 'activityTime',
        width: 125,
        render: (text, record) => (
          <div>
            <p>{moment(record.activityTimeStart).format(timeFormatStr)}</p>
            <p>{moment(record.activityTimeEnd).format(timeFormatStr)}</p>
          </div>
        ),
      },
      {
        label: '状态',
        name: 'status',
        type: 'select',
        data: statusMap,
        search: true,
        render: (text, record) => statusMap[record.status] || '-',
      },
      {
        label: '活动进度',
        name: 'activityRateStatus',
        type: 'select',
        data: activityRateStatusMap,
        render: (text, record) => activityRateStatusMap[record.activityRateStatus] || '-',
      },
      {
        label: '最近修改人/时间',
        name: 'updateUserName',
        width: 125,
        render: (text, record) => (
          <div>
            <p>{record.updateUserName}</p>
            <p>{moment(record.updateTime).format(timeFormatStr)}</p>
          </div>
        ),
      },
      {
        label: '创建人',
        name: 'createUserName',
        width: 125,
        hidden: true,
      },
      {
        label: '创建人/时间',
        width: 125,
        render: (text, record) => (
          <div>
            <p>{record.createUserName}</p>
            <p>{moment(record.createTime).format(timeFormatStr)}</p>
          </div>
        ),
      },
      {
        label: '操作',
        name: 'action',
        width: 180,
        render:(text, record) => {
          if (record.status !== 2) {
            const sign = record.status === 1 ? (
              <PopConfirm
                {...this.props}
                title="是否确认停用?"
                cb={() => updateStatus({ id: record.id, status: 2 })}
              ><span><a>下线</a></span></PopConfirm>
            ) : (
              <span>
                <PopConfirm
                  {...this.props}
                  title="确认上线该活动？"
                  cb={() => updateStatus({ id: record.id, status: 1 })}
                ><span><a>上线</a> | </span></PopConfirm>
                <PopConfirm
                  {...this.props}
                  title="是否确认删除?"
                  cb={() => activityDelete({ id: record.id })}
                ><span><a>删除</a></span></PopConfirm>
              </span>
            );
            return (
              <div>
                <span>
                  <Link to={{ pathname: `/Manage/ActivityDetail/${record.id}`, state:{ mode: 'edit' } }}>编辑</Link>
                </span>
                <span> | </span>
                {sign}
              </div>
            );
          }
          return (
            <div>
              <span>
                <Link to={{ pathname: `/Manage/ActivityDetail/${record.id}`, state:{ mode: 'view' } }}>查看</Link>
              </span>
              <span> | </span>
              <PopConfirm
                {...this.props}
                title="是否确认删除?"
                cb={() => activityDelete({ id: record.id })}
              ><span><a>删除</a></span></PopConfirm>
            </div>
          );
        },
      },
    ];

    const buttons = [{
      label: '新建',
      onClick: () => browserHistory.push('/Manage/ActivityDetail/0'),
    }];

    return (
      <div style={{ width: '100%' }} className="m-checkoutList">
        <ListPage
          title={'当前页面：限时活动列表'}
          columns={columns}
          rowKey={'id'}
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
