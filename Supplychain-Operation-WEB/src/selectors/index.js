import { createSelector } from 'reselect';

const getMenus = (state) => state.common.menus;

const getTopMenuKey = (state) => state.common.selectedTopKeys[0];

export const getTopMenus = createSelector(
  [getMenus],
  (menus) => menus || []
);

export const getSideMenus = createSelector(
  [getMenus, getTopMenuKey],
  (menus, key) => {
    const menu = menus.find((menu1) => menu1.id === key);
    return (menu || []).children || [];
  }
);
