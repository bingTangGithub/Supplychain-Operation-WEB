import React, { Component } from 'react';
import moment from 'moment';
import { browserHistory, Link } from 'react-router';
import { Button, Modal } from 'antd';
import ListPage from '../../../../components/ListPage';
import './index.scss';

const statusMap = {
  0: '已上线',
  1: '已下线',
};

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

  getColumns = () => [
    {
      label: '店铺ID',
      name: 'shopNo',
      search: true,
    }, {
      label: '店铺名称',
      name: 'shopName',
      search: true,
      render: (text, record) => (
        <Link to={{ pathname: `/Manage/ShopDetail/${record.sid}`, state:{ mode: 'view' } }}>{text}</Link>
      ),
    }, {
      label: '店招图',
      name: 'storeBannerImage',
      render: (text) => (<img src={(text || [])[0]} alt="店招图" style={{ maxWidth: '120px' }} />),
    }, {
      label: '店铺状态',
      name: 'delFlag',
      type: 'select',
      data: statusMap,
      search: true,
      render: (text) => statusMap[text],
    }, {
      label: '所属城市',
      name: 'vcityName',
    }, {
      label: '门店地址',
      name: 'detailAddress',
    }, {
      label: '营业时间',
      name: 'startTime',
      render: (text, record) => (<div style={{ whiteSpace: 'nowrap' }}>
        {text}~{record.endTime}
      </div>),
    }, {
      label: '创建人/时间',
      name: 'createBy',
      width: 125,
      render: (text, record) => (
        <div>
          <p>{text}</p>
          <p>{moment(record.createTime).format('YYYY-MM-DD,HH:mm')}</p>
        </div>
      ),
    }, {
      label: '操作',
      name: 'action',
      width: 180,
      render: (text, record) => {
        const btnMap = {
          edit: {
            key: 'edit',
            onClick: () => browserHistory.push(
              { pathname: `/Manage/ShopDetail/${record.sid}`, state:{ mode: 'edit' } }
            ),
            children: '编辑',
          },
          launch: {
            key: 'launch',
            onClick: () => this.props.showModal({
              mVisible: true,
              targetStatus: '0',
              targetSid: record.sid,
              modalContent: <div style={{ textAlign: 'center' }}>确认上线该店铺？</div>,
            }),
            type: 'primary',
            children: '上线',
          },
          stop: {
            key: 'stop',
            onClick: () => this.props.showModal({
              mVisible: true,
              targetStatus: '1',
              targetSid: record.sid,
              modalContent: <div style={{ textAlign: 'center' }}>确认下线该店铺？</div>,
            }),
            type: 'primary',
            children: '下线',
          },
        };
        const btnList = {
          0: ['edit', 'stop'],
          1: ['edit', 'launch'],
        }[record.delFlag] || [];
        return btnList.map((btnName) => <Button {...btnMap[btnName]} />);
      },
    },
  ]

  getButtons = () => [{
    label: '新建',
    onClick: () => browserHistory.push('/Manage/ShopDetail/0'),
  }]

  changeStatus = () => this.props.changeStatus({ sid: this.props.targetSid, targetStatus: this.props.targetStatus })
    .then((isSuccess) => {
      if (isSuccess) {
        this.props.showModal({ mVisible: false });
        this.props.loadData({ ...this.props.searchParams, ...this.props.page });
      }
    })

  render() {
    const {
      data,
      loading,
      page,
      loadData,
      changeSearch,
      searchParams,
      mVisible,
      modalContent,
      showModal,
    } = this.props;

    const columns = this.getColumns();
    const buttons = this.getButtons();

    return (
      <div style={{ width: '100%' }} className="m-shop-list">
        <ListPage
          title={'当前位置：店铺管理 > 店铺列表'}
          columns={columns}
          rowKey={'sid'}
          data={data}
          loading={loading}
          page={page}
          buttons={buttons}
          search={loadData}
          changeSearch={changeSearch}
          searchParams={searchParams}
        />
        <Modal
          visible={mVisible}
          title="提示"
          okText="确定"
          cancelText="取消"
          onOk={this.changeStatus}
          onCancel={() => showModal({ mVisible: false })}
        >{modalContent}</Modal>
      </div>
    );
  }
}

export default View;
