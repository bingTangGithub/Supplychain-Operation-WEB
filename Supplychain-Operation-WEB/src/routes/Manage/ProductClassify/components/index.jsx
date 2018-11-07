import React, { Component } from 'react';
import { Button, Tag, message, Modal } from 'antd';
import { DeepClone } from '@xinguang/common-tool';
import ListPage from '../../../../components/ListPage';
import ModalFormInCard from './ModalFormInCard';
import './index.scss';

class View extends Component {
  constructor(props) {
    super(props);

    this.state = {
      operateTypeObj: {
        增加子分类: 'addClass',
        删除: 'delete',
        编辑: 'edit',
      },
      editBtn: {
        type: 'default',
        label: '编辑',
        icon: 'edit',
      },
      deleteBtn: {
        type: 'danger',
        label: '删除',
        icon: 'delete',
      },
      addChildClassBtn: {
        type: 'primary',
        label: '增加子分类',
        icon: 'plus-circle-o',
      },
      btnArr: {
        NULL: [],
        canAdd: ['editBtn', 'addChildClassBtn', 'deleteBtn'],
        cannotAdd: ['editBtn', 'deleteBtn'],
      },
      inputVisible: false,
      inputValue: '',
      modalFormValue: {
        categoryName: '',
        sort: 50,
        attributeList: [],
      },
    };
  }
  componentDidMount() {
    const {
      searchParams,
      search,
      resetHadReqedParentId,
      setexpandedRowKeys,
    } = this.props;
    search(searchParams);
    resetHadReqedParentId();
    setexpandedRowKeys({ expandedRowKeys: [] });
  }

  getChildData = (parentId) => {
    const that = this;
    const {
      hadReqedArray,
      searchParams,
      setHadReqedParentId,
      search,
      setexpandedRowKeys,
      expandedRowKeys,
    } = that.props;

    const indexReq = hadReqedArray.findIndex((value) => (
      value === parentId
    ));
    const dataClone = DeepClone.deepClone(expandedRowKeys);

    // 之前没有请求过该父类
    if (indexReq === -1) {
      setHadReqedParentId({ parentId });
      search({
        ...searchParams,
        parentId,
      });
    } else {
      // 之前已经请求过，不再请求
    }

    const indexExpanded = expandedRowKeys.findIndex((expandedKey) => (
      expandedKey === parentId
    ));

    // 之前闭合，展开
    if (indexExpanded === -1) {
      setexpandedRowKeys({ expandedRowKeys: [...dataClone, parentId] });
    } else {
      // 已经展开，闭合
      dataClone.splice(indexExpanded, 1);
      setexpandedRowKeys({ expandedRowKeys: dataClone });
    }
  }

  getEachTag = (reqObj) => {
    const {
      tagNameArray,
      tagNameList,
      tagListObj: {
        tagName,
        tagId,
      },
    } = reqObj;

    tagNameArray.forEach((item) => {
      const { specName, operateType } = item;
      const specId = operateType === 'new' ? '' : item.specId;
      tagNameList.push({
        [tagName]: specName,
        [tagId]: specId,
        operateType: operateType || '',
      });
    });
  }

  getSavedReqObj = () => {
    const {
      specsInfo: { specsTags },
      labelInfo: { labelList },
      addBoolean,
      parentId,
      categoryId,
      modalFormValue: {
        attributeList: modalAttributeList,
        categoryName,
        sort,
      },
    } = this.props;
    const specList = [];
    const _labelList = [];
    const attributeList = [];
    const reqObj = {
      categoryName,
      sort,
      categoryId,
      specList,
      labelList: _labelList,
      attributeList,
    };

    if (specsTags.length) {
      const paramsObj = {
        tagNameArray: specsTags,
        tagNameList: specList,
        tagListObj: {
          tagName: 'specName',
          tagId: 'specId',
        },
      };
      this.getEachTag(paramsObj);
    }

    if (labelList.length) {
      const paramsObj = {
        tagNameArray: labelList,
        tagNameList: _labelList,
        tagListObj: {
          tagName: 'labelName',
          tagId: 'labelId',
        },
      };
      this.getEachTag(paramsObj);
    }

    if (modalAttributeList.length) {
      modalAttributeList.forEach((item) => {
        const { label, name, operateType, value, tagsArray } = item;
        const attributeId = operateType === 'new' ? '' : name;
        const attributeValues = [];
        tagsArray[0].tags.forEach((eachTag) => {
          attributeValues.push(eachTag.specName);
        });
        attributeList.push({
          attributeName: label,
          attributeId,
          isLimit: value,
          operateType: operateType || '',
          attributeValues: value ? attributeValues : [],
        });
      });
    }

    return addBoolean ? { ...reqObj, parentId } : reqObj;
  }

