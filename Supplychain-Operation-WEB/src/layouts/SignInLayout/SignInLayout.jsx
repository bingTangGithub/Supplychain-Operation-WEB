import React from 'react';

import { Layout } from 'antd';

const { Header, Content, Footer } = Layout;

const SignInLayout = ({ children }) => (
  <Layout>
    <Header className="header">
      <div className="logo" />
      <b style={{ color: '#fff' }}>我是首页</b>
    </Header>
    <Layout>

      <Layout style={{ padding: '0 24px 24px', marginTop: '20px' }}>
        <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 600 }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          copyright &copy; 浙江兔巢科技产业互联技术中心
        </Footer>
      </Layout>
    </Layout>
  </Layout>
);

export default SignInLayout;
