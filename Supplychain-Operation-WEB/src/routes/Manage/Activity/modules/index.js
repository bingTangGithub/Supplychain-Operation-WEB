import 'moment/locale/zh-cn';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const ACTIVITY_REQUEST = 'ACTIVITY_REQUEST';
const ACTIVITY_SUCCESS = 'ACTIVITY_SUCCESS';
const ACTIVITY_FAILURE = 'ACTIVITY_FAILURE';

const ACTIVITY_UPDATE_REQUEST = 'ACTIVITY_UPDATE_REQUEST';
const ACTIVITY_UPDATE_SUCCESS = 'ACTIVITY_UPDATE_SUCCESS';
const ACTIVITY_UPDATE_FAILURE = 'ACTIVITY_UPDATE_FAILURE';

const ACTIVITY_DELETE_REQUEST = 'ACTIVITY_DELETE_REQUEST';
const ACTIVITY_DELETE_SUCCESS = 'ACTIVITY_DELETE_SUCCESS';
const ACTIVITY_DELETE_FAILURE = 'ACTIVITY_DELETE_FAILURE';

const ACTIVITY_CHANGE_SEARCH = 'ACTIVITY_CHANGE_SEARCH';
// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  loadData: (params) => ({
    types: [ACTIVITY_REQUEST, ACTIVITY_SUCCESS, ACTIVITY_FAILURE],
    callAPI: () => fetch('/specialPrice/list', params),
    payload: params,
  }),
  updateStatus: (params) => ({
    types: [ACTIVITY_UPDATE_REQUEST, ACTIVITY_UPDATE_SUCCESS, ACTIVITY_UPDATE_FAILURE],
    callAPI: () => fetch('/specialPrice/update', params),
    payload: params,
  }),
  activityDelete: (params) => ({
    types: [ACTIVITY_DELETE_REQUEST, ACTIVITY_DELETE_SUCCESS, ACTIVITY_DELETE_FAILURE],
    callAPI: () => fetch('/specialPrice/del', params),
    payload: params,
  }),
  // 改变搜索条件
  changeSearch: createAction(ACTIVITY_CHANGE_SEARCH, 'fields'),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ACTIVITY_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [ACTIVITY_SUCCESS]: (state, action) => {
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
  [ACTIVITY_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITY_UPDATE_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [ACTIVITY_UPDATE_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITY_UPDATE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITY_DELETE_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [ACTIVITY_DELETE_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITY_DELETE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITY_CHANGE_SEARCH]: (state, action) => ({
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
