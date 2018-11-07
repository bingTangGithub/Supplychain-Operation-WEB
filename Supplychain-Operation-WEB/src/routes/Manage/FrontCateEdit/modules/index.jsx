import _cloneDeep from 'lodash.clonedeep';
import initialState from './initialState';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

import { getNewImgList } from '../../ProductDetailEdit/modules/tinyUtil';
import { resetSpuData, cateListAdaptor, findParentRecord, operateFuncStrategy } from './tinyUtil';

// ------------------------------------
// Constants
// ------------------------------------
const FRONTCATEEDIT_VALUES_CHANGE = 'FRONTCATEEDIT_VALUES_CHANGE';
const FRONTCATEEDIT_IMG_CHANGE = 'FRONTCATEEDIT_IMG_CHANGE';
const FRONTCATEEDIT_IMG_RESET = 'FRONTCATEEDIT_IMG_RESET';
const FRONTCATEEDIT_BACKCATELIST_RESET = 'FRONTCATEEDIT_BACKCATELIST_RESET';
const FRONTCATEEDIT_TAG_DELETE = 'FRONTCATEEDIT_TAG_DELETE';
const FRONTCATEEDIT_GOODSMODAL_SHOW = 'FRONTCATEEDIT_GOODSMODAL_SHOW';
const FRONTCATEEDIT_GOODSMODAL_SAVE = 'FRONTCATEEDIT_GOODSMODAL_SAVE';
const FRONTCATEEDIT_SPULIST_RESET = 'FRONTCATEEDIT_SPULIST_RESET';

const FRONTCATEEDIT_DETAIL_DO = 'FRONTCATEEDIT_DETAIL_DO';
const FRONTCATEEDIT_DETAIL_SUCCESS = 'FRONTCATEEDIT_DETAIL_SUCCESS';
const FRONTCATEEDIT_DETAIL_FAILURE = 'FRONTCATEEDIT_DETAIL_FAILURE';

const FRONTCATEEDIT_BACKCATE_DO = 'FRONTCATEEDIT_BACKCATE_DO';
const FRONTCATEEDIT_BACKCATE_SUCCESS = 'FRONTCATEEDIT_BACKCATE_SUCCESS';
const FRONTCATEEDIT_BACKCATE_FAILURE = 'FRONTCATEEDIT_BACKCATE_FAILURE';

const FRONTCATEEDIT_SUBMIT_DO = 'FRONTCATEEDIT_SUBMIT_DO';
const FRONTCATEEDIT_SUBMIT_SUCCESS = 'FRONTCATEEDIT_SUBMIT_SUCCESS';
const FRONTCATEEDIT_SUBMIT_FAILURE = 'FRONTCATEEDIT_SUBMIT_FAILURE';

/* 商品列表 */
const FRONTCATEEDIT_GOODSMODAL_REQUEST = 'FRONTCATEEDIT_GOODSMODAL_REQUEST';
const FRONTCATEEDIT_GOODSMODAL_SUCCESS = 'FRONTCATEEDIT_GOODSMODAL_SUCCESS';
const FRONTCATEEDIT_GOODSMODAL_FAILURE = 'FRONTCATEEDIT_GOODSMODAL_FAILURE';

