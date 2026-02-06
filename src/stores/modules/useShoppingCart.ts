import { defineStore } from 'pinia';
import type { CartItem } from '@/src/types/api';
import { getCartList, addToCart, removeFromCart, updateCartItem, clearCart } from '@/src/api/modules/cart';
import { handleApiRequest } from '@/src/utils/helpers/request';

export interface ShoppingCartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

export const useShoppingCart = defineStore('shoppingCart', {
  state: (): ShoppingCartState => ({
    items: [],
    loading: false,
    error: null,
    lastUpdated: null
  }),
  
  getters: {
    // 购物车商品总数
    totalCount: (state): number => {
      return state.items.reduce((sum, item) => sum + (item.count || 0), 0);
    },
    
    // 购物车商品总价格
    totalPrice: (state): number => {
      return state.items.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * (item.count || 0));
      }, 0);
    },
    
    // 选中的商品
    selectedItems: (state): CartItem[] => {
      return state.items.filter(item => item.selected);
    },
    
    // 选中商品的数量
    selectedCount: (state): number => {
      return state.selectedItems.reduce((sum, item) => sum + (item.count || 0), 0);
    },
    
    // 选中商品的价格
    selectedPrice: (state): number => {
      return state.selectedItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
        return sum + (price * (item.count || 0));
      }, 0);
    },
    
    // 购物车是否为空
    isEmpty: (state): boolean => {
      return state.items.length === 0;
    },
    
    // 是否全选
    isAllSelected: (state): boolean => {
      if (state.items.length === 0) return false;
      return state.items.every(item => item.selected);
    }
  },
  
  actions: {
    /**
     * 加载购物车数据
     */
    async loadCart() {
      this.loading = true;
      this.error = null;
      
      try {
        const cartData = await handleApiRequest(() => getCartList());
        
        // 更新购物车数据
        this.items = Array.isArray(cartData) ? cartData : [];
        this.lastUpdated = Date.now();
      } catch (error: any) {
        this.error = error?.msg || error?.message || '加载购物车失败';
        console.error('加载购物车失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 添加商品到购物车
     */
    async addItem(productId: string | number, count: number = 1, productInfo?: any) {
      this.loading = true;
      
      try {
        // 先检查商品是否已在购物车中
        const existingItem = this.items.find(item => item.productId === productId);
        
        if (existingItem) {
          // 如果商品已在购物车中，更新数量
          const newCount = existingItem.count + count;
          await this.updateItem(existingItem.id, newCount);
        } else {
          // 如果商品不在购物车中，新增商品
          const result = await handleApiRequest(() => 
            addToCart({ 
              productId, 
              count, 
              ...(productInfo || {}) 
            })
          );
          
          // 添加到本地状态
          const newItem = {
            id: result.id || Date.now(),
            productId,
            count,
            selected: true, // 新添加的商品默认选中
            ...productInfo
          };
          
          this.items.push(newItem as CartItem);
          this.lastUpdated = Date.now();
        }
      } catch (error: any) {
        this.error = error?.msg || error?.message || '添加商品到购物车失败';
        console.error('添加商品到购物车失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 从购物车移除商品
     */
    async removeItem(itemId: string | number) {
      this.loading = true;
      
      try {
        // 先从后端删除
        await handleApiRequest(() => removeFromCart({ id: itemId }));
        
        // 再从本地状态删除
        this.items = this.items.filter(item => item.id !== itemId);
        this.lastUpdated = Date.now();
      } catch (error: any) {
        this.error = error?.msg || error?.message || '从购物车移除商品失败';
        console.error('从购物车移除商品失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 更新购物车商品数量
     */
    async updateItem(itemId: string | number, count: number) {
      if (count <= 0) {
        // 如果数量小于等于0，直接删除商品
        await this.removeItem(itemId);
        return;
      }
      
      this.loading = true;
      
      try {
        // 先更新后端
        await handleApiRequest(() => 
          updateCartItem({ 
            id: itemId, 
            count 
          })
        );
        
        // 再更新本地状态
        const itemIndex = this.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          this.items[itemIndex].count = count;
          this.lastUpdated = Date.now();
        }
      } catch (error: any) {
        this.error = error?.msg || error?.message || '更新购物车商品失败';
        console.error('更新购物车商品失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 清空购物车
     */
    async clear() {
      this.loading = true;
      
      try {
        // 先清空后端购物车
        await handleApiRequest(() => clearCart());
        
        // 再清空本地状态
        this.items = [];
        this.lastUpdated = Date.now();
      } catch (error: any) {
        this.error = error?.msg || error?.message || '清空购物车失败';
        console.error('清空购物车失败:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * 切换单个商品的选中状态
     */
    toggleItemSelection(itemId: string | number) {
      const item = this.items.find(item => item.id === itemId);
      if (item) {
        item.selected = !item.selected;
        this.lastUpdated = Date.now();
      }
    },
    
    /**
     * 设置所有商品的选中状态
     */
    setAllSelected(selected: boolean) {
      this.items.forEach(item => {
        item.selected = selected;
      });
      this.lastUpdated = Date.now();
    },
    
    /**
     * 批量设置商品选中状态
     */
    setItemsSelected(itemIds: (string | number)[], selected: boolean) {
      this.items.forEach(item => {
        if (itemIds.includes(item.id)) {
          item.selected = selected;
        }
      });
      this.lastUpdated = Date.now();
    },
    
    /**
     * 根据商品ID获取购物车项
     */
    getItemByProductId(productId: string | number): CartItem | undefined {
      return this.items.find(item => item.productId === productId);
    },
    
    /**
     * 检查商品是否在购物车中
     */
    isProductInCart(productId: string | number): boolean {
      return this.items.some(item => item.productId === productId);
    }
  },

  // 持久化存储配置
  persist: {
    key: 'shopping-cart',
    storage: uni.getStorageSync ? uni : localStorage,
    paths: ['items'] // 只持久化购物车商品
  }
});