  setKeysAndValuesInAddField = (reqObj) => {
    const addFieldInfo = {
      ...this.props.addFieldInfo,
      ...reqObj,
    };

    this.props.setKeysAndValues({ addFieldInfo });
  }

   getCardCon = () => {
     const {
       getCurLabelList,
       setLabelValError,
       setLabelValue,
       setLabelInputVisible,
       modalFormValue,
       labelInfo,
       specsInfo,
       getCurSpecsTags,
       setSpecsTagValError,
       setSpecsTagValue,
       setSpecsTagInputVisible,
       addFieldInfo,
     } = this.props;
     const {
       specsTags,
       canAddSpecsTag,
       isSpecsTagValError,
       specsTagInputValue,
       specsTagInputVisible,
       specLimitMax,
       specsTagsMaxLength,
     } = specsInfo;

     const {
       canAddLabel,
       labelList,
       isLabelValError,
       labelInputValue,
       labelInputVisible,
       limitMax,
     } = labelInfo;

     const {
       canAddField,
       addFieldInputVisible,
       addFieldInputValue,
       isAddFieldValError,
       addFieldLabel,
       addFieldInputValueLenMax,
       fieldMaxLength,
     } = addFieldInfo;
     return [
       {
         cardTitle: '基础信息:',
         name: 'baseInfoCard',
         fields: [
           {
             label: '分类名称',
             name: 'categoryName',
             required: true,
             simple: true,
             max: 12,
           }, {
             label: '排序',
             name: 'sort',
             simple: true,
             pattern: /^100$|^([1-9][0-9]?)$/,
             patternMsg: '输入1-100的整数区间',
           },
         ],
         tagsArray: [
           {
             label: '规格',
             canAddTag: canAddSpecsTag,
             tags: specsTags,
             getCurTags: getCurSpecsTags,
             setTagValError: setSpecsTagValError,
             isTagValError: isSpecsTagValError,
             setTagValue: setSpecsTagValue,
             tagInputValue: specsTagInputValue,
             setTagInputVisible: setSpecsTagInputVisible,
             tagInputVisible: specsTagInputVisible,
             tagInputValueLenMax: specLimitMax,
             tagsMaxLength: specsTagsMaxLength,
           }, {
             label: '标签',
             canAddTag: canAddLabel,
             tags: labelList,
             getCurTags: getCurLabelList,
             setTagValError: setLabelValError,
             isTagValError: isLabelValError,
             setTagValue: setLabelValue,
             tagInputValue: labelInputValue,
             setTagInputVisible: setLabelInputVisible,
             tagInputVisible: labelInputVisible,
             tagsMaxLength: limitMax,
           },
         ],
       }, {
         cardTitle: '其它属性:',
         name: 'propertyInfoCard',
         fields: modalFormValue.attributeList || [],
         canAddField,
         addFieldInputVisible,
         addFieldInputValue,
         isAddFieldValError,
         addFieldLabel,
         addFieldInputValueLenMax,
         fieldMaxLength,
         setKeysAndValuesInAddField: this.setKeysAndValuesInAddField,
         addPropertyObj: this.addPropertyInCard,
       },
     ];
   }

  searchChild = (expanded, record) => {
    const parentId = record.categoryId;
    if (parentId) {
      this.getChildData(parentId);
    } else {
      // 没有父 id 不去请求
    }
  }

