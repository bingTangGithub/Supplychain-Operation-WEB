import { message } from 'antd';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const ORDERDETAIL_REQUEST_DO = 'ORDERDETAIL_REQUEST_DO';
const ORDERDETAIL_REQUEST_SUCCESS = 'ORDERDETAIL_REQUEST_SUCCESS';
const ORDERDETAIL_REQUEST_FAILURE = 'ORDERDETAIL_REQUEST_FAILURE';

const ORDERDETAIL_REASON_DO = 'ORDERDETAIL_REASON_DO';
const ORDERDETAIL_REASON_SUCCESS = 'ORDERDETAIL_REASON_SUCCESS';
const ORDERDETAIL_REASON_FAILURE = 'ORDERDETAIL_REASON_FAILURE';

const ORDERDETAIL_CANCEL_ORDER_DO = 'ORDERDETAIL_CANCEL_ORDER_DO';
const ORDERDETAIL_CANCEL_ORDER_SUCCESS = 'ORDERDETAIL_CANCEL_ORDER_SUCCESS';
const ORDERDETAIL_CANCEL_ORDER_FAILURE = 'ORDERDETAIL_CANCEL_ORDER_FAILURE';

const ORDERDETAIL_LOGISTICS_LIST_ORDER_DO = 'ORDERDETAIL_LOGISTICS_LIST_ORDER_DO';
const ORDERDETAIL_LOGISTICS_LIST_SUCCESS = 'ORDERDETAIL_LOGISTICS_LIST_SUCCESS';
const ORDERDETAIL_LOGISTICS_LIST_FAILURE = 'ORDERDETAIL_LOGISTICS_LIST_FAILURE';

// get hidden store phone number
const ORDERDETAIL_GET_PHONE_REQUEST = 'ORDERDETAIL_GET_PHONE_REQUEST';
const ORDERDETAIL_GET_PHONE_SUCCESS = 'ORDERDETAIL_GET_PHONE_SUCCESS';
const ORDERDETAIL_GET_PHONE_FAILURE = 'ORDERDETAIL_GET_PHONE_FAILURE';
// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  // 在createAction中组装action
  // 在中间件(/src/store/createStore.js)中组装action, 可传入的参数是types, callAPI, shouldCallAPI, payload, callback
  sendRequest: (params) => ({
    types: [ORDERDETAIL_REQUEST_DO, ORDERDETAIL_REQUEST_SUCCESS, ORDERDETAIL_REQUEST_FAILURE],
    callAPI: () => fetch('/order/detail', params),
  }),
  searchCancelReason: () => ({
    types: [ORDERDETAIL_REASON_DO, ORDERDETAIL_REASON_SUCCESS, ORDERDETAIL_REASON_FAILURE],
    callAPI: () => fetch('/dictionary/query', {
      type: 'CANCEL_REASON',
    }),
  }),
  cancelOrder: (params) => ({
    types: [ORDERDETAIL_CANCEL_ORDER_DO, ORDERDETAIL_CANCEL_ORDER_SUCCESS, ORDERDETAIL_CANCEL_ORDER_FAILURE],
    callAPI: () => fetch('/order/cancel', params),
  }),
  searchLogistics: (params) => ({
    types: [
      ORDERDETAIL_LOGISTICS_LIST_ORDER_DO, ORDERDETAIL_LOGISTICS_LIST_SUCCESS, ORDERDETAIL_LOGISTICS_LIST_FAILURE,
    ],
    callAPI: () => fetch('/order/logistics', params),
  }),
  // get store phone number
  getStorePhone: (params) => ({
    types: [ORDERDETAIL_GET_PHONE_REQUEST, ORDERDETAIL_GET_PHONE_SUCCESS, ORDERDETAIL_GET_PHONE_FAILURE],
    callAPI: () => fetch('/order/user/phone', params),
  }),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ORDERDETAIL_GET_PHONE_REQUEST]: (state) => ({
    ...state,
    loading: true,
  }),
  [ORDERDETAIL_GET_PHONE_SUCCESS]: (state, action) => {
    const {
      buyerNickname,
      buyerPhone,
    } = action.data;
    if (!buyerNickname || !buyerPhone) {
      message.warning('部分手机号未获取到');
    }
    // record.phone = phone;
    const { data } = state;
    data.buyerNickname = buyerNickname;
    data.orderAddress.phone = buyerPhone;
    return {
      ...state,
      data:{
        ...data,
      },
    };
  },
  [ORDERDETAIL_GET_PHONE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ORDERDETAIL_LOGISTICS_LIST_ORDER_DO]: (state) => ({
    ...state,
    loading: true,
  }),
  [ORDERDETAIL_LOGISTICS_LIST_SUCCESS]: (state, action) => {
    const { data } = action;
    return {
      ...state,
      data,
      loading: false,
    };
  },
  [ORDERDETAIL_LOGISTICS_LIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ORDERDETAIL_CANCEL_ORDER_DO]: (state) => ({
    ...state,
    loading: true,
  }),
  [ORDERDETAIL_CANCEL_ORDER_SUCCESS]: (state, action) => {
    message.success('取消成功');
    const { data } = action;
    return {
      ...state,
      data,
      loading: false,
    };
  },
  [ORDERDETAIL_CANCEL_ORDER_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ORDERDETAIL_REQUEST_DO]: (state) => ({
    ...state,
    loading: true,
  }),
  [ORDERDETAIL_REQUEST_SUCCESS]: (state, action) => {
    const { data } = action;
    return {
      ...state,
      data,
      loading: false,
    };
  },
  [ORDERDETAIL_REQUEST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ORDERDETAIL_REASON_DO]: (state) => ({
    ...state,
    loading: true,
  }),
  [ORDERDETAIL_REASON_SUCCESS]: (state, action) => {
    const { list } = action.data;
    return {
      ...state,
      cancelList: list,
      loading: false,
    };
  },
  [ORDERDETAIL_REASON_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  loading: false,
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
