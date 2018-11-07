import 'moment/locale/zh-cn';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const COUPON_REQUEST = 'COUPON_REQUEST';
const COUPON_SUCCESS = 'COUPON_SUCCESS';
const COUPON_FAILURE = 'COUPON_FAILURE';

const COUPON_UPDATE_REQUEST = 'COUPON_UPDATE_REQUEST';
const COUPON_UPDATE_SUCCESS = 'COUPON_UPDATE_SUCCESS';
const COUPON_UPDATE_FAILURE = 'COUPON_UPDATE_FAILURE';

const COUPON_DELETE_REQUEST = 'COUPON_DELETE_REQUEST';
const COUPON_DELETE_SUCCESS = 'COUPON_DELETE_SUCCESS';
const COUPON_DELETE_FAILURE = 'COUPON_DELETE_FAILURE';

const PRODUCTLIST_CHANGE_SEARCH = 'PRODUCTLIST_CHANGE_SEARCH';
// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  loadData: (params) => ({
    types: [COUPON_REQUEST, COUPON_SUCCESS, COUPON_FAILURE],
    callAPI: () => fetch('/coupon/list', params),
    payload: params,
  }),
  updateStatus: (params) => ({
    types: [COUPON_UPDATE_REQUEST, COUPON_UPDATE_SUCCESS, COUPON_UPDATE_FAILURE],
    callAPI: () => fetch('/common/coupon/status/update', params),
    payload: params,
  }),
  couponDelete: (params) => ({
    types: [COUPON_DELETE_REQUEST, COUPON_DELETE_SUCCESS, COUPON_DELETE_FAILURE],
    callAPI: () => fetch('/coupon/del', params),
    payload: params,
  }),
  // 改变搜索条件
  changeSearch: createAction(PRODUCTLIST_CHANGE_SEARCH, 'fields'),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [COUPON_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPON_SUCCESS]: (state, action) => {
    const { data } = action;
    const newData = data.list;
    return {
      ...state,
      loading: false,
      data: newData,
      page: {
        pageNo: data.pageNo,
        pageSize: data.pageSize,
        count: data.totalSize,
      },
    };
  },
  [COUPON_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPON_UPDATE_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPON_UPDATE_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPON_UPDATE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPON_DELETE_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPON_DELETE_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPON_DELETE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTLIST_CHANGE_SEARCH]: (state, action) => ({
    ...state,
    searchParams: {
      ...state.searchParams,
      ...action.fields,
    },
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------


const initialState = {
  loading: false,
  data: [],
  page: {
    pageNo: 1,
    pageSize: 10,
  },
  searchParams: {},
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
