import moment from 'moment';
import _cloneDeep from 'lodash.clonedeep';

export const cateListAdaptor = (data) =>
  (data.map(
    // ({ categoryId, categoryName, isParent, specList, labelList, attributeList }）=>({
    ({
      categoryId,
      categoryName,
      isParent,
      specList,
      // labelList,
      attributeList,
    }) => ({
      value: categoryId,
      label: categoryName,
      isLeaf: isParent === '2',
      specList,
      // labelList,
      attributeList,
      disabled: isParent === '2' && !(specList && specList.length),
    })
  ));

export const areaListAdaptor = (data) =>
  (data.map(
    ({ value, label, level }) => ({
      value,
      label,
      isLeaf: level > '3',
    })
  ));

export const carriageListAdaptor = (data) =>
  (data.map(
    ({ templateId, templateName }) => ({
      value: templateId,
      label: `ID:${templateId}-${templateName}`,
    })
  ));

export const labelListAdaptor = (data) =>
  (data.map(
    ({ labelId, labelName }) => ({
      value: labelId,
      label: labelName,
    })
  ));

export const tagListAdaptor = (data) =>
  (data.map(
    ({ tagId, tagLabel }) => ({
      value: tagId,
      label: tagLabel,
    })
  ));

export const getNewImgList = (imgList = [], params = {}) => {
  let list = [...imgList];
  const { type, imgUrl, fileList: newFileList } = params;
  switch (type) {
    case 'add':
      list.push({ uid: new Date().getTime(), url: imgUrl });
      break;
    case 'change':
      list = newFileList;
      break;
    default:
      break;
  }
  return list;
};

export const getAttrFormList = (data = []) => {
  const attrValueListAdaptor = (attrValueList) =>
    attrValueList.map((value) => ({
      value,
      label: value,
    }));
  return data.map(({ attributeId, attributeName, isLimit, attributeValues = [] }) => {
    const formData = {
      formItemCfg: {
        label: attributeName,
        id: `attributeList-${attributeId}`,
      },
      fieldOpt: {
        rules: [
          !isLimit && { max: 64, message: '请输入长度小于64的文字' },
        ],
      },
      inputOpt: {
        type: isLimit ? 'select' : 'input',
        props: {
          placeholder: `请${isLimit ? '选择' : '输入'}${attributeName}`,
        },
      },
    };
    if (isLimit) {
      formData.inputOpt.props.data = attrValueListAdaptor(attributeValues);
      formData.inputOpt.props.allowClear = true;
      formData.inputOpt.props.getPopupContainer = () => document.getElementById('product-detail-form');
    }
    return formData;
  });
};

export const getAreaList = (targetList, dataList) => {
  const getAreaData = (code, targetData, targetLen, targetStrList = []) => {
    const targetCode = code.substr(0, targetLen).padEnd(6, '0');
    targetData = targetData.find((item) => item.value === targetCode);
    targetStrList.push(targetData.label);

    if (Number(code.substr(targetLen)) === 0) return targetStrList;
    return getAreaData(code, targetData.children, targetLen + 2, targetStrList);
  };
  return targetList.map((areaCode) => ({
    code: areaCode,
    label: getAreaData(areaCode, dataList, 2).join('/'),
  }));
};

export const getTarget = (selectedOptions) => {
  if (selectedOptions && selectedOptions.length) {
    return selectedOptions[selectedOptions.length - 1];
  }
  return false;
};

export const resetSpecValueStyles = (children) => {
  const len = children.length;
  children.forEach((item, index) => {
    item.btnList = [];
    const { id, style } = item.formItemCfg;
    const [, specIndex, specValueIndex] = id.split('-');
    // 若不是唯一一个，则有-号
    len !== 1 && item.btnList.push({
      type: 'minusIcon',
      getProps: (__props) => ({
        onClick:
          () => __props.rmSpecValue({ specIndex, specValueIndex, id, key: 'minus' }),
      }),
    });
    // 若是最后一个，且少于10个规格值，则有+号
    const isLast = len === (index + 1);
    isLast && len < 10 && item.btnList.push({
      type: 'plusIcon',
      getProps: (__props) => ({
        onClick: () => __props.addSpecValue({ specIndex, key: 'plus' }),
      }),
    });
    isLast || (item.formItemCfg.style = { ...style, marginBottom: 5 });
  });
  return children;
};

