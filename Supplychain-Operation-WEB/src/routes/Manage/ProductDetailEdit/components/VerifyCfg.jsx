import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { Card } from 'antd';
import DetailPage from '../../../../components/DetailPage';

class SkuCfg extends Component {
  // constructor(props) {}
  handleVerifySubmit = (form) => {
    const {
      varifyRecord,
      verifySubmit,
      spuId,
      shopId,
    } = this.props;
    form.validateFields({ force: true }, (err) => {
      if (!err) {
        verifySubmit({
          ...varifyRecord,
          spuId,
          shopId,
        }).then((success) => {
          if (success) {
            browserHistory.push('/Manage/ProductList');
          }
        });
      }
    });
  };

  render() {
    const {
      varifyRecord,
      changeVarifyRecord,
      verifyLoading,
    } = this.props;

    const varifyFields = [
      {
        label: '审核结果',
        name: 'verifyStatus',
        type: 'radio',
        required: true,
        simple: true,
        data: {
          3: '通过',
          4: '不通过', // 实际是2
        },
      }, {
        label: '修改建议',
        name: 'reason',
        required: true,
        max: 200,
        simple: true,
        hidden: !(varifyRecord.verifyStatus.value === '4'),
      },
    ];
    const varifyButtons = [{
      label: '保存',
      type: 'primary',
      onClick: (form) => this.handleVerifySubmit(form),
      loading: verifyLoading,
    }];
    return (
      <Card title="商品审核" className="form-section">
        <DetailPage
          fields={varifyFields}
          buttons={varifyButtons}
          values={varifyRecord}
          changeRecord={changeVarifyRecord}
        />
      </Card>
    );
  }
}

export default SkuCfg;
