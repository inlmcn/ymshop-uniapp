/**
 * Store 统一入口文件
 */
import { createPinia } from "pinia";

// 导入各个模块的store
export * from './modules/useMainStore';
export * from './modules/useShoppingCart';
export * from './modules/useActivityPageStore';
export * from './modules/useGlobalRequestStore';

// 创建Pinia实例
const store = createPinia();

export default store;