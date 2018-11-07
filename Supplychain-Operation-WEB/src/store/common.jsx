import { message, notification } from 'antd';
import React from 'react';
import { browserHistory } from 'react-router';
import fetch from '../util/fetch';
import '../util/fix';
import { createAction, getUserCenterUrl } from '../util';
import menuData from '../components/SideMenu/menuData.json';

const CryptoJS = require('../../lib/crypto-js');
// ------------------------------------
// Constants
// ------------------------------------
export const MENU_REQUEST = 'MENU_REQUEST';
export const MENU_SUCCESS = 'MENU_SUCCESS';
export const MENU_FAILURE = 'MENU_FAILURE';
export const SHOW_EDITPWD = 'SHOW_EDITPWD';
export const HIDE_EDITPWD = 'HIDE_EDITPWD';
export const SAVE_PWD_REQUEST = 'SAVE_PWD_REQUEST';
export const SAVE_PWD_SUCCESS = 'SAVE_PWD_SUCCESS';
export const SAVE_PWD_FAILURE = 'SAVE_PWD_FAILURE';
export const CLICK_TOP_MENU = 'CLICK_TOP_MENU';
export const CLICK_SUB_MENU = 'CLICK_SUB_MENU';
export const CLICK_MENU_ITEM = 'CLICK_MENU_ITEM';
export const INIT_MENU = 'INIT_MENU';
export const INIT_COMMON = 'INIT_COMMON';

export const SHOW_APPLY_REASON = 'SHOW_APPLY_REASON';
export const HIDE_APPLY_REASON = 'HIDE_APPLY_REASON';
export const SAVE_APPLY_REASON_REQUEST = 'SAVE_APPLY_REASON_REQUEST';
export const SAVE_APPLY_REASON_SUCCESS = 'SAVE_APPLY_REASON_SUCCESS';
export const SAVE_APPLY_REASON_FAILURE = 'SAVE_APPLY_REASON_FAILURE';
export const COLLAPSE_SUB_MENU = 'COLLAPSE_SUB_MENU';

const COMMON_CITY_REQUEST = 'COMMON_CITY_REQUEST';
const COMMON_CITY_SUCCESS = 'COMMON_CITY_SUCCESS';
const COMMON_CITY_FAILURE = 'COMMON_CITY_FAILURE';
const COMMON_CITY_SET = 'COMMON_CITY_SET';

const COMMON_VERIFYLIST_REQUEST = 'COMMON_VERIFYLIST_REQUEST';
const COMMON_VERIFYLIST_SUCCESS = 'COMMON_VERIFYLIST_SUCCESS';
const COMMON_VERIFYLIST_FAILURE = 'COMMON_VERIFYLIST_FAILURE';

// ------------------------------------
// Actions
// ------------------------------------
const key = CryptoJS.enc.Latin1.parse('eGluZ3Vhbmd0YmI=');
const iv = CryptoJS.enc.Latin1.parse('svtpdprtrsjxabcd');

