import fetch from '../../../../util/fetch';
import { createAction, mapToSendData } from '../../../../util';

const COUPONGRANT_REQUEST = 'COUPONGRANT_REQUEST';
const COUPONGRANT_SUCCESS = 'COUPONGRANT_SUCCESS';
const COUPONGRANT_FAILURE = 'COUPONGRANT_FAILURE';
const COUPONGRANT_COUPONCHOOSE_SUCCESS = 'COUPONGRANT_COUPONCHOOSE_SUCCESS';
const COUPONGRANT_COUPONCHOOSE_REQUEST = 'COUPONGRANT_COUPONCHOOSE_REQUEST';
const COUPONGRANT_COUPONCHOOSE_FAILURE = 'COUPONGRANT_COUPONCHOOSE_FAILURE';
const COUPONGRANT_COUPONRECORD_DEL = 'COUPONGRANT_COUPONRECORD_DEL';
const COUPONGRANT_PHONERECORD_ADD = 'COUPONGRANT_PHONERECORD_ADD';
const COUPONGRANT_PHONERECORD_DEL = 'COUPONGRANT_PHONERECORD_DEL';

//------------------------
// actions
//------------------------
export const actions = {
  save: (params) => ({
    types: [COUPONGRANT_REQUEST, COUPONGRANT_SUCCESS, COUPONGRANT_FAILURE],
    callAPI: () => fetch('/coupon/grant', mapToSendData(params, (data) => {
      const newData = { ...data };
      return newData;
    })),
    payload: params,
  }),
  addCoupon: (params) => ({
    types: [COUPONGRANT_COUPONCHOOSE_REQUEST, COUPONGRANT_COUPONCHOOSE_SUCCESS, COUPONGRANT_COUPONCHOOSE_FAILURE],
    callAPI: () => fetch('/coupon/choose', params),
  }),
  delCoupon: createAction(COUPONGRANT_COUPONRECORD_DEL, 'index'),
  addPhone: createAction(COUPONGRANT_PHONERECORD_ADD, 'phone'),
  delPhone: createAction(COUPONGRANT_PHONERECORD_DEL, 'index'),
};

//------------------------
// Action Handlers
//------------------------

const ACTION_HANDLERS = {
  [COUPONGRANT_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPONGRANT_SUCCESS] : (state) => ({
    ...state,
    loading: false,
  }),
  [COUPONGRANT_FAILURE] : (state) => ({
    ...state,
    loading: false,
  }),
  [COUPONGRANT_COUPONCHOOSE_REQUEST] : (state) => ({
    ...state,
    loading: false,
  }),
  [COUPONGRANT_COUPONCHOOSE_SUCCESS] : (state, action) => {
    const newState = { ...state };
    const record = { ...state.record };
    record.coupons = record.coupons.concat(action.data);
    newState.record = record;
    newState.loading = false;
    return newState;
  },
  [COUPONGRANT_COUPONCHOOSE_FAILURE] : (state) => ({
    ...state,
    loading: false,
  }),
  // 上面事件定义中传入的参数index可以在这里直接使用
  [COUPONGRANT_COUPONRECORD_DEL] : (state, action) => {
    const newState = { ...state };
    const record = { ...state.record };
    record.coupons.splice(action.index, 1);
    newState.record = record;
    newState.loading = false;
    return newState;
  },
  [COUPONGRANT_PHONERECORD_ADD] : (state, action) => {
    const newState = { ...state };
    const record = { ...state.record };
    record.phones = record.phones.concat(action.phone);
    newState.record = record;
    newState.loading = false;
    return newState;
  },
  [COUPONGRANT_PHONERECORD_DEL] : (state, action) => {
    const newState = { ...state };
    const record = { ...state.record };
    record.phones.splice(action.index, 1);
    newState.record = record;
    newState.loading = false;
    return newState;
  },
};

//------------------------
// Reducer
//------------------------

const initialState = {
  loading: false,
  record:{
    coupons: [],
    phones: [],
    couponIds: '',
    phone1: '',
  },
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
