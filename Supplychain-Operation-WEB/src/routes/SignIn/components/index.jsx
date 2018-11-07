import { browserHistory } from 'react-router';
import React, { Component } from 'react';
import { Layout } from 'antd';
import './style.scss';
import WrappedNormalLoginForm from './WrappedNormalLoginForm';
import FindPwd from './FindPwd';

const { Content, Footer } = Layout;

class View extends Component {
  login(values) {
    this.props.login(values).then((isSuccess) => {
      isSuccess && browserHistory.push('/Manage');
    });
  }

  render() {
    return (
      <Layout className="login-layout">
        <Content style={{ padding: '0 50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <WrappedNormalLoginForm
            login={this.login.bind(this)}
            loading={this.props.loading}
            willShowFindPwd={this.props.showFindPwd}
          />
          <FindPwd
            bel={this.props.bel}
            closeFindPwd={this.props.closeFindPwd}
            getCheckCode={this.props.getCheckCode}
            newFindPwdSave={this.props.newFindPwdSave}
          />
        </Content>
        <Footer style={{ textAlign: 'center', color:'#fff', background:'transparent' }}>
          copyright &copy; 产业互联技术中心
        </Footer>
      </Layout>
    );
  }
}

export default View;