export const getFormSpecValue = ({ formItemList = [], specIndex, len = 1, reset }) => {
  const listLen = formItemList.length;
  let specValueIndex = listLen
    ? Number(formItemList[listLen - 1].formItemCfg.id.split('-')[2]) + 1
    : 0;
  if (reset) {
    specValueIndex = 0;
    len = reset.length;
  }
  for (let i = 0; i < len; i += 1) {
    formItemList.push({
      formItemCfg: {
        label: ' ',
        id: `specValue-${specIndex}-${specValueIndex + i}-${new Date().getTime()}`,
        // hasFeedback: true,
        colon: false,
        wrapperCol: { xs: { span: 18 }, sm: { span: 10 } },
        // style: ,
      },
      fieldOpt: {
        initialValue: reset ? reset[i] : undefined,
        rules: [
          { required: true, message: '必填' },
          { max: 16, message: '请输入长度小于16的文字' },
        ],
      },
      inputOpt: {
        type: 'input',
        props: {
          placeholder: '请输入规格值',
          disabled: !!reset,
        },
      },
    });
  }

  formItemList = resetSpecValueStyles(formItemList);
  return formItemList;
};

const getUid = (item, iName = 'uid') => {
  const uidItem = [...item].sort((a, b) => {
    if (a[iName] < b[iName]) return -1;
    if (a[iName] > b[iName]) return 1;
    return 0;
  });
  return uidItem.map((uItem) => uItem[iName]).join(',');
};

export const updateSkuList = (specInfoList, skuList) => {
  const _specInfoList = _cloneDeep(specInfoList).reverse();
  let minSpecIndex = -1;
  let tempListA = [];
  let tempListB = [];

  _specInfoList.forEach(({ specValues, specId, specName }, specIndex) => {
    if (!specValues) {
      return false;
    }
    Object.keys(specValues).forEach((id) => {
      let [, sIndex, vIndex] = id.split('-');
      sIndex = sIndex.padStart(2, '0');
      vIndex = vIndex.padStart(2, '0');
      const specValue = (specValues[id] || '').trim();
      if (!specValue) {
        return false;
      }
      const specValueItem = {
        specId,
        specName,
        specValue,
        uid: sIndex + vIndex,
        uidLoad: specId + specValue,
      };
      // const specValueItem = { specId, specName, specValue, uid: sIndex + vIndex };
      if (minSpecIndex === -1) {
        minSpecIndex = specIndex;
        tempListA.push([specValueItem]);
      } else if (minSpecIndex === specIndex) {
        tempListA.push([specValueItem]);
      } else {
        tempListA.forEach(
          (tempValueItems) => tempListB.push([specValueItem, ...tempValueItems])
        );
      }
      return true;
    });
    tempListB.length && (tempListA = tempListB);
    tempListB = [];
    return true;
  });

  const dataSource = tempListA.map((item, index) => {
    const uid = getUid(item);
    const uidLoad = getUid(item, 'uidLoad');
    let values = {};
    skuList && (values = skuList.find((sku) => sku.uidLoad === uidLoad || sku.uid === uid) || {});
    delete values.uidLoad;
    return {
      uid,
      costPrice: { value: undefined, validate: undefined },
      unitPrice: { value: undefined, validate: undefined },
      sellingPrice: { value: undefined, validate: undefined },
      quantity: { value: undefined, validate: undefined },
      pkgWeight: { value: undefined, validate: undefined },
      pkgWeightMin: { value: undefined, validate: undefined },
      pkgWeightMax: { value: undefined, validate: undefined },
      ...values,
      key: index,
      specList: item,
    };
  });
  return dataSource;
};

const testPrice = (priceValue) => /^\d{0,8}(\.\d{1,2})?$/.test(priceValue);
const testRequiredPrice = (priceValue) => /^[^ ]+$/.test(priceValue) && testPrice(priceValue);

const testWeight = (priceValue) => !priceValue || /^\d{0,6}(\.\d{1,2})?$/.test(priceValue);
const testRequiredWeight = (priceValue) => /^[^ ]+$/.test(priceValue) && testWeight(priceValue);

export const price2percent = (value) => Number((Number(value) * 100).toFixed(0));

export const validateSkuInfo = ({ value = '', type, standardFlag }) => {
  const validateStrategy = {
    costPrice: (typeValue) => testPrice(typeValue),
    unitPrice: (typeValue) => (standardFlag ? testPrice : testRequiredPrice)(typeValue),
    sellingPrice: (typeValue) => testRequiredPrice(typeValue),
    quantity: (typeValue) => /^\d{1,8}$/.test(typeValue),
    pkgWeight: (typeValue) => (standardFlag ? testWeight : testRequiredWeight)(typeValue),
    pkgWeightMin: (typeValue) => /^\d{1,4}(\.\d)?$/.test(typeValue),
    pkgWeightMax: (typeValue) => /^\d{1,4}(\.\d)?$/.test(typeValue),
  };
  return validateStrategy[type](value);
};

export const getSubmitValueFunc = (type) => {
  const valueFormat = {
    costPrice: (v) => (v ? price2percent(v) : v),
    unitPrice: (v) => (v ? price2percent(v) : v),
    sellingPrice: price2percent,
    quantity: (v) => Number(v),
  };
  return valueFormat[type] || ((v) => v);
};

