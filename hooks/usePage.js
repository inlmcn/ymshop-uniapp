/**
 * 保持向后兼容的usePage入口文件
 * 用于支持旧的导入路径
 */

// 导出TypeScript版本的usePage，但提供JavaScript兼容接口
import { usePage as usePageTs, useOrderPage as useOrderPageTs } from '../src/hooks/usePage';

export function usePage(apiFunc) {
  const hook = usePageTs(apiFunc);
  
  // 将TypeScript版本的返回值适配为JavaScript兼容格式
  return {
    type: hook.type,
    dataList: hook.dataList,
    loading: hook.loading,
    loadend: hook.loadend,
    listEmpty: hook.listEmpty,
    refresh: hook.refresh,
    debounceRefresh: hook.debounceRefresh,
    pagination: hook.pagination
  };
}

export function useOrderPage(apiFunc) {
  const hook = useOrderPageTs(apiFunc);
  
  return {
    type: hook.type,
    dataList: hook.dataList,
    loading: hook.loading,
    loadend: hook.loadend,
    listEmpty: hook.listEmpty,
    refresh: hook.refresh,
    debounceRefresh: hook.debounceRefresh,
    getOrdersByStatus: hook.getOrdersByStatus,
    updateOrderStatus: hook.updateOrderStatus,
    pagination: hook.pagination
  };
}