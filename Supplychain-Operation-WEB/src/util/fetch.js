/* eslint-disable */
import fetch from 'isomorphic-fetch'
import { getBaseUrl } from '../util'
import CryptoJS from '../../lib/crypto-js'

const decorateParams = (params = {}) => { // compatible with the param like "foo: {value: 'xxx', ...}"
  let res = {};
  for (let i in params) {
    let param = params[i];
    let  value = param !== null && //not null
      typeof param === 'object' && // fields is a object perhaps
      !(param instanceof Array) && // not array
      !(param._d) // not moment
        ? (param.value && param.value.trim && param.value.trim() || param.value) : param;

    if (value instanceof Array && value.length === 2) { // dateRange, datetimeRange, numberRange
      if (param.type === 'datetimeRange' || param.type === 'numberRange') {
        res[i + 'Start'] = value[0] || undefined;
        res[i + 'End'] = value[1] || undefined
      } else if (param.type === 'dateRange' || param.type === 'twodateRange') {
        res[i + 'Start'] = value[0] && value[0].format('YYYY-MM-DD');
        res[i + 'End'] = value[1] && value[1].format('YYYY-MM-DD')
      } else {
        res[i] = value
      }
    } else {
      if (/^\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}$/.test(value)) { // fix time string to second
        value = value + ':00'
      }
      res[i] = typeof value === 'undefined' ? '' : (value && value.trim && value.trim() || value)
    }
  }
  return res
};

function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

function getAuthorization() {
  if(localStorage.getItem('accessToken')){
    return `${localStorage.getItem('accessToken')}`;
  }else {
    var str = CryptoJS.enc.Utf8.parse("tubobo_xs:tubobo_xs");
    return `Basic ${CryptoJS.enc.Base64.stringify(str)}`;
  }
}

export default (url, params = {}, opts = {}, needDecorate = true, needCityNo = true) => {
  const defaultOpts = {
    method: 'POST',
    mode: 'cors',
    headers: {
      'client_sn':'sdas',
      'Content-Type': 'application/json',
      'Authorization': getAuthorization(),
      'client_source':'supplychain-operation',
      'device_type':'web',
      'version':'v1.0.0',
      'request_id':randomString(32),
      'platformId': getBaseUrl('platformId'),
      'bizCode': getBaseUrl('bizCode'),
    },
  };

  if (needCityNo)
    defaultOpts.headers['city_no'] = localStorage.getItem('curCityNo');

  opts = {
    ...defaultOpts,
    ...opts,
  };

  if (opts.body) {
    delete opts.headers['Content-Type'];
  }

  if (opts.method === 'POST' && !opts.body) {
    opts.body = needDecorate === false ? JSON.stringify(params) : JSON.stringify(decorateParams(params));
  }
  document.querySelector('#overlay').style.display = 'block';
  return fetch(url.indexOf('//') > -1 ? url : (getBaseUrl(opts.serviceModal) + url), opts)
    .then(res => {
      document.querySelector('#overlay').style.display = 'none';
      if (res.status < 200 || res.status >= 300) {
        return {
          resultCode: '-1',
          resultDesc: res.status + ' ' + res.statusText,
        }
      }
      const contentType = res.headers.get('content-type');
      if (contentType.indexOf('application/json') > -1) {
        return res.json()
      } else {
        return res.blob()
      }
    })
    .then(json => {
      if (json.type) { // blob
        return json
      }
      if (json.resultCode === '-5' || json.resultCode === '-1000' || json.resultCode === '11' || json.resultCode === '12' || json.resultCode === '13' || json.resultCode === '10004') { // 登录过期或未登录
        localStorage.setItem('accessToken', '');
        localStorage.setItem('user', '{}');
        location.assign(getBaseUrl('entryUrl'));
      }
      if (json.resultCode === 'TBB00002') {
        const paramsTemp = {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthorization(),
          },
        }
        if (opts.method === 'POST') {
          paramsTemp.body = JSON.stringify(decorateParams({ refreshToken : localStorage.getItem('refreshToken') }))
        }
        fetch((`${getBaseUrl('tokenUrl')}/tubobo/sysUser/refreshToken`), paramsTemp)
          .then(res => {
            if (res.status < 200 || res.status >= 300) {
              return {
                resultCode: '-1',
                resultDesc: res.status + ' ' + res.statusText,
              }
            } else {
              return res.json()
            }
          }).then(json => {
          let { resultData } = json
          if(resultData){
            if(resultData.token){
              localStorage.setItem('accessToken', resultData.token);
            }
            if(resultData.refreshToken) {
              localStorage.setItem('refreshToken', resultData.refreshToken);
            }
          }
          if (json.resultCode === '10001' ||
            json.resultCode === 'TBB00002' ||
            json.resultCode === '-5' ||
            json.resultCode === '-1000'||
            json.resultCode === '12' ||
            json.resultCode === '13' ||
            json.resultCode === '10004'
          ) { // 登录过期或未登录
            localStorage.setItem('accessToken', '')
            localStorage.setItem('user', '{}')
            location.assign(getBaseUrl('entryUrl'))
          }

          let resetUrl = getBaseUrl() + url;

          document.querySelector('#overlay').style.display = 'block'
          opts.headers.Authorization = resultData.token
          fetch(resetUrl, opts).then(res => {
            document.querySelector('#overlay').style.display = 'none'
            if (res.status < 200 || res.status >= 300) {
              return {
                resultCode: '-1',
                resultDesc: res.status + ' ' + res.statusText,
              }
            }
            const contentType = res.headers.get('content-type')
            if (contentType.indexOf('application/json') > -1) {
              return res.json()
            } else {
              return res.blob()
            }
          }).then(() => {
            if (json.type) { // blob
              return json
            }
            return json
          })
        })
      }
      localStorage.removeItem('url')
      return json
    })
    .catch(e => {
      document.querySelector('#overlay').style.display = 'none'
      return {
        resultCode: '-1',
        resultDesc: '网络异常，请重试',
      }
    });
}
