import React, { Component } from 'react';
import { Layout, Menu, Select, notification } from 'antd';
// import { Layout, Menu, Dropdown, Button } from 'antd';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import { common } from '../../store/common';
import { getTopMenus } from '../../selectors';
import DropdownPanelWrapper from './DropdownPanelWrapper';
import respond from '../../decorators/Responsive';
import { getCurCity } from '../../util';

const { Header } = Layout;
const { Option } = Select;

class TopMenu extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expand: document.body.clientWidth > 768,
    };

    this.responsiveHandler = ((e) => {
      if (e.matches) {
        this.setState({
          expand: false,
        });
      } else {
        this.setState({
          expand: true,
        });
      }
    });
  }

  componentDidMount() {
    this.mql = window.matchMedia('(max-width: 768px)');
    this.mql.addListener(this.responsiveHandler);
    this.props.loadCityList().then((isSuccess) => {
      if (isSuccess) {
        const { vcityList } = this.props;
        let { curCityNo } = getCurCity();
        if (curCityNo && this.currentCityValid(curCityNo)) {
          // 本地有正确的城市数据
        } else if (vcityList.length) {
          curCityNo = vcityList[0].cityNo;
        }
        this.setCurCity(curCityNo);
        const { query = {} } = browserHistory.getCurrentLocation();
        const { jump } = query;
        browserHistory.push(`/Manage/Changing?jump=${this.valiPathname(jump)}`);
      }
    });
    setInterval(() => this.popInfo(), 1000 * 60 * 10);
  }

  componentWillReceiveProps(newProps) {
    if (newProps.firstLeaf && (newProps.firstLeaf.href !== (this.props.firstLeaf && this.props.firstLeaf.href))) {
      browserHistory.push(newProps.firstLeaf.href);
      this.props.initialMenu();
    }
  }

  componentWillUnmount() {
    this.mql && this.mql.removeListener(this.responsiveHandler);
  }

  onClick({ key }) {
    this.props.clickTopMenu(key);
  }

  setCurCity = (cityNo) => {
    this.props.setCurCity(cityNo);
  }

  valiPathname = (pathname) => {
    if (!/Manage\/(Changing|Loading)/.test(pathname) && !/Manage$/.test(pathname)) {
      return pathname;
    }
    const matchs = JSON.stringify(this.props.menus).match(/"href":"([^"]*)"/) || [];
    return matchs[1];
  }

  handleCityChange = (cityNo) => {
    this.setCurCity(cityNo);
    browserHistory.push(`/Manage/Changing?jump=${this.valiPathname(location.pathname)}`);
  }

  currentCityValid = (curCityNo) => this.props.vcityList.find((item) => item.cityNo === curCityNo);

  createMenu = (data) => data.map((item) => <Menu.Item key={item.id}><a>{item.name}</a></Menu.Item>);

  popInfo = () => {
    this.props.fetchVerifyList().then((isSuccess) => {
      // browserHistory.getCurrentLocation();
      const { verifyNum } = this.props;
      const go2list = () => browserHistory.push('/Manage/VerifyList');
      isSuccess && verifyNum && notification.info({
        key: 'verifyList',
        duration: 0,
        message: '商品待审核',
        description: <div>您有{verifyNum}条待审核的商品信息，<a role="button" tabIndex={0} onClick={go2list}>请尽快审核</a>。</div>,
      });
    });
  }

  render() {
    const { vcityValue } = this.props;
    const {
      expand,
    } = this.state;
    const menu = (
      <Menu
        mode="horizontal"
        selectedKeys={this.props.selectedKeys}
        style={{ lineHeight: '64px' }}
        onClick={this.onClick.bind(this)}
      >
        {this.createMenu(this.props.topMenuData)}
      </Menu>
    );
    return (
      <Header className="header flex flex-c flex-js" style={{ background: '#fff' }}>
        <div>
          当前城市：
          <Select
            className="city-box"
            onChange={this.handleCityChange}
            value={vcityValue}
          >
            {this.props.vcityList.map(
              ({ cityNo, cityName }) => <Option value={cityNo} key={cityNo}>{cityName}</Option>
            )}
          </Select>
        </div>
        {/*
          !expand && <Dropdown overlay={menu} trigger={['click']}>
            <Button icon="bars" />
          </Dropdown>
        */}
        {
          expand && menu
        }
        <DropdownPanelWrapper />
      </Header>
    );
  }
}

const TopMenuWrapper = connect(
  (state) => ({
    topMenuData: getTopMenus(state),
    selectedKeys: state.common.selectedTopKeys,
    firstLeaf: state.common.firstLeaf,
    vcityLoading: state.common.vcityLoading,
    vcityList: state.common.vcityList,
    vcityValue: state.common.vcityValue,
    menus: state.common.menus,
    verifyNum: state.common.verifyNum,
  }),
  {
    clickTopMenu: common.clickTopMenu,
    initialMenu: common.initialMenu,
    loadCityList: common.loadCityList,
    setCurCity: common.setCurCity,
    fetchVerifyList: common.fetchVerifyList,
  },
)(TopMenu);

export default respond(TopMenuWrapper);

