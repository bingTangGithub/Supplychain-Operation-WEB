import React, { Component } from 'react';
import { Table } from 'antd';

class TableList extends Component {
  state = {
    bordered: false,
    pagination: false,
  }
  render() {
    const {
      data,
      columns,
      rowKey,
    } = this.props;
    return (
      <Table rowKey={rowKey} {...this.state} dataSource={data} columns={columns} />
    );
  }
}

export default TableList;
