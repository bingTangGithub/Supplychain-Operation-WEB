import moment from 'moment';
import 'moment/locale/zh-cn';
import fetch from '../../../../util/fetch';
import { createAction, formatDate, fenToYuan } from '../../../../util';

const ORDER_LIST_REQUEST = 'ORDER_LIST_REQUEST';
const ORDER_LIST_SUCCESS = 'ORDER_LIST_SUCCESS';
const ORDER_LIST_FAILURE = 'ORDER_LIST_FAILURE';
const ORDER_LIST_CHANGE = 'ORDER_LIST_CHANGE';
const ORDER_LIST_RESET = 'ORDER_LIST_RESET';
const CHANGE_ORDER_STATUS = 'CHANGE_ORDER_STATUS';

const ORDER_LIST_BUYERLIST_REQUEST = 'ORDER_LIST_BUYERLIST_REQUEST';
const ORDER_LIST_BUYERLIST_SUCCESS = 'ORDER_LIST_BUYERLIST_SUCCESS';
const ORDER_LIST_BUYERLIST_FAILURE = 'ORDER_LIST_BUYERLIST_FAILURE';

const ORDER_LIST_RESET_BUYERLIST = 'ORDER_LIST_RESET_BUYERLIST';

const dicOrderStatus = {
  1:'待付款',
  2:'待发货',
  3:'待签收',
  4:'已完成',
  5:'已关闭',
};

const dicPayMethod = {
  ONLINE:'线上支付',
  CASH_ON_DELIVERY:'货到付款',
};

// ------------------------------------
// Actions
// ------------------------------------

export const actions = {
  fetchBuyerList: (params) => ({
    types: [ORDER_LIST_BUYERLIST_REQUEST, ORDER_LIST_BUYERLIST_SUCCESS, ORDER_LIST_BUYERLIST_FAILURE],
    callAPI: () => fetch('/buyer/list', params),
    payload: params,
  }),
  resetBuyerlist:createAction(ORDER_LIST_RESET_BUYERLIST),
  search:(params) => ({
    types: [ORDER_LIST_REQUEST, ORDER_LIST_SUCCESS, ORDER_LIST_FAILURE],
    callAPI: () => fetch('/order/list', params, {
      method: 'POST',
    }),
  }),
  changeSearch:createAction(ORDER_LIST_CHANGE, 'fields'),
  changeOrderStatus:createAction(CHANGE_ORDER_STATUS, 'params'),
  reset:createAction(ORDER_LIST_RESET),
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  buyerList: {
    loading: false,
    data: [],
    query: '',
  },
  loading: false,
  page: {
    pageSize: 10,
    count: 0,
    pageNo: 1,
  },
  data:{
    list:[],
  },
  cancelList:[],
  searchParams: {
    pageNo: 1,
    pageSize: 10,
    orderNo:'',
    orderStatus:0,
    createTime:{
      value:[
        moment().subtract(11, 'days'),
        moment(),
      ],
      type: 'twodateRange',
    },
  },
  orderStatusActive:[true, false, false, false, false, false],
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ORDER_LIST_BUYERLIST_REQUEST]: (state, action) => ({
    ...state,
    buyerList: {
      ...state.buyerList,
      query: action.name,
    },
  }),
  [ORDER_LIST_BUYERLIST_SUCCESS]: (state, action) => ({
    ...state,
    buyerList: {
      ...state.buyerList,
      data: action.data.list,
      query: action.data.list.length ? state.buyerList.query : '',
    },
  }),
  [ORDER_LIST_BUYERLIST_FAILURE]: (state) => ({
    ...state,
  }),
  [ORDER_LIST_RESET_BUYERLIST]: (state) => ({
    ...state,
    buyerList: initialState.buyerList,
  }),
  [ORDER_LIST_REQUEST]: (state) => ({
    ...state,
    loading: true,
  }),
  [ORDER_LIST_SUCCESS]: (state, action) => {
    const { data } = action;
    if (data.list && data.list.length !== 0) {
      data.list.map((item, index) => {
        const newItem = item;
        newItem.key = index;
        if (newItem.createTime) {
          newItem.createTime = formatDate(newItem.createTime, 'yyyy-MM-dd HH:mm:ss');
        } else {
          newItem.createTime = '';
        }
        newItem.orderStatus = dicOrderStatus[newItem.orderStatus];
        newItem.discount = `${newItem.discountName || ''}\n${newItem.discountAmount ?
          -fenToYuan(newItem.discountAmount, 2) : ''}`;
        if (newItem.orderAddress) {
          const temp = newItem.orderAddress;
          const addressTemp = temp.province + temp.city + temp.district + temp.detailAddress;
          newItem.orderAddress = `${addressTemp} 联系人：${temp.contactName}`;
        }
        if (newItem.orderAmountTotal) {
          newItem.orderAmountTotal = fenToYuan(newItem.orderAmountTotal, 2);
        }
        if (newItem.actuallyPayAmount) {
          newItem.actuallyPayAmount = fenToYuan(newItem.actuallyPayAmount, 2);
        }
        if (newItem.payMethod) {
          newItem.orderAmountTotal = `${newItem.orderAmountTotal}\n${dicPayMethod[newItem.payMethod]}`;
        }
        if (newItem.orderDesc) {
          newItem.actuallyPayAmount = `${newItem.actuallyPayAmount}\n${newItem.orderDesc}`;
        }
        return false;
      });
    }
    const newState = Object.assign({}, state);
    newState.data = Object.assign({}, state.data, data);
    return {
      ...newState,
      loading: false,
      page:{
        ...state.page,
        pageNo: data.pageNo,
        pageSize: data.pageSize,
        count: data.totalSize,
      },
    };
  },
  [ORDER_LIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
    data: [],
  }),
  [ORDER_LIST_CHANGE]: (state, action) => {
    const { fields } = action;
    const { value } = fields.createTime;
    fields.createTime.value = value instanceof Array ? value : [value.startValue, value.endValue];
    return {
      ...state,
      searchParams: {
        ...state.searchParams,
        ...fields,
      },
    };
  },
  [ORDER_LIST_RESET]:() => initialState,
  [CHANGE_ORDER_STATUS]: (state, action) => {
    const { params } = action;
    const orderStatusActive = [false, false, false, false, false, false];
    orderStatusActive[params.orderStatus] = true;
    return {
      ...state,
      searchParams: {
        ...state.searchParams,
        ...params,
      },
      orderStatusActive,
    };
  },
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
