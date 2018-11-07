import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Modal, Button, message } from 'antd';
import ListPage from '../../../../components/ListPage';
import { btnStyles } from '../modules/tinyUtil';
import './index.scss';

class View extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.searchRootCate();
  }

  onExpand = (expanded, record) => {
    this.props.setTargetRecord(record);
    if (expanded) { // 展开父级分类
      record.hasReqChild || this.props.search({ parentId: record.frontCateId, pageSize: -1, pageNo: 1 });
      record.hasReqChild && this.props.openExpandedRow(record.frontCateId);
    } else { // 合上父级分类
      this.props.closeExpandedRow(record.frontCateId);
    }
  }

  getBtn = (btnName, record) => {
    const btnCfg = btnStyles[btnName];
    const btnOperate = {
      edit: () => {
        const isParent = record.level === '1';
        browserHistory.push({
          pathname: '/Manage/FrontCateEdit',
          state: { mode: 'edit', type: isParent ? 'parent' : 'child', frontCateId: record.frontCateId },
        });
      },
      newChild: () => {
        browserHistory.push({
          pathname: '/Manage/FrontCateEdit',
          state: { mode: 'new', type: 'child', parentId: record.frontCateId },
        });
      },
      delete: () => this.props.showDeleteModal(record),
      show: () => this.props.showShowModal(record),
      hide: () => this.props.showHideModal(record),
    }[btnName];
    return (<Button
      {...btnCfg}
      key={btnCfg.label}
      onClick={btnOperate}
    >{btnCfg.label}</Button>);
  };

  searchRootCate = () => {
    const { pageSize, pageNo } = this.props.page;
    this.props.search({ parentId: 0, pageSize, pageNo });
  }

  handleConfirmOk = () => {
    const { actionType, hideShowFrontCate, deleteFrontCate } = this.props;
    const actionFunc = {
      hide: () => hideShowFrontCate().then((response) => this.updateList(response)),
      show: () => hideShowFrontCate().then((response) => this.updateList(response)),
      delete: () => deleteFrontCate().then((response) => {
        if (response && response.success) {
          message.success('删除成功！');

          const { parentIdList } = this.props.targetRecord;
          parentIdList.length || this.searchRootCate();
        }
      }),
    }[actionType];
    return actionFunc();
  }

  updateList = (response) => {
    if (response && response.success) {
      const { targetRecord, updateParentCate } = this.props;
      // 更新子分类数据
      // targetRecord.hasReqChild && search({ parentId: targetRecord.frontCateId, pageSize: -1, pageNo: 1 });

      // 更新父分类数据
      targetRecord.level === '2' && updateParentCate({ frontCateId: targetRecord.parentIdList[0] });
    }
  }

  render() {
    const { search, expandedRowKeys, confirm, handleConfirmCancel } = this.props;
    const columns = [
      {
        label: '排序',
        name: 'sort',
      }, {
        label: '前端分类',
        name: 'frontCateName',
      }, {
        label: '状态',
        name: 'frontCateStatus',
        render: (text) => (text === 'show' ? '展示' : '隐藏'),
      }, {
        label: '最近修改人/时间',
        name: 'lastModified',
        render: (text, { operateName, operateTime }) => (
          <div>
            <div>{operateName || '-'}</div>
            <div>{operateTime || '-'}</div>
          </div>
        ),
      }, {
        title: '操作',
        key: 'action',
        render: (record) => {
          const { frontCateStatus, level } = record;
          const statusStr = `${frontCateStatus}-${level}`;
          const btnStrategy = {
            'show-1': ['hide'],
            'hide-1': ['edit', 'newChild', 'show', 'delete'],
            'show-2': ['hide'],
            'hide-2': ['edit', 'show', 'delete'],
          };
          const defaultArr = frontCateStatus === 'show' ? ['hide'] : ['show', 'delete'];
          return (btnStrategy[statusStr] || defaultArr).map(
            (btnName) => this.getBtn(btnName, record)
          );
        },
      },
    ];

    const btnList = [{
      label: '增加',
      size: 'large',
      onClick: () => {
        browserHistory.push({
          pathname: '/Manage/FrontCateEdit',
          state: { mode: 'new', type: 'parent' },
        });
      },
    }];

    return (
      <div style={{ width:'100%' }} className="m-frontcatelist">
        <ListPage
          {...this.props}
          noSearch
          title="当前位置：商品管理 > 前端分类"
          columns={columns}
          rowKey="frontCateId"
          indentSize={30}
          buttons={btnList}
          onExpand={this.onExpand} // 该事件不会影响分页
          expandedRowKeys={expandedRowKeys}
          onChange={({ current, pageSize }) => search({ parentId: 0, pageNo: current, pageSize })}
        />
        <Modal
          title=""
          onOk={this.handleConfirmOk}
          onCancel={handleConfirmCancel}
          visible={confirm.visible}
        >
          <p style={{ textAlign: 'center' }}>{confirm.text}</p>
        </Modal>
      </div>
    );
  }
}

export default View;