  cancel = () => {
    const {
      changeModalVisible,
      setSpecsTagValue,
      setSpecsTagValError,
      setSpecsTagInputVisible,
      setLabelValue,
      setLabelValError,
      setLabelInputVisible,
      modalFormValue: {
        attributeList,
      },
      setPropertyTagValError,
      setPropertyTagInputVisible,
      setPropertyTagValue,
      setKeysAndValues,
    } = this.props;

    changeModalVisible({ modalVisible: false });

    setSpecsTagValue({ tagInputValue: '' });
    setSpecsTagValError({ isTagValError: false });
    setSpecsTagInputVisible({ tagInputVisible: false });

    setLabelValue({ tagInputValue: '' });
    setLabelValError({ isTagValError: false });
    setLabelInputVisible({ tagInputVisible: false });

    // 关于属性的一些属性的归位
    const addFieldInfo = {
      ...this.props.addFieldInfo,
      isAddFieldValError: false,
      addFieldInputValue: '',
      addFieldInputVisible: false,
    };

    setKeysAndValues({ addFieldInfo });

    attributeList.forEach((item) => {
      const { tagsArray } = item;
      tagsArray.forEach((eachTag) => {
        const { property } = eachTag;
        setPropertyTagValError({ property, isTagValError: false });
        setPropertyTagInputVisible({ property, tagInputVisible: false });
        setPropertyTagValue({ property, tagInputValue: '' });
      });
    });
  }

  // 增加或者编辑二级分类
  addOrEditClass = (record) => {
    const that = this;
    const { addBoolean } = record;
    const saveReqObj = that.getSavedReqObj(record);
    const {
      saveClass,
      changeModalVisible,
      search,
      searchParams,
      parentId,
      resetHadReqedParentId,
      setexpandedRowKeys,
      setHadReqedParentId,
      hadReqedArray,
      expandedRowKeys,
      data,
      setKeysAndValues,
    } = that.props;

    return saveClass(saveReqObj).then((response) => {
      if (response && response.success) {
        const messageCon = addBoolean ? '添加成功！' : '修改成功！';
        message.success(`${messageCon}`);
        changeModalVisible({ modalVisible: false });
        setKeysAndValues({ modalFormValue: this.state.modalFormValue });
        // search({ ...searchParams, parentId }); // 保存成功之后刷新界面，请求该父级下的新子类
        // 如果增加、编辑的是一级分类 或者对其它级别的分类做编辑是，做一些重置工作
        // 当编辑的分类下边还有分类时，请求它的父类之后，前边的展开符号若之前展开,现仍是展开,因为刷新它的父类,
        // 子类目前是没有数据的,不能为展开
        search({ ...searchParams, parentId }).then((searchResponse) => {
          if (searchResponse && searchResponse.success) {
            const oldChild = that.retainedOldBrothers(parentId, data);
            const hadReqedArrayClone = DeepClone.deepClone(hadReqedArray);
            const expandedRowKeysClone = DeepClone.deepClone(expandedRowKeys);
            const cleanedHadReqedArray = that.protectBrothers(oldChild, hadReqedArrayClone);
            const cleanedExpandedRowKeysArray = that.protectBrothers(oldChild, expandedRowKeysClone);
            setHadReqedParentId({ isClean: true, cleanedHadReqedArray });
            setexpandedRowKeys({ expandedRowKeys: cleanedExpandedRowKeysArray });
          }
        });
        if (parentId === 0 || !addBoolean) {
          resetHadReqedParentId();
          setexpandedRowKeys({ expandedRowKeys: [] });
        }
      } else if (response) {
        changeModalVisible({ modalVisible: true });
      }
    });
  }

  save = (record) => {
    const { addBoolean } = this.props;
    const recordSaved = { ...record, addBoolean };

    return this.addOrEditClass(recordSaved);
  }

  showMyModal = (showCont) => {
    const { getMyFields, changeModalVisible } = this.props;
    getMyFields(showCont); // 这里顺便将当前操作的 parentId 重新设置
    changeModalVisible({ modalVisible: true });
  }

