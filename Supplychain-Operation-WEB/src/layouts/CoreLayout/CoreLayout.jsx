import React, { Component } from 'react';
import { Layout } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { connect } from 'react-redux';
import SideMenu from '../../components/SideMenu';
import { getBaseUrl } from '../../util';
import '../../styles/core.scss';
import './CoreLayout.scss';
import ChangePwdFormWrapper from './ChangePwdFormWrapper';
import TopMenuWrapper from './TopMenu';


const { Content, Sider } = Layout;

class CoreLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }
  onCollapse = (collapsed) => {
    this.setState({
      collapsed,
    });
  };
  render() {
    const envStr = getBaseUrl('envStr');
    return (
      <Layout>
        <ChangePwdFormWrapper />
        <Sider
          collapsible
          breakpoint="sm"
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
          width={200}
        >
          <layout className="flex flex-v" style={{ height: '100%', borderRight: '1px solid #404040' }}>
            <div className="logo-wrapper flex flex-v flex-c">

              <div className="logo"><img alt="图片未加载" src="/logo-w.png" /></div>
              <div className="logo-title">供应链服务商后台</div>
              {envStr && <div className="logo-env">【{envStr}】</div>}
            </div>
            <SideMenu
              collapsed={this.state.collapsed}
            />
          </layout>
        </Sider>
        <Layout>
          <TopMenuWrapper />
          <Scrollbars
            style={{ height: document.body.clientHeight - 64 }}
          >
            <Content style={{ padding: 0, margin: 0 }}>
              {this.props.children}
            </Content>
          </Scrollbars>
        </Layout>
      </Layout>
    );
  }
}

export default connect()(CoreLayout);
