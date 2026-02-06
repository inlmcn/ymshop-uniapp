/**
 * 保持向后兼容的订单API入口文件
 * 用于支持旧的导入路径
 */

// 导出TypeScript版本的API，但提供JavaScript兼容接口
import * as orderApiModule from '../../src/api/modules/order';

// 直接导出所有API函数
export const orderConfirm = orderApiModule.orderConfirm;
export const orderCreate = orderApiModule.orderCreate;
export const orderUserCount = orderApiModule.orderUserCount;
export const orderList = orderApiModule.orderList;
export const orderComputed = orderApiModule.orderComputed;
export const orderInfo = orderApiModule.orderInfo;
export const orderCancel = orderApiModule.orderCancel;
export const orderTake = orderApiModule.orderTake;
export const orderComments = orderApiModule.orderComments;
export const orderDelete = orderApiModule.orderDelete;
export const cancelAfterVerification = orderApiModule.cancelAfterVerification;
export const applyForAfterSales = orderApiModule.applyForAfterSales;
export const applyForAfterSalesInfo = orderApiModule.applyForAfterSalesInfo;
export const storeAfterSalesList = orderApiModule.storeAfterSalesList;
export const checkForAfterSalesInfo = orderApiModule.checkForAfterSalesInfo;
export const afterSalesOrderRevoke = orderApiModule.afterSalesOrderRevoke;
export const afterSalesOrderDelete = orderApiModule.afterSalesOrderDelete;
export const addLogisticsInformation = orderApiModule.addLogisticsInformation;
export const getExpress = orderApiModule.getExpress;
export const orderPay = orderApiModule.orderPay;
export const orderExpress = orderApiModule.orderExpress;
export const orderNewExpress = orderApiModule.orderNewExpress;

// 支付相关导出
export const payOrder = orderApiModule.payOrder;
export const checkPay = orderApiModule.checkPay;
export const checkRecharge = orderApiModule.checkRecharge;
export const editOrderAddress = orderApiModule.editOrderAddress;
export const getTemplate = orderApiModule.getTemplate;
export const orderBindingBiliTrackId = orderApiModule.orderBindingBiliTrackId;
export const orderFollowUpComment = orderApiModule.orderFollowUpComment;
export const getOrderComments = orderApiModule.getOrderComments;
export const getPlanOrderMinAmount = orderApiModule.getPlanOrderMinAmount;
export const getPlanOrderMinCount = orderApiModule.getPlanOrderMinCount;