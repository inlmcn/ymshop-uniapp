/**
 * 项目常量定义
 */

// 订单状态常量
export const ORDER_STATUS = {
  ALL: -1,
  PENDING_PAYMENT: 0,
  PENDING_SHIPMENT: 1,
  PENDING_RECEIPT: 2,
  PENDING_REVIEW: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  REFUNDING: 6,
  REFUNDED: 7
};

export const ORDER_STATUS_TEXT = {
  [ORDER_STATUS.PENDING_PAYMENT]: '未支付',
  [ORDER_STATUS.PENDING_SHIPMENT]: '待发货',
  [ORDER_STATUS.PENDING_RECEIPT]: '待收货',
  [ORDER_STATUS.PENDING_REVIEW]: '待评价',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
  [ORDER_STATUS.REFUNDING]: '退款中',
  [ORDER_STATUS.REFUNDED]: '已退款'
};

// HTTP 请求方法常量
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
};

// 页面常量
export const PAGE_PATHS = {
  HOME: '/root/index/index',
  PRODUCT: '/root/product/index',
  USER: '/root/user/user',
  CART: '/pages/shoppingCartJump/shoppingCart',
  LOGIN: '/pages/login/index'
};

// 本地存储键名常量
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  USER_INFO: 'userInfo',
  CART_DATA: 'cartData',
  SELECTED_ADDRESS: 'selectedAddress'
};