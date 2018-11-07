import 'moment/locale/zh-cn';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const TAGLIST_REQUEST = 'TAGLIST_REQUEST';
const TAGLIST_SUCCESS = 'TAGLIST_SUCCESS';
const TAGLIST_FAILURE = 'TAGLIST_FAILURE';

const TAGLIST_CHANGE_SEARCH = 'TAGLIST_CHANGE_SEARCH';
const TAGLIST_MODAL_CHANGE = 'TAGLIST_MODAL_CHANGE';

const TAGLIST_DELETE_REQUEST = 'TAGLIST_DELETE_REQUEST';
const TAGLIST_DELETE_SUCCESS = 'TAGLIST_DELETE_SUCCESS';
const TAGLIST_DELETE_FAILURE = 'TAGLIST_DELETE_FAILURE';

const TAGLIST_TAGMODAL_CHANGE = 'TAGLIST_TAGMODAL_CHANGE';
const TAGLIST_TAGRECORD_CHANGE = 'TAGLIST_TAGRECORD_CHANGE';

const TAGLIST_SAVE_REQUEST = 'TAGLIST_SAVE_REQUEST';
const TAGLIST_SAVE_SUCCESS = 'TAGLIST_SAVE_SUCCESS';
const TAGLIST_SAVE_FAILURE = 'TAGLIST_SAVE_FAILURE';
// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  loadData: (params) => ({
    types: [TAGLIST_REQUEST, TAGLIST_SUCCESS, TAGLIST_FAILURE],
    // FIX ME
    callAPI: () => fetch('/tag/list', params),
    // callAPI: () => fetch(
    //   'http://172.16.2.71:8068/mockjsdata/85/tag/list',
    //   params,
    //   // FIX ME
    //   { headers: {} },
    // ),
    payload: params,
  }),
  // 改变搜索条件
  changeSearch: createAction(TAGLIST_CHANGE_SEARCH, 'fields'),
  showModal: createAction(TAGLIST_MODAL_CHANGE, 'fields'),
  deleteTag: (params) => ({
    types: [TAGLIST_DELETE_REQUEST, TAGLIST_DELETE_SUCCESS, TAGLIST_DELETE_FAILURE],
    callAPI: () => fetch('/tag/delete', params),
    payload: params,
  }),
  showTagModal: createAction(TAGLIST_TAGMODAL_CHANGE, 'fields'),
  changeRecord: createAction(TAGLIST_TAGRECORD_CHANGE, 'fields'),
  saveTag: (params) => ({
    types: [TAGLIST_SAVE_REQUEST, TAGLIST_SAVE_SUCCESS, TAGLIST_SAVE_FAILURE],
    callAPI: () => fetch('/tag/edit', params),
    payload: params,
  }),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [TAGLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [TAGLIST_SUCCESS]: (state, action) => {
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
  [TAGLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [TAGLIST_CHANGE_SEARCH]: (state, action) => ({
    ...state,
    searchParams: {
      ...state.searchParams,
      ...action.fields,
    },
  }),
  [TAGLIST_MODAL_CHANGE]: (state, action) => ({ ...state, ...action.fields }),
  [TAGLIST_DELETE_REQUEST]: (state) => ({ ...state, loading: true }),
  [TAGLIST_DELETE_SUCCESS]: (state) => ({ ...state, loading: false }),
  [TAGLIST_DELETE_FAILURE]: (state) => ({ ...state, loading: false }),
  [TAGLIST_TAGMODAL_CHANGE]: (state, action) => ({ ...state, ...action.fields }),
  [TAGLIST_TAGRECORD_CHANGE]: (state, action) => ({
    ...state,
    modalFormValue: { ...state.modalFormValue, ...action.fields },
  }),
  [TAGLIST_SAVE_REQUEST]: (state) => ({ ...state, loading: true }),
  [TAGLIST_SAVE_SUCCESS]: (state) => ({ ...state, loading: false }),
  [TAGLIST_SAVE_FAILURE]: (state) => ({ ...state, loading: false }),
};

// ------------------------------------
// Reducer
// ------------------------------------


const initialState = {
  mVisible: false,
  tmVisible: false,
  targetTagId: '',
  modalContent: '',
  loading: false,
  data: [],
  page: {
    pageNo: 1,
    pageSize: 10,
  },
  searchParams: {},
  modalFormValue: {},
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
