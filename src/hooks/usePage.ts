import { ref, reactive, computed } from 'vue';
import type { Ref } from 'vue';
import type { Order, ApiResponse, PaginatedResponse } from '@/src/types/api';
import { debounce } from 'lodash-es';

/**
 * 页面数据管理Hook
 * 用于处理列表数据的加载、分页、刷新等功能
 */
export function usePage<T = any>(apiFunc: (params: any) => Promise<ApiResponse<PaginatedResponse<T> | T[]>>) {
  // 分页参数
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    loadend: false,
  });

  // 数据列表
  const dataList: Ref<T[]> = ref([]);
  
  // 类型筛选
  const type = ref(-1);
  
  // 列表是否为空
  const listEmpty = computed(() => dataList.value.length <= 0);
  
  // 加载状态
  const loading = computed(() => pagination.loading);
  const loadend = computed(() => pagination.loadend);

  /**
   * 刷新数据（清空后重新加载第一页）
   */
  const refresh = async () => {
    try {
      pagination.page = 1;
      pagination.hasMore = true;
      pagination.loadend = false;
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: type.value
      };
      
      pagination.loading = true;
      const response = await apiFunc(params);
      
      if (response && Array.isArray(response.data)) {
        dataList.value = [...response];
      } else if (response && response.data && Array.isArray(response.data.list)) {
        dataList.value = [...response.data.list];
        pagination.hasMore = response.data.hasMore ?? false;
      } else {
        dataList.value = [];
        pagination.hasMore = false;
      }
      
      // 检查是否已加载完所有数据
      if ((response.data?.list?.length ?? response.length) < pagination.pageSize) {
        pagination.loadend = true;
        pagination.hasMore = false;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      dataList.value = [];
      pagination.hasMore = false;
    } finally {
      pagination.loading = false;
    }
  };

  /**
   * 加载更多数据
   */
  const loadMore = async () => {
    if (pagination.loading || !pagination.hasMore) {
      return;
    }

    try {
      pagination.loading = true;
      pagination.page++;

      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        type: type.value
      };

      const response = await apiFunc(params);

      if (response && Array.isArray(response.data)) {
        dataList.value.push(...response);
      } else if (response && response.data && Array.isArray(response.data.list)) {
        dataList.value.push(...response.data.list);
        pagination.hasMore = response.data.hasMore ?? false;
      }

      // 检查是否已加载完所有数据
      if ((response.data?.list?.length ?? response.length) < pagination.pageSize) {
        pagination.loadend = true;
        pagination.hasMore = false;
      }
    } catch (error) {
      console.error('加载更多数据失败:', error);
      pagination.page--; // 回滚页码
    } finally {
      pagination.loading = false;
    }
  };

  /**
   * 带防抖的刷新函数
   */
  const debounceRefresh = debounce(refresh, 300);

  /**
   * 更新指定索引的数据项
   */
  const updateItem = (index: number, newData: Partial<T>) => {
    if (index >= 0 && index < dataList.value.length) {
      dataList.value[index] = { ...dataList.value[index], ...newData };
    }
  };

  /**
   * 删除指定索引的数据项
   */
  const removeItem = (index: number) => {
    if (index >= 0 && index < dataList.value.length) {
      dataList.value.splice(index, 1);
    }
  };

  /**
   * 根据条件查找数据项索引
   */
  const findIndex = (predicate: (item: T) => boolean): number => {
    return dataList.value.findIndex(predicate);
  };

  /**
   * 根据条件查找数据项
   */
  const find = (predicate: (item: T) => boolean): T | undefined => {
    return dataList.value.find(predicate);
  };

  return {
    // 响应式数据
    type,
    dataList,
    loading,
    loadend,
    listEmpty,
    
    // 方法
    refresh,
    loadMore,
    debounceRefresh,
    updateItem,
    removeItem,
    findIndex,
    find,
    
    // 分页信息
    pagination: {
      get page() { return pagination.page; },
      get pageSize() { return pagination.pageSize; },
      get hasMore() { return pagination.hasMore; },
    }
  };
}

/**
 * 专门用于订单列表的Hook
 */
export function useOrderPage(apiFunc: (params: any) => Promise<any>) {
  const pageHook = usePage(apiFunc);
  
  /**
   * 获取特定状态的订单
   */
  const getOrdersByStatus = (status: number) => {
    return pageHook.dataList.value.filter((order: any) => order.status === status);
  };

  /**
   * 更新订单状态
   */
  const updateOrderStatus = (orderId: string | number, newStatus: number) => {
    const index = pageHook.findIndex((order: any) => order.id === orderId);
    if (index !== -1) {
      pageHook.updateItem(index, { status: newStatus });
    }
  };

  return {
    ...pageHook,
    getOrdersByStatus,
    updateOrderStatus
  };
}