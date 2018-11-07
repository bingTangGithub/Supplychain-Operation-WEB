import { message } from 'antd';
import fetch from '../../../../util/fetch';
import { createAction, mapReceivedData, mapToSendData } from '../../../../util';


const recordCopy = {
  name: {
    value: '',
  },
  description: {
    value: undefined,
  },
  remark: {
    value: undefined,
  },
  activityTime: {
    value: [],
  },
  type: {
    value: '1',
  },
  inventoryLock: {
    value: 1,
  },
  uidLimitBuy: {
    value: 1,
  },
  activityDesc: {
    value: '',
  },
  status: {
    value: undefined,
  },
};

// ------------------------------------
// Constants
// ------------------------------------
const ACTIVITYDETAIL_RECORD_CHANGE = 'ACTIVITYDETAIL_RECORD_CHANGE';

const ACTIVITYDETAIL_REQUEST = 'ACTIVITYDETAIL_REQUEST';
const ACTIVITYDETAIL_SUCCESS = 'ACTIVITYDETAIL_SUCCESS';
const ACTIVITYDETAIL_FAILURE = 'ACTIVITYDETAIL_FAILURE';

const ACTIVITYDETAIL_SAVE_REQUEST = 'ACTIVITYDETAIL_SAVE_REQUEST';
const ACTIVITYDETAIL_SAVE_SUCCESS = 'ACTIVITYDETAIL_SAVE_SUCCESS';
const ACTIVITYDETAIL_SAVE_FAILURE = 'ACTIVITYDETAIL_SAVE_FAILURE';

const ACTIVITYDETAIL_PROLIST_REQUEST = 'ACTIVITYDETAIL_PROLIST_REQUEST';
const ACTIVITYDETAIL_PROLIST_SUCCESS = 'ACTIVITYDETAIL_PROLIST_SUCCESS';
const ACTIVITYDETAIL_PROLIST_FAILURE = 'ACTIVITYDETAIL_PROLIST_FAILURE';

const ACTIVITYDETAIL_SORTLIST_REQUEST = 'ACTIVITYDETAIL_SORTLIST_REQUEST';
const ACTIVITYDETAIL_SORTLIST_SUCCESS = 'ACTIVITYDETAIL_SORTLIST_SUCCESS';
const ACTIVITYDETAIL_SORTLIST_FAILURE = 'ACTIVITYDETAIL_SORTLIST_FAILURE';

// const ACTIVITYDETAIL_FRONTSORTLIST_REQUEST = 'ACTIVITYDETAIL_FRONTSORTLIST_REQUEST';
// const ACTIVITYDETAIL_FRONTSORTLIST_SUCCESS = 'ACTIVITYDETAIL_FRONTSORTLIST_SUCCESS';
// const ACTIVITYDETAIL_FRONTSORTLIST_FAILURE = 'ACTIVITYDETAIL_FRONTSORTLIST_FAILURE';

const ACTIVITYDETAIL_PRO_CHANGESEARCH = 'ACTIVITYDETAIL_PRO_CHANGESEARCH';

const PRODUCT_SKU_CHANGE = 'PRODUCT_SKU_CHANGE';

const SETTING_VALUE = 'SETTING_VALUE';

const FILE_DOWNLOAD_REQUEST = 'FILE_DOWNLOAD_REQUEST';
const FILE_DOWNLOAD_SUCCESS = 'FILE_DOWNLOAD_SUCCESS';
const FILE_DOWNLOAD_FAILURE = 'FILE_DOWNLOAD_FAILURE';

