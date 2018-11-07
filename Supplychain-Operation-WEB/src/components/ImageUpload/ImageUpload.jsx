import React, { Component } from 'react';
import { Upload, Icon, message } from 'antd';
import fetch from '../../util/fetch';

class ImageUpload extends Component {
  state = {
    imgList: [],
  };

  beforeUpload = (file) => {
    const isImage = /^image\/(jpeg)|(png)|(gif)$/.test(file.type);
    if (!isImage) {
      message.error(`"${file.name}"格式错误!`);
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error(`"${file.name}"大小超过5MB!`);
    }
    return isImage && isLt5M;
  }

  customRequest = (fileInfo) => {
    if (!this.uploadList) this.uploadList = [];
    if (this.canUpload()) {
      this.uploadList.push(fileInfo);

      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.uploadImgList();
    } else {
      message.error(`图片数量超过限制！"${fileInfo.file.name}"无法上传。`);
    }
  }

  uploadImgList = () => {
    this.timer = setTimeout(() => {
      const len = this.uploadList.length;
      this.uploadList.forEach(
        (item, index) => setTimeout(
          () => this.doUpload(item, len === 1 ? undefined : index),
          (index + 1) * 100
        )
      );
      this.uploadingLen = len;
      this.uploadList = [];
      clearTimeout(this.timer);
    }, 200);
  }

  doUpload = ({ file, onSuccess, onError }) => {
    const formData = new FormData();

    const { params } = this.props;
    params && Object.keys(params).forEach((key) => {
      formData.append(key, params[key]);
    });
    formData.append('file', file);

    this.setState({
      uploading: true,
    });

    return fetch('/img/upload', {}, { body: formData }).then((result) => {
      if (result.resultCode === '0') { // 成功
        message.success(`"${file.name}"上传成功`);
        onSuccess();
        this.props.onChange({
          id: this.props.id,
          type: 'add',
          imgUrl: result.resultData,
        });
      } else { //  失败
        message.error(`"${file.name}"上传失败`);
        onError();
      }
      this.uploadingLen = this.uploadingLen - 1;
      this.setState({ imgList: [] });
    }).catch(() => {
      message.error(`"${file.name}"上传失败`);
      onError();
      this.uploadingLen = this.uploadingLen - 1;
      this.setState({ imgList: [] });
    });
  }

  canUpload = () => {
    const { length, fileList } = this.props;
    const uploadLen = (this.uploadList || []).length;
    return fileList ? (fileList.length + uploadLen + (this.uploadingLen || 0)) < length : true;
  }

  render() {
    const { imgList } = this.state;
    const { clearfix, multiple = false } = this.props;
    const showButton = this.canUpload();
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );
    return (
      <div className={`${clearfix ? 'clearfix' : ''}`}>
        <Upload
          // action="//merchant-manage.dev.ops.com/img/upload"
          listType="picture-card"
          beforeUpload={this.beforeUpload}
          customRequest={this.customRequest}
          fileList={imgList}
          multiple={multiple}
        >
          {showButton && uploadButton}
        </Upload>
      </div>
    );
  }
}
export default ImageUpload;
