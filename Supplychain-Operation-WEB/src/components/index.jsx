import React from 'react';
import {
  Input,
  Form,
  DatePicker,
  Row,
  Col,
  Cascader,
  Checkbox,
  Button,
  Icon,
} from 'antd';
import CommonSelect from './Select';
import CommonCheckboxGroup from './CheckboxGroup';
// import ImageUpload from './ImageUpload';
import CommonDatePicker from './DatePicker';
import MonthPicker from './MonthPicker';
import Search from './Search';
import MonthRange from './MonthRange';
import AutoComplete from './Input';
import InputNumber from './InputNumber';
import NumberRange from './NumberRange';
import DateRange from './DateRange';
import Radio from './Radio';
import CustomRadio from './CustomRadio';
import DoubleTimePicker from './DoubleTimePicker';
import MapView from './Map';
import Address from './Address';
import ImagePicker from './ImagePicker';

const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

const { RangePicker } = DatePicker;

const shapeSelectData = (field) => {
  const data = field.data;
  const valueName = field.valueName || 'id';
  const displayName = field.displayName || 'label';
  let res = [];
  if (Object.prototype.toString.call(data) === '[object Object]') {
    Object.keys(data).forEach((item) => {
      const itemObj = {};
      itemObj[valueName] = item;
      itemObj[displayName] = data[item];
      res.push(itemObj);
    });
  } else {
    res = data;
  }
  return res;
};

