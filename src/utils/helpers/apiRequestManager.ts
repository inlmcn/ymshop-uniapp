import { requestUtil } from './request';
import { apiCache } from './apiCache';
import type { RequestOptions, ApiResponse } from '@/types/utils';

/**
 * API请求管理器
 * 用于统一管理API请求，提供请求队列、缓存、重试等功能
 */
export class ApiRequestManager {
  // 请求队列，用于管理并发请求
  private requestQueue: Map<string, Promise<any>> = new Map();
  
  // 请求配置
  private defaultRetryTimes: number = 1;
  private defaultRetryDelay: number = 1000; // 毫秒

  /**
   * 发起API请求
   */
  async request<T = any>(
    options: RequestOptions,
    requestOptions: {
      useCache?: boolean;
      cacheTTL?: number;
      retryTimes?: number;
      retryDelay?: number;
      deduplicate?: boolean; // 是否去重
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      useCache = true,
      cacheTTL,
      retryTimes = this.defaultRetryTimes,
      retryDelay = this.defaultRetryDelay,
      deduplicate = true
    } = requestOptions;

    // 生成请求标识符
    const requestId = this.generateRequestId(options);

    // 如果启用去重且已有相同请求在进行中，返回正在进行的请求
    if (deduplicate && this.requestQueue.has(requestId)) {
      return this.requestQueue.get(requestId);
    }

    // 如果启用缓存，先尝试从缓存获取
    if (useCache) {
      const cacheKey = apiCache.generateKey(options.url, options.data);
      const cachedResult = apiCache.get(cacheKey);
      
      if (cachedResult) {
        return cachedResult;
      }
    }

    // 创建请求Promise
    const requestPromise = this.executeRequest<T>(options, retryTimes, retryDelay)
      .then(result => {
        // 请求成功后，如果是GET请求且启用了缓存，则存入缓存
        if (useCache && options.method?.toUpperCase() === 'GET') {
          const cacheKey = apiCache.generateKey(options.url, options.data);
          apiCache.set(cacheKey, result, cacheTTL);
        }
        return result;
      })
      .catch(error => {
        throw error;
      })
      .finally(() => {
        // 请求完成后，从队列中移除
        this.requestQueue.delete(requestId);
      });

    // 将请求加入队列
    if (deduplicate) {
      this.requestQueue.set(requestId, requestPromise);
    }

    return requestPromise;
  }

  /**
   * 执行实际的API请求（带重试机制）
   */
  private async executeRequest<T = any>(
    options: RequestOptions,
    remainingRetries: number,
    retryDelay: number
  ): Promise<ApiResponse<T>> {
    try {
      let result: ApiResponse<T>;
      
      switch (options.method?.toUpperCase()) {
        case 'GET':
          result = await requestUtil.get<T>(options.url, options.data);
          break;
        case 'POST':
          result = await requestUtil.post<T>(options.url, options.data);
          break;
        case 'PUT':
          result = await requestUtil.put<T>(options.url, options.data);
          break;
        case 'DELETE':
          result = await requestUtil.delete<T>(options.url, options.data);
          break;
        default:
          result = await requestUtil.get<T>(options.url, options.data);
      }
      
      return result;
    } catch (error) {
      // 如果还有重试次数，延迟后重试
      if (remainingRetries > 0) {
        await this.delay(retryDelay);
        return this.executeRequest<T>(options, remainingRetries - 1, retryDelay * 1.5); // 指数退避
      }
      
      // 重试次数用完，抛出错误
      throw error;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成请求标识符
   */
  private generateRequestId(options: RequestOptions): string {
    const sortedData = this.sortObjectKeys(options.data || {});
    return `${options.method}_${options.url}_${JSON.stringify(sortedData)}`;
  }

  /**
   * 对对象键进行排序，确保相同的参数生成相同的键
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }
    const sortedKeys = Object.keys(obj).sort();
    const sortedObj: any = {};
    sortedKeys.forEach(key => {
      sortedObj[key] = this.sortObjectKeys(obj[key]);
    });
    return sortedObj;
  }

  /**
   * 并发请求
   */
  async concurrent<T = any>(
    requests: Array<RequestOptions>,
    options: {
      concurrency?: number; // 并发数限制
      useCache?: boolean;
      cacheTTL?: number;
    } = {}
  ): Promise<Array<ApiResponse<T>>> {
    const { concurrency = 5, useCache = true, cacheTTL } = options;
    
    const results: Array<ApiResponse<T>> = [];
    
    // 分批处理请求
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      const batchPromises = batch.map(req => 
        this.request<T>(req, { useCache, cacheTTL })
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    
    return results;
  }

  /**
   * 设置默认重试次数
   */
  setDefaultRetryTimes(times: number): void {
    this.defaultRetryTimes = times;
  }

  /**
   * 设置默认重试延迟
   */
  setDefaultRetryDelay(delay: number): void {
    this.defaultRetryDelay = delay;
  }

  /**
   * 取消所有待处理的请求
   */
  cancelAllPendingRequests(): void {
    requestUtil.cancelAllRequests();
    this.requestQueue.clear();
  }

  /**
   * 获取当前待处理的请求数量
   */
  getPendingRequestCount(): number {
    return this.requestQueue.size;
  }

  /**
   * 清理过期的缓存
   */
  cleanupCache(): void {
    apiCache.cleanup();
  }
}

// 创建全局API请求管理器实例
export const apiRequestManager = new ApiRequestManager();