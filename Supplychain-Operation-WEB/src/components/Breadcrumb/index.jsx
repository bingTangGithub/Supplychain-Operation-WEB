import React from 'react';
// import { Router, Route, Link, hashHistory } from 'react-router';
// import { Breadcrumb } from 'antd';

const Home = ({ title }) =>
  (
    <div style={{ fontSize: '1.5em', fontWeight: 500, color: '#000', marginBottom: '16px' }}>
      当前位置：{title}
    </div>
  );

export default Home;