const FRONTCATEEDIT_GOODSMODAL_CHANGE_SEARCH = 'FRONTCATEEDIT_GOODSMODAL_CHANGE_SEARCH';
const FRONTCATEEDIT_TEMPSPULIST_ADD = 'FRONTCATEEDIT_TEMPSPULIST_ADD';

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  // 在createAction中组装action
  ValuesChange: createAction(FRONTCATEEDIT_VALUES_CHANGE, 'params'),
  handleImgChange: createAction(FRONTCATEEDIT_IMG_CHANGE, 'params'),
  resetImgValue: createAction(FRONTCATEEDIT_IMG_RESET, 'params'),
  resetBackCateList: createAction(FRONTCATEEDIT_BACKCATELIST_RESET, 'params'),
  tagDelete: createAction(FRONTCATEEDIT_TAG_DELETE, 'params'),
  showGoodsModal: createAction(FRONTCATEEDIT_GOODSMODAL_SHOW, 'params'),
  saveTempSpuList: createAction(FRONTCATEEDIT_GOODSMODAL_SAVE),
  resetSpuItemList: createAction(FRONTCATEEDIT_SPULIST_RESET, 'params'),
  // 在中间件(/src/store/createStore.js)中组装action, 可传入的参数是types, callAPI, shouldCallAPI, payload, callback
  loadDetail: (frontCateId) => ({
    types: [FRONTCATEEDIT_DETAIL_DO, FRONTCATEEDIT_DETAIL_SUCCESS, FRONTCATEEDIT_DETAIL_FAILURE],
    callAPI: () => fetch('/frontCate/detail', { frontCateId }),
  }),
  loadBackCate: (parentId = 0, parentIdList = []) => ({
    types: [FRONTCATEEDIT_BACKCATE_DO, FRONTCATEEDIT_BACKCATE_SUCCESS, FRONTCATEEDIT_BACKCATE_FAILURE],
    callAPI: () => fetch('/category/list', { parentId, pageNo: 1, pageSize: -1 }),
    payload: { parentId, parentIdList },
  }),
  handleSubmit: (params) => ({
    types: [FRONTCATEEDIT_SUBMIT_DO, FRONTCATEEDIT_SUBMIT_SUCCESS, FRONTCATEEDIT_SUBMIT_FAILURE],
    callAPI: () => fetch('/frontCate/edit', params),
  }),

  /* 商品列表 */
  search: (params) => ({
    types: [FRONTCATEEDIT_GOODSMODAL_REQUEST, FRONTCATEEDIT_GOODSMODAL_SUCCESS, FRONTCATEEDIT_GOODSMODAL_FAILURE],
    callAPI: () => fetch('/frontCate/spuList', params),
  }),
  // 改变搜索条件
  changeSearch: createAction(FRONTCATEEDIT_GOODSMODAL_CHANGE_SEARCH, 'fields'),
  addSpuList: createAction(FRONTCATEEDIT_TEMPSPULIST_ADD, 'params'),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [FRONTCATEEDIT_SUBMIT_DO]: (state) => ({ ...state, loading: true }),
  [FRONTCATEEDIT_SUBMIT_SUCCESS]: (state) => ({ ...state, loading: false }),
  [FRONTCATEEDIT_SUBMIT_FAILURE]: (state) => ({ ...state, loading: false }),

  [FRONTCATEEDIT_DETAIL_DO]: (state) => ({ ...state, loading: true }),
  [FRONTCATEEDIT_DETAIL_SUCCESS]: (state, action) => {
    let stateCloned = _cloneDeep(state);
    stateCloned = resetSpuData(action.data, stateCloned);
    return { ...stateCloned, loading: false };
  },
  [FRONTCATEEDIT_DETAIL_FAILURE]: (state) => ({ ...state, loading: true }),

  [FRONTCATEEDIT_BACKCATE_DO]: (state) => ({ ...state, loading: true }),
  [FRONTCATEEDIT_BACKCATE_SUCCESS]: (state, action) => {
    const { data: { list }, parentId, parentIdList } = action;
    let _data = _cloneDeep(state.backCateList);

    let _backCateList = [];

    if (parentId === 0) { // 第1级分类
      _backCateList = cateListAdaptor(list);
      _data = _backCateList;
    } else { // 子分类
      const newParentIdList = [...parentIdList, parentId];
      _backCateList = cateListAdaptor(list, newParentIdList);
      let parentData = { children: _data };
      parentData = findParentRecord(newParentIdList, parentData);
      parentData.children = _backCateList;
    }

    return {
      ...state,
      loading: false,
      backCateList: _data,
    };
  },
  [FRONTCATEEDIT_BACKCATE_FAILURE]: (state) => ({ ...state, loading: true }),

  [FRONTCATEEDIT_VALUES_CHANGE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { formData, totalId } = action.params;

    stateCloned.values[totalId] = formData;
    return { ...stateCloned };
  },
  [FRONTCATEEDIT_IMG_CHANGE]: (state, action) => {
    const _values = _cloneDeep(state.values);
    const { id } = action.params;
    _values[id] = getNewImgList(state.values[id], action.params);
    return { ...state, values: _values };
  },
  [FRONTCATEEDIT_IMG_RESET]: (state) => ({
    ...state,
    values: { ...state.values, frontCateImg: [] },
    loading: false,
  }),
  [FRONTCATEEDIT_BACKCATELIST_RESET]: (state, action) => {
    const { checked, data } = action.params;
    return { ...state, checkedBackCateList: checked, backCateList: data || state.backCateList };
  },
  [FRONTCATEEDIT_TAG_DELETE]: (state, action) => {
    const { operateType, spuId, temp } = action.params;
    const newState = { ...state };
    if (temp) {
      const target = _cloneDeep(state.goodsModal.tempSpuItemList);
      newState.goodsModal.tempSpuItemList = operateFuncStrategy[operateType](target, spuId);
    } else {
      const target = _cloneDeep(state.spuItemList);
      newState.spuItemList = operateFuncStrategy[operateType](target, spuId);
    }

    return newState;
  },
  [FRONTCATEEDIT_GOODSMODAL_SHOW]: (state, action) => {
    const visible = action.params;
    const _goodsModal = _cloneDeep(state.goodsModal);
    if (visible) {
      _goodsModal.tempSpuItemList = _cloneDeep(state.spuItemList);
    }
    return { ...state, goodsModalVisible: visible, goodsModal: _goodsModal };
  },
  [FRONTCATEEDIT_GOODSMODAL_SAVE]: (state) => {
    const _tempList = _cloneDeep(state.goodsModal.tempSpuItemList);
    return { ...state, spuItemList: _tempList };
  },
  [FRONTCATEEDIT_SPULIST_RESET]: (state, action) => {
    const { selected, data } = action.params;
    return {
      ...state,
      goodsModal: { ...state.goodsModal, data: selected },
      spuItemList: data,
    };
  },

  /* 商品列表 */
  [FRONTCATEEDIT_GOODSMODAL_REQUEST] : (state) => ({
    ...state,
    goodsModal: { ...state.goodsModal, loading: true },
  }),
  [FRONTCATEEDIT_GOODSMODAL_SUCCESS]: (state, action) => {
    const { data } = action;
    const {
      list,
      pageNo,
      pageSize,
      totalSize,
    } = data;
    return {
      ...state,
      goodsModal: {
        ...state.goodsModal,
        loading: false,
        data: list,
        page: {
          ...state.goodsModal.page,
          pageNo,
          pageSize,
          count: totalSize,
        },
      },
    };
  },
  [FRONTCATEEDIT_GOODSMODAL_FAILURE]: (state) => ({
    ...state,
    goodsModal: { ...state.goodsModal, loading: true },
  }),
  [FRONTCATEEDIT_GOODSMODAL_CHANGE_SEARCH]: (state, action) => ({
    ...state,
    goodsModal: {
      ...state.goodsModal,
      searchParams: {
        ...state.goodsModal.searchParams,
        ...action.fields,
      },
    },
  }),
  [FRONTCATEEDIT_TEMPSPULIST_ADD]: (state, action) => {
    const { spuId, name, shopId } = action.params;
    const target = _cloneDeep(state.goodsModal.tempSpuItemList);
    return {
      ...state,
      goodsModal: {
        ...state.goodsModal,
        tempSpuItemList: operateFuncStrategy.add(target, spuId, name, shopId),
      },
    };
  },
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function reducer(state = _cloneDeep(initialState), action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
