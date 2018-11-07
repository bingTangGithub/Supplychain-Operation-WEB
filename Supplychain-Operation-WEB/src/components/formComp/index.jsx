import React from 'react';
import {
  Input,
  Cascader,
  DatePicker,
  Radio,
  Icon,
  TreeSelect,
  Checkbox,
  Select,
} from 'antd';
import ImagePreviewList from '../ImageUpload/ImagePreviewList';
import ImageUpload from '../ImageUpload/ImageUpload';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;
const Option = Select.Option;
const formComp = {
  input: (props) => <Input {...props} />,
  checkbox: (props) => <Checkbox {...props} />,
  cascader: (props) => <Cascader {...props} />,
  rangePicker: (props) => <RangePicker {...props} />,
  treeSelect: (props) => <TreeSelect showCheckedStrategy={SHOW_PARENT} {...props} />,
  radioGroup: (props) => <RadioGroup {...props} />,
  select: (props) => (<Select {...props}>
    {props.data.map((item) => <Option key={item.value} {...item}>{item.label}</Option>)}
  </Select>),
  imgUpload: (props) => (<div>
    <ImagePreviewList {...props} />
    { !props.disabled && <ImageUpload {...props} /> }
  </div>),
};

const iconStyle = { fontSize: 25, verticalAlign: 'middle', marginLeft: 10, cursor: 'pointer' };
export const iconMinusPlus = {
  minusIcon: (props) => <Icon key="minus" type="minus-circle-o" style={iconStyle} {...props} />,
  plusIcon: (props) => <Icon key="plus" type="plus-circle" style={iconStyle} {...props} />,
};

export default formComp;
