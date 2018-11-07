import { message } from 'antd';
import _cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import fetch from '../../../../util/fetch';
import { createAction, mapReceivedData, mapToSendData } from '../../../../util';
// import { moduleName } from '../index';

// ------------------------------------
// Constants
// ------------------------------------
const getInitialState = () => ({
  nextBtnDisabled: false,
  vCityList: [],
  username: '',
  originRecord: {},
  record: {
    username: { value: undefined },
    shopName: { value: undefined },
    addressCascader: { value: undefined },
    addressMap: { value: undefined },
    detailAddress: { value: undefined },
    longitude: { value: undefined },
    latitude: { value: undefined },
    vcityId: { value: localStorage.getItem('curCityNo') },
    vcityName: { value: localStorage.getItem('curCityName') },
    storeBannerImage: {
      value: undefined,
    },
    mobilePhone: { value: undefined },
    openTime: {
      value: {
        serviceTimeStart: { value: undefined },
        serviceTimeEnd: { value: undefined },
      },
    },
    sid: { value: undefined },
  },
  mobileRecord: {
    phone: { value: undefined },
    userName: { value: undefined },
    cityNo: { value: localStorage.getItem('curCityName') },
    roleIdStr: { value: '供应链商家' },
  },
  loading: false,
  confirmLoading: false,
  searchParams: {},
  page: {
    pageSize: 10,
    pageNo: 1,
  },
});
const SHOPDETAIL_RECORD_CHANGE = 'SHOPDETAIL_RECORD_CHANGE';
const SHOPDETAIL_MOBILERECORD_CHANGE = 'SHOPDETAIL_MOBILERECORD_CHANGE';
const SHOPDETAIL_USERNAME_SET = 'SHOPDETAIL_USERNAME_SET';
const SHOPDETAIL_REQUEST = 'SHOPDETAIL_REQUEST';
const SHOPDETAIL_SUCCESS = 'SHOPDETAIL_SUCCESS';
const SHOPDETAIL_FAILURE = 'SHOPDETAIL_FAILURE';
const SHOPDETAIL_SAVE_REQUEST = 'SHOPDETAIL_SAVE_REQUEST';
const SHOPDETAIL_SAVE_SUCCESS = 'SHOPDETAIL_SAVE_SUCCESS';
const SHOPDETAIL_SAVE_FAILURE = 'SHOPDETAIL_SAVE_FAILURE';
const SHOPDETAIL_RESET = 'SHOPDETAIL_RESET';
const SHOPDETAIL_INIT = 'SHOPDETAIL_INIT';

