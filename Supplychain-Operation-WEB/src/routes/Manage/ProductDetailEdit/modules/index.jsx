import React from 'react';
import { message } from 'antd';
import _cloneDeep from 'lodash.clonedeep';
import initialState from './initialState';
import { moduleName } from '../index';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';
import {
  // labelListAdaptor,
  cateListAdaptor,
  areaListAdaptor,
  carriageListAdaptor,
  tagListAdaptor,
  getNewImgList,
  // getAreaList,
  getTarget,
  getFormSpecValue,
  resetSpecValueStyles,
  updateSkuList,
  validateSkuInfo,
  getSubmitValueFunc,
  getFormatPriceFunc,
  // needOriginData,
  resetSpuData,
  getAttrFormList,
  getFomatFormData,
} from './tinyUtil';

// ------------------------------------
// Constants
// ------------------------------------
const PRDTEDIT_PRODUCT_NEW = 'PRDTEDIT_PRODUCT_NEW';
const PRDTEDIT_CATELIST_DO = 'PRDTEDIT_CATELIST_DO';
const PRDTEDIT_CATELIST_SUCCESS = 'PRDTEDIT_CATELIST_SUCCESS';
const PRDTEDIT_CATELIST_FAILURE = 'PRDTEDIT_CATELIST_FAILURE';
const PRDTEDIT_AREALIST_DO = 'PRDTEDIT_AREALIST_DO';
const PRDTEDIT_AREALIST_SUCCESS = 'PRDTEDIT_AREALIST_SUCCESS';
const PRDTEDIT_AREALIST_FAILURE = 'PRDTEDIT_AREALIST_FAILURE';
const PRDTEDIT_CARRIAGE_DO = 'PRDTEDIT_CARRIAGE_DO';
const PRDTEDIT_CARRIAGE_SUCCESS = 'PRDTEDIT_CARRIAGE_SUCCESS';
const PRDTEDIT_CARRIAGE_FAILURE = 'PRDTEDIT_CARRIAGE_FAILURE';
const PRDTEDIT_VALUES_CHANGE = 'PRDTEDIT_VALUES_CHANGE';
const PRDTEDIT_SPEC_THINGS_UPDATE = 'PRDTEDIT_SPEC_THINGS_UPDATE';
const PRDTEDIT_SPEC_UPDATE = 'PRDTEDIT_SPEC_UPDATE';
const PRDTEDIT_SPEC_VALUES_UPDATE = 'PRDTEDIT_SPEC_VALUES_UPDATE';
const PRDTEDIT_SPEC_VALUE_ADD = 'PRDTEDIT_SPEC_VALUE_ADD';
const PRDTEDIT_SPEC_VALUE_RM = 'PRDTEDIT_SPEC_VALUE_RM';
// const PRDTEDIT_SALE_AREA_ADD = 'PRDTEDIT_SALE_AREA_ADD';
const PRDTEDIT_SKU_INFO_CHANGE = 'PRDTEDIT_SKU_INFO_CHANGE';
const PRDTEDIT_IMG_LIST_CHANGE = 'PRDTEDIT_IMG_LIST_CHANGE';
const PRDTEDIT_VALUES_VALIDATE = 'PRDTEDIT_VALUES_VALIDATE';
const PRDTEDIT_SUBMIT_DO = 'PRDTEDIT_SUBMIT_DO';
const PRDTEDIT_SUBMIT_SUCCESS = 'PRDTEDIT_SUBMIT_SUCCESS';
const PRDTEDIT_SUBMIT_FAILURE = 'PRDTEDIT_SUBMIT_FAILURE';

const PRDTEDIT_DETAIL_DO = 'PRDTEDIT_DETAIL_DO';
const PRDTEDIT_DETAIL_SUCCESS = 'PRDTEDIT_DETAIL_SUCCESS';
const PRDTEDIT_DETAIL_FAILURE = 'PRDTEDIT_DETAIL_FAILURE';
const PRDTEDIT_EDIT_STATUS_CHANGE = 'PRDTEDIT_EDIT_STATUS_CHANGE';
const PRDTEDIT_FORM_ITEM_EDIT = 'PRDTEDIT_FORM_ITEM_EDIT';