  operateType = (record, label) => {
    const that = this;
    const {
      getPropertyCurTags,
      setPropertyTagValError,
      setPropertyTagValue,
      setPropertyTagInputVisible,
      propertyTag: {
        canAddPropertyValueTag,
        tagPropertyInputValueLenMax,
        tagsPropertyMaxLength,
      },
      addFieldInfo: {
        canDelFieldItem,
      },
    } = that.props;

    const {
      labelList,
      categoryId,
      categoryName,
      specList,
      sort,
      isParent,
      parentId, // 操作的该条数据的 parentId
      attributeList = [], // 属性
    } = record;

    const { operateTypeObj } = this.state;
    const operateType = operateTypeObj[label];
    const label2specAdaptor = (list) =>
      list.map((item) => ({ specId: item.labelId, specName: item.labelName }));

    // 对属性进行处理
    const attributeListClone = DeepClone.deepClone(attributeList);
    attributeListClone.forEach((item, index) => {
      const {
        attributeName,
        attributeId,
        isLimit,
        attributeValues = [],
      } = item;

      attributeValues.forEach((tag, tagIndex) => {
        attributeValues[tagIndex] = {
          specName: tag,
          specId: tag,
        };
      });

      attributeListClone[index] = {
        label: attributeName,
        name: attributeId,
        type: 'customradio',
        data: {
          true : '限制',
          false: '不限制',
        },
        value: isLimit,
        canDelFieldItem,
        tagsArray: [
          {
            label: '',
            canAddTag: canAddPropertyValueTag,
            tags: attributeValues,
            getCurTags: getPropertyCurTags,
            setTagValError: setPropertyTagValError,
            isTagValError: false,
            setTagValue: setPropertyTagValue,
            tagInputValue: '',
            setTagInputVisible: setPropertyTagInputVisible,
            tagInputVisible: false,
            tagsMaxLength: tagsPropertyMaxLength,
            tagInputValueLenMax: tagPropertyInputValueLenMax,
            property: attributeId,
          },
        ],
        onChange: this.radioChange.bind(this, attributeId),
        delFieldItem: this.removeFieldItem.bind(this, attributeId),
      };
    });

    // categoryId在增加二级分类时将设为父级分类Id
    const addField = {
      addBoolean: true,
      parentId: categoryId,
      record: this.state.modalFormValue,
    };

    // categoryId 为本条数据的分类id,parentId为它父类的id
    const editField = {
      categoryId,
      parentId,
      record: {
        categoryName,
        sort,
        specs: specList,
        labelList: label2specAdaptor(labelList),
        isParent,
        attributeList: attributeListClone,
      },
    };

    switch (operateType) {
      case 'addClass':
        that.showMyModal(addField);
        break;
      case 'edit':
        that.showMyModal(editField);
        break;
      default:
        this.props.changeDelModalVisible({ delClassObj: record, delModalVisible: true });
    }
  }

  // 增加或者删除一个分类时，刷新该类的父类，此时它的兄弟们中被请求过（或者展开过）的id
  // 从hadReqedParentId中 清除
  protectBrothers = (newBrothersList = [], hadReqedParentId = []) => {
    const hadReqedParentIdClone = hadReqedParentId;
    newBrothersList.forEach((item, index) => {
      const { isParent, categoryId } = item;
      if (isParent === '1') {
        const hadReqedIndex = hadReqedParentIdClone.findIndex((value) => value === categoryId);
        if (hadReqedIndex !== -1) {
          hadReqedParentIdClone.splice(hadReqedIndex, 1);
          this.protectBrothers(newBrothersList[index].children, hadReqedParentIdClone);
        } else {
          // 没被请求过，子类也不可能被请求过
        }
      } else {
        // 没有子类不处理
      }
    });
    return hadReqedParentIdClone;
  }

  // 由于增加或者删除一个分类时，刷新该类的父类时，它的兄弟们的 children 均变为[]，无法找到
  // 从 hadReqedParentId中 清除，这里在刷新之前现将数据拷贝出来，以便于找到已经请求过的
  // 即用parId找到它下边的所有的 children, 这里找到就不用继续找，用for比较好，可以break
  // retainedOldBrothers = (oldData, parId) => {
  //   let obj = [];
  //   for (let i = 0; i < oldData.length; i += 1) {
  //     if (oldData[i].categoryId === parId) {
  //       obj = oldData[i].children;
  //       break;
  //     } else if (typeof oldData[i].children !== 'undefined') {
  //       obj = this.retainedOldBrothers(oldData[i].children, parId);
  //     } else {
  //       // 在一级以及下边的 children 下边都没有找到 pid，不处理
  //       // newData[index].children = [];
  //     }
  //   }
  //   return obj;
  // }
  //
  retainedOldBrothers = (parId, oldData = []) => {
    if (parId === 0) {
      return oldData;
    }

    for (let i = 0; i < oldData.length; i += 1) {
      if (oldData[i].categoryId === parId) {
        return oldData[i].children;
      }

      if (typeof oldData[i].children !== 'undefined') {
        const obj = this.retainedOldBrothers(parId, oldData[i].children);
        if (obj) {
          return obj;
        }
      }
    }
    return null;
  }