const SHOPDETAIL_VCITYLIST_REQUEST = 'SHOPDETAIL_VCITYLIST_REQUEST';
const SHOPDETAIL_VCITYLIST_SUCCESS = 'SHOPDETAIL_VCITYLIST_SUCCESS';
const SHOPDETAIL_VCITYLIST_FAILURE = 'SHOPDETAIL_VCITYLIST_FAILURE';

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  changeRecord: createAction(SHOPDETAIL_RECORD_CHANGE, 'fields'),
  changeMobileRecord: createAction(SHOPDETAIL_MOBILERECORD_CHANGE, 'fields'),
  setUsername: createAction(SHOPDETAIL_USERNAME_SET),
  load: (id) => ({
    types: [SHOPDETAIL_REQUEST, SHOPDETAIL_SUCCESS, SHOPDETAIL_FAILURE],
    callAPI: () => fetch('/shop/detail', { sid: id }),
    payload: { sid: id },
  }),
  save: (params) => ({
    types: [SHOPDETAIL_SAVE_REQUEST, SHOPDETAIL_SAVE_SUCCESS, SHOPDETAIL_SAVE_FAILURE],
    callAPI: () => fetch('/shop/add', mapToSendData(params, (data) => {
      // const { originRecord = {}, vCityList } = state[moduleName];
      const newData = { ...data };
      newData.startTime = newData.openTime.serviceTimeStart.value.format('HH:mm');
      newData.endTime = newData.openTime.serviceTimeEnd.value.format('HH:mm');
      delete newData.addressMap;
      delete newData.openTime;

      if (!newData.vcityId) {
        newData.vcityId = localStorage.getItem('curCityNo');
      }

      // const hasSameCityId = () => originRecord.vcityId && newData.vcityId === originRecord.vcityId.value;
      // newData.vcityName = hasSameCityId() && originRecord.vcityName
      //   ? originRecord.vcityName.value
      //   : (vCityList.find((item) => item.cityNo === newData.vcityId) || {}).cityName;

      newData.shopType = '0';
      newData.merchantType = '0';
      return newData;
    })),
    payload: params,
  }),
  reset: createAction(SHOPDETAIL_RESET),
  init: createAction(SHOPDETAIL_INIT),

  createNewRole: (params) => ({
    types: [SHOPDETAIL_VCITYLIST_REQUEST, SHOPDETAIL_VCITYLIST_SUCCESS, SHOPDETAIL_VCITYLIST_FAILURE],
    callAPI: () => fetch('/shop/creatoradd', params),
  }),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SHOPDETAIL_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [SHOPDETAIL_SUCCESS]: (state, action) => {
    // action.data = {
    //   shopName:'18815283340',
    //   detailAddress:'18815283340',
    //   vcityId:'6',
    //   storeBannerImage:[
    //     'http://tubobo-qd.oss-cn-shanghai.aliyuncs.com/tbb-operationentry/entryIcon/xiaodian.png',
    //   ],
    //   mobilePhone:'18815283340',
    //   areaCode:'330106',
    //   province:'浙江省',
    //   city:'杭州市',
    //   district:'西湖区',
    //   longitude:120.1921,
    //   latitude:30.237451,
    //   startTime:'08:11',
    //   endTime:'20:11',
    // };
    const newData = { ...action.data };
    newData.addressCascader = {
      value: `${newData.province}/${newData.city}/${newData.district}`,
    };
    newData.openTime = {
      serviceTimeStart: { value: newData.startTime ? moment(newData.startTime, 'HH:mm') : undefined },
      serviceTimeEnd: { value: newData.endTime ? moment(newData.endTime, 'HH:mm') : undefined },
    };
    newData.addressMap = [newData.longitude, newData.latitude];
    // newData.vcityId = localStorage.getItem('curCityName');
    return {
      ...state,
      loading: false,
      record: mapReceivedData(newData, (data) => ({ ...data })),
      originRecord: mapReceivedData(newData, (data) => ({ ...data })),
      username: action.data.username,
    };
  },
  [SHOPDETAIL_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
  [SHOPDETAIL_RECORD_CHANGE]: (state, action) => {
    const newRecord = { ...action.fields };
    const { originRecord } = state;

    const { addressMap } = action.fields;
    if (addressMap && addressMap.dirty && addressMap.value && addressMap.value.addressComponent) {
      const { value } = addressMap;
      const { lng, lat } = value.location;
      // 经纬度变更时，才更新定位数据
      if (originRecord.longitude && lng === originRecord.longitude.value && lat === originRecord.latitude.value) {
        const addrList = [
          'addressCascader',
          'areaCode',
          'province',
          'city',
          'district',
          'detailAddress',
          'longitude',
          'latitude',
        ];
        addrList.forEach((addrName) => {
          newRecord[addrName] = originRecord[addrName];
        });
      } else {
        const { province, district, adcode } = value.addressComponent;
        let { city } = value.addressComponent;
        if (!city) {
          // 直辖市的数据需要修正
          city = '-';
        }
        newRecord.addressCascader = { value: `${province}/${city}/${district}` };
        newRecord.areaCode = { value: adcode };
        newRecord.province = { value: province };
        newRecord.city = { value: city };
        newRecord.district = { value: district };
        newRecord.detailAddress = { value: value.formattedAddress };
        newRecord.longitude = { value: lng };
        newRecord.latitude = { value: lat };
      }
    }
    return {
      ...state,
      record: newRecord,
    };
  },
  [SHOPDETAIL_SAVE_REQUEST]: (state) => ({
    ...state,
    confirmLoading: true,
  }),
  [SHOPDETAIL_SAVE_SUCCESS]: (state) => {
    message.success('操作成功');
    return {
      ...state,
      confirmLoading: false,
      visible: false,
    };
  },
  [SHOPDETAIL_SAVE_FAILURE]: (state) => ({
    ...state,
    confirmLoading: false,
  }),
  [SHOPDETAIL_RESET]: (state) => ({
    ...state,
    record: _cloneDeep(state.originRecord),
  }),
  [SHOPDETAIL_INIT]: () => ({
    ..._cloneDeep(getInitialState()),
  }),
  [SHOPDETAIL_VCITYLIST_REQUEST] : (state) => ({
    ...state,
    loading: true,
    nextBtnDisabled: true,
  }),
  [SHOPDETAIL_VCITYLIST_SUCCESS]: (state, action) => ({
    ...state,
    loading: false,
    vCityList: action.data.list,
  }),
  [SHOPDETAIL_VCITYLIST_FAILURE]: (state) => ({
    ...state,
    loading: false,
    nextBtnDisabled: false,
  }),
  [SHOPDETAIL_MOBILERECORD_CHANGE]: (state, action) => ({
    ...state,
    mobileRecord: {
      ...state.mobileRecord,
      ...action.fields,
    },
  }),
  [SHOPDETAIL_USERNAME_SET]: (state) => ({
    ...state,
    nextBtnDisabled: false,
    username: state.mobileRecord.phone.value,
    record: {
      ...state.record,
      username: { value: state.mobileRecord.phone.value },
    },
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------

export default function reducer(state = _cloneDeep(getInitialState()), action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