export const common = {
  fetchVerifyList: () => ({
    types: [COMMON_VERIFYLIST_REQUEST, COMMON_VERIFYLIST_SUCCESS, COMMON_VERIFYLIST_FAILURE],
    callAPI: () => fetch('/spu/list', { pageNo: 1, pageSize: 10, verifyStatus: '1' }),
  }),
  setCurCity: createAction(COMMON_CITY_SET, 'payload'),
  loadCityList: () => ({
    types: [COMMON_CITY_REQUEST, COMMON_CITY_SUCCESS, COMMON_CITY_FAILURE],
    callAPI: () => fetch('/privilegeCity', {}, {}, false, false),
    // callAPI: () => fetch('http://172.16.2.71:8068/mockjsdata/85/privilegeCity'),
    // payload: params,
  }),
  loadMenu: () => ({
    types: [MENU_REQUEST, MENU_SUCCESS, MENU_FAILURE],
    /* callAPI: (state) => fetch('//' + location.host + '/mock/menu.json', {}, {
        method: 'GET',
      }), */
    callAPI: () => new Promise((resolve) => resolve(menuData)),
    callback: (payload, dispatch, state) => {
      // if forward to '/Manage', redirect to first link url according with the menu data
      if (location.pathname === '/Manage') {
        const matchs = JSON.stringify(state.common.menus).match(/"href":"([^"]*)"/) || [];
        if (matchs[1]) {
          const firstLink = matchs[1];
          firstLink && browserHistory.replace(firstLink);
        }
      }
      // select the menu
      dispatch(common.initMenu());
    },
  }),
  clickTopMenu: (id) => // when click top menu, find the first link under it
    (dispatch, getState) => {
      const menus = getState().common.menus;
      const topMenu = menus.find((menu) => menu.id === id);
      const findLink = (findLinkmenus) => {
        for (let i = 0; i < findLinkmenus.length; i += 1) {
          const menu = findLinkmenus[i];
          if (menu.children) {
            return findLink(menu.children);
          } else if (menu.href) {
            return menu;
          }
        }
        return false;
      };

      const firstLeafMenu = findLink(topMenu.children);
      browserHistory.push(firstLeafMenu.href);
      // dispatch(common.initMenu())
    },
  clickMenuItem: createAction(CLICK_MENU_ITEM, 'payload'),
  clickSubMenu: createAction(CLICK_SUB_MENU, 'payload'),
  initMenu: createAction(INIT_MENU),
  initCommon: createAction(INIT_COMMON),
  showEditPwd: createAction(SHOW_EDITPWD),
  hideEditPwd: createAction(HIDE_EDITPWD),
  savePwd: (params) => {
    const newParams = params;
    const oldPassword = CryptoJS.AES.encrypt(
      params.oldPassword,
      key,
      {
        iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.ZeroPadding,
      });
    const newPassword = CryptoJS.AES.encrypt(
      params.newPassword,
      key,
      {
        iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.ZeroPadding,
      });
    newParams.oldPassword = oldPassword.toString();
    newParams.newPassword = newPassword.toString();
    return {
      types: [SAVE_PWD_REQUEST, SAVE_PWD_SUCCESS, SAVE_PWD_FAILURE],
      callAPI: () => fetch(`${getUserCenterUrl()}/account/modifyPassword`, newParams),
    };
  },
  showApplyReason:(need) => ({
    type: SHOW_APPLY_REASON,
    payload: need,
  }),
  hideApplyReason:() => ({
    type: HIDE_APPLY_REASON,
  }),
  saveApplyReasonRequest: (params) => ({
    type: SAVE_APPLY_REASON_REQUEST,
    payload: params,
  }),
  saveApplyReasonSuccess: (data) => ({
    type: SAVE_APPLY_REASON_SUCCESS,
    payload: data,
  }),
  saveApplyReasonFailure: (msg) => ({
    type: SAVE_APPLY_REASON_FAILURE,
    payload: msg,
  }),
  saveApplyReason: (params) => (
    (dispatch) => {
      const newParams = params;
      let way;
      if (newParams.way) {
        way = newParams.way;
        delete newParams.way;
      }
      dispatch(common.saveApplyReasonRequest(newParams));
      return fetch(way, newParams)
        .then((json) => {
          if (json.resultCode === '0') {
            dispatch(common.saveApplyReasonSuccess(json.resultData));
            return true;
          }
          dispatch(common.saveApplyReasonFailure(json.resultDesc));
          return false;
        });
    }
  ),
  collapseSubMenu: () => ({
    type: COLLAPSE_SUB_MENU,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------

const ACTION_HANDLERS = {
  [COMMON_CITY_SET]: (state, action) => {
    const curCityNo = action.payload;
    const { cityNo, cityName } = state.vcityList.find((item) => item.cityNo === curCityNo);
    localStorage.setItem('curCityNo', cityNo);
    localStorage.setItem('curCityName', cityName);
    return {
      ...state,
      vcityValue: cityNo,
      vcityName: cityName,
    };
  },
  [COMMON_CITY_REQUEST]: (state) => ({
    ...state,
    vcityLoading: true,
  }),
  [COMMON_CITY_SUCCESS]: (state, action) => ({
    ...state,
    vcityLoading: false,
    vcityList: action.data.list,
  }),
  [COMMON_CITY_FAILURE]: (state) => ({
    ...state,
    vcityLoading: false,
    vcityList: [],
  }),
  [MENU_REQUEST]: (state) => ({
    ...state,
  }),
  [MENU_SUCCESS]: (state, action) => ({
    ...state,
    menus: action.data,
  }),
  [MENU_FAILURE]: (state, action) => {
    message.error(action.msg);
    return {
      ...state,
    };
  },
  [CLICK_TOP_MENU]: (state, action) => {
    const selectedTopKeys = [action.payload];

    return {
      ...state,
      selectedTopKeys,
    };
  },
  [CLICK_SUB_MENU]: (state, action) => {
    // toggle the sideSubMenu, not the leaf
    const index = state.openedKeys.indexOf(action.payload);
    index > -1 ? state.openedKeys.splice(index, 1) : state.openedKeys.push(action.payload);
    localStorage.setItem('menuKeys', JSON.stringify([state.selectedTopKeys, state.openedKeys, state.selectedKeys]));
    return {
      ...state,
      openedKeys: state.openedKeys,
    };
  },
  [CLICK_MENU_ITEM]: (state, action) => {
    const selectedKeys = [action.payload];
    // anyway, we should keep it persistent,
    // so we can get it previous state if some router not match the menu like detail page
    localStorage.setItem('menuKeys', JSON.stringify([state.selectedTopKeys, state.openedKeys, selectedKeys]));
    return {
      ...state,
      selectedKeys,
    };
  },
  [INIT_MENU]: (state) => {
    const menus = state.menus;
    const menuKeys = [];

    // recursion to find the matched menu and its parentIds
    const findMenu = (findmenus) => {
      let res = false;
      for (let i = 0; i < findmenus.length; i += 1) {
        const menu = findmenus[i];
        menuKeys.push(menu.id);
        if (menu.href === location.pathname) {
          return true;
        } else if (menu.children) {
          res = findMenu(menu.children);
          if (!res) {
            menuKeys.pop();
          } else {
            return true;
          }
        } else {
          menuKeys.pop();
        }
      }
      return res;
    };

    findMenu(menus);

    let selectedTopKeys = [];
    let openedKeys = [];
    let selectedKeys = [];
    if (menuKeys.length === 0) { // if not matched, get the menu state from storage
      [selectedTopKeys, openedKeys, selectedKeys] = [...JSON.parse(localStorage.getItem('menuKeys'))];
    } else {
      selectedTopKeys = [menuKeys.shift()];
      selectedKeys = [menuKeys.pop()];
      openedKeys = menuKeys;
    }
    openedKeys = Array.from(new Set(openedKeys.concat(state.openedKeys))); // combine the submenu open state
    localStorage.setItem('menuKeys', JSON.stringify([selectedTopKeys, menuKeys, selectedKeys]));

    return {
      ...state,
      // these key state is persistent, so we should save them to store
      selectedTopKeys,
      openedKeys,
      selectedKeys,
    };
  },
  [INIT_COMMON]: (state) => { // not usable
    let userStr = localStorage.getItem('user');
    if (userStr === 'undefined') {
      userStr = '{}';
    }
    const user = JSON.parse(userStr);

    // detect browser version
    const userAgent = (navigator.userAgent.match(/Chrome\/(\d+)\./) || [])[1] || 0;
    userAgent && (+userAgent < 54) && notification.warning({
      duration: null,
      message: '浏览器版本过低',
      description: <div>请下载<a href="http://www.chromeliulanqi.com/Chrome_Latest_Setup.exe">最新版chrome浏览器</a></div>,
    });
    return {
      ...state,
      editPwdVisible: (user && user.firstLogin) || false,
    };
  },
  [SHOW_EDITPWD]: (state) => ({
    ...state,
    editPwdVisible: true,
  }),
  [HIDE_EDITPWD]: (state) => ({
    ...state,
    editPwdVisible: false,
  }),
  [SAVE_PWD_REQUEST]: (state) => ({
    ...state,
    savePwdLoading: true,
  }),
  [SAVE_PWD_SUCCESS]: (state) => {
    message.success('操作成功');
    return {
      ...state,
      savePwdLoading: false,
      editPwdVisible: false,
    };
  },
  [SAVE_PWD_FAILURE]: (state, action) => {
    message.error(action.msg);
    return {
      ...state,
      savePwdLoading: false,
    };
  },
  [SHOW_APPLY_REASON]: (state, action) => {
    const newState = Object.assign({}, state);
    const need = action.payload;
    newState.need = Object.assign({}, state.need, need);
    return {
      ...newState,
      applyReasonVisible: true,
    };
  },
  [HIDE_APPLY_REASON]: (state) => ({
    ...state,
    applyReasonVisible: false,
  }),
  [SAVE_APPLY_REASON_REQUEST]: (state) => ({
    ...state,
    applyReasonLoading: true,
  }),
  [SAVE_APPLY_REASON_SUCCESS]: (state) => {
    message.success('操作成功');
    return {
      ...state,
      applyReasonLoading: false,
      applyReasonVisible: false,
    };
  },
  [SAVE_APPLY_REASON_FAILURE]: (state, action) => {
    message.error(action.payload);
    return {
      ...state,
      applyReasonLoading: false,
    };
  },
  [COLLAPSE_SUB_MENU]: (state) => ({
    ...state,
    openedKeys: [],
  }),

  [COMMON_VERIFYLIST_REQUEST]: (state) => ({ ...state }),
  [COMMON_VERIFYLIST_SUCCESS]: (state, action) => ({ ...state, verifyNum: action.data.totalSize }),
  [COMMON_VERIFYLIST_FAILURE]: (state) => ({ ...state }),
};

let userStr = localStorage.getItem('user');
if (userStr === 'undefined') {
  userStr = '{}';
}
const user = JSON.parse(userStr);

const initialState = {
  verifyNum: 0,
  menus: [],
  editPwdVisible: (user && user.firstLogin) || false,
  savePwdLoading: false,
  permission: {},
  selectedKeys: [],
  openedKeys: [],
  selectedTopKeys: [],
  applyReasonVisible: false,
  applyReasonLoading: false,
  need:{
    warning:'initSda',
    way:'/initDes',
    type:'initType',
  },
  vcityList: [],
  vcityLoading: false,
  vcityValue: undefined,
  vcityName: undefined,
};
export default function commonReducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
