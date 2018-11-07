import 'moment/locale/zh-cn';
import { DeepClone } from '@xinguang/common-tool';
import _cloneDeep from 'lodash.clonedeep';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const PRODUCTCLASSIFY_SET_KEYSANDVALUES = 'PRODUCTCLASSIFY_SET_KEYSANDVALUES';

const PRODUCTCLASSIFY_REQUEST = 'PRODUCTCLASSIFY_REQUEST';
const PRODUCTCLASSIFY_SUCCESS = 'PRODUCTCLASSIFY_SUCCESS';
const PRODUCTCLASSIFY_FAILURE = 'PRODUCTCLASSIFY_FAILURE';

const PRODUCTCLASSIFY_SET_PARNRTID = 'PRODUCTCLASSIFY_SET_PARNRTID';

const PRODUCTCLASSIFY_CHANGE_MODAL = 'PRODUCTCLASSIFY_CHANGE_MODAL';

const PRODUCTCLASSIFY_SAVE_REQUEST = 'PRODUCTCLASSIFY_SAVE_REQUEST';
const PRODUCTCLASSIFY_SAVE_SUCCESS = 'PRODUCTCLASSIFY_SAVE_SUCCESS';
const PRODUCTCLASSIFY_SAVE_FAILURE = 'PRODUCTCLASSIFY_SAVE_FAILURE';

const PRODUCTCLASSIFY_CHANGE_FIELDS = 'PRODUCTCLASSIFY_CHANGE_FIELDS';

const PRODUCTCLASSIFY_CUR_SPECS = 'PRODUCTCLASSIFY_CUR_SPECS';

const PRODUCTCLASSIFY_CHANGE_DELMODAL = 'PRODUCTCLASSIFY_CHANGE_DELMODAL';

const PRODUCTCLASSIFY_DEL_REQUEST = 'PRODUCTCLASSIFY_DEL_REQUEST';
const PRODUCTCLASSIFY_DEL_SUCCESS = 'PRODUCTCLASSIFY_DEL_SUCCESS';
const PRODUCTCLASSIFY_DEL_FAILURE = 'PRODUCTCLASSIFY_DEL_FAILURE';

const PRODUCTCLASSIFY_CHANGE_RECORD = 'PRODUCTCLASSIFY_CHANGE_RECORD';
const PRODUCTCLASSIFY_RESET_PARNRTID = 'PRODUCTCLASSIFY_RESET_PARNRTID';

const PRODUCTCLASSIFY_SET_SEPCE_ERROR = 'PRODUCTCLASSIFY_SET_SEPCE_ERROR';

const PRODUCTCLASSIFY_SET_TAG_INPUT_VALUE = 'PRODUCTCLASSIFY_SET_TAG_INPUT_VALUE';

const PRODUCTCLASSIFY_SET_TAG_INPUT_VISIBLE = 'PRODUCTCLASSIFY_SET_TAG_INPUT_VISIBLE';

const PRODUCTCLASSIFY_SET_EXPANDEDROWKEYS = 'PRODUCTCLASSIFY_SET_EXPANDEDROWKEYS';

const PRODUCTCLASSIFY_CUR_LABELLIST = 'PRODUCTCLASSIFY_CUR_LABELLIST';
const PRODUCTCLASSIFY_SET_LABEL_ERROR = 'PRODUCTCLASSIFY_SET_LABEL_ERROR';
const PRODUCTCLASSIFY_SET_LABEL_INPUT_VALUE = 'PRODUCTCLASSIFY_SET_LABEL_INPUT_VALUE';
const PRODUCTCLASSIFY_SET_LABEL_INPUT_VISIBLE = 'PRODUCTCLASSIFY_SET_LABEL_INPUT_VISIBLE';

