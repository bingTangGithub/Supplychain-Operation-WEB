import moment from 'moment';
import 'moment/locale/zh-cn';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const CHECKOUTLIST_REQUEST = 'CHECKOUTLIST_REQUEST';
const CHECKOUTLIST_SUCCESS = 'CHECKOUTLIST_SUCCESS';
const CHECKOUTLIST_FAILURE = 'CHECKOUTLIST_FAILURE';

const CHECKOUTLIST_BUYERLIST_REQUEST = 'CHECKOUTLIST_BUYERLIST_REQUEST';
const CHECKOUTLIST_BUYERLIST_SUCCESS = 'CHECKOUTLIST_BUYERLIST_SUCCESS';
const CHECKOUTLIST_BUYERLIST_FAILURE = 'CHECKOUTLIST_BUYERLIST_FAILURE';

const CHECKOUTLIST_CHANGE_SEARCH = 'CHECKOUTLIST_CHANGE_SEARCH';

const CHECKOUTLIST_LIST_RESET = 'CHECKOUTLIST_LIST_RESET';

const CHECKOUTLIST_RESET_BUYERLIST = 'CHECKOUTLIST_RESET_BUYERLIST';

const initialState = {
  buyerList: {
    loading: false,
    data: [],
    query: '',
  },
  loading: false,
  data: [],
  page: {
    pageSize: 10,
    count: 0,
    pageNo: 1,
  },
  searchParams: {
    pageNo: 1,
    pageSize: 10,
    confirmDate:{
      value:[
        moment().subtract(6, 'days'),
        moment(),
      ],
      type: 'twodateRange',
    },
  },
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  fetchBuyerList: (params) => ({
    types: [CHECKOUTLIST_BUYERLIST_REQUEST, CHECKOUTLIST_BUYERLIST_SUCCESS, CHECKOUTLIST_BUYERLIST_FAILURE],
    callAPI: () => fetch('/buyer/list', params),
    payload: params,
  }),
  resetBuyerlist:createAction(CHECKOUTLIST_RESET_BUYERLIST),
  search: (params) => ({
    types: [CHECKOUTLIST_REQUEST, CHECKOUTLIST_SUCCESS, CHECKOUTLIST_FAILURE],
    callAPI: () => {
      const {
        confirmDate,
      } = params;
      const newParams = params;
      const [confirmDateStart, confirmDateEnd] = confirmDate.value;
      if (confirmDateEnd) newParams.confirmDateEnd = `${moment(confirmDateEnd).format('YYYY-MM-DD')} 23:59:59`;
      if (confirmDateStart) newParams.confirmDateStart = `${moment(confirmDateStart).format('YYYY-MM-DD')} 00:00:00`;
      return fetch('/checkout/list', newParams);
    },
  }),
  // 改变搜索条件
  changeSearch: createAction(CHECKOUTLIST_CHANGE_SEARCH, 'fields'),
  reset:createAction(CHECKOUTLIST_LIST_RESET),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [CHECKOUTLIST_BUYERLIST_REQUEST]: (state, action) => ({
    ...state,
    buyerList: {
      ...state.buyerList,
      query: action.name,
    },
  }),
  [CHECKOUTLIST_BUYERLIST_SUCCESS]: (state, action) => ({
    ...state,
    buyerList: {
      ...state.buyerList,
      data: action.data.list,
      query: action.data.list.length ? state.buyerList.query : '',
    },
  }),
  [CHECKOUTLIST_BUYERLIST_FAILURE]: (state) => ({
    ...state,
  }),
  [CHECKOUTLIST_RESET_BUYERLIST]: (state) => ({
    ...state,
    buyerList: initialState.buyerList,
  }),
  [CHECKOUTLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [CHECKOUTLIST_SUCCESS]: (state, action) => {
    const { data } = action;
    const {
      list,
      pageNo,
      pageSize,
      totalSize,
    } = data;
    return {
      ...state,
      loading: false,
      data: list,
      page: {
        ...state.page,
        pageNo,
        pageSize,
        count: totalSize,
      },
    };
  },
  [CHECKOUTLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [CHECKOUTLIST_CHANGE_SEARCH]: (state, action) => {
    const { fields } = action;
    const { value } = fields.confirmDate;
    fields.confirmDate.value = value instanceof Array ? value : [value.startValue, value.endValue];
    return {
      ...state,
      searchParams: {
        ...state.searchParams,
        ...fields,
      },
    };
  },
  [CHECKOUTLIST_LIST_RESET]: () => initialState,
};

// ------------------------------------
// Reducer
// ------------------------------------


export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