export const getFormatPriceFunc = (type) => {
  const getFormatPrice = (v) => {
    if (v === undefined || !v.trim()) return undefined;
    return Number(v).toFixed(2);
  };
  const valueFormat = {
    costPrice: getFormatPrice,
    unitPrice: getFormatPrice,
    sellingPrice: getFormatPrice,
  };
  return valueFormat[type] || ((v) => v);
};

const percent2price = (value) => {
  if (typeof value !== 'number') return undefined;
  return (Number(value) / 100).toFixed(2);
};

export const needOriginData = (list, id) => {
  const __item = list.find((item) => item.formItemCfg.id === id);
  return __item && __item.click2Edit;
};

export const getFomatFormData = (id, value) => ({ name: id, value });

export const resetSpuData = (data, __state) => {
  data.carriageId = String(data.carriageId);
  const {
    name,
    subHead,
    standardFlag,
    unit,
    pkgUnit,
    categoryId,
    categoryName,
    spuNo,
    // labelList,
    tagList = [],
    saleDateBegin,
    saleDateEnd,
    // areaList,
    saleStatus,
    skuList,
    // minBuyNum,
    // lotSize,
    carriageId,
    headImageList,
    detailImageList,
    specList,
    attributeList,
  } = data;

  specList.forEach((spec) => {
    spec.specValueList.sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });
  });

  const __skuList = skuList.map((skuItem) => {
    const __specList = skuItem.specList.map(
      ({ specValue, specId, specName }) => ({ specValue, specId, specName, uidLoad: specId + specValue })
    );
    const uidLoad = getUid(__specList, 'uidLoad');
    return {
      ...skuItem,
      uidLoad,
      key: skuItem.skuId,
      costPrice: { value: percent2price(skuItem.costPrice), validate: true },
      unitPrice: { value: percent2price(skuItem.unitPrice), validate: true },
      sellingPrice: { value: percent2price(skuItem.sellingPrice), validate: true },
      quantity: { value: skuItem.quantity, validate: true },
      pkgWeight: { value: skuItem.pkgWeight, validate: true },
      pkgWeightMin: { value: skuItem.pkgWeightMin, validate: true },
      pkgWeightMax: { value: skuItem.pkgWeightMax, validate: true },
    };
  });
  const __headImageList = headImageList.map((url, index) => ({ uid: `${index}-${url.length}`, url }));
  const __detailImageList = detailImageList.map((url, index) => ({ uid: `${index}-${url.length}`, url }));

  return {
    ...__state,
    skuList: __skuList,
    specList,
    cateList: [{ value: categoryId, label: categoryName, isLeaf: true }],
    values: {
      name: getFomatFormData('name', name),
      subHead: getFomatFormData('subHead', subHead),
      standardFlag: getFomatFormData('standardFlag', standardFlag ? '1' : '2'),
      unit: getFomatFormData('unit', unit),
      pkgUnit: getFomatFormData('pkgUnit', pkgUnit),
      categoryId: getFomatFormData('categoryId', [categoryId]),
      spuNo: getFomatFormData('spuNo', spuNo),
      // labelList: getFomatFormData('labelList', labelList.map(({ labelId }) => labelId)),
      tagList: getFomatFormData('tagList', tagList.map(({ tagId }) => tagId)),
      saleDate: saleDateBegin && getFomatFormData(
        'saleDate',
        [moment(saleDateBegin), moment(saleDateEnd)],
      ),
      // areaList: getFomatFormData('areaList', areaList.map((area) => area.code)),
      saleStatus: getFomatFormData('saleStatus', saleStatus),
      // minBuyNum: getFomatFormData('minBuyNum', minBuyNum),
      // lotSize: getFomatFormData('lotSize', lotSize),
      carriageId: getFomatFormData('carriageId', carriageId),
      headImageList: __headImageList,
      detailImageList: __detailImageList,
    },
    // 详情展示数据
    submitValues: {
      name,
      subHead,
      standardFlag,
      unit,
      pkgUnit,
      categoryId,
      categoryName,
      spuNo,
      // labelList: labelList.map(({ labelName }) => labelName).join('，'),
      tagList: tagList.map(({ tagLabel }) => tagLabel).join('，'),
      saleDate: saleDateBegin &&
        [moment(saleDateBegin).format('YYYY-MM-DD HH:mm:ss'), moment(saleDateEnd).format('YYYY-MM-DD HH:mm:ss')],
      // areaList,
      saleStatus: { 0: '立即上架', 1: '暂不上架' }[saleStatus],
      skuList: __skuList,
      // minBuyNum,
      // lotSize,
      carriageId,
      headImageList: __headImageList,
      detailImageList: __detailImageList,
      attributeList,
    },
    // originData: { ...data, verifyStatus: '1', reason: '没有通过' }, // FIX ME
    originData: data,
  };
};
