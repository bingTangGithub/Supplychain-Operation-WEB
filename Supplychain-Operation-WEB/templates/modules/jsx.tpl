import { message } from 'antd';
import { createAction } from '../../../../util';
import fetch from '../../../../util/fetch';
// ------------------------------------
// Constants
// ------------------------------------
const REQUEST_DO = 'REQUEST_DO';
const REQUEST_SUCCESS = 'REQUEST_SUCCESS';
const REQUEST_FAILURE = 'REQUEST_FAILURE';
const COLOR_CHANGE = 'COLOR_CHANGE';

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  // 在createAction中组装action
  colorChange: createAction(COLOR_CHANGE, 'color'),
  // 在中间件(/src/store/createStore.js)中组装action, 可传入的参数是types, callAPI, shouldCallAPI, payload, callback
  sendRequest: (values) => ({
    types: [REQUEST_DO, REQUEST_SUCCESS, REQUEST_FAILURE],
    callAPI: () => fetch('/restful/serviceProvider/edit', values),
    payload: { editedValues: values },
  }),
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [REQUEST_DO]: (state, action) => {
    message.info('你的请求发出了！');
    console.log('action in REQUEST_DO:', action);
    return {
      ...state,
      loading: true,
    };
  },
  [REQUEST_SUCCESS]: (state, action) => {
    message.info('你的请求成功了！');
    console.log('action in REQUEST_SUCCESS:', action);
    return {
      ...state,
      loading: false,
    };
  },
  [REQUEST_FAILURE]: (state, action) => {
    message.error('你的请求失败了！');
    console.log('action in REQUEST_FAILURE:', action);
    return {
      ...state,
      loading: false,
    };
  },
  [COLOR_CHANGE]: (state, action) => {
    console.log('action in COLOR_CHANGE:', action);
    return { ...state };
  },
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = {
  loading: false,
};

export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