  handleOk = () => {
    const that = this;
    const {
      categoryId,
      parentId,
      delClass,
      search,
      searchParams,
      page: {
        pageNo,
      },
      setexpandedRowKeys,
      hadReqedArray,
      expandedRowKeys,
      setHadReqedParentId,
      data,
    } = that.props;
    // 删除父类时，刷新当前页的整个页面，删除子类时，刷新该父类
    const reqObj = parentId === 0 ? { ...searchParams, pageNo } : { ...searchParams, parentId };
    delClass({ categoryId }).then((response) => {
      if (response && response.success) {
        message.success('删除成功！');
        search(reqObj).then((searchResponse) => {
          if (searchResponse && searchResponse.success) {
            if (parentId === 0) {
              setexpandedRowKeys({ expandedRowKeys: [] });
            } else {
              const oldChild = that.retainedOldBrothers(parentId, data);
              const newChild = oldChild.filter((item) =>
                item.categoryId !== categoryId
              );
              const hadReqedArrayClone = DeepClone.deepClone(hadReqedArray);
              const expandedRowKeysClone = DeepClone.deepClone(expandedRowKeys);
              const cleanedHadReqedArray = that.protectBrothers(newChild, hadReqedArrayClone);
              const cleanedExpandedRowKeysArray = that.protectBrothers(newChild, expandedRowKeysClone);
              setHadReqedParentId({ isClean: true, cleanedHadReqedArray });
              setexpandedRowKeys({ expandedRowKeys: cleanedExpandedRowKeysArray });
            }
          }
        });
      }
    });
  }

  handleCancel = () => {
    this.props.changeDelModalVisible({ delModalVisible:false });
  }

  pageChange = (page) => {
    const {
      search,
      searchParams,
      resetHadReqedParentId,
      setexpandedRowKeys,
    } = this.props;
    search({
      ...searchParams,
      pageNo: page.current,
      pageSize: page.pageSize,
    });
    resetHadReqedParentId();
    setexpandedRowKeys({ expandedRowKeys: [] });
  }

  radioChange = (property, e) => {
    this.props.setAttributeList({ isLimit: e, property });
  }

  removeFieldItem = (attributeId) => {
    const { modalFormValue: { attributeList }, setKeysAndValues } = this.props;
    const index = attributeList.findIndex((eachAttribute) =>
      eachAttribute.name === attributeId
    );
    const { operateType } = attributeList[index];
    const attributeListClone = DeepClone.deepClone(attributeList);
    if (operateType && operateType === 'new') { // 删除新增的
      attributeListClone.splice(index, 1);
    } else { // 删除本来有的
      attributeListClone[index].operateType = 'delete';
    }

    const modalFormValue = {
      ...this.props.modalFormValue,
      attributeList: attributeListClone,
    };

    setKeysAndValues({ modalFormValue });
  }

