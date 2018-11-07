import 'moment/locale/zh-cn';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const SHOPLIST_REQUEST = 'SHOPLIST_REQUEST';
const SHOPLIST_SUCCESS = 'SHOPLIST_SUCCESS';
const SHOPLIST_FAILURE = 'SHOPLIST_FAILURE';

const SHOPLIST_CHANGE_SEARCH = 'SHOPLIST_CHANGE_SEARCH';
const SHOPLIST_MODAL_CHANGE = 'SHOPLIST_MODAL_CHANGE';

const SHOPLIST_STATUS_REQUEST = 'SHOPLIST_STATUS_REQUEST';
const SHOPLIST_STATUS_SUCCESS = 'SHOPLIST_STATUS_SUCCESS';
const SHOPLIST_STATUS_FAILURE = 'SHOPLIST_STATUS_FAILURE';
// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  loadData: (params) => ({
    types: [SHOPLIST_REQUEST, SHOPLIST_SUCCESS, SHOPLIST_FAILURE],
    callAPI: () => fetch('/shop/list', params),
    payload: params,
  }),
  // 改变搜索条件
  changeSearch: createAction(SHOPLIST_CHANGE_SEARCH, 'fields'),
  showModal: createAction(SHOPLIST_MODAL_CHANGE, 'fields'),
  changeStatus: (params) => ({
    types: [SHOPLIST_STATUS_REQUEST, SHOPLIST_STATUS_SUCCESS, SHOPLIST_STATUS_FAILURE],
    callAPI: () => fetch('/shop/status', params),
    payload: params,
  }),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SHOPLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [SHOPLIST_SUCCESS]: (state, action) => {
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
  [SHOPLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [SHOPLIST_CHANGE_SEARCH]: (state, action) => ({
    ...state,
    searchParams: {
      ...state.searchParams,
      ...action.fields,
    },
  }),
  [SHOPLIST_MODAL_CHANGE]:  (state, action) => ({ ...state, ...action.fields }),
  [SHOPLIST_STATUS_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [SHOPLIST_STATUS_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [SHOPLIST_STATUS_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------


const initialState = {
  mVisible: false,
  targetStatus: '',
  targetSid: '',
  modalContent: '',
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
