import React, { Component } from 'react';
import { Table, Icon, Tooltip, Input, Popover, Button } from 'antd';

class SkuCfg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      costPrice: undefined,
      unitPrice: undefined,
      sellingPrice: undefined,
      quantity: undefined,
      pkgWeight: undefined,
      pkgWeightMin: undefined,
      pkgWeightMax: undefined,
      validate: {
        costPrice: false,
        unitPrice: false,
        sellingPrice: false,
        quantity: false,
        pkgWeight: false,
        pkgWeightMin: false,
        pkgWeightMax: false,
      },
      visible: {
        costPrice: false,
        unitPrice: false,
        sellingPrice: false,
        quantity: false,
        pkgWeight: false,
        pkgWeightMin: false,
        pkgWeightMax: false,
      },
    };
  }

  // componentDidMount() {
  // }

  onCancel = (type) => {
    this.hidePopover(type);
  }

  onSave = (type) => {
    const value = this.state[type];

    const format = ({ value: itemValue, type: itemType }) => {
      const getFormatPrice = (v) => Number(v).toFixed(2);
      const formatStrategy = {
        costPrice: getFormatPrice,
        unitPrice: getFormatPrice,
        sellingPrice: getFormatPrice,
        quantity: (v) => Number(v),
        pkgWeight: getFormatPrice,
        pkgWeightMin: getFormatPrice,
        pkgWeightMax: getFormatPrice,
      };
      return formatStrategy[itemType](itemValue);
    };
    this.hidePopover(type);
    this.props.skuInfoChange({ value: format({ value, type }), type });
    // this.setState({
    //   [type]: undefined,
    //   validate: {
    //     ...this.state.validate,
    //     [type]: false,
    //   },
    // });
  }

  getTitleIcon = (type) => {
    const { validate } = this.state;
    const titleInfo = {
      costPrice: '成本价',
      unitPrice: '单价',
      sellingPrice: '售价',
      quantity: '库存',
      pkgWeight: '皮重',
      pkgWeightMin: '最小毛重',
      pkgWeightMax: '最大毛重',
    };
    const iconStyle = {
      cursor: 'pointer',
      marginLeft: 4,
      border: '1px solid #666',
      borderRadius: 3,
      padding: 2,
    };
    const isRequired = {
      costPrice: () => false,
      unitPrice: () => !this.props.standardFlag,
      sellingPrice: () => true,
      quantity: () => true,
      pkgWeight: () => !this.props.standardFlag,
      pkgWeightMin: () => true,
      pkgWeightMax: () => true,
    }[type]();
    const inputStyle = { maxWidth: 125, marginRight: 15 };
    const onChange = (ev) => {
      const { value } = ev.target;
      return this.setState({
        [type]: value,
        validate: { ...validate, [type]: this.validate({ type, value }) },
      });
    };
    const getContent = (contentType) => {
      const contentInfo = {
        costPrice: { addonBefore: '¥', placeholder: '请输入成本价' },
        unitPrice: { addonBefore: '¥', placeholder: '请输入单价' },
        sellingPrice: { addonBefore: '¥', placeholder: '请输入售价' },
        quantity: { placeholder: '请输入库存' },
        pkgWeight: { addonAfter: '斤', placeholder: '请输入皮重' },
        pkgWeightMin: { addonAfter: '斤', placeholder: '请输入最小皮重' },
        pkgWeightMax: { addonAfter: '斤', placeholder: '请输入最大皮重' },
      };
      return (<div>
        <Input
          {...contentInfo[contentType]}
          value={this.state[contentType]}
          onChange={onChange}
          style={inputStyle}
          disabled={this.props.disabled}
        />
        <Button
          disabled={!validate[contentType]}
          type="primary"
          onClick={() => { this.onSave(contentType); }}
        >保存</Button>
        <Button onClick={() => { this.onCancel(contentType); }} >取消</Button>
      </div>);
    };

    const visible = this.state.visible[type];
    const inputNode = (<div style={{ cursor: 'pointer', display: 'inline-block' }}>
      {isRequired ? <span style={{ color: 'red', fontFamily: 'SimSun' }}>* </span> : ''}
      {titleInfo[type]}
    </div>);
    return this.props.disabled ? inputNode : (
      <div>
        <Popover
          content={getContent(type)}
          visible={visible}
          trigger="click"
          onVisibleChange={(typeVisible) => this.handleVisibleChange(type, typeVisible)}
          style={{ width: 300 }}
        >
          {inputNode}
          <Tooltip placement="topLeft" title="批量编辑" arrowPointAtCenter>
            <Icon type="edit" style={iconStyle} />
          </Tooltip>
        </Popover>
      </div>
    );
  }

  validate = ({ type, value }) => {
    const testPrice = (priceValue) => {
      priceValue = priceValue.trim();
      return /^\d{1,8}(\.\d{0,2})?$/.test(priceValue);
    };
    const testNumber = (priceValue) => {
      priceValue = priceValue.trim();
      return /^\d{1,8}$/.test(priceValue);
    };
    const testWeight = (weightValue) => {
      weightValue = weightValue.trim();
      return /^\d{1,6}(\.\d{1,2})?$/.test(weightValue);
    };
    const validateStrategy = {
      costPrice: testPrice,
      unitPrice: testPrice,
      sellingPrice: testPrice,
      quantity: testNumber,
      pkgWeight: testWeight,
      pkgWeightMin: testWeight,
      pkgWeightMax: testWeight,
    };
    return validateStrategy[type](value);
  }

  handleVisibleChange = (type, visible) => {
    this.setState({
      visible: {
        ...this.state.visible,
        [type]: visible,
      },
    });
  }

  hidePopover = (type) => {
    this.handleVisibleChange(type, false);
  }

  showPopover = (type) => {
    this.handleVisibleChange(type, true);
  }

  renderInput = ({ type, text: { validate, value }, index, standardFlag }) => {
    const extraProps = {
      costPrice: {
        placeholder: '请输入成本价',
        addonBefore: '¥',
        errorMsg: ['请填写8位以内的数字', '最多保留2位小数'],
      },
      sellingPrice: {
        placeholder: '请输入售价',
        addonBefore: '¥',
        errorMsg: ['请填写8位以内的数字', '最多保留2位小数'],
      },
      unitPrice: {
        placeholder: '请输入单价',
        addonBefore: '¥',
        errorMsg: ['请填写8位以内的数字', '最多保留2位小数'],
      },
      quantity: {
        placeholder: '请输入库存',
        errorMsg: '请填写8位以内的整数',
      },
      pkgWeight: {
        placeholder: '请输入皮重',
        addonAfter: '斤',
        errorMsg: ['请填写6位以内的数字', '最多保留2位小数'],
      },
      pkgWeightMin: {
        placeholder: '请输入最小皮重',
        addonAfter: '斤',
        errorMsg: ['请填写6位以内的数字', '最多保留2位小数'],
      },
      pkgWeightMax: {
        placeholder: '请输入最大皮重',
        addonAfter: '斤',
        errorMsg: ['请填写6位以内的数字', '最多保留2位小数'],
      },
    };
    return (<div className={validate === false && 'has-error'}>
      <Input
        placeholder={extraProps[type].placeholder}
        addonBefore={extraProps[type].addonBefore}
        addonAfter={extraProps[type].addonAfter}
        disabled={this.props.disabled}
        value={value}
        className="ant-input"
        onChange={(ev) => this.props.skuInfoChange(
          { value: ev.target.value, index, type, standardFlag }
        )}
        style={{ maxWidth: 150 }}
      />
      {validate === false && (
        extraProps[type].errorMsg.constructor === Array
          ? extraProps[type].errorMsg.map((item) => <div className="sku-cfg-error" key={item}>{item}</div>)
          : <div className="sku-cfg-error">{extraProps[type].errorMsg}</div>
      )}
    </div>);
  }

  render() {
    const { dataSource, standardFlag } = this.props;

    const columns = [{
      title: '规格组合',
      dataIndex: 'specList',
      key: 'specList',
      render: (list) => list.map((item) => item.specValue).join(','),
    }, {
      title: this.getTitleIcon('costPrice'),
      dataIndex: 'costPrice',
      key: 'costPrice',
      render: (text, record, index) =>
        this.renderInput({ type: 'costPrice', text, record, index }),
    }, {
      title: this.getTitleIcon('unitPrice'),
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (text, record, index) =>
        this.renderInput({ type: 'unitPrice', text, record, index, standardFlag }),
    }, {
      title: this.getTitleIcon('sellingPrice'),
      dataIndex: 'sellingPrice',
      key: 'sellingPrice',
      render: (text, record, index) =>
        this.renderInput({ type: 'sellingPrice', text, record, index }),
    }, {
      title: this.getTitleIcon('quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      render: (text, record, index) =>
        this.renderInput({ type: 'quantity', text, record, index }),
    }, {
      title: this.getTitleIcon('pkgWeight'),
      dataIndex: 'pkgWeight',
      key: 'pkgWeight',
      render: (text, record, index) =>
        this.renderInput({ type: 'pkgWeight', text, record, index }),
    }, {
      title: this.getTitleIcon('pkgWeightMin'),
      dataIndex: 'pkgWeightMin',
      key: 'pkgWeightMin',
      render: (text, record, index) =>
        this.renderInput({ type: 'pkgWeightMin', text, record, index }),
      isHidden: () => this.props.standardFlag,
    }, {
      title: this.getTitleIcon('pkgWeightMax'),
      dataIndex: 'pkgWeightMax',
      key: 'pkgWeightMax',
      render: (text, record, index) =>
        this.renderInput({ type: 'pkgWeightMax', text, record, index }),
      isHidden: () => this.props.standardFlag,
    }].filter(({ isHidden }) => !(isHidden && isHidden()));

    return (
      <div className="m-skucfg">
        <Table dataSource={dataSource} columns={columns} pagination={false} size="middle" />
      </div>
    );
  }
}

export default SkuCfg;
