import config from '../config.json'
import { Modal } from 'antd';
import moment from 'moment';
const confirm = Modal.confirm;

export const serialize = (obj) => {
  var str = '';
  for (let k in obj) {
    if (obj[k]) {
      str += k + '=' + obj[k] + '&'
    }
  }
  return str.slice(0, str.length - 1)
};

export const getFieldsValue = (fields = {}) => {
  let res = {};
  for (let i in fields) {
    let param = fields[i];
    res[i] = typeof param === 'object' && !(param instanceof Array) ? param.value : param
  }
  return res
};

export const getSessionValue = (key) => {
  return JSON.parse(localStorage.getItem('user'))[key]
};

export const getNodeEnv = () => {
  let env = 'development';
  if (__ONLINE__) {
    env = 'online';
  } else if (__PRE__) {
    env = 'pre';
  } else if (__QAIF__) {
    env = 'qaif';
  } else if (__QAFC__) {
    env = 'qafc';
  } else if (__DEV__) {
    env = 'dev';
  } else if (__MOCK__) {
    env = 'mock';
  } else if (__DEVELOPMENT__) {
    env = 'development';
  }
  return env;
};

/*
* get url prefix according to the env, default development
* */
// export const getBaseUrl = () => config.apiAddress[getNodeEnv()];
export const getBaseUrl = (serverModal="apiAddress") => config[serverModal][getNodeEnv()];
export const getUserCenterUrl = () => config.userCenterAddress[getNodeEnv()];


export const isArray = (obj) => {
  if (typeof Array.isArray === 'function') {
    return Array.isArray(obj);
  } else {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }
};

export function createAction (type, ...argNames) {
  return function (...args) {
    let action = { type };
    argNames.forEach((arg, index) => {
      action[argNames[index]] = args[index]
    });
    return action
  }
}

export function formatMoney (num) {
  let numStr = '' + num;
  let nums = numStr.split('.');

  let integer = (nums[0]).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  return nums.length > 1 ? integer + '.' + nums[1] : integer
}

export function formatDate (value, format) {
  let maps = {
    'yyyy' : function (d) { return d.getFullYear() },
    'MM' : function (d) { return fix(d.getMonth() + 1) },
    'dd' : function (d) { return fix(d.getDate()) },
    'HH' : function (d) { return fix(d.getHours()) },
    'mm' : function (d) { return fix(d.getMinutes()) },
    'ss' : function (d) { return fix(d.getSeconds()) },
  };

  let chunk = new RegExp(Object.keys(maps).join('|'), 'g');

  function fix (d) {
    d = '' + d;
    if (d.length <= 1) {
      d = '0' + d
    }
    return d
  }

  function formatDateInside (value, format) {
    format = format || 'yyyy-MM-dd HH:mm:ss';
    value = new Date(value);
    return format.replace(chunk, function (capture) {
      return maps[capture] ? maps[capture](value) : ''
    })
  }

  return formatDateInside(value, format)
}

export function compare2Objects (x, y) {
  let diffArr = [];

  // 判断两个值是不是对象
  if (!(x instanceof Object && y instanceof Object)) {
    return '这两个值至少有一个不是对象';
  }

  // 判断两个对象的键值名是否相等
  let xkeys = Object.keys(x);
  let ykeys = Object.keys(y);
  for (let i = 0; i < xkeys.length; i += 1) {
    let value = xkeys[i];
    if (y.hasOwnProperty(value) !== x.hasOwnProperty(value)) {
      diffArr.push(value);
    } else if (typeof y[value] !== typeof x[value]) {
      diffArr.push(value);
    }
  }

  for (let i = 0; i < ykeys.length; i += 1) {
    let value = ykeys[i];
    if (y.hasOwnProperty(value) !== x.hasOwnProperty(value)) {
      diffArr.push(value);
    }
    else if (typeof y[value] !== typeof x[value]) {
      diffArr.push(value);
    } else{
      // 进行深度遍历
      switch (typeof (x[value])) {
        case 'object':
        case 'function':
          let deepArr = (compare2Objects (x[value], y[value]));

          if (deepArr instanceof Array && deepArr.length !== 0) {
            diffArr.push(value);
            break;
          }
          break;
        default:
          if (x[value] !== y[value]) {
            diffArr.push(value);
          }
          break;
      }
    }
  }
  return diffArr;
}

