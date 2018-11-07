import React from 'react';

export default () => ({
  path: 'Loading',
  component: () => (<div
    style={{
      width: '100%',
      lineHeight: '500px',
      fontSize: '14px',
      textAlign: 'center',
    }}
  >
    加载城市数据中，请稍后。。。
  </div>),
});
