import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { browserHistory, Router } from 'react-router';
import { Provider } from 'react-redux';

// APP容器
class AppContainer extends Component {
  static propTypes = {
    routes : PropTypes.object.isRequired,
    store  : PropTypes.object.isRequired,
  }

  // 数据更新时调用，这里可以增加判断，返回值是boolean
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { routes, store } = this.props;

    return (
      <Provider store={store}>
        <div style={{ height: '100%', display: 'flex' }}>
          <Router history={browserHistory} routes={routes} />
        </div>
      </Provider>
    );
  }
}

export default AppContainer;
