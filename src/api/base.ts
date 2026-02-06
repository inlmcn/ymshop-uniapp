import { requestUtil, handleApiRequest } from '@/src/utils/helpers/request';
import type { ApiResponse } from '@/src/types/api';

/**
 * API基类
 * 提供通用的API请求方法
 */
export abstract class BaseApi {
  /**
   * GET请求
   */
  protected async get<T = any>(url: string, params?: any): Promise<T> {
    return requestUtil.get<T>(url, params).then(res => res.data);
  }

  /**
   * POST请求
   */
  protected async post<T = any>(url: string, data?: any): Promise<T> {
    return requestUtil.post<T>(url, data).then(res => res.data);
  }

  /**
   * PUT请求
   */
  protected async put<T = any>(url: string, data?: any): Promise<T> {
    return requestUtil.put<T>(url, data).then(res => res.data);
  }

  /**
   * DELETE请求
   */
  protected async delete<T = any>(url: string, params?: any): Promise<T> {
    return requestUtil.delete<T>(url, params).then(res => res.data);
  }

  /**
   * 带错误处理的GET请求
   */
  protected async safeGet<T = any>(
    url: string, 
    params?: any, 
    options?: { showError?: boolean; showLoading?: boolean }
  ): Promise<T | null> {
    try {
      return await handleApiRequest(
        () => requestUtil.get<T>(url, params),
        { ...options, loadingText: '加载中...' }
      );
    } catch (error) {
      console.error(`GET request failed: ${url}`, error);
      return null;
    }
  }

  /**
   * 带错误处理的POST请求
   */
  protected async safePost<T = any>(
    url: string, 
    data?: any, 
    options?: { showError?: boolean; showLoading?: boolean }
  ): Promise<T | null> {
    try {
      return await handleApiRequest(
        () => requestUtil.post<T>(url, data),
        { ...options, loadingText: '提交中...' }
      );
    } catch (error) {
      console.error(`POST request failed: ${url}`, error);
      return null;
    }
  }

  /**
   * 上传文件
   */
  protected async uploadFile(
    url: string,
    filePath: string,
    name?: string,
    formData?: Record<string, any>
  ) {
    return requestUtil.upload({ url, filePath, name, formData });
  }
}

/**
 * 分页API基类
 * 提供分页相关的通用方法
 */
export abstract class PaginatedApi<T = any> extends BaseApi {
  /**
   * 获取分页数据
   */
  protected async getPagedList(
    url: string,
    page: number = 1,
    pageSize: number = 10,
    params?: any
  ): Promise<{ list: T[]; total: number; hasMore: boolean }> {
    const queryParams = {
      ...params,
      page,
      pageSize
    };

    const result = await this.get(url, queryParams);
    
    // 根据后端返回格式进行适配
    if (result && typeof result === 'object') {
      if ('list' in result && 'total' in result) {
        // 符合 { list: [], total: 0 } 格式
        return {
          list: result.list || [],
          total: result.total || 0,
          hasMore: (result.list?.length || 0) === pageSize
        };
      } else if (Array.isArray(result)) {
        // 直接返回数组
        return {
          list: result,
          total: result.length,
          hasMore: result.length === pageSize
        };
      }
    }

    // 默认返回
    return {
      list: Array.isArray(result) ? result : [],
      total: Array.isArray(result) ? result.length : 0,
      hasMore: false
    };
  }
}