export const geneBox = (field, opts = {}) => {
  const newField = field;
  if (field.dataIndex) {
    newField.name = field.dataIndex;
  }
  if (field.title) {
    newField.label = field.title;
  }

  // deal with placeholder
  const phMap = {
    date: '请选择日期',
    address: '请选择地址',
    datetime: '请选择时间',
    dateRange: ['请选择开始日期', '请选择结束日期'],
    month: '请选择月份',
    datetimeRange: ['请选择开始时间', '请选择结束时间'],
    monthRange: ['请选择开始月份', '请选择结束月份'],
    select: `请选择${field.label}`,
  };
  let placeholder = field.placeholder || phMap[field.type] || `请输入${field.message ? field.message : field.label}`;
  placeholder = field.disabled ? '-' : placeholder;

  // combine with options from outside
  const defaultOpts = {
    size: 'default',
    ...opts,
    disabled: newField.disabled,
    name: newField.name,
    label: newField.label,
    placeholder,
  };
  if (newField.component) {
    newField.type = 'default';
  }
  switch (newField.type) {
    case 'twodateRange':
      return (
        <DateRange
          minTime={newField.minTime}
          maxTime={newField.maxTime}
          {...defaultOpts}
          allowClear={!!newField.allowClear}
        />
      );
    case 'default':
      return (
        <newField.component
          {...defaultOpts}
          {...newField}
        />
      );
    case 'date':
      return (
        <CommonDatePicker
          {...defaultOpts}
          format="YYYY-MM-DD"
          onChange={newField.onChange}
          disabledDate={newField.disabledDate}
        />
      );
    case 'Cascader':
      return (
        <Cascader
          {...defaultOpts}
          options={newField.data}
          changeOnSelect={!!newField.changeOnSelect}
        />
      );
    case 'datetime':
      return (
        <CommonDatePicker
          {...defaultOpts}
          showTime={{ format: 'HH:mm:ss' }}
          format="YYYY-MM-DD HH:mm:ss"
        />
      );
    case 'dateRange':
      return (
        <RangePicker
          {...defaultOpts}
          format="YYYY-MM-DD"
        />
      );
    case 'month':
      return (
        <MonthPicker
          {...defaultOpts}
        />
      );
    case 'datetimeRange':
      return (
        <RangePicker
          {...defaultOpts}
          showTime={{ format: 'HH:mm:ss' }}
          format="YYYY-MM-DD HH:mm:ss"
        />
      );
    case 'monthRange':
      return (
        <MonthRange
          {...defaultOpts}
        />
      );
    case 'search':
      return (
        <Search
          {...defaultOpts}
          onSearch={field.onSearch}
        />
      );
    case 'select':
      return (
        <CommonSelect
          {...defaultOpts}
          action={newField.action}
          data={shapeSelectData(field)}
          multiple={newField.multiple}
          valueName={newField.valueName}
          displayName={newField.displayName}
          onChange={newField.onChange}
          onSelect={newField.onSelect}
          showSearch={newField.showSearch}
          resetSelect={newField.resetSelect}
          allowClear={!newField.required}
          page={newField.page}
        />
      );
    // case 'editor':
    //   return (
    //     <Editor
    //       placeholder={field.disabled ? '-' : `请输入${field.labelExtra || field.label}`}
    //     />
    //   )
    case 'checkboxGroup':
      return (
        <CommonCheckboxGroup
          {...defaultOpts}
          label={newField.label}
          options={newField.options}
        />
      );
    case 'checkbox':
      return (
        <CheckboxGroup
          {...defaultOpts}
          options={newField.options}
        />
      );
    case 'singleCheckbox':
      return (
        <Checkbox
          {...defaultOpts}
          onChange={newField.onChange}
        >{newField.content}</Checkbox>
      );
    case 'image':
      return (
        <ImagePicker
          {...defaultOpts}
          data={field.data}
          tokenSeparators={field.tokenSeparators}
          action={field.action}
          width={field.width}
          mostPic={field.mostPic}
          height={field.height}
          getUrl={field.getUrl}
          single={field.single}
          limit={field.limit}
          headers={field.headers}
        />
      );
    case 'password':
      return (
        <Input
          type="password"
          {...defaultOpts}
        />
      );
    case 'number':
      return (
        <InputNumber
          {...defaultOpts}
          max={newField.max || 1000000000000000} // 16 or 99...
          min={typeof newField.min === 'number' ? newField.min : undefined}
          money={newField.money}
          reduce={field.reduce}
          inputWidth={field.inputWidth}
          addonBefore={field.addonBefore}
          addonAfter={field.addonAfter}
          precision={field.precision}
          render={field.render}
          readonly={field.readonly}
        />
      );
    case 'textarea':
      return (
        <Input
          type="textarea"
          {...defaultOpts}
          autosize={newField.disabled ? true : { minRows: 2, maxRows: 6 }}
        />
      );
    case 'radio':
      return (
        <Radio
          {...defaultOpts}
          data={newField.data}
          styleType={newField.styleType}
        />
      );
    case 'customradio':
      return (
        <CustomRadio
          {...defaultOpts}
          values={newField.value}
          data={newField.data}
          onSelect={newField.onChange}
        />
      );
    case 'numberRange':
      return (
        <NumberRange
          {...defaultOpts}
          startMin={newField.startMin}
          endMin={newField.endMin}
          startMax={newField.startMax}
          endMax={newField.endMax}
        />
      );
    case 'button':
      return (
        !field.changed ?
          <Button style={{ border:'none', color:'green' }} onClick={field.onClick}>{field.show}</Button>
          :
          <span>
            <Button
              className="ant-btn ant-btn-lg"
              style={{ border:'none', color:'green' }}
              onClick={field.onClick}
            >{field.show}</Button>
            <span style={{ color:'#f12719', float:'right', padding:'0 8px', background:'#eee' }}>
              已变更
            </span>
          </span>
      );
    case 'html':
      return field.html;
    case 'doubleTime':
      return (
        <DoubleTimePicker
          onChange={field.onChange}
          format={field.format}
          disabled={field.disabled}
        />
      );
    case 'map':
      return (
        <MapView
          {...defaultOpts}
        />
      );
    case 'address':
      return (
        <Address
          {...defaultOpts}
          displayValue={field.displayValue}
          changeOnSelect={!!field.changeOnSelect}
          data={field.data}
        />
      );
    default:
      return (
        <AutoComplete
          {...defaultOpts}
          allowClear
          dataSource={field.dataSource}
          onChange={field.onChange}
          onSelect={field.onSelect}
          buttonText={field.buttonText}
          buttonClick={field.buttonClick}
          changed={field.changed}
        />
      );
  }
};

