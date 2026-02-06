/**
 * 保持向后兼容的useShoppingCart入口文件
 * 用于支持旧的导入路径
 */

// 导出TypeScript版本的useShoppingCart，但提供JavaScript兼容接口
import { useShoppingCart as useShoppingCartTs } from './useShoppingCart';

export function useShoppingCart() {
  const store = useShoppingCartTs();
  
  return store;
}