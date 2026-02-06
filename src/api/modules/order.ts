import { PaginatedApi } from '@/src/api/base';
import type { Order, ApiResponse } from '@/src/types/api';

/**
 * 订单API类
 * 继承自PaginatedApi，提供订单相关的API方法
 */
class OrderApi extends PaginatedApi<Order> {
  /**
   * 订单确认
   */
  async confirm(data: { key: string; [key: string]: any }): Promise<any> {
    return this.post('/order/confirm', data);
  }

  /**
   * 订单创建
   */
  async create(data: { key: string; [key: string]: any }): Promise<any> {
    return this.post(`/order/create/${data.key}`, data);
  }

  /**
   * 个人中心订单统计
   */
  async userCount(data: any): Promise<any> {
    return this.post(`/order/user_count`, data);
  }

  /**
   * 订单列表
   */
  async list(data: { type?: number; page?: number; pageSize?: number; [key: string]: any }): Promise<any> {
    return this.get(`/order/list`, data);
  }

  /**
   * 计算订单金额
   */
  async computed(data: { key: string; [key: string]: any }): Promise<any> {
    return this.post(`/order/computed/${data.key}`, data);
  }

  /**
   * 计算详情
   */
  async info(data: { key: string; [key: string]: any }): Promise<any> {
    return this.get(`/order/detail/${data.key}`, data);
  }

  /**
   * 取消订单
   */
  async cancel(data: { orderId: string | number; [key: string]: any }): Promise<boolean> {
    try {
      await this.post(`/order/cancel`, data);
      return true;
    } catch (error) {
      console.error('取消订单失败:', error);
      return false;
    }
  }

  /**
   * 订单收货
   */
  async take(data: { orderId: string | number; [key: string]: any }): Promise<boolean> {
    try {
      await this.post(`/order/take`, data);
      return true;
    } catch (error) {
      console.error('确认收货失败:', error);
      return false;
    }
  }

  /**
   * 订单评价
   */
  async comments(data: any): Promise<any> {
    return this.post(`/order/comments`, data);
  }

  /**
   * 订单删除
   */
  async delete(data: { id: string | number; [key: string]: any }): Promise<boolean> {
    try {
      await this.deleteRequest(`/order/del`, data);
      return true;
    } catch (error) {
      console.error('删除订单失败:', error);
      return false;
    }
  }

  /**
   * 取消订单（核销）
   */
  async cancelAfterVerification(data: any): Promise<any> {
    return this.post(`/order/refund`, data);
  }

  /**
   * 申请售后
   */
  async applyForAfterSales(data: any): Promise<any> {
    return this.post(`/after/applyForAfterSales`, data);
  }

  /**
   * 售后产品列表
   */
  async applyForAfterSalesInfo(data: any): Promise<any> {
    return this.post(`/after/applyForAfterSales/get`, data);
  }

  /**
   * 售后列表
   */
  async storeAfterSalesList(data: any): Promise<any> {
    return this.get(`/after/storeAfterSales/list`, data);
  }

  /**
   * 售后订单详情
   */
  async checkForAfterSalesInfo(data: { key: string; [key: string]: any }): Promise<any> {
    return this.get(`/after/checkForAfterSales/${data.key}`, data);
  }

  /**
   * 撤销申请
   */
  async afterSalesOrderRevoke(data: { key: string; id: string | number }): Promise<any> {
    return this.get(`/after/revoke/${data.key}/${data.id}`, {});
  }

  /**
   * 删除记录
   */
  async afterSalesOrderDelete(data: { id: string | number; orderCode: string }): Promise<boolean> {
    try {
      await this.delete(`/after/deleteAfterSalesOrder?id=${data.id}&orderCode=${data.orderCode}`, data);
      return true;
    } catch (error) {
      console.error('删除售后记录失败:', error);
      return false;
    }
  }

  /**
   * 添加物流信息
   */
  async addLogisticsInformation(data: any): Promise<any> {
    return this.post(`/after/addLogisticsInformation`, data);
  }

  /**
   * 获取快递列表
   */
  async getExpress(): Promise<any> {
    return this.get("/order/express/list", {});
  }

  /**
   * 订单支付
   */
  async pay(data: any): Promise<any> {
    return this.post(`/order/pay`, data);
  }

  /**
   * 物流信息
   */
  async express(data: any): Promise<any> {
    return this.post(`/order/order/express`, data);
  }

  /**
   * 新版物流信息
   */
  async newExpress(data: { key: string; [key: string]: any }): Promise<any> {
    return this.get(`/order/getExpress/${data.key}`, data);
  }

