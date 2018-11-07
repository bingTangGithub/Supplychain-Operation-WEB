import React, { Component } from 'react';
import { browserHistory } from 'react-router';

class View extends Component {
  componentDidMount = () => {
    const { query = {} } = browserHistory.getCurrentLocation();
    let { jump } = query;
    if (!jump) jump = '/Manage/ShopList';
    browserHistory.push(jump);
  }

  render() {
    return (<div
      style={{
        width: '100%',
        lineHeight: '500px',
        fontSize: '14px',
        textAlign: 'center',
      }}
    >
      加载城市数据中，请稍后。。。
    </div>);
  }
}

export default () => ({
  path: 'Changing',
  component: View,
});
