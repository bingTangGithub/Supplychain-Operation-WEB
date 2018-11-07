import _cloneDeep from 'lodash.clonedeep';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';
import { cateListAdaptor, findParentRecord } from './tinyUtil';

// ------------------------------------
// Constants
// ------------------------------------
const FRONTCATE_ROW_OPEN = 'FRONTCATE_ROW_OPEN';
const FRONTCATE_ROW_CLOSE = 'FRONTCATE_ROW_CLOSE';
const FRONTCATE_TARGETRECORD_SET = 'FRONTCATE_TARGETRECORD_SET';

const FRONTCATE_CONFIRM_HIDE = 'FRONTCATE_CONFIRM_HIDE';
const FRONTCATE_CONFIRM_SHOW = 'FRONTCATE_CONFIRM_SHOW';
const FRONTCATE_CONFIRM_DETELE = 'FRONTCATE_CONFIRM_DETELE';
const FRONTCATE_CONFIRM_CALCEL = 'FRONTCATE_CONFIRM_CALCEL';

const FRONTCATE_STATUS_REQUEST = 'FRONTCATE_STATUS_REQUEST';
const FRONTCATE_STATUS_SUCCESS = 'FRONTCATE_STATUS_SUCCESS';
const FRONTCATE_STATUS_FAILURE = 'FRONTCATE_STATUS_FAILURE';

const FRONTCATE_DELETE_REQUEST = 'FRONTCATE_DELETE_REQUEST';
const FRONTCATE_DELETE_SUCCESS = 'FRONTCATE_DELETE_SUCCESS';
const FRONTCATE_DELETE_FAILURE = 'FRONTCATE_DELETE_FAILURE';

const FRONTCATE_LIST_REQUEST = 'FRONTCATE_LIST_REQUEST';
const FRONTCATE_LIST_SUCCESS = 'FRONTCATE_LIST_SUCCESS';
const FRONTCATE_LIST_FAILURE = 'FRONTCATE_LIST_FAILURE';

const FRONTCATE_DETAIL_REQUEST = 'FRONTCATE_DETAIL_REQUEST';
const FRONTCATE_DETAIL_SUCCESS = 'FRONTCATE_DETAIL_SUCCESS';
const FRONTCATE_DETAIL_FAILURE = 'FRONTCATE_DETAIL_FAILURE';