export const createFormItem = (opts) => {
  let {
    formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 18,
      },
    },
    colSpan = 12,
  } = opts;

  const {
    field,
    form,
    inputOpts,
  } = opts;
  inputOpts.form = form;
  if (field.dataIndex) {
    field.name = field.dataIndex;
  }
  if (field.title) {
    field.label = field.title;
  }
  if (!field.max && !field.type && !field.component) {
    field.max = 120;
  }
  const rules = [];
  if (field.hidden && !field.search) {
    rules.push({
      required: false, // BUG? should set it
    });
  } else {
    let msgLabel = '';
    if (typeof field.label === 'string') {
      msgLabel = (field.labelExtra || field.label || '').replace(/\(.*\)/, '');
    }

    if (field.required) {
      let msgPefix = '请输入';
      if (['date', 'datetime', 'dateRange', 'datetimeRange', 'select'].indexOf(field.type) > -1) {
        msgPefix = '请选择';
      }
      if (field.type === 'IDPhotoGroup' || field.type === 'image') {
        msgPefix = '请上传图片';
      }

      const rule = {
        required: !field.disabled,
        message: (`${msgPefix}${msgLabel}`),
      };

      if (!field.type || field.type === 'textarea') {
        rule.whitespace = true;
      }

      rules.push(rule);
    }
    if (field.validator) {
      rules.push({ validator: field.validator });
    }
    if (field.max && field.type !== 'number') {
      rules.push({
        max: field.max,
        message: `${msgLabel}必须小于${field.max}个字`,
        transform: (v) => {
          let newV = v;
          if (typeof newV === 'number') {
            newV += '';
          }
          return newV;
        },
      });
    } else if (field.max && field.type === 'number') {
      rules.push({ validator: (rule, value, callback) => {
        if (value && field.max < +value) {
          callback(`${msgLabel}不能大于${field.max}`);
        }
        callback();
      } });
    }
    if (field.min && field.type !== 'number') {
      rules.push({
        min: field.min,
        message: `${msgLabel}必须大于${field.min}个字`,
        transform: (v) => {
          let newV = v;
          if (typeof newV === 'number') {
            newV += '';
          }
          return newV;
        },
      });
    } else if (field.min && field.type === 'number') {
      rules.push({ validator: (rule, value, callback) => {
        if (value && field.min > +value) {
          callback(`${msgLabel}不能小于${field.min}`);
        }
        callback();
      } });
    }
    if (field.pattern) {
      rules.push({ pattern: field.pattern, message: field.patternMsg });
    }
    if (field.phone) {
      rules.push({ pattern: /^1[0-9]{10}$/, message: '请输入正确的手机格式' });
    }
    if (field.number) {
      rules.push({ pattern: /^\d+$/, message: '请输入数字' });
    }
    if (field.positive) {
      rules.push({ pattern:/^((\d{1,5})|(\d{1,5}\.\d{1,2}))$/, message:'请输入不大于99999.99的正数，可保留两位小数' });
    }
    if (field.ID) {
      rules.push({
        pattern: new RegExp(
          `${/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|/.source
          }${/(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.source}`
        ),
        message: '身份证格式有误',
      });
    }
    if (field.char) {
      rules.push({ pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]*$/, message: '请输入字母+数字' });
    }
    if (field.thanOne) {
      rules.push({ pattern: /^[1-9]\d{0,7}\.{0,1}\d{0,2}$/, message: '请输入大于1的正数，最多有两位小数' });
    }
    if (field.zeroToTwo) {
      rules.push({
        pattern: /^(([0-2])|(0\.(0[0-9]{0,1}|[1-9][0-9]{0,1}))|(1\.\d\d{0,1})|(2\.0[0]{0,1}))$/,
        message: '请输入0~2的数，可保留两位小数',
      });
    }
  }

  if (field.long) {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: formItemLayout.labelCol.span / 2,
      },
      wrapperCol: {
        span: 24 - (formItemLayout.labelCol.span / 2),
      },
    };
  }

  if (field.small) {
    colSpan = field.small;
    formItemLayout = field.layoutData || formItemLayout;

    formItemLayout = {
      labelCol: {
        span: formItemLayout.labelCol.span / 2,
      },
      wrapperCol: {
        span: 24 - (formItemLayout.labelCol.span / 2),
      },
    };
  }

  let styles = {};
  if (!field.search && field.hidden) {
    styles.display = 'none';
  }
  if (field.style) {
    styles = {
      ...styles,
      ...field.style,
    };
  }

  if (field.type === 'checkboxGroup') {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 0,
      },
      wrapperCol: {
        span: 24 - (formItemLayout.labelCol.span / 2),
      },
    };
  }

  if (field.type === 'IDPhotoGroup' || field.type === 'image') {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 0,
      },
      wrapperCol: {
        span: 24 - (formItemLayout.labelCol.span / 2),
      },
    };
  }

  if (field.simple) {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 14,
      },
    };
  }

  if (field.simpleHalf) {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 3,
      },
      wrapperCol: {
        span: 10,
      },
    };
  }
  if (field.simpleSetting) {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 16,
      },
    };
  }
  if (field.simpleList) {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 6,
      },
      wrapperCol: {
        span: 18,
      },
    };
  }
  if (field.simpleTabel) {
    colSpan = 24;
    formItemLayout = {
      labelCol: {
        span: 3,
      },
      wrapperCol: {
        span: 16,
      },
    };
  }
  if (field.className === 'title') {
    colSpan = 24;
    formItemLayout = {
    };
  }
  const classNames = (field.className || '').split(' ');
  let className = '';
  classNames.forEach((cn) => {
    className += `${cn}-form-item `;
  });
  if (!field.label) {
    className += ' item-no-required';
  }

  let children;
  if (field.type === 'title') {
    children = (<Col span={24} key={field.label} style={styles}>
      <div className={`ant-form-title ${className}`}>
        {typeof field.label === 'object' ? field.label : `${field.label}`}
      </div>
    </Col>);
  } else if (field.type === 'custom') {
    children = field.children;
  }

  return (
    field.type === 'title'
      ? children
      : <Row key={field.name}>
        <Col span={colSpan}>
          <FormItem
            {...formItemLayout}
            label={field.type === 'checkboxGroup' ? '' : (field.label || ' ')}
            className={className}
            style={styles}
            colon={!!field.label}
            extra={field.extra}
          >
            {
              form.getFieldDecorator(field.name, {
                rules,
                initialValue: field.initialValue,
              })(geneBox(field, inputOpts))
            }
            {
              field.canDelFieldItem ?
                (<Button
                  onClick={field.delFieldItem}
                  type="dashed"
                >
                  <Icon type="minus" /> 属性
                </Button>
                ) : <div />
            }

          </FormItem>
        </Col>
      </Row>
  );
};

// makesure the props.values
export const mapPropsToFields = (props = {}) => {
  let res = {};
  const keys = Object.keys(props.values || {});
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const param = props.values[key];
    if (typeof param === 'object' && !(param instanceof Array)) {
      res[key] = param;
    } else {
      res[key] = { value: param };
    }
  }
  if (props.mapFields) {
    res = {
      ...res,
      ...props.mapFields(res),
    };
  }
  return res;
};

// makesure the props.changeRecord
export const onFieldsChange = (props, flds) => {
  const fields = flds;
  const keys = Object.keys(fields || {});
  const findFun = (name) => {
    const newName = name;
    return (item) => item.name === newName;
  };
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const fld = props.fields.find(findFun(fields[key].name));
    fields[key].type = fld && fld.type;
  }
  props.changeRecord && props.changeRecord({
    ...props.values,
    ...fields,
  });
};