const ACTIVITYDETAIL_CLEARPROPS = 'ACTIVITYDETAIL_CLEARPROPS';

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  changeRecord: createAction(ACTIVITYDETAIL_RECORD_CHANGE, 'fields'),
  changeSku: createAction(PRODUCT_SKU_CHANGE, 'fields'),
  load: (id) => ({
    types: [ACTIVITYDETAIL_REQUEST, ACTIVITYDETAIL_SUCCESS, ACTIVITYDETAIL_FAILURE],
    callAPI: () => fetch('/specialPrice/detail', { id }),
    payload: { id },
  }),
  save: (params) => ({
    types: [ACTIVITYDETAIL_SAVE_REQUEST, ACTIVITYDETAIL_SAVE_SUCCESS, ACTIVITYDETAIL_SAVE_FAILURE],
    callAPI: () => fetch('/specialPrice/add', mapToSendData(params, (data) => {
      const newData = { ...data };
      newData.skuList = [...newData.skuList];
      if (newData.skuList) {
        newData.skuList = newData.skuList.map((item) => {
          const newItem = { ...item };
          if (newItem.activityPrice) {
            newItem.activityPrice = Math.round(newItem.activityPrice * 100);
          }
          if (newItem.activityUnitPrice) {
            newItem.activityUnitPrice = Math.round(newItem.activityUnitPrice * 100);
          }
          return newItem;
        });
      }
      if (newData.uidLimitBuy.toString() === '1') {
        newData.uidLimitBuy = true;
      } else {
        newData.uidLimitBuy = false;
      }
      if (newData.inventoryLock.toString() === '1') {
        newData.inventoryLock = true;
      } else {
        newData.inventoryLock = false;
      }
      newData.activityTime = newData.activityTime || [];
      newData.activityTimeStart = newData.activityTime[0] ? newData.activityTime[0].valueOf() : '';
      newData.activityTimeEnd = newData.activityTime[1] ? newData.activityTime[1].valueOf() : '';
      return newData;
    })),
    payload: params,
  }),
  loadPro:  (params) => ({
    types: [ACTIVITYDETAIL_PROLIST_REQUEST, ACTIVITYDETAIL_PROLIST_SUCCESS, ACTIVITYDETAIL_PROLIST_FAILURE],
    callAPI: () => fetch('/spu/list', mapToSendData(params, (data) => {
      const newData = { ...data };
      if (newData.categoryId) {
        newData.categoryId = newData.categoryId[newData.categoryId.length - 1];
      }
      // if (newData.frontCateId) {
      //   newData.frontCateId = newData.frontCateId[newData.frontCateId.length - 1];
      // }
      newData.saleStatus = 0;
      return newData;
    })),
    payload: params,
  }),
  loadSort:  (params) => ({
    types: [
      ACTIVITYDETAIL_SORTLIST_REQUEST,
      ACTIVITYDETAIL_SORTLIST_SUCCESS,
      ACTIVITYDETAIL_SORTLIST_FAILURE,
    ],
    callAPI: () => fetch('/categoryList', params),
    payload: params,
  }),
  changeSearch: createAction(ACTIVITYDETAIL_PRO_CHANGESEARCH, 'fields'),
  setValue: createAction(SETTING_VALUE, 'fields'),
  loadFile: (params) => ({
    types: [
      FILE_DOWNLOAD_REQUEST,
      FILE_DOWNLOAD_SUCCESS,
      FILE_DOWNLOAD_FAILURE,
    ],
    callAPI: () => fetch('/sku/template/export', params, { method: 'get' }).then((blob) => {
      if (!!blob && typeof blob === 'object' && blob.constructor === Blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'sku.xls';
        document.body.appendChild(a);
        a.click();
        return { resultCode:'0' };
      }
      return blob;
    }),
    payload: params,
  }),
  clearProps: createAction(ACTIVITYDETAIL_CLEARPROPS),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ACTIVITYDETAIL_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [ACTIVITYDETAIL_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    record: mapReceivedData(action.data, (data) => {
      const newRecord = { ...data };
      if (newRecord.type !== null) {
        newRecord.type = 1;
      }
      if (newRecord.uidLimitBuy === true) {
        newRecord.uidLimitBuy = '1';
      } else {
        newRecord.uidLimitBuy = '2';
      }
      if (newRecord.inventoryLock === true) {
        newRecord.inventoryLock = '1';
      } else {
        newRecord.inventoryLock = '2';
      }
      newRecord.status = newRecord.status;
      if (newRecord.activityPro) {
        newRecord.activityPro.forEach((item) => {
          item.skuInfo.forEach((itemChild) => {
            if (itemChild.activityPrice) {
              itemChild.activityPrice /= 100;
            }
            if (itemChild.activityUnitPrice) {
              itemChild.activityUnitPrice /= 100;
            }
          });
        });
      }
      return newRecord;
    }),
    pro: action.data.activityPro,
  }),
  [ACTIVITYDETAIL_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITYDETAIL_RECORD_CHANGE]: (state, action) => ({
    ...state,
    record: action.fields,
  }),
  [ACTIVITYDETAIL_SAVE_REQUEST] : (state) => ({
    ...state,
    confirmLoading: true,
  }),
  [ACTIVITYDETAIL_SAVE_SUCCESS]: (state) => {
    message.success('操作成功');
    return {
      ...state,
      confirmLoading: false,
      visible: false,
    };
  },
  [ACTIVITYDETAIL_SAVE_FAILURE]: (state) => ({
    ...state,
    confirmLoading: false,
  }),
  [ACTIVITYDETAIL_PROLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [ACTIVITYDETAIL_PROLIST_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    proData: action.data.list,
    page: {
      pageSize: action.data.pageSize,
      pageNo: action.data.pageNo,
      count: action.data.totalSize,
    },
  }),
  [ACTIVITYDETAIL_PROLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITYDETAIL_SORTLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [ACTIVITYDETAIL_SORTLIST_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    sortData: action.data.sorts,
  }),
  [ACTIVITYDETAIL_SORTLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITYDETAIL_PRO_CHANGESEARCH]: (state, action) => ({
    ...state,
    searchParams: action.fields,
  }),
  [PRODUCT_SKU_CHANGE]: (state, action) => ({
    ...state,
    selectSkuId: action.fields,
  }),
  [SETTING_VALUE]: (state, action) => ({
    ...state,
    setRecord: action.fields,
  }),
  [FILE_DOWNLOAD_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [FILE_DOWNLOAD_SUCCESS]: (state) => ({
    ...state,
    loading: false,
  }),
  [FILE_DOWNLOAD_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [ACTIVITYDETAIL_CLEARPROPS]: (state) => ({
    ...state,
    pro: [],
    record: recordCopy,
    selectSkuId: [],
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  record: recordCopy,
  setRecord: {
    activityUnitPrice: {
      value: '',
    },
    activityPrice: {
      value: '',
    },
    activityInventory: {
      value: '',
    },
    uidMaxBuyCount: {
      value: '',
    },
    addInventory: {
      value: '',
    },
  },
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
  selectSkuId: [],
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
