import React, { Component } from 'react';
import { Menu, Icon, Dropdown, Modal } from 'antd';
import { connect } from 'react-redux';
import { common } from '../../store/common';
import { getBaseUrl } from '../../util';

class DropdownPanel extends Component {
  onMenuClick({ key }) {
    if (key === '2') {
      location.assign(getBaseUrl('entryUrl'));
      // this.props.showEditPwd();
    }
    return this;
  }

  render() {
    const logout = () => {
      localStorage.setItem('accessToken', '');
      // browserHistory.push('/SignIn')
      // window.storeManager.clear();
      if (window.opener) {
        window.opener = null;
        window.close();
      }
      location.assign(getBaseUrl('entryUrl'));
      // clear the redux state, because the data is related the different roles
    };

    const menu = (
      <Menu onClick={this.onMenuClick.bind(this)}>
        {/* <Menu.Item key="2">
          <a>修改密码</a>
        </Menu.Item> */}
        <Menu.Item key="3">
          <a
            tabIndex={0}
            role="button"
            onClick={(() => {
              Modal.confirm({
                title: '确定要退出“供应链服务商后台”吗？',
                onOk: (() => {
                  setTimeout(() => {
                    logout();
                  }, 300);
                }),
                onCancel() {},
              });
            })}
          >退出</a>
        </Menu.Item>
      </Menu>
    );

    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <a className="flex flex-c">
          <img className="login-avatar" alt="" src="/avatar.png" />
          <span className="login-name">
            你好！<Icon type="down" />
          </span>
        </a>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state) => ({
  editPwdVisible: state.common.editPwdVisible,
  savePwdLoading: state.common.savePwdLoading,
});

const mapDispatchToProps = {
  showEditPwd: common.showEditPwd,
  hideEditPwd: common.hideEditPwd,
  savePwd: common.savePwd,
  initCommon: common.initCommon,
};

const DropdownPanelWrapper = connect(mapStateToProps, mapDispatchToProps)(DropdownPanel);

export default DropdownPanelWrapper;