  addPropertyInCard = (addFieldInputValue) => {
    const {
      getPropertyCurTags,
      setPropertyTagValError,
      setPropertyTagValue,
      setPropertyTagInputVisible,
      propertyTag,
      addAttributeList,
      setKeysAndValues,
      modalFormValue,
    } = this.props;

    const { attributeList } = modalFormValue;

    const {
      canAddPropertyValueTag,
      tagPropertyInputValueLenMax,
      tagsPropertyMaxLength,
    } = propertyTag;

    const nameUseTime = `${Date.parse(new Date())}`;
    const tagsArray = [
      {
        label: '',
        canAddTag: canAddPropertyValueTag,
        tags: [],
        getCurTags: getPropertyCurTags,
        setTagValError: setPropertyTagValError,
        isTagValError: false,
        setTagValue: setPropertyTagValue,
        tagInputValue: '',
        setTagInputVisible: setPropertyTagInputVisible,
        tagInputVisible: false,
        tagsMaxLength: tagsPropertyMaxLength,
        tagInputValueLenMax: tagPropertyInputValueLenMax,
        property: nameUseTime,
      },
    ];

    const onChange = this.radioChange.bind(this, nameUseTime);
    const delFieldItem = this.removeFieldItem.bind(this, nameUseTime);

    const index = attributeList.findIndex((each) =>
      each.label === addFieldInputValue
    );

    if (index !== -1) {
      if (attributeList[index].operateType === 'delete') { // 刚删除掉的现在又加上，恢复编辑状态
        const attributeListClone = DeepClone.deepClone(attributeList);
        attributeListClone[index].operateType = '';
        setKeysAndValues({
          modalFormValue: {
            ...modalFormValue,
            attributeList: attributeListClone,
          },
        });
      } else {
        message.error('不能添加重复的属性');
      }
    } else {
      addAttributeList({
        newProperty: addFieldInputValue,
        tagsArray,
        onChange,
        operateType: 'new',
        delFieldItem,
        name: nameUseTime,
      });
    }
  }


  render() {
    const { btnArr } = this.state;
    const {
      modalVisible,
      modalFormValue,
      cusTitle,
      delModalVisible,
      expandedRowKeys,
      changeRecord,
    } = this.props;

    const columns = [
      {
        label: '排序',
        name: 'sort',
      },
      {
        label: '分类ID',
        name: 'categoryId',
      },
      {
        label: '分类',
        name: 'categoryName',
      },
      {
        label: '规格',
        name: 'standard',
        render: (text, record) => {
          const { specList, isParent } = record;
          let contentDiv;
          // 有子分类
          if (isParent === 1) {
            contentDiv = '';
          } else {
            contentDiv =
              (<div>
                {
                  specList.map((item) => {
                    const { specName } = item;
                    const isLongTag = specName.length > 20;
                    return (<Tag key={item.specId} color="#7ec2f3">
                      { isLongTag ? `${specName.slice(0, 20)}...` : specName}
                    </Tag>);
                  })
                }
              </div>);
          }
          return contentDiv;
        },
      },
      {
        title: '操作',
        key: 'action',
        render: (record) => {
          const { level } = record;
          let btnShowArr;

          if (level !== '5') { // 二级分类
            btnShowArr = btnArr.canAdd.map((item) =>
              this.state[item]
            );
          } else {
            btnShowArr = btnArr.cannotAdd.map((item) =>
              this.state[item]
            );
          }
          return (
            <span>
              {
                btnShowArr.map((item) => (
                  <Button
                    {...item}
                    key={item.label}
                    style={{ marginLeft: '20px' }}
                    onClick={this.operateType.bind(this, record, item.label)}
                  >{item.label}</Button>
                ))
              }
            </span>
          );
        },
      },

    ];

    const buttons = [
      {
        label: '添加', // 添加一级分类
        onClick: () => {
          const addField = {
            addBoolean: true,
            parentId: 0,
            record: { categoryName: '', sort: 50 },
          };
          this.showMyModal(addField);
        },
      },
    ];

    return (
      <div style={{ width:'100%' }} className="m-productClassify">
        <ListPage
          {...this.props}
          noSearch
          title="当前位置：商品分类"
          columns={columns}
          rowKey="categoryId"
          indentSize={60}
          buttons={buttons}
          onExpand={(expanded, record) => { this.searchChild(expanded, record); }} // 该事件不会影响分页
          expandedRowKeys={expandedRowKeys}
          modalVisible={modalVisible}
          cusTitle={cusTitle}
          onChange={this.pageChange}
          hasModalForm={false}
        />
        <ModalFormInCard
          visible={modalVisible}
          values={modalFormValue}
          fields={this.getCardCon()}
          onCancel={this.cancel}
          onCreate={this.save}
          cusTitle={cusTitle}
          modalClass="m-productClassify-modal"
          changeRecord={changeRecord}
        />
        <Modal
          title=""
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          visible={delModalVisible}
        >
          <p style={{ textAlign: 'center' }}>删除后商品将不可引用该分类，确定删除？</p>
        </Modal>
      </div>
    );
  }
}

export default View;
