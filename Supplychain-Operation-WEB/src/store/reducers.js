import { combineReducers } from 'redux';
import commonReducer from './common';
import dictReducer from './dict';

export const makeRootReducer = (asyncReducers) =>
  // 合并
  combineReducers({
    // locationreducer 返回变化后的路径地址
    // location: locationReducer,
    common: commonReducer,
    dict: dictReducer,
    ...asyncReducers,
  });


export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;
  const newStore = store;
  newStore.asyncReducers[key] = reducer;
  newStore.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