const PRODUCTCLASSIFY_SET_ATTRIBUTELIST = 'PRODUCTCLASSIFY_SET_ATTRIBUTELIST';
const PRODUCTCLASSIFY_SET_PROPERTY_INPUT_VISIBLE = 'PRODUCTCLASSIFY_SET_PROPERTY_INPUT_VISIBLE';
const PRODUCTCLASSIFY_SET_PROPERTY_TAG_INPUT_VALUE = 'PRODUCTCLASSIFY_SET_PROPERTY_TAG_INPUT_VALUE';
const PRODUCTCLASSIFY_GET_CUR_PROPERTY_TAGS = 'PRODUCTCLASSIFY_GET_CUR_PROPERTY_TAGS';
const PRODUCTCLASSIFY_SET_PROPERTY_TAG_VAL_ERROR = 'PRODUCTCLASSIFY_SET_PROPERTY_TAG_VAL_ERROR';

const PRODUCTCLASSIFY_ADD_ATTRIBUTELIST = 'PRODUCTCLASSIFY_ADD_ATTRIBUTELIST';

// 模态框中的
const fields = [
  {
    label: '分类名称',
    name: 'categoryName',
    required: true,
    simple: true,
    max: 12,
  },
  {
    label: '排序',
    name: 'sort',
    simple: true,
    pattern: /^100$|^([1-9][0-9]?)$/,
    patternMsg: '输入1-100的整数区间',
  },
  // {
  //   label: '规格',
  //   name: 'specs',
  //   simple: true,
  //   max: 20,
  // },
];

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
  modalVisible: false,
  cusTitle: '新增商品分类',
  hadReqedArray: [], // 已经请求过的一级分类的 id 组成的数组
  fields, // 模态框中的表单
  modalFormValue: { sort: 50, specs: '', attributeList: [] }, //  模态框中表单的值
  parentId: 0, // 目前操作的父级分类的id，新增一级分类时为0，
  categoryId: '', // 分类Id，新增时为 ''
  addBoolean: false, // 操作类型
  delModalVisible: false,
  isParent: 2, // 当前类是否是父类  1是(有子分类)，2不是
  expandedRowKeys: [], // 展开的行
  specsInfo: {
    specsTags: [], // 新增或编辑规格时初始出现的tags
    canAddSpecsTag: true, // 默认可以添加规格
    isSpecsTagValError: false, // 规格值长度不符合要求
    specsTagInputValue:  '', // tag input的初始值为空
    specsTagInputVisible: false, // taginput 显示否
    specLimitMax: 16,
    specsTagsMaxLength: 3, // tags 的最多个数
  },
  labelInfo: {
    labelList: [], // 新增或编辑时初始出现的label
    canAddLabel: true, // 默认可以添加label
    isLabelValError: false, // label长度不符合要求
    labelInputValue: '', // label input的初始值为空
    labelInputVisible: false, // label input 显示否
    limitMax: 32,
  },
  propertyTag: {
    canAddPropertyValueTag: true, // 可以增加属性值
    tagPropertyInputValueLenMax: 32,
    tagsPropertyMaxLength: 10,
  },
  addFieldInfo: {
    canAddField: true, // 默认可以增加属性
    canDelFieldItem: true, // 默认可以删除属性
    addFieldInputVisible: false, // 新增属性 input 显示否
    addFieldInputValue: '', // 新增属性 input的初始值为空
    isAddFieldValError: false, // 新增属性 label长度不符合要求
    addFieldLabel: '属性',
    addFieldInputValueLenMax: 16, // 新增属性 label长度最大值
    fieldMaxLength: 15, // 最多15换个属性
  },
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  setKeysAndValues: createAction(PRODUCTCLASSIFY_SET_KEYSANDVALUES, 'fields'),
  search: (params) => {
    const pageSize = params.parentId === 0 ? params.pageSize : -1;
    const paramsChanged = { ...params, pageSize };
    return {
      types: [PRODUCTCLASSIFY_REQUEST, PRODUCTCLASSIFY_SUCCESS, PRODUCTCLASSIFY_FAILURE],
      callAPI: () => fetch('/category/list', paramsChanged),
      payload: { params: paramsChanged }, // 如此将params 放在 action 中
    };
  },
  setHadReqedParentId:  createAction(PRODUCTCLASSIFY_SET_PARNRTID, 'fields'),
  resetHadReqedParentId:  createAction(PRODUCTCLASSIFY_RESET_PARNRTID, 'fields'),
  changeModalVisible: createAction(PRODUCTCLASSIFY_CHANGE_MODAL, 'fields'),
  saveClass: (params) => ({
    types: [PRODUCTCLASSIFY_SAVE_REQUEST, PRODUCTCLASSIFY_SAVE_SUCCESS, PRODUCTCLASSIFY_SAVE_FAILURE],
    callAPI: () => fetch('/category/edit', params),
    // callback: (res, dispatch) => {
    //   dispatch(actions.changeModalVisible);
    // },
  }),
  getMyFields: createAction(PRODUCTCLASSIFY_CHANGE_FIELDS, 'curtype'), // 这里参数不能设置 'type',原因见createAction函数
  getCurSpecsTags: createAction(PRODUCTCLASSIFY_CUR_SPECS, 'fields'), // 编辑中目前的tags
  changeDelModalVisible: createAction(PRODUCTCLASSIFY_CHANGE_DELMODAL, 'fields'),
  delClass: (params) => ({
    types: [PRODUCTCLASSIFY_DEL_REQUEST, PRODUCTCLASSIFY_DEL_SUCCESS, PRODUCTCLASSIFY_DEL_FAILURE],
    callAPI: () => fetch('/category/delete', params),
  }),
  // 改变form 表单的值, 这里只需要改变 分类名称与排序即可，其它的都有各自的改变方法的
  changeRecord: createAction(PRODUCTCLASSIFY_CHANGE_RECORD, 'fields'),
  setSpecsTagValError: createAction(PRODUCTCLASSIFY_SET_SEPCE_ERROR, 'fields'),
  setSpecsTagValue: createAction(PRODUCTCLASSIFY_SET_TAG_INPUT_VALUE, 'fields'),
  setSpecsTagInputVisible: createAction(PRODUCTCLASSIFY_SET_TAG_INPUT_VISIBLE, 'fields'),
  setexpandedRowKeys: createAction(PRODUCTCLASSIFY_SET_EXPANDEDROWKEYS, 'fields'),

  getCurLabelList: createAction(PRODUCTCLASSIFY_CUR_LABELLIST, 'fields'), // 编辑中目前的tags,
  setLabelValError: createAction(PRODUCTCLASSIFY_SET_LABEL_ERROR, 'fields'),
  setLabelValue: createAction(PRODUCTCLASSIFY_SET_LABEL_INPUT_VALUE, 'fields'),
  setLabelInputVisible: createAction(PRODUCTCLASSIFY_SET_LABEL_INPUT_VISIBLE, 'fields'),

  setAttributeList: createAction(PRODUCTCLASSIFY_SET_ATTRIBUTELIST, 'fields'),
  setPropertyTagInputVisible: createAction(PRODUCTCLASSIFY_SET_PROPERTY_INPUT_VISIBLE, 'fields'),
  setPropertyTagValue: createAction(PRODUCTCLASSIFY_SET_PROPERTY_TAG_INPUT_VALUE, 'fields'),
  getPropertyCurTags: createAction(PRODUCTCLASSIFY_GET_CUR_PROPERTY_TAGS, 'fields'),
  setPropertyTagValError: createAction(PRODUCTCLASSIFY_SET_PROPERTY_TAG_VAL_ERROR, 'fields'),

  addAttributeList: createAction(PRODUCTCLASSIFY_ADD_ATTRIBUTELIST, 'fields'),
};

