/**
 * API缓存管理器
 * 用于缓存API响应数据，减少重复请求
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number; // 生存时间（毫秒）
}

export class ApiCacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 默认5分钟

  /**
   * 设置缓存
   */
  set(key: string, data: any, ttl?: number): void {
    const cacheEntry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl !== undefined ? ttl : this.defaultTTL
    };

    this.cache.set(key, cacheEntry);
  }

  /**
   * 获取缓存
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 检查是否存在有效的缓存
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * 删除缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 生成缓存键
   */
  generateKey(url: string, params?: any): string {
    if (!params) {
      return url;
    }

    // 对参数进行序列化，确保相同的参数产生相同的键
    const sortedParams = this.sortObjectKeys(params);
    const paramString = JSON.stringify(sortedParams);
    
    return `${url}?${encodeURIComponent(paramString)}`;
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
   * 设置默认TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

// 创建全局缓存实例
export const apiCache = new ApiCacheManager();

/**
 * 带缓存的API请求装饰器
 */
export function cachedApiRequest(ttl?: number) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // 生成缓存键，基于方法名和参数
      const url = args[0]; // 假设第一个参数是URL
      const params = args[1]; // 假设第二个参数是请求参数
      const cacheKey = apiCache.generateKey(`${target.constructor.name}.${propertyKey}`, { url, params });

      // 尝试从缓存获取数据
      const cachedData = apiCache.get(cacheKey);
      if (cachedData !== null) {
        return cachedData;
      }

      // 如果缓存中没有，则调用原始方法
      const result = await originalMethod.apply(this, args);

      // 将结果存入缓存
      apiCache.set(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}