const PRDTEDIT_SPEC_DO = 'PRDTEDIT_SPEC_DO';
const PRDTEDIT_SPEC_SUCCESS = 'PRDTEDIT_SPEC_SUCCESS';
const PRDTEDIT_SPEC_FAILURE = 'PRDTEDIT_SPEC_FAILURE';
const PRDTEDIT_SPEC_THINGS_RESET = 'PRDTEDIT_SPEC_THINGS_RESET';

const PRDTEDIT_ATTR_UPDATE = 'PRDTEDIT_ATTR_UPDATE';
const PRDTEDIT_ATTR_CLEAR = 'PRDTEDIT_ATTR_CLEAR';

const PRDTEDIT_TAGLIST_DO = 'PRDTEDIT_TAGLIST_DO';
const PRDTEDIT_TAGLIST_SUCCESS = 'PRDTEDIT_TAGLIST_SUCCESS';
const PRDTEDIT_TAGLIST_FAILURE = 'PRDTEDIT_TAGLIST_FAILURE';

const PRDTEDIT_VERIFYRECORD_CHANGE = 'PRDTEDIT_VERIFYRECORD_CHANGE';

const PRDTEDIT_VARIFYSUBMIT_DO = 'PRDTEDIT_VARIFYSUBMIT_DO';
const PRDTEDIT_VARIFYSUBMIT_SUCCESS = 'PRDTEDIT_VARIFYSUBMIT_SUCCESS';
const PRDTEDIT_VARIFYSUBMIT_FAILURE = 'PRDTEDIT_VARIFYSUBMIT_FAILURE';

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  // 在createAction中组装action
  newProduct: createAction(PRDTEDIT_PRODUCT_NEW),
  ValuesChange: createAction(PRDTEDIT_VALUES_CHANGE, 'params'),
  // 在中间件(/src/store/createStore.js)中组装action, 可传入的参数是types, callAPI, shouldCallAPI, payload, callback
  loadCateList: (selectedOptions) => ({
    types: [
      PRDTEDIT_CATELIST_DO,
      PRDTEDIT_CATELIST_SUCCESS,
      PRDTEDIT_CATELIST_FAILURE,
    ],
    callAPI: () => fetch('/category/list', {
      parentId: selectedOptions ? [...selectedOptions].pop().value : 0,
      pageNo: 0,
      pageSize: -1,
    }),
    payload: { selectedOptions },
  }),
  loadAreaList: (treeNode) => ({
    types: [
      PRDTEDIT_AREALIST_DO,
      PRDTEDIT_AREALIST_SUCCESS,
      PRDTEDIT_AREALIST_FAILURE,
    ],
    callAPI: () => fetch('/query/area', {
      parentId: treeNode ? treeNode.props.value : '100000',
    }),
    payload: { treeNode },
  }),
  loadCarriageList: () => ({
    types: [
      PRDTEDIT_CARRIAGE_DO,
      PRDTEDIT_CARRIAGE_SUCCESS,
      PRDTEDIT_CARRIAGE_FAILURE,
    ],
    callAPI: () => fetch('/freight/list', {}),
  }),
  updateSpecThings: createAction(PRDTEDIT_SPEC_THINGS_UPDATE, 'params'),
  updateSpec: createAction(PRDTEDIT_SPEC_UPDATE, 'params'),
  updateSpecValues: createAction(PRDTEDIT_SPEC_VALUES_UPDATE, 'params'),
  addSpecValue: createAction(PRDTEDIT_SPEC_VALUE_ADD, 'params'),
  rmSpecValue: createAction(PRDTEDIT_SPEC_VALUE_RM, 'params'),
  // addSaleArea: createAction(PRDTEDIT_SALE_AREA_ADD, 'params'),
  skuInfoChange: createAction(PRDTEDIT_SKU_INFO_CHANGE, 'params'),
  handleImgListChange: createAction(PRDTEDIT_IMG_LIST_CHANGE, 'params'),
  validateAllValues: createAction(PRDTEDIT_VALUES_VALIDATE, 'values'),
  handleSubmit: (id) => ({
    types: [
      PRDTEDIT_SUBMIT_DO,
      PRDTEDIT_SUBMIT_SUCCESS,
      PRDTEDIT_SUBMIT_FAILURE,
    ],
    shouldCallAPI: (state) => state[moduleName].valiAllValues,
    callAPI: (state) => fetch('/spu/edit', {
      spuId: id || '',
      ...state[moduleName].submitValues,
    }),
  }),

  loadProductDetail: (spuId) => ({
    types: [
      PRDTEDIT_DETAIL_DO,
      PRDTEDIT_DETAIL_SUCCESS,
      PRDTEDIT_DETAIL_FAILURE,
    ],
    callAPI: () => fetch('/spu/detail', { spuId }),
  }),
  setEditStatus: createAction(PRDTEDIT_EDIT_STATUS_CHANGE, 'editStatus'),
  editFormItem: createAction(PRDTEDIT_FORM_ITEM_EDIT, 'id'),
  resetSpec: () => ({
    types: [
      PRDTEDIT_SPEC_DO,
      PRDTEDIT_SPEC_SUCCESS,
      PRDTEDIT_SPEC_FAILURE,
    ],
    callAPI: (state) => fetch('/query/spec', {
      categoryId: state[moduleName].submitValues.categoryId,
    }),
  }),
  resetSpecThings: createAction(PRDTEDIT_SPEC_THINGS_RESET),

  updateAttrList: createAction(PRDTEDIT_ATTR_UPDATE, 'params'),
  clearAttrListValue: createAction(PRDTEDIT_ATTR_CLEAR),
  loadTagList: () => ({
    types: [
      PRDTEDIT_TAGLIST_DO,
      PRDTEDIT_TAGLIST_SUCCESS,
      PRDTEDIT_TAGLIST_FAILURE,
    ],
    callAPI: () => fetch('/tag/list', { pageSize: -1, pageNo: 1 }),
  }),
  changeVarifyRecord: createAction(PRDTEDIT_VERIFYRECORD_CHANGE, 'fields'),

  verifySubmit: (form) => {
    const {
      shopId,
      spuId,
      verifyStatus: { value: verifyStatus },
      reason: { value: reason },
    } = form;
    const result = { shopId, spuId, verifyStatus }; // 通过
    if (verifyStatus === '4') { // 不通过
      result.verifyStatus = '2';
      result.reason = reason;
    }
    return {
      types: [
        PRDTEDIT_VARIFYSUBMIT_DO,
        PRDTEDIT_VARIFYSUBMIT_SUCCESS,
        PRDTEDIT_VARIFYSUBMIT_FAILURE,
      ],
      callAPI: () => fetch('/spu/verify', result),
    };
  },
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [PRDTEDIT_SPEC_THINGS_RESET]: (state) => {
    const stateCloned = _cloneDeep(state);
    const {
      specList,
      specInfoList,
      attributeList: attributeListData,
      originData: { attributeList = [] },
    } = stateCloned;

    specList.forEach(({ specId: targetId, specValueList }) => {
      specInfoList.forEach((specInfo, specIndex) => {
        if (specInfo.specId === targetId) {
          // 使目标规格是被选中状态
          const targetFormId = specInfo.title.formItemCfg.id;
          stateCloned.values[targetFormId] = { name: targetFormId, value: true };

          // 设置已有规格值
          specInfo.children = getFormSpecValue({ specIndex, reset: specValueList });
          specInfo.children.forEach(({ formItemCfg: { id }, fieldOpt: { initialValue } }) => {
            stateCloned.values[id] = { value: initialValue };
            specInfo.specValues || (specInfo.specValues = {});
            specInfo.specValues[id] = initialValue;
          });
        }
      });
    });

    // 设置sku
    stateCloned.skuList = updateSkuList(specInfoList, stateCloned.submitValues.skuList);

    // 遍历商品详情中的attributeList数据，填入表单中
    const _attributeObj = {};
    attributeListData.forEach((dataItem) => {
      const { attributeId, isLimit, attributeValues } = dataItem;
      const targetObj = attributeList.find((aItem) => aItem.attributeId === attributeId);
      const itemName = `attributeList-${attributeId}`;
      // 有同一个属性 && (该属性不限制 || 当前属性值在该属性的属性值列表中)
      if (targetObj && (!isLimit || attributeValues.find((val) => val === targetObj.attributeValue))) {
        _attributeObj[itemName] = getFomatFormData(itemName, targetObj.attributeValue);
        targetObj.value = targetObj.attributeValue;
      } else {
        _attributeObj[itemName] = getFomatFormData(itemName, undefined);
      }
    });
    Object.assign(stateCloned.values, _attributeObj);

    return { ...stateCloned };
  },
  [PRDTEDIT_FORM_ITEM_EDIT]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { id } = action;

    let formItem = stateCloned.baseInfoList.find((item) => item.formItemCfg.id === id);
    formItem || (formItem = stateCloned.saleRuleList.find((item) => item.formItemCfg.id === id));
    formItem.click2Edit = false;

    return { ...stateCloned };
  },
  [PRDTEDIT_EDIT_STATUS_CHANGE]: (state, action) => {
    const { editStatus } = action;
    let stateCloned = _cloneDeep(state);
    const { baseInfoList, saleRuleList, specInfoList } = _cloneDeep(initialState);
    editStatus || (stateCloned = resetSpuData(
      stateCloned.originData,
      { ...stateCloned, baseInfoList, saleRuleList, specInfoList },
    ));
    return { ...stateCloned };
  },
  [PRDTEDIT_DETAIL_DO]: () => {
    const stateCloned = _cloneDeep(initialState);
    return { ...stateCloned, loading: true };
  },
  [PRDTEDIT_DETAIL_SUCCESS]: (state, action) => {
    let stateCloned = _cloneDeep(state);
    stateCloned = resetSpuData(action.data, stateCloned);
    return { ...stateCloned, loading: false, shopname: action.data.shopName };
  },
  [PRDTEDIT_DETAIL_FAILURE]: () => {
    const stateCloned = _cloneDeep(initialState);
    return { ...stateCloned, loading: false };
  },
  [PRDTEDIT_SPEC_DO]: (state) => ({ ...state, loading: true }),
  [PRDTEDIT_SPEC_SUCCESS]: (state, action) => {
    const { list = [], attributeList = [] } = action.data;
    const { categoryId, categoryName } = state.submitValues;
    return {
      ...state,
      cateList: [{
        value: categoryId,
        label: categoryName,
        specList: list,
        attributeList,
      }],
      loading: false,
    };
  },
  [PRDTEDIT_SPEC_FAILURE]: (state) => ({ ...state, loading: false }),

  [PRDTEDIT_SUBMIT_DO]: (state) => ({ ...state, loading: true }),
  [PRDTEDIT_SUBMIT_SUCCESS]: () => ({ ..._cloneDeep(initialState) }),
  [PRDTEDIT_SUBMIT_FAILURE]: (state) => ({ ...state, loading: false }),
  [PRDTEDIT_VALUES_VALIDATE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { skuList, values, originData, tagList: tagData, attributeList } = stateCloned;
    const getImgList = (list) => list.map((item) => item.url);
    const {
      name,
      subHead,
      standardFlag,
      unit,
      pkgUnit,
      saleStatus,
      spuNo,
      // labelList = [],
      tagList = [],
      saleDate,
      // saleArea,
      // minBuyNum,
      // lotSize,
      // carriageId,
    } = action.values;
    let { categoryId = [] } = action.values;
    // const { categoryId = [] } = action.values;

    const judgeSpecInfo = (valuesObj) => {
      let isSelected = false;
      Object.keys(valuesObj).forEach((vItemName) => {
        /^spec-[0-9]/.test(vItemName)
          && valuesObj[vItemName]
          && valuesObj[vItemName].value
          && (isSelected = true);
      });
      return isSelected;
    };

    let _skuList = [];
    const judgeSkuInfo = () => {
      let err = false;
      skuList
        ? (_skuList = skuList.map((specInfo) => {
          const { specList, skuId } = specInfo;

          const __specList = specList.map((item) => {
            const __item = _cloneDeep(item);
            delete __item.uid;
            delete __item.uidLoad;
            return __item;
          });

          const result = {};
          const skuInfoMap = [
            'costPrice',
            'unitPrice',
            'sellingPrice',
            'quantity',
            'pkgWeight',
          ];
          if (standardFlag === '2') {
            skuInfoMap.push('pkgWeightMin');
            skuInfoMap.push('pkgWeightMax');
          }

          skuInfoMap.forEach((itemName) => {
            const item = specInfo[itemName];
            const { value } = item;
            const getSubmitValue = getSubmitValueFunc(itemName);
            const getFormatValue = getFormatPriceFunc(itemName);

            item.validate = validateSkuInfo({ value, type: itemName, standardFlag: standardFlag === '1' });
            if (item.validate) {
              result[itemName] = getSubmitValue(value);
              item.value = getFormatValue(value);
            } else {
              err = true;
            }
          });
          return { ...result, skuId, specList: __specList };
        }))
        : (err = true);
      return !err;
    };

    const { headImageList, detailImageList } = values;
    const judgeImgList = (list) =>
      list
      && Object.prototype.toString.call(list) === '[object Array]'
      && list.length;

    if (!judgeSpecInfo(values)) {
      message.error('请至少选择一项规格');
      return { ...stateCloned };
    }
    if (!judgeSkuInfo()) {
      let msg = '请正确填写成本价、单价、售价、库存、皮重';
      if (standardFlag === '2') {
        msg += '、最小毛重和最大毛重';
      }
      message.error(msg);
      return { ...stateCloned };
    }
    if (!judgeImgList(detailImageList)) {
      message.error('请上传商品详情图片');
      return { ...stateCloned };
    }
    if (!judgeImgList(headImageList)) {
      message.error('请上传商品图片');
      return { ...stateCloned };
    }

    // if (areaCodeList && areaCodeList.length === 1 && areaCodeList[0] === '100000') {
    //   areaCodeList = [{ code: '100000', label: '全国' }];
    // } else if (originData && needOriginData(stateCloned.baseInfoList, 'areaList')) {
    //   areaCodeList = originData.areaList;
    // } else {
    //   areaCodeList = getAreaList(areaCodeList, areaList[0].children);
    // }

    // const _labelList = [];
    // labelList.forEach((labelId) => {
    //   const target = labelData.find((labelItem) => labelId === labelItem.value);
    //   target && _labelList.push({
    //     labelId: target.value,
    //     labelName: target.label,
    //   });
    // });
    const _tagList = [];
    tagList.forEach((tagId) => {
      const target = tagData.find((tagItem) => tagId === tagItem.value);
      target && _tagList.push({
        tagId: target.value,
        tagLabel: target.label,
      });
    });

    originData && (categoryId = [originData.categoryId]);

    const _attributeList = [];
    attributeList.map(({ attributeId, attributeName, value }) =>
      value && value.trim()
      && _attributeList.push({ attributeId, attributeName, attributeValue: value })
    );

    // debugger;
    const submitValues = {
      name,
      subHead,
      standardFlag: standardFlag === '1',
      unit,
      pkgUnit,
      categoryId: categoryId.pop(),
      spuNo,
      tagList: _tagList,
      saleDateBegin: saleDate && saleDate[0] && saleDate[0].valueOf(),
      saleDateEnd: saleDate && saleDate[1] && saleDate[1].valueOf(),
      // areaList: areaCodeList,
      saleStatus,
      // minBuyNum,
      // lotSize,
      skuList: _skuList,
      // carriageId,
      headImageList: getImgList(headImageList),
      detailImageList: getImgList(detailImageList),
      attributeList: _attributeList,
    };
    console.log('submitValues', submitValues);
    return { ...stateCloned, submitValues, valiAllValues: true };
  },
  [PRDTEDIT_IMG_LIST_CHANGE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { id } = action.params;
    stateCloned.values[id] = getNewImgList(stateCloned.values[id], action.params);
    return { ...stateCloned };
  },
  [PRDTEDIT_SKU_INFO_CHANGE]: (state, action) => {
    const stateCloned = _cloneDeep(state);

    const { index, type, value, standardFlag } = action.params;
    const result = validateSkuInfo({ value, type, standardFlag });
    if (typeof index === 'number') {
      stateCloned.skuList[index][type] = { value, validate: result };
    } else {
      stateCloned.skuList.forEach(
        (item) => { item[type] = { value, validate: result }; }
      );
    }
    return { ...stateCloned };
  },
  // [PRDTEDIT_SALE_AREA_ADD]: (state, action) => {
  //   const { value } = action.params;
  //   const stateCloned = _cloneDeep(state);
  //   const { baseInfoList } = stateCloned;
  //   const areaItemIndex = baseInfoList.findIndex(
  //     (formItem) => formItem.formItemCfg.id === 'areaList'
  //   );
  //   // 若选择‘部分地区’，则添加区域选择
  //   baseInfoList[areaItemIndex].isShow = value === '1';

  //   return { ...stateCloned };
  // },
  [PRDTEDIT_SPEC_UPDATE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { value, optsList } = action.params;
    const { specInfoList } = stateCloned;

    const indexInSpecList = optsList[0]; // spec在specInfoList中的下标

    // 初始化规格下的规格值
    if (specInfoList[indexInSpecList]) {
      delete specInfoList[indexInSpecList].children;
      specInfoList[indexInSpecList].specValues = {};
    }

    // 若spec被勾选，则在specInfoList中添加spec-[titleIndex]-0的规格值
    if (value) {
      specInfoList[indexInSpecList].children =
        getFormSpecValue({ specIndex: indexInSpecList });
      specInfoList[indexInSpecList].specValues = {};
    }

    stateCloned.skuList = updateSkuList(specInfoList, stateCloned.skuList);
    return { ...stateCloned };
  },
  [PRDTEDIT_SPEC_VALUES_UPDATE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { formData: { value }, optsList, totalId } = action.params;

    const [specIndex] = optsList;
    if (!stateCloned.specInfoList[specIndex]) {
      return { ...stateCloned, skuList: [] };
    }
    stateCloned.specInfoList[specIndex].specValues[totalId] = value;

    stateCloned.skuList = updateSkuList(stateCloned.specInfoList, stateCloned.skuList);
    return { ...stateCloned };
  },
  [PRDTEDIT_SPEC_THINGS_UPDATE]: (state, action) => {
    const { value = [] } = action.params;
    const stateCloned = _cloneDeep(state);
    let { cateList: cateSelected } = stateCloned;

    // 更新最小分类下的规格列表specInfoList|标签列表labelList
    let specInfoList = [];
    // let labelList = [];
    let attributeList = [];
    let otherAttrList = [];
    const len = value.length;
    value.forEach((categoryId, index) => {
      cateSelected = cateSelected.find((cateItem) => cateItem.value === categoryId);
      if (index === len - 1) {
        // 若为最后一级，则赋值;
        // 规格列表specInfoList
        specInfoList = _cloneDeep(cateSelected.specList);
        // 分类列表labelList
        // labelList = labelListAdaptor(cateSelected.labelList);
        // 其他属性列表attributeList
        attributeList = _cloneDeep(cateSelected.attributeList);
        otherAttrList = getAttrFormList(cateSelected.attributeList);
      } else {
        // 若不为最后一级，则继续遍历;
        cateSelected = cateSelected.children;
      }
    });

    // 生成该分类下新的规格内容
    const specListLen = specInfoList.length;
    specInfoList = specInfoList.map((item, index) => ({
      ...item,
      title: {
        formItemCfg: {
          label: index === 0
            ? (<span><span style={{ color: 'red', fontFamily: 'SimSun' }}>* </span>规格设置</span>)
            : ' ',
          id: `spec-${index}-${new Date().getTime()}`,
          colon: index === 0,
          style: index !== specListLen ? { marginBottom: 5 } : {},
        },
        fieldOpt: {
          rules: [],
          valuePropName: 'checked',
        },
        inputOpt: {
          type: 'checkbox',
          props: { children: item.specName },
        },
      },
    }));

    stateCloned.skuList = updateSkuList(specInfoList, stateCloned.skuList);

    return { ...stateCloned, specInfoList, attributeList, otherAttrList };
  },
  [PRDTEDIT_SPEC_VALUE_ADD]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { specIndex } = action.params;

    const specInfo = stateCloned.specInfoList[specIndex];
    specInfo.children = getFormSpecValue({
      formItemList: specInfo.children,
      specIndex,
    });

    return { ...stateCloned };
  },
  [PRDTEDIT_SPEC_VALUE_RM]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { specIndex, specValueIndex, id } = action.params;

    const specInfo = stateCloned.specInfoList[specIndex];
    const { children, specValues } = specInfo;
    specInfo.children = resetSpecValueStyles(children.filter((item) => item.formItemCfg.id !== id));
    delete specValues[specValueIndex];
    delete specInfo.specValues[id];

    stateCloned.skuList = updateSkuList(stateCloned.specInfoList, stateCloned.skuList);
    return { ...stateCloned };
  },
  [PRDTEDIT_CATELIST_DO]: (state, action) => {
    const targetOption = getTarget(action.selectedOptions);
    targetOption && (targetOption.loading = true);
    return {
      ...state,
      loading: true,
      cateList: [...state.cateList],
    };
  },
  [PRDTEDIT_CATELIST_SUCCESS]: (state, action) => {
    const targetOption = getTarget(action.selectedOptions);
    let newData = cateListAdaptor(action.data.list);
    if (targetOption) {
      targetOption.loading = false;
      targetOption.children = newData;

      newData = [...state.cateList];
    }
    return {
      ...state,
      cateList: newData,
      loading: false,
    };
  },
  [PRDTEDIT_CATELIST_FAILURE]: (state, action) => {
    const targetOption = getTarget(action.selectedOptions);

    targetOption && (targetOption.loading = false);
    const errCateList = [{
      value: '',
      label: '加载失败，请刷新页面...',
      isLeaf: true,
      disabled: true,
    }];
    return {
      ...state,
      loading: false,
      cateList: targetOption ? [...state.cateList] : errCateList,
    };
  },
  [PRDTEDIT_AREALIST_DO]: (state) => ({ ...state, loading: true }),
  [PRDTEDIT_AREALIST_SUCCESS]: (state, action) => {
    const { treeNode } = action;
    let newData = areaListAdaptor(action.data.list);

    if (treeNode) {
      const pos = treeNode.props.pos.split('-');
      pos.shift();

      const len = pos.length;
      let parentArea = state.areaList;
      pos.forEach((item, index) => {
        index === len - 1
          ? (parentArea[item].children = newData)
          : (parentArea = parentArea[item].children);
      });
      newData = [...state.areaList];
    }

    return { ...state, areaList: newData, loading: false };
  },
  [PRDTEDIT_AREALIST_FAILURE]: (state, action) => {
    const { treeNode } = action;
    const errList = [{
      value: '',
      label: '加载失败，请刷新页面...',
      isLeaf: true,
      disabled: true,
    }];
    return {
      ...state,
      areaList: treeNode ? state.areaList : errList,
      loading: false,
    };
  },
  [PRDTEDIT_CARRIAGE_DO]: (state) => ({ ...state }),
  [PRDTEDIT_CARRIAGE_SUCCESS]: (state, action) => ({
    ...state,
    // carriageList: action.data.list,
    carriageList: carriageListAdaptor(action.data.list),
    // loading: false,
  }),
  [PRDTEDIT_CARRIAGE_FAILURE]: (state) => {
    const errCateList = [{
      value: '',
      label: '加载失败，请刷新页面...',
      disabled: true,
    }];
    return {
      ...state,
      // loading: false,
      carriageList: errCateList,
    };
  },
  [PRDTEDIT_VALUES_CHANGE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { formData, totalId } = action.params;

    stateCloned.values[totalId] = formData;
    return { ...stateCloned };
  },
  [PRDTEDIT_PRODUCT_NEW]: () => {
    const stateCloned = _cloneDeep(initialState);
    return { ...stateCloned };
  },
  [PRDTEDIT_ATTR_CLEAR]: (state) => {
    const stateCloned = _cloneDeep(state);
    Object.keys(stateCloned.values).forEach((valName) => {
      /^attributeList-/.test(valName) && (delete stateCloned.values[valName]);
    });

    return { ...stateCloned };
  },
  [PRDTEDIT_ATTR_UPDATE]: (state, action) => {
    const stateCloned = _cloneDeep(state);
    const { value, optsList: [attrId] } = action.params;
    stateCloned.attributeList.forEach((item) => {
      item.attributeId === attrId && (item.value = value);
    });
    return { ...stateCloned };
  },
  [PRDTEDIT_TAGLIST_DO]: (state) => ({
    ...state,
    loading: true,
  }),
  [PRDTEDIT_TAGLIST_SUCCESS]: (state, action) => ({
    ...state,
    tagList: tagListAdaptor(action.data.list),
    loading: false,
  }),
  [PRDTEDIT_TAGLIST_FAILURE]: (state) => {
    const errTagList = [{
      value: '',
      label: '加载失败，请刷新页面...',
    }];
    return {
      ...state,
      loading: false,
      tagList: errTagList,
    };
  },
  [PRDTEDIT_VERIFYRECORD_CHANGE]: (state, action) => ({
    ...state,
    varifyRecord: { ...action.fields },
  }),
  [PRDTEDIT_VARIFYSUBMIT_DO]: (state) => ({ ...state, verifyLoading: true }),
  [PRDTEDIT_VARIFYSUBMIT_SUCCESS]: (state) => ({ ...state, verifyLoading: false }),
  [PRDTEDIT_VARIFYSUBMIT_FAILURE]: (state) => ({ ...state, verifyLoading: false }),
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function reducer(state = _cloneDeep(initialState), action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
