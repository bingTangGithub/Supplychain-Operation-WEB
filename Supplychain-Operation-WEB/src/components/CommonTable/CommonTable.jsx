import React, { Component } from 'react';
import { Table, Spin } from 'antd';
import PropTypes from 'prop-types';

export default class CommonTable extends Component {
  static propTypes = {
    rowKey: PropTypes.string,
    loading: PropTypes.bool,
    columns: PropTypes.array.isRequired,
    dataSource: PropTypes.array,
    rowSelection: PropTypes.object,
    pagination: PropTypes.object,
    search: PropTypes.func,
    searchParams: PropTypes.object,
    onChange: PropTypes.func,
    bordered: PropTypes.bool,
    onExpand: PropTypes.func,
    indentSize: PropTypes.number,
    expandedRowKeys: PropTypes.array,
  }

  static defaultProps = {
    rowKey: 'id',
    loading: false,
    dataSource: [],
    rowSelection: undefined,
    pagination: {},
    search: undefined,
    searchParams: {},
    onChange: undefined,
    bordered: false,
    onExpand: undefined,
    indentSize: undefined,
    expandedRowKeys: [],
  };

  onChange(page) {
    this.props.search({
      ...this.props.searchParams,
      pageNo: page.current,
      pageSize: page.pageSize,
    });
  }

  render() {
    const {
      rowKey,
      loading,
      columns,
      dataSource,
      pagination,
      searchParams,
      rowSelection,
      onChange,
      bordered,
      onExpand,
      indentSize,
      expandedRowKeys,
    } = this.props;
    const mapColumns = [
      ...columns,
    ];

    mapColumns.forEach((col) => {
      const column = col;
      if ('label' in column) {
        column.title = column.label;
      }
      if ('name' in column) {
        column.key = column.name;
        column.dataIndex = column.name;
      }
      if (!('render' in column)) {
        column.render = (text) => ((text === '' || typeof text === 'undefined') ? '-' : text);
      }
    });

    return (
      <Spin spinning={loading}>
        <Table
          bordered={bordered}
          indentSize={indentSize}
          searchParams={searchParams}
          rowKey={rowKey}
          style={{ marginTop: '16px' }}
          columns={mapColumns}
          dataSource={dataSource}
          pagination={
            Object.keys(pagination).length !== 0 ? {
              pageSize: 10,
              ...pagination,
              showTotal: (total, range) => `显示第 ${range[0]} 到第 ${range[1]} 条记录，总共 ${total} 条记录`,
            } : false}
          onChange={onChange || this.onChange.bind(this)}
          rowSelection={rowSelection}
          onExpand={onExpand} // 用于点击table的加号时进行的操作，该属性不受分页影响
          expandedRowKeys={expandedRowKeys} // 为了分页跳回来之后正常
        />
      </Spin>
    );
  }
}
