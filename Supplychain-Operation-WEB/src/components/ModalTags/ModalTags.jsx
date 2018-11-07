import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DeepClone } from '@xinguang/common-tool';
import {
  Tag,
  Input,
  Button,
  message,
} from 'antd';

export default class ModalTags extends Component {
  static propTypes = {
    label: PropTypes.string,
    tags: PropTypes.array,
    getCurTags: PropTypes.func,
    canAddTag: PropTypes.bool,
    setTagValError: PropTypes.func,
    isTagValError: PropTypes.bool,
    setTagValue: PropTypes.func,
    tagInputValue: PropTypes.string,
    setTagInputVisible: PropTypes.func,
    tagInputVisible: PropTypes.bool,
    tagsMaxLength: PropTypes.number,
    tagInputValueLenMax: PropTypes.number,
  };
  static defaultProps = {
    label: '规格',
    tags: [],
    getCurTags: undefined,
    canAddTag: true,
    setTagValError: undefined,
    isTagValError: false,
    setTagValue: undefined,
    tagInputValue: '',
    setTagInputVisible: undefined,
    tagInputVisible: false,
    tagsMaxLength: 3,
    tagInputValueLenMax: 16,
  };

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
    };
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({
      tags: newProps.tags,
    });
    if (newProps.tagInputVisible === true && this.props.tagInputVisible === false) {
      this.setState({
        tagInputVisible: true,
      }, () => {
        this.input.focus();
      });
    }
    if (newProps.tagInputVisible === false && this.props.tagInputVisible === true) {
      this.setState({
        tagInputVisible: false,
      });
    }
  }

  handleClose = (removedTag) => {
    const { tags, getCurTags, property } = this.props;
    const index = tags.findIndex((tag) =>
      tag.specName === removedTag
    );
    const { operateType } = tags[index];
    const tagsClone = DeepClone.deepClone(tags);
    if (operateType && operateType === 'new') { // 删除新增的
      tagsClone.splice(index, 1);
    } else { // 删除本来有的
      tagsClone[index].operateType = 'delete';
    }

    getCurTags({ tags: tagsClone, property });
  }

  showInput = () => {
    const { canAddTag, setTagInputVisible, tagsMaxLength, property } = this.props;
    const { tags } = this.state;
    let showTagsLen = tags.length;
    tags.forEach((item) => {
      if (item.operateType === 'delete') {
        showTagsLen -= 1;
      }
    });
    if (canAddTag) {
      if (showTagsLen < tagsMaxLength) {
        setTagInputVisible({ tagInputVisible: true, property });
      }
    } else {
      this.setState({ hasChild: true });
    }
  }

  handleInputChange = (e) => {
    const { value } = e.target;
    const { tagInputValueLenMax, property } = this.props;
    const isTagValError = value.trim().length === 0 || value.length > tagInputValueLenMax;

    this.props.setTagValError({ isTagValError, property });
    this.props.setTagValue({ tagInputValue: value, property });
  }

  addTagObj = (inputValue) => {
    const { tags, getCurTags, label, property } = this.props;
    const addTagObj = {
      specName: inputValue,
      specId: Date.parse(new Date()),
      operateType: 'new',
    };
    const curTags = [...tags, addTagObj];

    const index = tags.findIndex((each) =>
      each.specName === inputValue
    );
    if (index !== -1) { // tags： （包括之前有的，以及之前删除的） 有找到了
      if (tags[index].operateType === 'delete') { // 刚删除掉的现在又加上，恢复编辑状态
        const tagsClone = DeepClone.deepClone(tags);
        tagsClone[index].operateType = '';
        getCurTags({ tags: tagsClone, property });
      } else { // 加已经存在的
        message.error(`不能添加重复的${label}！`);
      }
    } else { // 加之前没有的
      getCurTags({ tags: curTags, property });
    }
  }

  handleInputConfirm = () => {
    const {
      tagInputValue,
      isTagValError,
      setTagValue,
      setTagInputVisible,
      property,
    } = this.props;

    if (isTagValError) {
      return;
    }

    if (tagInputValue) {
      this.addTagObj(tagInputValue);
    } else {
      // 没输值，不做处理
    }

    setTagValue({ tagInputValue: '', property });
    setTagInputVisible({ tagInputVisible: false, property });
  }

  saveInputRef = (input) => {
    this.input = input;
    return this.input;
  };

  render() {
    const { tags } = this.state;
    const {
      tagInputVisible,
      tagInputValue,
      isTagValError,
      canAddTag,
      label,
      tagsMaxLength,
      tagInputValueLenMax,
    } = this.props;
    let showTagsLen = tags.length;
    tags.forEach((item) => {
      if (item.operateType === 'delete') {
        showTagsLen -= 1;
      }
    });

    const isButtonDisabled = !(showTagsLen < tagsMaxLength && canAddTag);

    let inputStyle;

    if (isTagValError) {
      inputStyle = {
        width: 78,
        border: '1px solid red',
      };
    } else {
      inputStyle = {
        width: 78,
      };
    }

    return (
      <div className="ant-row">
        <div className="ant-col-6 ant-form-item-label">{label}：</div>
        {
          <div className="ant-col-14" style={{ whiteSpace: 'initial' }}>
            {tags.map((tag) => {
              const { specName, specId, operateType } = tag;
              const tagElem = (
                <Tag
                  style={{ marginBottom: '7px', lineHeight: '24px', height: '26px' }}
                  className="has-error"
                  key={specId}
                  color="#ff4965"
                  closable
                  afterClose={() => this.handleClose(specName)}
                >
                  { specName }
                </Tag>
              );
              if (operateType !== 'delete') {
                return tagElem;
              }
              return undefined;
            })}
            {tagInputVisible && (
              <span>
                <Input
                  ref={this.saveInputRef}
                  type="text"
                  style={inputStyle}
                  value={tagInputValue}
                  onChange={this.handleInputChange}
                  onPressEnter={this.handleInputConfirm}
                  onBlur={this.handleInputConfirm}
                />
                <div className="error_text" style={{ color: '#ff0000' }}>
                  { isTagValError ? `${label || '属性值'}不能为空，且长度不能大于${tagInputValueLenMax}` : '' }</div>
              </span>
            )}
            {
              !tagInputVisible &&
                <Button
                  type="dashed"
                  onClick={this.showInput}
                  disabled={isButtonDisabled}
                >新增</Button>
            }
          </div>
        }
      </div>
    );
  }
}
