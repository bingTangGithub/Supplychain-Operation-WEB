import 'moment/locale/zh-cn';
import fetch from '../../../../util/fetch';

// ------------------------------------
// Constants
// ------------------------------------
const COLLECTDETAIL_REQUEST = 'COLLECTDETAIL_REQUEST';
const COLLECTDETAIL_SUCCESS = 'COLLECTDETAIL_SUCCESS';
const COLLECTDETAIL_FAILURE = 'COLLECTDETAIL_FAILURE';

const initialState = {
  loading: false,
  data: [],
};

// ------------------------------------
// Actions
// ------------------------------------
export const actions = {
  search: (params) => ({
    types: [COLLECTDETAIL_REQUEST, COLLECTDETAIL_SUCCESS, COLLECTDETAIL_FAILURE],
    callAPI: () => fetch('/checkoutOrder/detail', params),
  }),
  // searchOtherService: (id) => ({
  //   types: [COLLECTDETAIL_REQUEST, COLLECTDETAIL_SUCCESS, COLLECTDETAIL_FAILURE],
  //   callAPI: () => fetch('/operationAdmin/billDetail', { orderNo: id },
  //     { serviceModal: 'purchaseAddress' }),
  // }),
};

function toRMB(moneyFen) {
  if (moneyFen === null) {
    moneyFen = 0;
  }
  return `￥${moneyFen}`;
}
// export function toRMB(moneyFen) {
//   return `￥${(moneyFen / 100).toFixed(2)}`;
// }
//
// function mergeArr(arr) {
//   const map = {}; // 存放已经放置的 spuId
//   const dest = []; // 最终的 dest 数组
//   for (let i = 0; i < arr.length; i += 1) {
//     const ai = arr[i];
//     const {
//       skuId,
//       skuType,
//       sortedFlag, // 是否完成分拣 1:完成  0:未分拣
//       skuPrice: {
//         skuPackingName,
//         skuUnitName,
//         skuPackingPrice,
//         skuUnitPrice,
//       },
//       actualNumber,
//       productName,
//     } = ai;
//
//     let total = 0;
//     let quantity = 0; // 实际发货数量
//     const expectNum = 1; // 订单件数
//     let unitPrice; // 商品单价
//     let unitName; // 商品单位
//
//     if (skuType === '1') { // 标品
//       if (sortedFlag) { // 已完成分拣
//         quantity = 1;
//       }
//       unitPrice = skuPackingPrice;
//       unitName = skuPackingName;
//     } else {
//       unitPrice = skuUnitPrice;
//       let weight = 0;
//       if (sortedFlag) { // 已完成分拣
//         total = 1;
//         weight = actuallyWeight;
//       }
//       quantity = `${weight.toFixed(2)} (${total}件)`;
//       unitName = skuUnitName;
//     }
//
//     if (!map[skuId]) {
//       dest.push({
//         skuId,
//         unitPrice,
//         actualNumber,
//         unitName,
//         productName,
//         skuType,
//         expectNum,
//       });
//       map[skuId] = skuId;
//     } else {
//       for (let j = 0; j < dest.length; j += 1) {
//         const dj = dest[j];
//         if (dj.skuId === skuId) {
//           dj.expectNum += 1; // 订单件数
//           if (skuType === '1') { // 标品
//             dj.quantity += Number(quantity);
//           } else {
//             const djOldArr = dj.quantity.split('(');
//             const djOldQuantity = parseFloat(djOldArr[0], 10); // 已分拣重量
//             const jdOldTotal = parseInt(djOldArr[1], 10); // 已分拣件数
//             const newAddArr = quantity.split('(');
//             const newQuantity = parseFloat(newAddArr[0], 10); // 本条数据分拣重量
//             dj.quantity = `${(djOldQuantity + newQuantity).toFixed(2)} (${jdOldTotal + total}件)`;
//           }
//           break;
//         }
//       }
//     }
//   }
//
//   dest.forEach((item, index) => {
//     const { skuType, unitPrice } = item;
//     const tempArr = item.quantity.toString().split('(');
//     const quantity = skuType === '1' ? parseFloat(item.quantity, 10) : parseFloat(tempArr[0], 10);
//     const price = toRMB(quantity * unitPrice);
//     dest[index] = {
//       ...item,
//       price,
//       unitPrice: toRMB(unitPrice),
//     };
//   });
//   return dest;
// }

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [COLLECTDETAIL_REQUEST] : (state) => ({
    ...state,
    loading: true,
  }),
  [COLLECTDETAIL_SUCCESS]: (state, action) => {
    const {
      productList,
      shopDiscountAmount,
      logisticsFee,
      payAmount, // 应收金额
      orderAmountTotal, // 实收金额
      allProductCost,
    } = action.data.list[0];
    const list = productList;
    return {
      ...state,
      loading: false,
      data: list,
      allProductCost: toRMB(allProductCost),
      logisticsFee: toRMB(logisticsFee),
      shopDiscountAmount: `-${toRMB(shopDiscountAmount)}`,
      payAmount: toRMB(payAmount),
      orderAmountTotal: toRMB(orderAmountTotal),
    };
  },
  [COLLECTDETAIL_FAILURE]: (state) => ({
    ...state,
    loading: false,
  }),
};

// ------------------------------------
// Reducer
// ------------------------------------


export default function reducer(state = initialState, action = {}) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
