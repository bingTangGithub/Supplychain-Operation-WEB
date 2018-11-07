import React, { Component } from 'react';
import { Upload, Modal, Icon } from 'antd';
import './index.scss';

class ImagePreviewList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      previewVisible: false,
      previewImage: '',
    };
  }

  handleCancel = () => this.setState({ previewVisible: false })

  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true,
    });
  }

  handleChange = (index) => {
    const fileList = [...this.props.fileList];
    fileList.splice(index, 1);
    this.props.onChange({
      id: this.props.id,
      type: 'change',
      fileList,
    });
  }

  handleClick = (direction, index) => {
    const fileList = [...this.props.fileList];
    const elem = fileList.splice(index, 1)[0];

    let newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0) newIndex = newIndex + fileList.length + 1;
    if (newIndex > fileList.length) newIndex = 0;

    fileList.splice(newIndex, 0, elem);

    this.props.onChange({
      id: this.props.id,
      type: 'change',
      fileList,
    });
  }

  render() {
    const { previewVisible, previewImage } = this.state;
    const { fileList, disabled, clearfix } = this.props;
    const len = fileList ? fileList.length : 0;
    const dontShow = disabled && (!fileList || !len);

    const className = `img-upload ${clearfix ? 'clearfix' : ''} ${disabled ? 'disabled' : ''}`;

    return (
      dontShow
        ? <div>-</div>
        : (<div className={className}>
          {fileList.map((file, index) => (
            <div className="upload-container" key={file.url}>
              {!disabled && len > 1 && <span className="move-left">
                <Icon type="left" onClick={() => this.handleClick('left', index)} />
              </span>}
              <Upload
                beforeUpload={() => false}
                listType="picture-card"
                fileList={[file]}
                onPreview={this.handlePreview}
                onChange={() => this.handleChange(index)}
              />
              {!disabled && len > 1 && <span className="move-right">
                <Icon type="right" onClick={() => this.handleClick('right', index)} />
              </span>}
            </div>
          ))}

          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
            <img alt="example" style={{ width: '100%' }} src={previewImage} />
          </Modal>
        </div>)
    );
  }
}
export default ImagePreviewList;
