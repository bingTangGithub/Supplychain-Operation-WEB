import React, { Component } from 'react';
import { Col } from 'antd';
import PropTypes from 'prop-types';
import ImagePicker from './ImagePicker';
import './style.scss';

export default class ImagePickerGroup extends Component {
  static propTypes = {
    // value: PropTypes.oneOfType([
    //   PropTypes.string,
    //   PropTypes.array,
    // ]),
    tokenSeparators: PropTypes.string,
    disabled: PropTypes.bool,
    action: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    headers: PropTypes.object,
    getUrl: PropTypes.func.isRequired,
    single: PropTypes.bool,
    data: PropTypes.object,
    mostPic: PropTypes.number,
    type: PropTypes.string,
    limit: PropTypes.object,
  }

  static defaultProps = {
    // value: '',
    action: '',
    tokenSeparators: undefined,
    disabled: false,
    width: 100,
    height: 100,
    headers: {},
    getUrl: undefined,
    single: false,
    data: {},
    mostPic: 10000,
    type: '',
    limit: {},
  }

  constructor(props) {
    super(props);

    this.state = {
      items: props.value || [],
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value;
      this.setState({
        items: value || [],
        disabled: nextProps.disabled,
      });
    }
  }

  onChange(value) {
    const {
      tokenSeparators,
    } = this.props;
    let items = this.state.items;
    if (typeof this.state.items === 'string') {
      items = this.state.items && this.state.items.split(tokenSeparators);
    }
    items = [
      ...items,
    ];
    items[value.key] = value.value;
    this.props.onChange(this.parseValues(items));
  }

  onClose(seq) {
    const {
      tokenSeparators,
    } = this.props;
    let items = this.state.items;
    if (typeof this.state.items === 'string') {
      items = this.state.items && this.state.items.split(tokenSeparators);
    }
    items = [
      ...items,
    ];

    items.splice(seq, 1);

    this.setState({
      ...this.state,
      items,
    });

    this.props.onChange(this.parseValues(items));
  }

  setError = (errMsg) => this.props.form.setFields({
    [this.props.name]: {
      value: this.props.form.getFieldValue('storeBannerImage'),
      errors: [new Error(errMsg)],
    },
  })

  formatValues(items) {
    let newItems = items;
    const {
      tokenSeparators,
    } = this.props;
    if (tokenSeparators && newItems.length !== 0) {
      newItems = newItems.toString().split(tokenSeparators);
    }
    return newItems;
  }

  parseValues(items) {
    let newItems = items;
    const {
      tokenSeparators,
    } = this.props;
    if (tokenSeparators) {
      newItems = newItems.join(tokenSeparators);
    }
    return newItems;
  }

  add() {
    const defaultValue = {
      value: '',
    };
    const items = [
      ...this.state.items,
      defaultValue,
    ];
    this.setState({
      ...this.state,
      items,
    });
    this.props.onChange(this.parseValues(items));
  }

  render() {
    const {
      tokenSeparators,
      action,
      width,
      height,
      disabled,
      headers,
      getUrl,
      single,
      data,
      type,
      limit = {},
    } = this.props;

    let {
      mostPic,
    } = this.props;

    const createItems = () => {
      let items = this.state.items;
      items = this.formatValues(items);
      const res = items.map((item, index) => (
        <Col className="imagepicker-item-wrapper" key={`upload${item.toString()}`}>
          <ImagePicker
            value={item}
            sequence={index}
            disabled={disabled}
            onChange={this.onChange.bind(this)}
            onClose={this.onClose.bind(this)}
            closeable
            action={action}
            width={width}
            mostPic={mostPic}
            height={height}
            headers={headers}
            getUrl={getUrl}
            data={data}
            type={type}
          />
        </Col>
      ));
      // blank placeholder
      if (single) {
        mostPic = 1;
      }
      if (items.length === 0 || (!(items.length > mostPic - 1) && !disabled)) {
        res.push(
          <Col
            className="imagepicker-item-wrapper"
            key={'upload-placeholder'}
          >
            <ImagePicker
              value={undefined}
              sequence={items.length}
              disabled={disabled}
              onChange={this.onChange.bind(this)}
              onClose={this.onClose.bind(this)}
              closeable={false}
              tokenSeparators={tokenSeparators}
              action={action}
              width={width}
              height={height}
              headers={headers}
              getUrl={getUrl}
              data={data}
              limit={limit}
              setError={this.setError}
              isBtn
            />
          </Col>);
      }
      return res;
    };

    const tips = `支持JPG|PNG|GIF|JPEG格式
      ${(limit.width || limit.height) && '；尺寸要求:'}
      ${limit.width || '任意'}*${limit.height || '任意'}像素
      ${limit.size && `；大小在${limit.size}M以内`}`;

    return (
      <div>
        <div value={this.state.item} className="imagepicker-container">
          {createItems()}
        </div>
        {!disabled && <div style={{ whiteSpace: 'normal', color: '#9e9e9e' }}>{tips}</div>}
      </div>
    );
  }
}
