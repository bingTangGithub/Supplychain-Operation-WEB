/* eslint-disable import/no-dynamic-require */
import { injectReducer } from '../../../store/reducers';
import { common } from '../../../store/common';

export function createChildRoutes(moduleName, id) {
  let path = moduleName;
  if (id) {
    path = `${moduleName}/:id`;
  }
  return (store) => ({
    path,
    onEnter: (opts, replace, next) => {
      store.dispatch(common.initMenu());
      next();
    },
    onLeave: () => {
    },
    getComponent(nextState, cb) {
      const __moduleName = 'ProductList';
      require.ensure([], (require) => {
        const container = require(`../${__moduleName}/containers/index`).default;
        const reducer = require(`../${__moduleName}/modules/index`).default;
        injectReducer(store, { key: __moduleName, reducer });
        cb(null, container);
      });
    },
  });
}

export const moduleName = 'VerifyList';
export default createChildRoutes(moduleName);
