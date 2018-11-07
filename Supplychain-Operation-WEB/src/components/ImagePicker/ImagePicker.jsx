import React, { Component } from 'react';
import { Upload, Modal, Icon, Button, Spin, message } from 'antd';
import PropTypes from 'prop-types';

class ImagePicker extends Component {
  static propTypes = {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    closeable: PropTypes.bool,
    headers: PropTypes.object,
    getUrl: PropTypes.func.isRequired,
    data: PropTypes.object,
    width: PropTypes.number,
    type: PropTypes.string,
    isBtn: PropTypes.bool,
    setError: PropTypes.func,
  }

  static defaultProps = {
    value: undefined,
    disabled: false,
    closeable: true,
    headers: {},
    getUrl: undefined,
    data: {},
    width: 100,
    type: '',
    isBtn: false,
    setError: () => {},
  }

  constructor(props) {
    super(props);
    const value = props.value;
    this.state = {
      value,
      coverfix: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      const value = nextProps.value || undefined;
      this.setState(Object.assign({}, this.state, {
        value,
      }));
    }
  }

  onClose(e) {
    e.stopPropagation();
    this.props.onClose(this.props.sequence);
  }

  onPreview(e) {
    e.stopPropagation();
    if (this.props.type === 'file') {
      const a = document.createElement('a');
      a.href = this.state.value;
      a.target = '_blank';
      a.click();
    } else {
      this.setState(Object.assign({}, this.state, {
        previewVisible: true,
      }));
    }
  }

  onPicCancel() {
    this.setState(Object.assign({}, this.state, {
      previewVisible: false,
    }));
  }

  onImgLoad(e) {
    const img = e.target;
    let coverfix = '';
    if ((img.naturalHeight > img.naturalWidth) || (img.height > img.width)) {
      coverfix = 'img-coverfix';
    } else {
      coverfix = '';
    }
    this.setState(Object.assign({}, this.state, {
      coverfix,
    }));
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState(Object.assign({}, this.state, {
        loading: true,
      }));
    } else {
      this.setState(Object.assign({}, this.state, {
        loading: false,
      }));
    }
    if (info.file.status === 'done') {
      const value = this.props.getUrl(info.file.response);
      if (!value) {
        message.error(info.file.response.resultDesc);
      } else {
        this.setState(Object.assign({}, this.state, {
          value,
        }));
        this.props.onChange({
          key: this.props.sequence,
          value,
        });
      }
    }
  };

  isImg = (value) => /png|jpg|gif/.test(value);

  beforeUpload = (file) => {
    const { setError } = this.props;
    let result = true;

    if (!/image.*/.test(file.type)) {
      message.error(`"${file.name}"格式错误!`);
      setError('图片格式错误!');
      result = false;
    }

    const { size, width, height } = this.props.limit || {};
    if (size && (file.size / 1024 / 1024 > size)) {
      message.error(`"${file.name}"大小超过${size}MB!`);
      setError(`图片大小超过${size}MB!`);
      result = false;
    }

    if (result && (width || height)) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData = e.target.result;
          const image = new Image();
          image.onload = () => {
            let judgePx = true;
            if (width && (image.width !== width)) {
              message.error(`要求图片宽度为${width}像素!`);
              setError(`要求图片宽度为${width}像素!`);
              judgePx = false;
            }
            if (height && (image.height !== height)) {
              message.error(`要求图片高度为${height}像素!`);
              setError(`要求图片高度为${height}像素!`);
              judgePx = false;
            }
            judgePx ? resolve() : reject();
          };
          image.src = imgData;
        };
        reader.readAsDataURL(file);
      });
    }

    return result;
  }

  render() {
    const { previewVisible, loading = false } = this.state;
    const {
      disabled,
      action,
      width,
      height,
      headers,
      data,
      type,
      isBtn,
    } = this.props;

    let imgWrapperStyle = {};

    if (width || height) {
      imgWrapperStyle = { width, height };
    }

    let waterMark = '';
    if (!this.state.value && disabled) {
      waterMark = 'img-watermark';
    }

    return (
      <div className="flex flex-v">
        <Upload
          className="avatar-uploader"
          action={action}
          beforeUpload={this.beforeUpload}
          headers={headers}
          onChange={this.handleChange}
          showUploadList={false}
          disabled={!isBtn || disabled}
          data={data}
        >
          {
            <Spin spinning={loading}>
              <div style={imgWrapperStyle} className={`img-wrapper flex flex-c ${waterMark} ${this.state.coverfix}`}>
                {
                  this.state.value && this.isImg &&
                  <img src={this.state.value} alt="" onLoad={this.onImgLoad.bind(this)} />
                }
                {
                  this.state.value && type === 'file' &&
                  <Icon type="file-text" style={{ fontSize: width }} />
                }
                {
                  !this.state.value && !disabled && <Icon type="plus" style={{ fontSize: width }} />
                }
              </div>
            </Spin>
          }
          {
            this.state.value &&
            <Button shape="circle" icon="eye-o" className="ant-upload-preview" onClick={this.onPreview.bind(this)} />
          }
          {
            !disabled && this.props.closeable &&
            <Button shape="circle" icon="close" className="ant-upload-close" onClick={this.onClose.bind(this)} />
          }
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.onPicCancel.bind(this)}>
          <img alt="" style={{ width: '100%' }} src={this.state.value} />
        </Modal>
      </div>
    );
  }
}

export default ImagePicker;
