import { Message } from 'antd';
import fetch from '../../../util/fetch';
import { createAction, getUserCenterUrl } from '../../../util';

const CryptoJS = require('../../../../lib/crypto-js');
// ------------------------------------
// Constants
// ------------------------------------
const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const SHOW_FIND_PWD = 'SHOW_FIND_PWD';
const CLOSE_FIND_PWD = 'CLOSE_FIND_PWD';
const GET_CHECKCODE_REQUEST = 'GET_CHECKCODE_REQUEST';
const GET_CHECKCODE_SUCCESS = 'GET_CHECKCODE_SUCCESS';
const GET_CHECKCODE_FAILURE = 'GET_CHECKCODE_FAILURE';
const SAVE_FIND_PASSWORD_REQUEST = 'SAVE_FIND_PASSWORD_REQUEST';
const SAVE_FIND_PASSWORD_SUCCESS = 'SAVE_FIND_PASSWORD_SUCCESS';
const SAVE_FIND_PASSWORD_FAILURE = 'SAVE_FIND_PASSWORD_FAILURE';
const GET_SHOPINFO_REQUEST = 'GET_SHOPINFO_REQUEST';
const GET_SHOPINFO_SUCCESS = 'GET_SHOPINFO_SUCCESS';
const GET_SHOPINFO_FAILURE = 'GET_SHOPINFO_FAILURE';

// ------------------------------------
// Actions
// ------------------------------------
const loginRequest = (params) => ({
  type: LOGIN_REQUEST,
  payload: params,
});

const loginSuccess = (data) => ({
  type: LOGIN_SUCCESS,
  payload: data,
});

const loginFailure = (msg) => ({
  type: LOGIN_FAILURE,
  payload: msg,
});

const saveFindRequest = (params) => ({
  type: SAVE_FIND_PASSWORD_REQUEST,
  payload: params,
});

const saveFindSuccess = (data) => ({
  type: SAVE_FIND_PASSWORD_SUCCESS,
  payload: data,
});

const saveFindFailure = (msg) => ({
  type: SAVE_FIND_PASSWORD_FAILURE,
  payload: msg,
});

const key = CryptoJS.enc.Latin1.parse('eGluZ3Vhbmd0YmI=');
const iv = CryptoJS.enc.Latin1.parse('svtpdprtrsjxabcd');

const login = (params) => (
  (dispatch) => {
    const newParams = params;
    dispatch(loginRequest(newParams));
    const encrypted = CryptoJS.AES.encrypt(
      newParams.password,
      key,
      {
        iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.ZeroPadding,
      }
    );

    newParams.password = encrypted.toString();

    return fetch(`${getUserCenterUrl()}/account/login`, newParams)
      .then((json) => {
        if (json.resultCode === '0') {
          dispatch(loginSuccess(json.resultData));
          return true;
        }
        dispatch(loginFailure(json.resultDesc));
        return false;
      });
  }
);

const newFindPwdSave = (params) => (
  (dispatch) => {
    const newParams = params;
    dispatch(saveFindRequest(newParams));
    const encrypted = CryptoJS.AES.encrypt(
      newParams.password,
      key,
      {
        iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.ZeroPadding,
      }
    );

    // const encryptedAgain = CryptoJS.AES.encrypt(
    //   newParams.secondPassword,
    //   key,
    //   {
    //     iv, mode:CryptoJS.mode.CBC, padding:CryptoJS.pad.ZeroPadding,
    //   }
    // );

    newParams.password = encrypted.toString();
    // newParams.secondPassword = encryptedAgain.toString();

    return fetch(`${getUserCenterUrl()}/account/findPassword`, newParams)
      .then((json) => {
        if (json.resultCode === '0') {
          dispatch(saveFindSuccess(json.resultData));
          return true;
        }
        dispatch(saveFindFailure(json.resultDesc));
        return false;
      });
  }
);

export const actions = {
  login,
  showFindPwd: createAction(SHOW_FIND_PWD, 'fields'),
  closeFindPwd: createAction(CLOSE_FIND_PWD, 'fields'),
  getCheckCode:(params) => ({
    types: [GET_CHECKCODE_REQUEST, GET_CHECKCODE_SUCCESS, GET_CHECKCODE_FAILURE],
    callAPI:() => fetch(`${getUserCenterUrl()}/account/smsAuthCode/send`, params, {
      method: 'POST',
    }),
  }),
  getShopInfo:(params) => ({
    types: [GET_SHOPINFO_REQUEST, GET_SHOPINFO_SUCCESS, GET_SHOPINFO_FAILURE],
    callAPI:() => fetch('/shop/info', params, {
      method: 'POST',
    }),
  }),
  newFindPwdSave,
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [LOGIN_REQUEST]: (state, action) => ({
    ...state,
    phone: action.payload.phone,
    password: action.payload.password,
    loading: true,
  }),
  [LOGIN_SUCCESS]: (state, action) => {
    localStorage.setItem('accessToken', action.payload.access_token);
    localStorage.setItem('refreshToken', action.payload.refresh_token);
    localStorage.setItem('name', JSON.stringify(action.payload.name));
    localStorage.setItem('token_type', action.payload.token_type);
    localStorage.setItem('expires_in', action.payload.expires_in);
    localStorage.setItem('scope', action.payload.scope);
    return {
      ...state,
      loading: false,
    };
  },
  [LOGIN_FAILURE]: (state, action) => {
    Message.error(action.payload);
    localStorage.setItem('accessToken', '');
    return {
      ...state,
      user: '',
      loading: false,
    };
  },
  [GET_CHECKCODE_REQUEST]: (state) => ({
    ...state,
    loading: true,
  }),
  [GET_CHECKCODE_SUCCESS]: (state) => {
    Message.success('发送成功');
    return {
      ...state,
      loading: false,
    };
  },
  [GET_CHECKCODE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [SHOW_FIND_PWD]:(state) => ({
    ...state,
    bel:true,
  }),
  [CLOSE_FIND_PWD]:(state) => ({
    ...state,
    bel:false,
  }),
  [SAVE_FIND_PASSWORD_REQUEST]:(state) => ({
    ...state,
    loading: false,
  }),
  [SAVE_FIND_PASSWORD_SUCCESS]:(state) => {
    Message.success('操作成功', 1, () => {
      location.assign('/SignIn');
    });
    return {
      ...state,
      loading: false,
    };
  },
  [SAVE_FIND_PASSWORD_FAILURE]:(state, action) => {
    Message.error(action.payload);
    return {
      ...state,
      loading: false,
    };
  },
  [GET_SHOPINFO_REQUEST]: (state) => ({
    ...state,
    loading: true,
  }),
  [GET_SHOPINFO_SUCCESS]: (state, action) => {
    localStorage.setItem('name', JSON.stringify(action.data.name));
    return {
      ...state,
    };
  },
  [GET_SHOPINFO_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  detail: true,
  phone: '',
  password: '',
  user: '',
  loading: false,
  bel:false,
};
export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
