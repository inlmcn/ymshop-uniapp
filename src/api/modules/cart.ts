import { BaseApi } from '@/src/api/base';
import type { CartItem, ApiResponse } from '@/src/types/api';

/**
 * 购物车API类
 * 继承自BaseApi，提供购物车相关的API方法
 */
class CartApi extends BaseApi {
  /**
   * 获取购物车列表
   */
  async list(): Promise<CartItem[]> {
    return this.get('/cart/list');
  }

  /**
   * 添加商品到购物车
   */
  async add(data: { productId: string | number; count: number; [key: string]: any }): Promise<any> {
    return this.post('/cart/add', data);
  }

  /**
   * 更新购物车商品数量
   */
  async update(data: { id: string | number; count: number; [key: string]: any }): Promise<any> {
    return this.post('/cart/update', data);
  }

  /**
   * 从购物车移除商品
   */
  async remove(data: { id: string | number }): Promise<any> {
    return this.post('/cart/remove', data);
  }

  /**
   * 清空购物车
   */
  async clear(): Promise<any> {
    return this.post('/cart/clear');
  }

  /**
   * 获取购物车商品数量
   */
  async getCount(): Promise<number> {
    return this.get('/cart/count');
  }

  /**
   * 批量操作购物车
   */
  async batchOperate(data: { action: string; ids: (string | number)[]; [key: string]: any }): Promise<any> {
    return this.post('/cart/batch', data);
  }
}

// 创建购物车API实例
export const cartApi = new CartApi();

// 导出原有函数接口，保持向后兼容
export const getCartList = () => cartApi.list();
export const addToCart = (data: any) => cartApi.add(data);
export const removeFromCart = (data: any) => cartApi.remove(data);
export const updateCartItem = (data: any) => cartApi.update(data);
export const clearCart = () => cartApi.clear();
export const getCartCount = () => cartApi.getCount();
export const batchCartOperate = (data: any) => cartApi.batchOperate(data);