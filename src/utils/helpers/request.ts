import { VUE_APP_API_URL, VUE_APP_UPLOAD_URL } from "@/config";
import cookie from "@/utils/helpers/cookie";
import { handleLoginFailure } from "@/utils";
import qs from 'qs';
import { apiCache } from './apiCache';
import type { RequestOptions, ApiResponse, ApiResponseOptions } from '@/types/utils';

function baseUrl() {
  let url;
  // #ifdef H5
  // h5开发环境直接走代理 vite.config.js
  if (process.env.NODE_ENV === 'development') {
    url = '/HealthCoast-api';
  } else {
    url = VUE_APP_API_URL;
  }
  // #endif
  // #ifndef H5
  url = VUE_APP_API_URL;
  // #endif
  return url;
}

class RequestUtil {
  // 超时时间（毫秒）
  requestTimeout = 60000;
  // 默认参数
  defaultOptions: Partial<RequestOptions> = {};
  // 是否启用缓存
  enableCache = true;

  // 请求队列，用于请求去重
  private pendingRequests = new Map<string, UniApp.RequestTask>();

  /**
   * 生成请求唯一标识
   */
  private getRequestKey(options: RequestOptions): string {
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
   * 取消挂起的请求
   */
  private cancelPendingRequest(requestKey: string) {
    const requestTask = this.pendingRequests.get(requestKey);
    if (requestTask) {
      requestTask.abort();
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * 请求
   * @param options
   * @return {Promise<any>}
   */
  doRequest<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
    const requestKey = this.getRequestKey(options);
    
    // 如果相同请求正在发送，则取消之前的请求（防止重复提交）
    if (this.pendingRequests.has(requestKey)) {
      this.cancelPendingRequest(requestKey);
    }

    options = this.beforeRequest(options);

    return new Promise<ApiResponse<T>>((resolve, reject) => {
      const requestTask = uni.request({
        ...options,
        url: `${baseUrl()}${options.url}`,
        timeout: this.requestTimeout,
        success: (res) => {
          this.pendingRequests.delete(requestKey);
          this.afterResponse<T>(res, resolve, reject);
        },
        fail: (err) => {
          this.pendingRequests.delete(requestKey);
          uni.showToast({ title: '请求出错了', icon: 'none' });
          console.error('Request failed:', err);
          reject(err);
        }
      });

      // 存储请求任务，用于去重和取消
      this.pendingRequests.set(requestKey, requestTask);
    });
  }

  /**
   * 外部绝对地址请求（不拼接 baseUrl，不走业务后端 code 拦截）
   * 适用于第三方平台（例如腾讯广告等）
   * @param options { url: string, method?: 'GET'|'POST'|'PUT'|'DELETE', header?: object, data?: any }
   * @return {Promise<any>} 直接返回 res.data
   */
  external<T = any>(options: Omit<RequestOptions, 'url'> & { url: string }): Promise<T> {
    // 合并默认项，但不附加 Authorization，也不拼接 baseUrl
    const reqOptions = {
      timeout: this.requestTimeout,
      ...options,
    } as RequestOptions;
    
    return new Promise<T>((resolve, reject) => {
      uni.request({
        ...reqOptions,
        success: (res) => {
          if (res.statusCode !== 200) {
            reject(res.data);
            return;
          }
          resolve(res.data as T);
        },
        fail: (err) => {
          console.error('External request failed:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 请求拦截器
   * @param options
   */
  beforeRequest(options: RequestOptions): RequestOptions {
    // 合并options，用户优先
    options = {
      header: {},
      ...this.defaultOptions,
      ...options
    } as RequestOptions;
    
    // 设置header
    const token = cookie.get('accessToken');
    options.header = {
      ...options.header,
      Authorization: token.accessToken ? 'Bearer ' + token.accessToken : '',
    };
    
    // 处理get参数被吃掉问题
    if (options.method && options.method.toLowerCase() === 'get' && options.data) {
      const data = qs.stringify(options.data);
      if (data) {
        delete options.data;
        options.url = `${options.url}?${data}`;
      }
    }
    
    return options;
  }

  /**
   * 响应拦截器（处理器）
   * @param res {RequestSuccessCallbackResult} 响应
   * @param resolve
   * @param reject
   */
  afterResponse<T>(res: UniApp.RequestSuccessCallbackResult, resolve: (value: ApiResponse<T> | PromiseLike<ApiResponse<T>>) => void, reject: (reason?: any) => void) {
    if (res.errMsg === 'uploadFile:ok') {
      try {
        res.data = JSON.parse(res.data as unknown as string);
      } catch (e) {
        console.error('Parse upload response failed:', e);
      }
    }
    
    // 请求statusCode非200
    if (res.statusCode !== 200) {
      reject(res.data);
      return;
    }
    
    const { data } = res as { data: ApiResponse<T> };
    
    // 无权限
    if ([401].includes(data.code)) {
      handleLoginFailure();
      reject(data);
      return;
    }
    
    // 拦截后端响应code
    if (![0, 200].includes(data.code)) {
      if ([1008007023].includes(data.code)) {
        reject(data);
        return;
      }
      
      // 延迟显示错误消息，避免覆盖页面其他提示
      setTimeout(() => {
        uni.showToast({ title: data.msg || '请求失败', icon: 'none' });
      }, 50);
      
      reject(data);
      return;
    }
    
    resolve(data);
  }

  /**
   * get
   * @param url
   * @param data
   * @return {Promise<ApiResponse<T>>}
   */
  get<T = any>(url: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.doRequest<T>({
      url,
      data,
      method: 'GET'
    });
  }

  /**
   * post
   * @param url
   * @param data
   * @return {Promise<ApiResponse<T>>}
   */
  post<T = any>(url: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.doRequest<T>({
      url,
      data,
      method: 'POST'
    });
  }

  /**
   * put
   * @param url
   * @param data
   * @return {Promise<ApiResponse<T>>}
   */
  put<T = any>(url: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.doRequest<T>({
      url,
      data,
      method: 'PUT'
    });
  }

  /**
   * delete
   * @param url
   * @param data
   * @return {Promise<ApiResponse<T>>}
   */
  delete<T = any>(url: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.doRequest<T>({
      url,
      data,
      method: 'DELETE'
    });
  }

  /**
   * 上传
   * @param options
   * @return {Promise<unknown>}
   * @doc https://zh.uniapp.dcloud.io/api/request/network-file.html
   */
  upload<T = any>(options: { url?: string, filePath: string, name?: string, formData?: Record<string, any> }): Promise<T> {
    const uploadOptions = this.beforeRequest({
      url: options.url || VUE_APP_UPLOAD_URL,
      filePath: options.filePath,
      name: options.name || 'file',
      formData: options.formData || {}
    } as RequestOptions);

    return new Promise<T>((resolve, reject) => {
      uni.uploadFile({
        ...uploadOptions,
        url: `${baseUrl()}${uploadOptions.url}`,
        success: (uploadFileRes) => {
          try {
            const parsedData = JSON.parse(uploadFileRes.data as string);
            this.afterResponse(
              { ...uploadFileRes, data: parsedData } as UniApp.RequestSuccessCallbackResult,
              (result) => resolve(result.data),
              reject
            );
          } catch (e) {
            // 如果不是JSON格式，直接返回原始数据
            resolve(uploadFileRes.data as unknown as T);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 下载
   * @param url
   * @return {Promise<UniApp.DownloadSuccessData>}
   * @doc https://zh.uniapp.dcloud.io/api/request/network-file.html
   */
  download(url: string): Promise<UniApp.DownloadSuccessData> {
    return new Promise<UniApp.DownloadSuccessData>((resolve, reject) => {
      uni.downloadFile({
        url,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * 取消所有挂起的请求
   */
  cancelAllRequests(): void {
    this.pendingRequests.forEach(task => {
      task.abort();
    });
    this.pendingRequests.clear();
  }

  /**
   * 取消特定请求
   */
  cancelRequest(url: string, data?: any): void {
    const options: RequestOptions = { url, data, method: 'GET' };
    const requestKey = this.getRequestKey(options);
    this.cancelPendingRequest(requestKey);
  }

  /**
   * 带缓存的GET请求
   */
  async getCached<T = any>(url: string, data: any = {}, ttl?: number): Promise<ApiResponse<T>> {
    if (!this.enableCache) {
      return this.get<T>(url, data);
    }

    // 生成缓存键
    const cacheKey = apiCache.generateKey(url, data);
    const cachedResult = apiCache.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    // 如果缓存中没有，发起请求
    const result = await this.get<T>(url, data);
    
    // 将结果存入缓存
    apiCache.set(cacheKey, result, ttl);
    
    return result;
  }

  /**
   * 清除特定URL的缓存
   */
  clearCache(url: string, data?: any): void {
    if (data) {
      const cacheKey = apiCache.generateKey(url, data);
      apiCache.delete(cacheKey);
    } else {
      // 如果没有提供具体参数，则清除所有匹配该URL的缓存
      // 这里简化处理，实际可能需要更复杂的匹配逻辑
      const keysToDelete: string[] = [];
      for (const [key] of apiCache['cache'].entries()) {
        if (key.startsWith(url)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => apiCache.delete(key));
    }
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    apiCache.clear();
  }
}

// 导入API请求管理器
import { apiRequestManager } from './apiRequestManager';

export const requestUtil = new RequestUtil();

/**
 * 带错误处理的API请求包装器
 */
export async function handleApiRequest<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: ApiResponseOptions = { showError: true, showLoading: false, loadingText: '加载中...' }
): Promise<T> {
  const { showError, showLoading, loadingText } = options;

  try {
    if (showLoading) {
      uni.showLoading({ title: loadingText, mask: true });
    }

    const response = await apiCall();
    
    return response.data;
  } catch (error: any) {
    if (showError) {
      uni.showToast({
        title: error.msg || error.message || '请求失败',
        icon: 'none'
      });
    }
    
    throw error;
  } finally {
    if (showLoading) {
      uni.hideLoading();
    }
  }
}

/**
 * 使用API请求管理器发起请求
 */
export async function managedRequest<T = any>(
  options: RequestOptions,
  requestOptions?: {
    useCache?: boolean;
    cacheTTL?: number;
    retryTimes?: number;
    retryDelay?: number;
    deduplicate?: boolean;
    showLoading?: boolean;
    loadingText?: string;
  }
): Promise<T> {
  const { showLoading = false, loadingText = '加载中...', ...apiOptions } = requestOptions || {};
  
  try {
    if (showLoading) {
      uni.showLoading({ title: loadingText, mask: true });
    }
    
    const response = await apiRequestManager.request<T>(options, apiOptions);
    return response.data;
  } catch (error: any) {
    uni.showToast({
      title: error.msg || error.message || '请求失败',
      icon: 'none'
    });
    throw error;
  } finally {
    if (showLoading) {
      uni.hideLoading();
    }
  }
}

// 导出API请求管理器
export { apiRequestManager };