// 给 老数据 data 的 某个对象下 tid 为 pid 的 children 赋值为 list
function buildTreeData(data, pid, list, specList) {
  const newData = DeepClone.deepClone(data);
  newData.forEach((item, index) => {
    if (item.categoryId === pid) {
      newData[index].children = [...list];
      newData[index].isParent = '1';
      if (!list.length) {
        // 删除后如没有子分类则不要 children 属性；规格有的加上, isParent 也相应更改
        delete newData[index].children;
        newData[index].specList = specList;
        newData[index].isParent = '2';
      }
    } else if (typeof newData[index].children !== 'undefined') {
      // newData[index].children = buildTreeData(newData[index].children, pid, list, specList);
      // 其实用上边的递归就好了
      newData[index].children = newData[index].children.map((child) => {
        const resArray = buildTreeData([child], pid, list, specList);
        return resArray[0];
      });
    } else {
      // 在一级以及下边的 children 下边都没有找到 pid，不处理
      // newData[index].children = [];
    }
  });
  return newData;
}


function filterInForm(formObj) {
  const {
    deepObj,
    property,
    changedProperty,
    changedPropertyToObj,
  } = formObj;
  const modalFormValueClone = DeepClone.deepClone(deepObj);
  const index = modalFormValueClone.attributeList.findIndex((each) => each.name === property); // 当前属性
  modalFormValueClone.attributeList[index].tagsArray[0][changedProperty] = changedPropertyToObj;
  return modalFormValueClone;
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [PRODUCTCLASSIFY_SET_KEYSANDVALUES]: (state, action) => {
    const itemObj = {};
    Object.keys(action.fields).forEach((item) => {
      itemObj[item] = action.fields[item];
    });

    return {
      ...state,
      ...itemObj,
    };
  },
  [PRODUCTCLASSIFY_REQUEST]: (state) => ({
    ...state,
    loading: true,
  }),
  [PRODUCTCLASSIFY_SUCCESS]: (state, action) => {
    let dataClone = [];
    const { data, params } = action;
    const { parentId } = params; // 请求参数中的 parentId
    const {
      list,
      specList, // 如果 请求参数 parentId 不为 0，会返回
    } = data;
    let totalSize;
    let pageNo;
    let pageSize;

    for (let i = 0; i < list.length; i += 1) {
      list[i] = { ...list[i], parentId };
      // 如果是父级节点，增加 children 属性,不显示规格, dataClone 为新更新的
      if (list[i].isParent === '1') {
        list[i].children = [];
      }
    }

    if (parentId === 0) {
      dataClone = list;
      totalSize = data.totalSize;
      pageNo = data.pageNo;
      pageSize = data.pageSize;
    } else { // 当请求的是子分类时，保持原来的页面页码
      dataClone = buildTreeData(state.data, parentId, list, specList);
      const { page } = state;
      totalSize = page.count;
      pageNo = page.pageNo;
      pageSize = page.pageSize;
    }

    return {
      ...state,
      loading: false,
      data: dataClone,
      page: {
        ...state.page,
        pageNo,
        pageSize,
        count: totalSize,
      },
    };
  },
  [PRODUCTCLASSIFY_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTCLASSIFY_SET_PARNRTID]: (state, action) => {
    const { parentId, isClean, cleanedHadReqedArray } = action.fields;
    const hadReqedArray = isClean ? cleanedHadReqedArray : [...state.hadReqedArray, parentId];
    return ({
      ...state,
      hadReqedArray,
    });
  },
  [PRODUCTCLASSIFY_RESET_PARNRTID]: (state) => ({
    ...state,
    hadReqedArray: [],
  }),
  [PRODUCTCLASSIFY_SAVE_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [PRODUCTCLASSIFY_SAVE_SUCCESS] : (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTCLASSIFY_SAVE_FAILURE] : (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTCLASSIFY_CHANGE_MODAL]: (state, action) => {
    const { modalVisible } = action.fields;
    return {
      ...state,
      modalVisible,
    };
  },
  [PRODUCTCLASSIFY_CHANGE_FIELDS]: (state, action) => {
    const _labelInfo = _cloneDeep(state.labelInfo);
    const {
      addBoolean,
      parentId,
      categoryId,
      record,
    } = action.curtype;
    const { specs = [], isParent, sort, labelList = [], attributeList = [], categoryName } = record;
    let cusTitle;
    _labelInfo.labelList = labelList;
    if (addBoolean) {
      cusTitle = '新增商品分类';
    } else {
      cusTitle = '修改商品分类';
      if (isParent === '1') { // 编辑父类时，不能加规格
        // canAddSpecsTag = false;
        // _labelInfo.canAddLabel = false; // 编辑父类时，不能加分类
        // _labelInfo.labelList = [];
      }
    }

    const specsInfoClone = DeepClone.deepClone(state.specsInfo);
    specsInfoClone.specsTags = specs || [];

    const modalFormValueClone = {
      attributeList,
      categoryName,
      sort,
    };

    return {
      ...state,
      // modalFormValue: record,
      modalFormValue: modalFormValueClone,
      // modalFormValue,
      addBoolean,
      cusTitle,
      specsInfo: specsInfoClone,
      parentId,
      categoryId: categoryId || '',
      // canAddSpecsTag,
      isParent,
      labelInfo: _labelInfo,
    };
  },
  [PRODUCTCLASSIFY_CUR_SPECS]: (state, action) => {
    const { tags } = action.fields;
    const specsInfoClone = DeepClone.deepClone(state.specsInfo);
    specsInfoClone.specsTags = tags;
    return {
      ...state,
      specsInfo: specsInfoClone,
    };
  },
  [PRODUCTCLASSIFY_CHANGE_DELMODAL]: (state, action) => {
    const { delModalVisible, delClassObj } = action.fields;
    let categoryId;
    let parentId;
    // 如果是没有要删除的类，比如取消时，没有传被删除的类，则categoryId不变
    if (delClassObj) {
      categoryId = delClassObj.categoryId;
      parentId = delClassObj.parentId;
    } else {
      categoryId = state.categoryId;
      parentId = state.parentId;
    }
    return {
      ...state,
      delModalVisible,
      categoryId,
      parentId,
    };
  },
  [PRODUCTCLASSIFY_DEL_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [PRODUCTCLASSIFY_DEL_SUCCESS] : (state) => ({
    ...state,
    delModalVisible: false,
    loading: false,
  }),
  [PRODUCTCLASSIFY_DEL_FAILURE] : (state) => ({
    ...state,
    loading: false,
  }),
  [PRODUCTCLASSIFY_CHANGE_RECORD]: (state, action) => ({
    ...state,
    modalFormValue: {
      ...state.modalFormValue,
      ...action.fields,
    },
  }),
  [PRODUCTCLASSIFY_SET_SEPCE_ERROR]: (state, action) => {
    const { isTagValError } = action.fields;
    const specsInfoClone = DeepClone.deepClone(state.specsInfo);
    specsInfoClone.isSpecsTagValError = isTagValError;
    return {
      ...state,
      specsInfo: specsInfoClone,
    };
  },
  [PRODUCTCLASSIFY_SET_TAG_INPUT_VALUE]: (state, action) => {
    const { tagInputValue } = action.fields;
    const specsInfoClone = DeepClone.deepClone(state.specsInfo);
    specsInfoClone.specsTagInputValue = tagInputValue;
    return {
      ...state,
      specsInfo: specsInfoClone,
    };
  },
  [PRODUCTCLASSIFY_SET_TAG_INPUT_VISIBLE]: (state, action) => {
    const { tagInputVisible } = action.fields;
    const specsInfoClone = DeepClone.deepClone(state.specsInfo);
    specsInfoClone.specsTagInputVisible = tagInputVisible;

    return {
      ...state,
      specsInfo: specsInfoClone,
    };
  },
  [PRODUCTCLASSIFY_SET_EXPANDEDROWKEYS]: (state, action) => {
    const { expandedRowKeys } = action.fields;
    return {
      ...state,
      expandedRowKeys,
    };
  },
  [PRODUCTCLASSIFY_CUR_LABELLIST]: (state, action) => {
    const { tags: labelList } = action.fields;
    const _labelInfo = _cloneDeep(state.labelInfo);
    _labelInfo.labelList = labelList;
    return {
      ...state,
      labelInfo: _labelInfo,
    };
  },
  [PRODUCTCLASSIFY_SET_LABEL_ERROR]: (state, action) => {
    const { isTagValError } = action.fields;
    const _labelInfo = _cloneDeep(state.labelInfo);
    _labelInfo.isLabelValError = isTagValError;
    return {
      ...state,
      labelInfo: _labelInfo,
    };
  },
  [PRODUCTCLASSIFY_SET_LABEL_INPUT_VALUE]: (state, action) => {
    const { tagInputValue } = action.fields;
    const _labelInfo = _cloneDeep(state.labelInfo);
    _labelInfo.labelInputValue = tagInputValue;
    return {
      ...state,
      labelInfo: _labelInfo,
    };
  },
  [PRODUCTCLASSIFY_SET_LABEL_INPUT_VISIBLE]: (state, action) => {
    const { tagInputVisible } = action.fields;
    const _labelInfo = _cloneDeep(state.labelInfo);
    _labelInfo.labelInputVisible = tagInputVisible;
    return {
      ...state,
      labelInfo: _labelInfo,
    };
  },
  [PRODUCTCLASSIFY_SET_ATTRIBUTELIST]: (state, action) => {
    const { property } = action.fields;
    const { attributeList } = state.modalFormValue;
    const attributeListClone = DeepClone.deepClone(attributeList);
    const index = attributeListClone.findIndex((each) => each.name === property);
    const isLimit = action.fields.isLimit !== 'false';
    const attributeIndex = { ...attributeList[index], value: isLimit };
    attributeListClone[index] = attributeIndex;
    return {
      ...state,
      modalFormValue: {
        ...state.modalFormValue,
        attributeList: attributeListClone,
      },
    };
  },
  [PRODUCTCLASSIFY_SET_PROPERTY_INPUT_VISIBLE]: (state, action) => {
    const { tagInputVisible, property } = action.fields;
    const formObj = {
      deepObj: state.modalFormValue,
      property,
      changedProperty: 'tagInputVisible',
      changedPropertyToObj: tagInputVisible,
    };
    const modalFormValueClone = filterInForm(formObj);
    return {
      ...state,
      modalFormValue: modalFormValueClone,
    };
  },
  [PRODUCTCLASSIFY_SET_PROPERTY_TAG_INPUT_VALUE]: (state, action) => {
    const { tagInputValue, property } = action.fields;

    const formObj = {
      deepObj: state.modalFormValue,
      property,
      changedProperty: 'tagInputValue',
      changedPropertyToObj: tagInputValue,
    };
    const modalFormValueClone = filterInForm(formObj);
    return {
      ...state,
      modalFormValue: modalFormValueClone,
    };
  },
  [PRODUCTCLASSIFY_GET_CUR_PROPERTY_TAGS]: (state, action) => {
    const { tags = [], property } = action.fields;
    const formObj = {
      deepObj: state.modalFormValue,
      property,
      changedProperty: 'tags',
      changedPropertyToObj: tags,
    };
    const modalFormValueClone = filterInForm(formObj);
    return {
      ...state,
      modalFormValue: modalFormValueClone,
    };
  },
  [PRODUCTCLASSIFY_SET_PROPERTY_TAG_VAL_ERROR]: (state, action) => {
    const { isTagValError, property } = action.fields;
    const formObj = {
      deepObj: state.modalFormValue,
      property,
      changedProperty: 'isTagValError',
      changedPropertyToObj: isTagValError,
    };
    const modalFormValueClone = filterInForm(formObj);
    return {
      ...state,
      modalFormValue: modalFormValueClone,
    };
  },
  [PRODUCTCLASSIFY_ADD_ATTRIBUTELIST]: (state, action) => {
    const { newProperty, tagsArray, onChange, delFieldItem, name, operateType } = action.fields;
    const { modalFormValue } = state;
    const modalFormValueClone = DeepClone.deepClone(modalFormValue);
    modalFormValueClone.attributeList.push({
      label: newProperty,
      name,
      type: 'customradio',
      operateType,
      data: {
        true : '限制',
        false: '不限制',
      },
      value: false,
      canDelFieldItem: true,
      tagsArray,
      onChange,
      delFieldItem,
    });

    return {
      ...state,
      modalFormValue: modalFormValueClone,
    };
  },
};

// ------------------------------------
// Reducer
// ------------------------------------


export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
