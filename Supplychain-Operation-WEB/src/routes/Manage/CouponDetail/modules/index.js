import { message } from 'antd';
import fetch from '../../../../util/fetch';
import { createAction, mapReceivedData, mapToSendData } from '../../../../util';

const recordCopy = {
  couponName: {
    value: '',
  },
  description: {
    value: undefined,
  },
  remark: {
    value: undefined,
  },
  couponType: {
    value: 'fullcut',
  },
  overPrice: {
    value: undefined,
  },
  price: {
    value: undefined,
  },
  discount: {
    value: undefined,
  },
  maxPrice: {
    value: undefined,
  },
  quantity: {
    value: undefined,
  },
  receiveUidMax: {
    value: undefined,
  },
  receiveTime: {
    value: [],
  },
  customerType: {
    value: 'all',
  },
  validTimeType: {
    value: '1',
  },
  intervalDay: {
    value: undefined,
  },
  useTime: {
    type: 'datetime',
    value: [],
  },
  overlay: '1',
  isOpen: {
    value: 1,
  },
  limitType: {
    value: 'allspu',
  },
  couponId: {
    value: undefined,
  },
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const COUPONDETAIL_RECORD_CHANGE = 'COUPONDETAIL_RECORD_CHANGE';
const COUPONDETAIL_REQUEST = 'COUPONDETAIL_REQUEST';
const COUPONDETAIL_SUCCESS = 'COUPONDETAIL_SUCCESS';
const COUPONDETAIL_FAILURE = 'COUPONDETAIL_FAILURE';
const COUPONDETAIL_SAVE_REQUEST = 'COUPONDETAIL_SAVE_REQUEST';
const COUPONDETAIL_SAVE_SUCCESS = 'COUPONDETAIL_SAVE_SUCCESS';
const COUPONDETAIL_SAVE_FAILURE = 'COUPONDETAIL_SAVE_FAILURE';
const COUPONDETAIL_PROLIST_REQUEST = 'COUPONDETAIL_PROLIST_REQUEST';
const COUPONDETAIL_PROLIST_SUCCESS = 'COUPONDETAIL_PROLIST_SUCCESS';
const COUPONDETAIL_PROLIST_FAILURE = 'COUPONDETAIL_PROLIST_FAILURE';
const COUPONDETAIL_SORTLIST_REQUEST = 'COUPONDETAIL_SORTLIST_REQUEST';
const COUPONDETAIL_SORTLIST_SUCCESS = 'COUPONDETAIL_SORTLIST_SUCCESS';
const COUPONDETAIL_SORTLIST_FAILURE = 'COUPONDETAIL_SORTLIST_FAILURE';
const COUPONDETAIL_RI_CHANGE = 'COUPONDETAIL_RI_CHANGE';
const COUPONDETAIL_VALIDTIME_CHANGE = 'COUPONDETAIL_VALIDTIME_CHANGE';
const COUPONDETIIL_PRO_CHANGESEARCH = 'COUPONDETIIL_PRO_CHANGESEARCH';
const COUPONDETIIL_CLEARPROPS = 'COUPONDETIIL_CLEARPROPS';

// ------------------------------------
// Actions
// ------------------------------------

export const actions = {
  changeRecord: createAction(COUPONDETAIL_RECORD_CHANGE, 'fields'),
  load: (id) => ({
    types: [COUPONDETAIL_REQUEST, COUPONDETAIL_SUCCESS, COUPONDETAIL_FAILURE],
    callAPI: () => fetch('/coupon/detail', { couponId: id }),
    payload: { couponId: id },
  }),
  save: (params) => ({
    types: [COUPONDETAIL_SAVE_REQUEST, COUPONDETAIL_SAVE_SUCCESS, COUPONDETAIL_SAVE_FAILURE],
    callAPI: () => fetch('/coupon/add', mapToSendData(params, (data) => {
      const newData = { ...data };
      if (newData.maxPrice !== null) {
        newData.maxPrice = Math.round(newData.maxPrice * 100);
      }
      if (newData.price !== null) {
        newData.price = Math.round(newData.price * 100);
      }
      if (newData.overPrice !== null) {
        newData.overPrice = Math.round(newData.overPrice * 100);
      }
      if (newData.discount !== null) {
        newData.discount *= 10;
      }
      const overlay = newData.overlay.toString();
      if (overlay === '1') {
        newData.overlay = true;
      } else {
        newData.overlay = false;
      }
      newData.receiveTime = newData.receiveTime || [];
      newData.receiveTimeStart = newData.receiveTime[0] ? newData.receiveTime[0].valueOf() : '';
      newData.receiveTimeEnd = newData.receiveTime[1] ? newData.receiveTime[1].valueOf() : '';
      newData.useTime = newData.useTime || [];
      newData.useTimeStart = newData.useTime[0] ? newData.useTime[0].valueOf() : '';
      newData.useTimeEnd = newData.useTime[1] ? newData.useTime[1].valueOf() : '';
      return newData;
    })),
    payload: params,
  }),
  loadPro:  (params) => ({
    types: [COUPONDETAIL_PROLIST_REQUEST, COUPONDETAIL_PROLIST_SUCCESS, COUPONDETAIL_PROLIST_FAILURE],
    callAPI: () => fetch('/coupon/product/list', mapToSendData(params, (data) => {
      const newData = { ...data };
      if (newData.categoryId) {
        newData.categoryId = newData.categoryId[newData.categoryId.length - 1];
      }
      return newData;
    })),
    payload: params,
  }),
  loadSort:  (params) => ({
    types: [COUPONDETAIL_SORTLIST_REQUEST, COUPONDETAIL_SORTLIST_SUCCESS, COUPONDETAIL_SORTLIST_FAILURE],
    callAPI: () => fetch('/categoryList', params),
    payload: params,
  }),
  changeRI: createAction(COUPONDETAIL_RI_CHANGE, 'param'),
  changeValidTime: createAction(COUPONDETAIL_VALIDTIME_CHANGE, 'value'),
  changeSearch: createAction(COUPONDETIIL_PRO_CHANGESEARCH, 'fields'),
  clearProps: createAction(COUPONDETIIL_CLEARPROPS),
};

// ------------------------------------
// Constants
// ------------------------------------
const ACTION_HANDLERS = {
  [COUPONDETAIL_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPONDETAIL_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    record: mapReceivedData(action.data, (data) => {
      const newRecord = { ...data };
      if (newRecord.overPrice !== null) {
        newRecord.overPrice /= 100;
      }
      if (newRecord.price !== null) {
        newRecord.price /= 100;
      }
      if (newRecord.maxPrice !== null) {
        newRecord.maxPrice /= 100;
      }
      if (newRecord.discount !== null) {
        newRecord.discount /= 10;
      }
      if (!newRecord.validTimeType) {
        newRecord.validTimeType = {};
        if (typeof newRecord.intervalDay === 'number') {
          newRecord.validTimeType.value = '2';
        } else {
          newRecord.validTimeType.value = '1';
        }
      }
      newRecord.isOpen = newRecord.isOpen ? 1 : 0;
      newRecord.intervalDay = newRecord.intervalDay;
      const overlay = newRecord.overlay;
      if (overlay) {
        newRecord.overlay = '1';
      }
      return newRecord;
    }),
    pro: action.data.availableSpuIds,
    sort: action.data.availableCategoryIds,
  }),
  [COUPONDETAIL_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPONDETAIL_RECORD_CHANGE]: (state, action) => ({
    ...state,
    record: action.fields,
  }),
  [COUPONDETAIL_SAVE_REQUEST] : (state) => ({
    ...state,
    confirmLoading: true,
  }),
  [COUPONDETAIL_SAVE_SUCCESS]: (state) => {
    message.success('操作成功');
    return {
      ...state,
      confirmLoading: false,
      visible: false,
    };
  },
  [COUPONDETAIL_SAVE_FAILURE]: (state) => ({
    ...state,
    confirmLoading: false,
  }),
  [COUPONDETAIL_PROLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPONDETAIL_PROLIST_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    proData: action.data.list,
    page: {
      pageSize: action.data.pageSize,
      pageNo: action.data.pageNo,
      count: action.data.totalSize,
    },
  }),
  [COUPONDETAIL_PROLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPONDETAIL_SORTLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COUPONDETAIL_SORTLIST_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    sortData: action.data.sorts,
  }),
  [COUPONDETAIL_SORTLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [COUPONDETAIL_RI_CHANGE]: (state, action) => {
    const newState = { ...state };
    const record = newState.record;
    const field = record[action.param.name];
    field.value.forEach((item) => {
      const newItem = item;
      if (item.checked && !item.value) {
        newItem.value = '1';
      } else if (!item.checked && item.value) {
        newItem.value = '';
      }
    });
    return {
      ...state,
      record: action.params,
    };
  },
  [COUPONDETAIL_VALIDTIME_CHANGE]: (state, action) => {
    const newState = state;
    newState.record = { ...newState.record };
    if (action.value === '1') {
      newState.record.intervalDay.value = '';
      newState.record.useTime.value = [];
    } else {
      newState.record.useTime.value = [];
      newState.record.intervalDay.value = '';
    }
    return newState;
  },
  [COUPONDETIIL_PRO_CHANGESEARCH]: (state, action) => ({
    ...state,
    searchParams: action.fields,
  }),
  [COUPONDETIIL_CLEARPROPS]: (state) => ({
    ...state,
    pro: [],
    record: recordCopy,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------

const initialState = {
  record: recordCopy,
  selectedRowKeys: [],
  loading: false,
  confirmLoading: false,
  searchParams: {},
  page: {
    pageSize: 10,
    pageNo: 1,
  },
  proData: [],
  sortData: [],
  pro: [],
  sort: [],
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
