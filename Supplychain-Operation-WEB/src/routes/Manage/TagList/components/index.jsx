import React, { Component } from 'react';
// import moment from 'moment';
// import { browserHistory } from 'react-router';
import { Button, Modal } from 'antd';
import ListPage from '../../../../components/ListPage';
import ModalForm from '../../../../components/ModalForm';
import './index.scss';

// const statusMap = {
//   0: '已上线',
//   1: '已下线',
// };

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

  getCardFields = (targetTagLabel) => [
    {
      label: '标签名称',
      name: 'tagLabel',
      required: true,
      simple: true,
      max: 6,
      validator: (rule, value, callback) => {
        if (value && value.trim() === targetTagLabel) {
          return callback('标签名称未改变');
        }
        return callback();
      },
    },
  ];

  getColumns = () => [
    {
      label: '标签ID',
      name: 'tagId',
      search: true,
    }, {
      label: '标签名',
      name: 'tagLabel',
      search: true,
      hidden: true,
    }, {
      label: '标签名称',
      name: 'tagLabel',
    }, {
      label: '创建人',
      name: 'creator',
      search: true,
    }, {
      label: '创建时间',
      name: 'createTime',
    }, {
      label: '更新时间',
      name: 'operateTime',
    }, {
      label: '操作',
      name: 'action',
      width: 180,
      render: (text, record) => {
        const btnMap = {
          edit: {
            key: 'edit',
            onClick: () => this.props.showTagModal({
              tmVisible: true,
              targetTagId: record.tagId,
              targetTagLabel: record.tagLabel,
              modalFormValue: {
                id: record.tagId,
                tagLabel: record.tagLabel,
              },
            }),
            type: 'default',
            children: '编辑',
          },
          delete: {
            key: 'delete',
            onClick: () => this.props.showModal({
              mVisible: true,
              targetTagId: record.tagId,
              modalContent: (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2em' }}>删除标签：{record.tagLabel} ？</div>
                  <div style={{ color: 'red' }}>删除后，当前城市所有商品将失去该标签。</div>
                </div>
              ),
            }),
            type: 'primary',
            children: '删除',
          },
        };
        const btnList = ['edit', 'delete'];
        return btnList.map((btnName) => <Button {...btnMap[btnName]} />);
      },
    },
  ]

  getButtons = () => [{
    label: '新建',
    onClick: () => this.props.showTagModal({
      tmVisible: true,
      targetTagId: undefined,
      targetTagLabel: undefined,
      modalFormValue: {
        id: undefined,
        tagLabel: undefined,
      },
    }),
  }]

  deleteTag = () => this.props.deleteTag({ tagId: this.props.targetTagId })
    .then((isSuccess) => {
      if (isSuccess) {
        this.props.showModal({ mVisible: false });
        this.props.loadData({ ...this.props.searchParams, ...this.props.page });
      }
    })

  save = (values) => {
    const { id, tagLabel } = values;
    this.props.saveTag({ tagId: id, tagLabel })
      .then((isSuccess) => {
        if (isSuccess) {
          this.props.showModal({ tmVisible: false });
          this.props.loadData({ ...this.props.searchParams, ...this.props.page });
        }
      });
  }

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
      tmVisible,
      modalFormValue,
      showTagModal,
      changeRecord,
      targetTagLabel,
    } = this.props;

    const columns = this.getColumns();
    const buttons = this.getButtons();

    return (
      <div style={{ width: '100%' }} className="m-tag-list">
        <ListPage
          title={'当前位置：商品管理 > 标签列表'}
          columns={columns}
          rowKey={'tagId'}
          data={data}
          loading={loading}
          page={page}
          buttons={buttons}
          search={loadData}
          changeSearch={changeSearch}
          searchParams={searchParams}
        />
        <ModalForm
          visible={tmVisible}
          values={modalFormValue}
          fields={this.getCardFields(targetTagLabel)}
          onCancel={() => showTagModal({ tmVisible: false, targetTagId: '' })}
          onCreate={this.save}
          title="标签"
          modalClass="m-tag-list"
          formWidth={760}
          changeRecord={changeRecord}
        />
        <Modal
          visible={mVisible}
          title="提示"
          okText="确定"
          cancelText="取消"
          onOk={this.deleteTag}
          onCancel={() => showModal({ mVisible: false })}
        >{modalContent}</Modal>
      </div>
    );
  }
}

export default View;
