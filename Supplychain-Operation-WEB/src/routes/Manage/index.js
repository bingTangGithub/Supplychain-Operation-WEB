/* eslint-disable import/no-dynamic-require */
import { injectReducer } from '../../store/reducers';
import CoreLayout from '../../layouts/CoreLayout';
import { common } from '../../store/common';
import Home from '../Home';
import CityLoading from './CityLoading';
import CityChanging from './CityChanging';

import CheckoutDetail from './CheckoutDetail';
import CheckoutList from './CheckoutList';
// import ProductClassify from './ProductClassify';
import OrderDetail from './OrderDetail';
import OrderList from './OrderList';
import Coupon from './Coupon';
import CouponDetail from './CouponDetail';
import CouponGrant from './CouponGrant';
import Activity from './Activity';
import ActivityDetail from './ActivityDetail';
import ShopList from './ShopList';
import ShopDetail from './ShopDetail';
import ProductList from './ProductList';
import VerifyList from './VerifyList';
import ProductDetailEdit from './ProductDetailEdit';
import FrontCateList from './FrontCateList';
import FrontCateEdit from './FrontCateEdit';
import TagList from './TagList';

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

export const createRoutes = (store) => ({
  path        : '/Manage',
  component   : CoreLayout,
  indexRoute  : Home,
  onEnter: ({ location }, replace, next) => {
    if ((store.vcityLoading || !store.vcityValue) && location.pathname !== '/Manage/Loading') {
      replace(`/Manage/Loading?jump=${location.pathname}`);
    }
    next();
  },
  onLeave: () => {
  },
  childRoutes : [
    ProductList(store),
    VerifyList(store),
    ProductDetailEdit(store),
    CheckoutDetail(store),
    CheckoutList(store),
    // ProductClassify(store),
    OrderDetail(store),
    OrderList(store),
    Coupon(store),
    CouponDetail(store),
    CouponGrant(store),
    Activity(store),
    ActivityDetail(store),
    ShopList(store),
    ShopDetail(store),
    CityLoading(store),
    CityChanging(store),
    FrontCateList(store),
    FrontCateEdit(store),
    TagList(store),
  ],
});

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
      require.ensure([], (require) => {
        const container = require(`./${moduleName}/containers/index`).default;
        const reducer = require(`./${moduleName}/modules/index`).default;
        injectReducer(store, { key: moduleName, reducer });
        cb(null, container);
      });
    },
  });
}

export default createRoutes;
