import 'moment/locale/zh-cn';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const PRODUCTLIST_REQUEST = 'PRODUCTLIST_REQUEST';
const PRODUCTLIST_SUCCESS = 'PRODUCTLIST_SUCCESS';
const PRODUCTLIST_FAILURE = 'PRODUCTLIST_FAILURE';

const PRODUCTLIST_STATUSCHANGE_REQUEST = 'PRODUCTLIST_STATUSCHANGE_REQUEST';
const PRODUCTLIST_STATUSCHANGE_SUCCESS = 'PRODUCTLIST_STATUSCHANGE_SUCCESS';
const PRODUCTLIST_STATUSCHANGE_FAILURE = 'PRODUCTLIST_STATUSCHANGE_FAILURE';

const PRODUCTLIST_SHOPLIST_REQUEST = 'PRODUCTLIST_SHOPLIST_REQUEST';
const PRODUCTLIST_SHOPLIST_SUCCESS = 'PRODUCTLIST_SHOPLIST_SUCCESS';
const PRODUCTLIST_SHOPLIST_FAILURE = 'PRODUCTLIST_SHOPLIST_FAILURE';

const PRODUCTLIST_OPERATE_DATA = 'PRODUCTLIST_OPERATE_DATA';
const PRODUCTLIST_CHANGE_MODAL_STATUS = 'PRODUCTLIST_CHANGE_MODAL_STATUS';

const PRODUCTLIST_CHANGE_SEARCH = 'PRODUCTLIST_CHANGE_SEARCH';
const PRODUCTLIST_PARAMS_RESET = 'PRODUCTLIST_PARAMS_RESET';

const PRODUCTLIST_LIST_RESET = 'PRODUCTLIST_LIST_RESET';

const initialState = {
  loading: false,
  data: [],
  shopList: [],
  page: {
    pageSize: 10,
    count: 0,
    pageNo: 1,
  },
  searchParams: {
    pageNo: 1,
    pageSize: 10,
  },
  modalShow: false,
  modalText: '',
  rowKey: 'id', // table 每行的rowKey
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  search: (params) => ({
    types: [PRODUCTLIST_REQUEST, PRODUCTLIST_SUCCESS, PRODUCTLIST_FAILURE],
    callAPI: () => {
      const __params = {};
      Object.keys(params).forEach((keyname) => {
        let target = params[keyname];
        if (Object.prototype.toString.call(target) === '[object Object]') target = target.value;
        if (target || target === 0) __params[keyname] = target;
      });
      return fetch('/spu/list', __params);
    },
  }),
  productOperate: (params) => ({
    types: [PRODUCTLIST_STATUSCHANGE_REQUEST, PRODUCTLIST_STATUSCHANGE_SUCCESS, PRODUCTLIST_STATUSCHANGE_FAILURE],
    callAPI: () => fetch('/spu/operate', params),
  }),
  getShopList: () => ({
    types: [PRODUCTLIST_SHOPLIST_REQUEST, PRODUCTLIST_SHOPLIST_SUCCESS, PRODUCTLIST_SHOPLIST_FAILURE],
    callAPI: () => fetch('/shop/list', { pageNo: 1, pageSize: -1 }),
  }),
  operateData: createAction(PRODUCTLIST_OPERATE_DATA, 'fields'),
  modalShowChange: createAction(PRODUCTLIST_CHANGE_MODAL_STATUS, 'fields'),
  // 改变搜索条件
  changeSearch: createAction(PRODUCTLIST_CHANGE_SEARCH, 'fields'),
  setSearchParams: createAction(PRODUCTLIST_PARAMS_RESET, 'fields'),
  reset: createAction(PRODUCTLIST_LIST_RESET),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [PRODUCTLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [PRODUCTLIST_SUCCESS]: (state, action) => {
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
  [PRODUCTLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),

  [PRODUCTLIST_STATUSCHANGE_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [PRODUCTLIST_STATUSCHANGE_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTLIST_STATUSCHANGE_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),

  [PRODUCTLIST_SHOPLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [PRODUCTLIST_SHOPLIST_SUCCESS]: (state, action) => ({
    ...state,
    shopList: action.data.list.map(({ shopName, sid }) => ({ label: shopName, value: sid })),
    loading: false,
  }),
  [PRODUCTLIST_SHOPLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTLIST_OPERATE_DATA]: (state, action) => ({
    ...state,
    loading: false,
    data: action.fields,
  }),
  [PRODUCTLIST_CHANGE_MODAL_STATUS]: (state, action) => {
    const { fields } = action;
    const { modalShow, operateType } = fields;
    const operateAndType = {
      delete: '删除后，此商品将不能再恢复。确定删除？',
      onSale: '确定进行上架操作？',
      offSale: '确定进行下架操作？',
    };
    const modalText = operateAndType[operateType];
    return {
      ...state,
      loading: false,
      modalShow,
      operatedObj: fields,
      modalText,
    };
  },
  [PRODUCTLIST_CHANGE_SEARCH]: (state, action) => ({
    ...state,
    searchParams: {
      ...state.searchParams,
      ...action.fields,
    },
  }),
  [PRODUCTLIST_PARAMS_RESET]: (state, action) => ({
    ...state,
    ...action.fields,
  }),
  [PRODUCTLIST_LIST_RESET]: () => initialState,
};

// ------------------------------------
// Reducer
// ------------------------------------


export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