  // ===================== 支付相关API ==========================
  /**
   * 统一支付接口
   */
  async payOrder(data: any): Promise<any> {
    return this.post(`/pay/payment`, data);
  }

  /**
   * 检查支付
   */
  async checkPay(data: any): Promise<any> {
    return this.post(`/order/pay/orderQuery`, data);
  }

  /**
   * 检查充值
   */
  async checkRecharge(data: any): Promise<any> {
    return this.get(`/recharge-order/isPay`, data);
  }

  /**
   * 修改订单地址
   */
  async editOrderAddress(data: any): Promise<any> {
    return this.post(`/order/edit/address`, data);
  }

  /**
   * 获取模板列表
   */
  async getTemplate(): Promise<any> {
    return this.get("/template/list", {});
  }

  /**
   * 订单关联B站trackId
   */
  async orderBindingBiliTrackId(data: { orderId: string | number; trackId: string }): Promise<any> {
    return this.get('/advertisement/bili/binding/relation', data);
  }

  /**
   * 订单追评
   */
  async orderFollowUpComment(data: any): Promise<any> {
    return this.post(`/order/follow/comments`, data);
  }

  /**
   * 获取订单评论数据
   */
  async getOrderComments(oId: string | number): Promise<any> {
    return this.get(`/order/evaluation/follow/data`, { oId });
  }

  /**
   * 获取方案页下单起售金额
   */
  async getPlanOrderMinAmount(): Promise<any> {
    return this.get('/order/getOrderMinAmount');
  }

  /**
   * 获取方案页下单起售数
   */
  async getPlanOrderMinCount(): Promise<any> {
    return this.get('/order/getOrderMinProductNum');
  }

  /**
   * 使用DELETE方法的辅助方法（因为成员方法名不能和HTTP方法名冲突）
   */
  private async deleteRequest(url: string, data?: any) {
    return this.delete(url, data);
  }
}

// 创建订单API实例
export const orderApi = new OrderApi();

// 导出原有函数接口，保持向后兼容
export const orderConfirm = (data: any) => orderApi.confirm(data);
export const orderCreate = (data: any) => orderApi.create(data);
export const orderUserCount = (data: any) => orderApi.userCount(data);
export const orderList = (data: any) => orderApi.list(data);
export const orderComputed = (data: any) => orderApi.computed(data);
export const orderInfo = (data: any) => orderApi.info(data);
export const orderCancel = (data: any) => orderApi.cancel(data);
export const orderTake = (data: any) => orderApi.take(data);
export const orderComments = (data: any) => orderApi.comments(data);
export const orderDelete = (data: any) => orderApi.delete(data);
export const cancelAfterVerification = (data: any) => orderApi.cancelAfterVerification(data);
export const applyForAfterSales = (data: any) => orderApi.applyForAfterSales(data);
export const applyForAfterSalesInfo = (data: any) => orderApi.applyForAfterSalesInfo(data);
export const storeAfterSalesList = (data: any) => orderApi.storeAfterSalesList(data);
export const checkForAfterSalesInfo = (data: any) => orderApi.checkForAfterSalesInfo(data);
export const afterSalesOrderRevoke = (data: any) => orderApi.afterSalesOrderRevoke(data);
export const afterSalesOrderDelete = (data: any) => orderApi.afterSalesOrderDelete(data);
export const addLogisticsInformation = (data: any) => orderApi.addLogisticsInformation(data);
export const getExpress = () => orderApi.getExpress();
export const orderPay = (data: any) => orderApi.pay(data);
export const orderExpress = (data: any) => orderApi.express(data);
export const orderNewExpress = (data: any) => orderApi.newExpress(data);

// 支付相关导出
export const payOrder = (data: any) => orderApi.payOrder(data);
export const checkPay = (data: any) => orderApi.checkPay(data);
export const checkRecharge = (data: any) => orderApi.checkRecharge(data);
export const editOrderAddress = (data: any) => orderApi.editOrderAddress(data);
export const getTemplate = () => orderApi.getTemplate();
export const orderBindingBiliTrackId = (data: any) => orderApi.orderBindingBiliTrackId(data);
export const orderFollowUpComment = (data: any) => orderApi.orderFollowUpComment(data);
export const getOrderComments = (oId: any) => orderApi.getOrderComments(oId);
export const getPlanOrderMinAmount = () => orderApi.getPlanOrderMinAmount();
export const getPlanOrderMinCount = () => orderApi.getPlanOrderMinCount();