import React, { Component } from 'react';
import { browserHistory } from 'react-router';
// import { Button, Modal, Tree, message } from 'antd';
import { message } from 'antd';
// import detail from '../../../../decorators/detail';
import DetailPage from '../../../../components/DetailPage';
import { getBaseUrl } from '../../../../util';

class View extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
    };
  }

  componentWillMount() {
    this.props.init();
  }

  componentDidMount() {
    const {
      params,
      load,
    } = this.props;
    if (params.id && params.id !== '0') {
      load(params.id);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.id !== this.props.params.id && nextProps.params.id === '0') {
      this.props.init();
    }
  }

  componentWillUnmount() {
    this.props.init();
  }

  onChange = (value) => {
    this.setState({ value });
  }

  handleSubmit = (form) => {
    const {
      record,
      save,
    } = this.props;
    form.validateFields({ force: true }, (err) => {
      if (!err) {
        const { id } = this.props.params;
        save({
          ...record,
          // vcityId: localStorage.getItem('curCityNo'),
          sid: id === '0' ? '' : id,
        }).then((success) => {
          if (success) {
            browserHistory.push('/Manage/ShopList');
          }
        });
      }
    });
  };

  handleNextStep = (form) => {
    const {
      mobileRecord,
      createNewRole,
      setUsername,
    } = this.props;
    form.validateFields({ force: true }, (err) => {
      if (!err) {
        const params = {
          phone: mobileRecord.phone.value,
          userName: mobileRecord.userName.value,
          cityNo: localStorage.curCityNo,
        };
        createNewRole(params).then((isSuccess) => {
          if (isSuccess) {
            const { data } = isSuccess;
            if (data) {
              message.success(`账号添加成功，姓名为：${data.name}`, 2);
              setTimeout(() => setUsername(), 2000);
            } else {
              setUsername();
            }
          }
          // isSuccess && onShow();
        });
      }
    });
  }

  render() {
    const {
      record,
      changeRecord,
      mobileRecord,
      changeMobileRecord,
      params,
      location,
      confirmLoading,
      username,
      nextBtnDisabled,
    } = this.props;

    location.state = location.state || {};

    const isEdit = params.id === '0' || location.state.mode === 'edit';
    const isView = !isEdit;

    const stepCfg = {
      step1: () => {
        const buttons = [{
          label: '下一步',
          type: 'primary',
          disabled: nextBtnDisabled,
          onClick: (form) => this.handleNextStep(form),
          loading: confirmLoading,
        }];

        const fields = [
          {
            label: '登陆手机号',
            name: 'phone',
            phone: true,
            required: true,
            simple: true,
          },
          {
            label: '姓名',
            name: 'userName',
            required: true,
            max: 30,
            simple: true,
          },
          {
            label: '账号角色',
            name: 'roleIdStr',
            simple: true,
            disabled: true,
          },
          {
            label: '所属城市',
            name: 'cityNo',
            simple: true,
            disabled: true,
          },
        ];
        return {
          pageFields: fields,
          pageButtons: buttons,
          pageRecord: mobileRecord,
          pageChangeRecord: changeMobileRecord,
        };
      },
      step2: () => {
        const buttonsMap = {
          save: {
            label: '保存',
            type: 'primary',
            onClick: (form) => this.handleSubmit(form),
            loading: confirmLoading,
          },
          cancel: {
            label: '取消',
            type: 'default',
            onClick: () => {
              this.props.reset();
              browserHistory.push({
                pathname: `/Manage/ShopDetail/${params.id}`,
                state: { mode: 'view' },
              });
            },
          },
          edit: {
            label: '编辑',
            type: 'primary',
            onClick: () => browserHistory.push({
              pathname: `/Manage/ShopDetail/${params.id}`,
              state: { mode: 'edit' },
            }),
            loading: confirmLoading,
          },
        };
        let buttons = [buttonsMap.save, buttonsMap.cancel];
        if (params.id === '0') {
          buttons = [buttonsMap.save];
        } else if (isView) {
          buttons = [buttonsMap.edit];
        }

        const fields = [
          {
            label: '基本信息',
            name: 'baseInfo',
            type: 'title',
          }, {
            label: '店铺账号',
            name: 'username',
            phone: true,
            required: true,
            simple: true,
            disabled: true,
          }, {
            label: '店铺名称',
            name: 'shopName',
            required: true,
            charLimit: true,
            simple: true,
            max: 20,
          }, {
            label: '所属区域',
            name: 'addressCascader',
            required: true,
            simple: true,
            disabled: true,
          }, {
            label: '定位地址',
            name: 'addressMap',
            type: 'map',
            required: true,
            simple: true,
          }, {
            label: '详细地址',
            name: 'detailAddress',
            required: true,
            simple: true,
          }, {
            label: '服务覆盖地区',
            name: 'vcityName',
            // type: 'select',
            required: true,
            simple: true,
            disabled: true,
            // valueName:'cityNo',
            // displayName:'cityName',
            // data: this.props.vCityList,
          }, {
            label: '店招图',
            name: 'storeBannerImage',
            type: 'image',
            single: true,
            action: `${getBaseUrl()}/img/upload`,
            getUrl: (res) => {
              if (res.resultCode === '0') return res.resultData;
              return '';
            },
            limit: {
              size: 2,
              width: 500,
              height: 500,
            },
            headers: {
              Authorization: localStorage.getItem('accessToken'),
              platformId: getBaseUrl('platformId'),
              bizCode: getBaseUrl('bizCode'),
            },
            required: true,
            simple: true,
          }, {
            label: '店铺电话',
            name: 'mobilePhone',
            phone: true,
            required: true,
            simple: true,
          }, {
            label: '营业信息',
            name: 'shopInfo',
            type: 'title',
          }, {
            label: '营业时间',
            name: 'openTime',
            type: 'doubleTime',
            format: 'HH:mm',
            simple: true,
            required: true,
            validator: (rule, value, callback) => {
              if (!value) {
                return callback();
              }
              if (!value.serviceTimeStart || !value.serviceTimeStart.value) {
                return callback('请选择开始时间');
              }
              if (!value.serviceTimeEnd || !value.serviceTimeEnd.value) {
                return callback('请选择结束时间');
              }
              return callback();
            },
          },
        ].map((item) => {
          const newItem = { ...item };
          if (isView) {
            newItem.disabled = true;
          }
          return newItem;
        });
        return {
          pageFields: fields,
          pageButtons: buttons,
          pageRecord: record,
          pageChangeRecord: changeRecord,
        };
      },
    };

    let stepStatus = 'step2';
    if (params.id === '0' && !username) stepStatus = 'step1';
    const { pageFields, pageButtons, pageRecord, pageChangeRecord } = stepCfg[stepStatus]();

    return (
      <div style={{ width: '100%' }} id="m-shop-detail">
        <DetailPage
          title={'当前位置：店铺管理 > 新建/编辑店铺'}
          fields={pageFields}
          buttons={pageButtons}
          values={pageRecord}
          changeRecord={pageChangeRecord}
        />
      </div>
    );
  }
}

export default View;