// 规则配置页面点击删除按钮触发的事件
export const dele = (params, props) => {
  const { del, search, searchParams } = props;
  confirm({
    content: '确定要删除这个内容么？',
    iconType:undefined,
    onOk() {
      del(params).then((success) => {
        success && search(searchParams);
      });
    },
  });
};

// 将数组类型的地址location转换成分开的省、市、区code
export const locationChange = (params) => {
  const newParams = params;
  if (params.location) {
    const value = params.location.value;
    switch (value.length) {
      case 0:
        newParams.provinceCode = '';
        newParams.cityCode = '';
        newParams.districtCode = '';
        break;
      case 1:
        newParams.provinceCode = value[0];
        newParams.cityCode = '';
        newParams.districtCode = '';
        break;
      case 2:
        newParams.provinceCode = value[0];
        newParams.cityCode = value[1];
        newParams.districtCode = '';
        break;
      case 3:
        newParams.provinceCode = value[0];
        newParams.cityCode = value[1];
        newParams.districtCode = value[2];
        break;
      default:
        break;
    }
  }
  return newParams;
};

// 金钱分转元
export const fenToYuan = (val, precision) => {
  let str = (val/100).toFixed(precision) + '';
  let intSum = str.substring(0,str.indexOf(".")).replace( /\B(?=(?:\d{3})+$)/g, ',' );
  let dot = str.substring(str.length,str.indexOf("."));
  let ret = intSum + dot;
  return ret;
};

// 门店详情页根据经纬度在地图上进行定位
export const mapPosition = (props) => {
  const map = new window.AMap.Map('container');
  map.setZoom(10);
  let { longitude, latitude } = props.data;
  longitude = longitude || 120.196008;
  latitude = latitude || 30.23055;
  map.setCenter([longitude, latitude]);

  const marker = new window.AMap.Marker({
    position: [longitude, latitude],
    map,
  });
  marker.setMap(map);
};

const isField = (val) => (typeof val === 'object' && val !== null) &&
  !(val instanceof Array) && 'value' in val && !(val._d);

const shapeType = (param, key) => {
  const value = param.value;
  const res = {};
  switch (param.type) {
    case 'month':
      res[key] = param.format('YYYY-MM');
      break;
    case 'datetimeRange':
    case 'numberRange':
      res[key] = param.value;
      res[`${key}Start`] = value[0] ? value[0].valueOf() : undefined;
      res[`${key}End`] = value[1] ? value[1].valueOf() : undefined;
      break;
    case 'dateRange':
      res[key] = param.value;
      res[`${key}Start`] = value[0].format('YYYY-MM-DD 00:00:00');
      res[`${key}End`] = value[1].format('YYYY-MM-DD 23:59:59');
      break;
    case 'monthRange':
      res[key] = param.value;
      res[`${key}Start`] = value[0].format('YYYY-MM');
      res[`${key}End`] = value[1].format('YYYY-MM');
      break;
    default:
      res[key] = param.value;
      (typeof res[key] === 'string') && res[key].trim();
  }
  return res;
};

export function mapToSendData(params = {}, decorate) {
  let res = {};
  const keys = Object.keys(params);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const param = params[key];
    if (isField(param)) {
      const valueObj = shapeType(param, key);
      res = {
        ...res,
        ...valueObj,
      };
    } else {
      res[key] = param;
    }
  }
  return decorate ? decorate(res) : res;
}

export function mapReceivedData(data, decorate) {
  let newData = { ...data };
  newData = decorate ? decorate(newData) : newData;
  const keys = Object.keys(newData);
  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (/^.*Start$/.test(key)) {
      const prefix = key.slice(0, key.length - 5);
      newData[prefix] = {};
      const valueStart = newData[key] ? moment(newData[key]) : null;
      const valueEnd = data[`${prefix}End`] ? moment(data[`${prefix}End`]) : null;
      newData[prefix].value = [valueStart, valueEnd];
    }
    const param = newData[key];
    if (typeof param === 'object' && param !== null && 'value' in param) {
      newData[key] = param;
    } else {
      newData[key] = { value: param };
    }
  }
  return newData;
}

export const getCurCity = () => ({
  curCityNo: localStorage.getItem('curCityNo'),
  curCityName: localStorage.getItem('curCityName'),
});