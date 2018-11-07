import { message } from 'antd';

export const cateListAdaptor = (data, parentRecord = []) => data.map(
  (backCate) => ({
    title: backCate.categoryName,
    key: backCate.categoryId,
    isLeaf: backCate.isParent === '2',
    parentIdList: parentRecord, // 父级分类id列表
  })
);

export const findParentRecord = (parentIdList, parentData) => {
  let _parentData = parentData;
  // 若为子分类，先找到其父分类
  parentIdList.forEach((parentId) => {
    _parentData = _parentData.children.find(
      ({ key: childId }) => childId === parentId
    );
  });
  return _parentData;
};

export const operateFuncStrategy = {
  delete: (list, id) => {
    const newList = [];
    list.forEach((item) => {
      if (item.spuId === id) {
        if (item.operateType !== 'new') {
          item.operateType = 'delete';
          newList.push(item);
        }
      } else {
        newList.push(item);
      }
    });
    return newList;
  },
  add: (list, id, name, shopId) => {
    const getTimeStamp = () => new Date().getTime();
    const target = list.find((item) => item.spuId === id);
    if (target) {
      if (target.operateType !== 'delete') {
        message.error('该商品已加入，请勿重复操作');
      } else {
        target.operateType = 'new';
        target.timeStamp = getTimeStamp();
      }
    } else {
      list.push({ spuId: id, spuName: name, shopId, operateType: 'new', timeStamp: getTimeStamp() });
    }
    return list;
  },
};

export const getFomatFormData = (id, value) => ({ name: id, value });

export const resetSpuData = (data, __state) => {
  const {
    frontCateName,
    sort,
    frontCateImg,
    frontCateImgTarget,
    endCateList,
    spuItemList,
    level,
  } = data;

  return {
    ...__state,
    values: {
      frontCateName: getFomatFormData('frontCateName', frontCateName),
      sort: getFomatFormData('sort', sort),
      frontCateImg: frontCateImg ? [{
        uid: frontCateImg,
        url: frontCateImg,
      }] : [],
      frontCateImgTarget: getFomatFormData('frontCateImgTarget', frontCateImgTarget),
    },
    checkedBackCateList: level === '1' ? [] : endCateList,
    spuItemList: level === '1' ? [] : spuItemList,
  };
};
