export const cateListAdaptor = (data, parentRecord) => (data || []).map(
  (frontCate) => ({
    ...frontCate,
    children: frontCate.isParent ? [] : undefined,
    hasReqChild: false,
    parentIdList: parentRecord ? [...parentRecord.parentIdList, parentRecord.frontCateId] : [], // 父级分类id列表
  })
);

export const btnStyles = {
  edit: { type: 'default', label: '编辑', icon: 'edit' },
  newChild: { type: 'primary', label: '增加子分类', icon: 'plus-circle-o' },
  delete: { type: 'danger', label: '删除', icon: 'delete' },
  show: { type: 'danger', label: '展示', icon: 'check-circle-o' },
  hide: { type: 'default', label: '隐藏', icon: 'close-circle-o' },
};

export const findParentRecord = (parentIdList, parentData) => {
  let _parentData = parentData;
  // 若为子分类，先找到其父分类
  parentIdList.forEach((parentId) => {
    _parentData = _parentData.children.find(
      ({ frontCateId: childId }) => childId === parentId
    );
  });
  return _parentData;
};
