import { requestUtil } from "@/utils/request";

/**
 * 订单确认
 */
export function orderConfirm(data) {
  return requestUtil.post("/order/confirm", data);
}

/**
 * 订单创建
 */
export function orderCreate(data) {
  return requestUtil.post(`/order/create/${data.key}`, data);
}

/**
 * 个人中心订单统计
 */
export function orderUserCount(data) {
  return requestUtil.post(`/order/user_count`, data);
}

/**
 * 订单列表
 */
export function orderList(data) {
  return requestUtil.get(`/order/list`, data);
}

/**
 * 计算订单金额
 */
export function orderComputed(data) {
  return requestUtil.post(`/order/computed/${data.key}`, data);
}

/**
 * 计算详情
 */
export function orderInfo(data) {
  return requestUtil.get(`/order/detail/${data.key}`, data);
}

/**
 * 取消订单
 */
export function orderCancel(data) {
  return requestUtil.post(`/order/cancel`, data);
}

/**
 * 订单收货
 */
export function orderTake(data) {
  return requestUtil.post(`/order/take`, data);
}

/**
 * 订单评价
 */
export function orderComments(data) {
  return requestUtil.post(`/order/comments`, data);
}

/**
 * 订单删除
 */
export function orderDelete(data) {
  return requestUtil.delete(`/order/del`, data);
}

/**
 * 取消订单 hexiao
 */
export function cancelAfterVerification(data) {
  return requestUtil.post(`/order/refund`, data);
}

/**
 * 申请售后
 */
export function applyForAfterSales(data) {
  return requestUtil.post(`/after/applyForAfterSales`, data);
}

/**
 * 售后产品列表
 */
export function applyForAfterSalesInfo(data) {
  return requestUtil.post(`/after/applyForAfterSales/get`, data);
}

/**
 * 售后列表
 */
export function storeAfterSalesList(data) {
  return requestUtil.get(`/after/storeAfterSales/list`, data);
}

/**
 * 售后订单详情
 */
export function checkForAfterSalesInfo(data) {
  return requestUtil.get(`/after/checkForAfterSales/${data.key}`, data);
}

/**
 * 撤销申请
 */
export function afterSalesOrderRevoke(data) {
  return requestUtil.get(`/after/revoke/${data.key}/${data.id}`, {});
}

/**
 * 删除记录
 */
export function afterSalesOrderDelete(data) {
  return requestUtil.delete(
    `/after/deleteAfterSalesOrder?id=${data.id}&orderCode=${data.orderCode}`,
    data
  );
}

/**
 * 添加物流信息
 */
export function addLogisticsInformation(data) {
  return requestUtil.post(`/after/addLogisticsInformation`, data);
}

/**
 * 获取快递列表
 */
export function getExpress() {
  return requestUtil.get("/order/express/list", {});
}

/**
 * 订单支付
 */
export function orderPay(data) {
  return requestUtil.post(`/order/pay`, data);
}

/**
 * 物流信息
 */
export function orderExpress(data) {
  return requestUtil.post(`/order/order/express`, data);
}
/**
 * 物流信息
 */
export function orderNewExpress(data) {
  return requestUtil.get(`/order/getExpress/${data.key}`, data);
}
// ===================== 👇 by kahu ==========================
/**
 * 统一支付接口
 * @param data
 * @returns {*}
 */
export const payOrder = (data) => requestUtil.post(`/pay/payment`, data);

/**
 * 检查支付
 * @param data
 * @returns {*}
 */
export const checkPay = (data) =>
  requestUtil.post(`/order/pay/orderQuery`, data);

/**
 * 检查充值
 * @param data
 * @return {Promise<*>}
 */
export const checkRecharge = (data) =>
  requestUtil.get(`/recharge-order/isPay`, data);

/**
 * 修改订单地址
 * @param data
 * @returns {*}
 */
export const editOrderAddress = (data) =>
  requestUtil.post(`/order/edit/address`, data);

export function getTemplate() {
  return requestUtil.get("/template/list", {});
}

/**
 * 订单关联B站trackId
 * @param data
 * @param data.orderId: 订单ID
 * @param data.trackId: B站trackId
 */
export const orderBindingBiliTrackId = (data) =>
  requestUtil.get('/advertisement/bili/binding/relation', data);


/**
 * 订单追评
 * @param data - 追评数据
 */
export const orderFollowUpComment = (data) =>
  requestUtil.post(`/order/follow/comments`, data);

/**
 * 获取订单评论数据
 */
export const getOrderComments = (oId) =>
  requestUtil.get(`/order/evaluation/follow/data`, {
    oId
  });
/**
 * 获取方案页下单起售金额
 */
export const getPlanOrderMinAmount = () =>
  requestUtil.get('/order/getOrderMinAmount');

/**
 * 获取方案页下单起售数
 */
export const getPlanOrderMinCount = () =>
  requestUtil.get('/order/getOrderMinProductNum');