const initialState = {
  loading: false,
  data: [],
  page: {
    pageSize: 10,
    pageNo: 1,
    count: 0,
  },
  searchParams: {
    pageNo: 1,
    pageSize: 10,
    parentId: 0, // 查询1级分类
  },
  confirm: {
    visible: false,
    text: '',
  },
  targetRecord: null,
  expandedRowKeys: [],
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  openExpandedRow: createAction(FRONTCATE_ROW_OPEN, 'fields'),
  closeExpandedRow: createAction(FRONTCATE_ROW_CLOSE, 'fields'),
  setTargetRecord: createAction(FRONTCATE_TARGETRECORD_SET, 'fields'),

  showHideModal: createAction(FRONTCATE_CONFIRM_HIDE, 'fields'),
  showShowModal: createAction(FRONTCATE_CONFIRM_SHOW, 'fields'),
  showDeleteModal: createAction(FRONTCATE_CONFIRM_DETELE, 'fields'),
  handleConfirmCancel: createAction(FRONTCATE_CONFIRM_CALCEL),

  hideShowFrontCate: () => ({
    types: [FRONTCATE_STATUS_REQUEST, FRONTCATE_STATUS_SUCCESS, FRONTCATE_STATUS_FAILURE],
    callAPI: ({ FrontCateList }) => {
      const { actionType, targetRecord: { frontCateId } } = FrontCateList;
      return fetch('/frontCate/operate', { frontCateId, targetStatus: actionType });
    },
  }),
  deleteFrontCate: () => ({
    types: [FRONTCATE_DELETE_REQUEST, FRONTCATE_DELETE_SUCCESS, FRONTCATE_DELETE_FAILURE],
    callAPI: ({ FrontCateList }) => {
      const { targetRecord: { frontCateId } } = FrontCateList;
      return fetch('/frontCate/delete', { frontCateId });
    },
  }),
  search: (params) => ({
    types: [FRONTCATE_LIST_REQUEST, FRONTCATE_LIST_SUCCESS, FRONTCATE_LIST_FAILURE],
    callAPI: () => fetch('/frontCate/list', params),
    payload: { params }, // 如此将params 放在 action 中
  }),
  updateParentCate: (params) => ({
    types: [FRONTCATE_DETAIL_REQUEST, FRONTCATE_DETAIL_SUCCESS, FRONTCATE_DETAIL_FAILURE],
    callAPI: () => fetch('/frontCate/detail', params),
    payload: { params }, // 如此将params 放在 action 中
  }),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [FRONTCATE_ROW_CLOSE]: (state, action) => {
    const _expandedRowKeys = new Set(state.expandedRowKeys);
    _expandedRowKeys.delete(action.fields);
    return { ...state, expandedRowKeys: [..._expandedRowKeys] };
  },
  [FRONTCATE_ROW_OPEN]: (state, action) => {
    const _expandedRowKeys = new Set(state.expandedRowKeys);
    _expandedRowKeys.add(action.fields);
    return { ...state, expandedRowKeys: [..._expandedRowKeys] };
  },
  [FRONTCATE_TARGETRECORD_SET]: (state, action) => ({ ...state, targetRecord: action.fields }),

  [FRONTCATE_CONFIRM_HIDE]: (state, action) => ({
    ...state,
    actionType: 'hide',
    targetRecord: action.fields,
    confirm: { visible: true, text: '确定隐藏该前端分类？' },
  }),
  [FRONTCATE_CONFIRM_SHOW]: (state, action) => ({
    ...state,
    actionType: 'show',
    targetRecord: action.fields,
    confirm: { visible: true, text: '确定显示该前端分类？' },
  }),
  [FRONTCATE_CONFIRM_DETELE]: (state, action) => ({
    ...state,
    actionType: 'delete',
    targetRecord: action.fields,
    confirm: { visible: true, text: '确定删除该前端分类？' },
  }),
  [FRONTCATE_CONFIRM_CALCEL]: (state) => ({
    ...state,
    actionType: null,
    targetRecord: null,
    confirm: { ...state.confirm, visible: false },
  }),

  [FRONTCATE_STATUS_REQUEST]: (state) => ({ ...state, loading: true }),
  [FRONTCATE_STATUS_SUCCESS]: (state) => {
    const { targetRecord, actionType, data } = state;
    const _data = _cloneDeep(data);
    let parentData = { children: _data };
    // 若为子分类，先找到其父分类
    parentData = findParentRecord(targetRecord.parentIdList, parentData);

    const curRecord = parentData.children.find(
      ({ frontCateId: childId }) => childId === targetRecord.frontCateId
    );
    curRecord.frontCateStatus = actionType;

    return {
      ...state,
      loading: false,
      data: _data,
      confirm: { ...state.confirm, visible: false },
    };
  },
  [FRONTCATE_STATUS_FAILURE]: (state) => ({ ...state, loading: false }),


  [FRONTCATE_DELETE_REQUEST]: (state) => ({ ...state, loading: true }),
  [FRONTCATE_DELETE_SUCCESS]: (state) => {
    const { targetRecord, data } = state;
    const _data = _cloneDeep(data);
    let parentData = { children: _data };
    // 若为子分类，先找到其父分类
    parentData = findParentRecord(targetRecord.parentIdList, parentData);

    const newChildren = parentData.children.filter(
      ({ frontCateId: childId }) => childId !== targetRecord.frontCateId
    );
    parentData.children = newChildren.length ? newChildren : undefined;

    return {
      ...state,
      loading: false,
      data: _data,
      confirm: { ...state.confirm, visible: false },
    };
  },
  [FRONTCATE_DELETE_FAILURE]: (state) => ({ ...state, loading: false }),

  [FRONTCATE_LIST_REQUEST]: (state) => ({ ...state, loading: true }),
  [FRONTCATE_LIST_SUCCESS]: (state, action) => {
    const {
      data: { list, totalSize, pageNo, pageSize },
      params: { parentId },
    } = action;
    const { targetRecord } = state;
    let page = {};
    let _data = _cloneDeep(state.data);
    const _expandedRowKeys = new Set(state.expandedRowKeys);

    let frontCateList = [];

    if (parentId === 0) { // 第1级分类
      frontCateList = cateListAdaptor(list);
      page = { pageNo, pageSize, count: totalSize };
      _data = frontCateList;
      _expandedRowKeys.clear();
    } else { // 子分类
      frontCateList = cateListAdaptor(list, targetRecord);
      let parentData = { children: _data };
      parentData = findParentRecord([...targetRecord.parentIdList, parentId], parentData);
      parentData.children = frontCateList;
      parentData.hasReqChild = true;
      _expandedRowKeys.add(parentId);
    }

    return {
      ...state,
      loading: false,
      data: _data,
      page: { ...state.page, ...page },
      expandedRowKeys: [..._expandedRowKeys],
    };
  },
  [FRONTCATE_LIST_FAILURE]: (state) => ({ ...state, loading: false }),

  [FRONTCATE_DETAIL_REQUEST]: (state) => ({ ...state, loading: true }),
  [FRONTCATE_DETAIL_SUCCESS]: (state, action) => {
    const {
      data: { frontCateStatus },
      params: { frontCateId },
    } = action;
    const _data = _cloneDeep(state.data);
    _data.forEach((cataItem) => {
      if (cataItem.frontCateId === frontCateId) {
        cataItem.frontCateStatus = frontCateStatus;
      }
    });

    return {
      ...state,
      loading: false,
      data: _data,
    };
  },
  [FRONTCATE_DETAIL_FAILURE]: (state) => ({ ...state, loading: false }),
};

// ------------------------------------
// Reducer
// ------------------------------------


export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
