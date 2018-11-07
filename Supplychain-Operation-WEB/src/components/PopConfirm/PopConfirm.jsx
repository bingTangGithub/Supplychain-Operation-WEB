import React from 'react';
import { Popconfirm, message } from 'antd';

const PopConfirm = ({
  children,
  title,
  cb,
  loadData,
  searchParams,
  page,
  visible,
  onVisibleChange,
  okText,
  cancelText,
}) => {
  const cfg = {};
  visible !== undefined && (cfg.visible = visible);
  onVisibleChange !== undefined && (cfg.onVisibleChange = onVisibleChange);
  return (<Popconfirm
    {...cfg}
    title={title}
    okText={okText || '确认'}
    cancelText={cancelText || '取消'}
    onConfirm={() => {
      cb().then((success) => {
        if (success) {
          message.success('操作成功');
          loadData({
            ...searchParams,
            ...page,
          });
        }
      });
    }}
  >
    {children}
  </Popconfirm>);
};

export default PopConfirm;
