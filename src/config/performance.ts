/**
 * 性能优化配置
 */

export interface PerformanceConfig {
  // 图片懒加载配置
  imageLazyLoad: {
    placeholder: string;
    errorImage: string;
    threshold: number; // 触发懒加载的距离阈值(px)
    rootMargin: string; // 根边距
  };
  
  // 虚拟滚动配置
  virtualList: {
    bufferSize: number; // 缓冲区大小
    itemDefaultHeight: number; // 默认项目高度
  };
  
  // 页面预加载配置
  pagePreload: {
    enabled: boolean; // 是否启用预加载
    threshold: number; // 预加载阈值(px)
    delay: number; // 预加载延迟(ms)
    maxCacheSize: number; // 最大页面缓存数
  };
  
  // 内存管理配置
  memoryManager: {
    maxSize: number; // 最大资源数
    gcThreshold: number; // 垃圾回收阈值
    gcEnabled: boolean; // 是否启用垃圾回收
  };
  
  // 图像优化配置
  imageOptimizer: {
    quality: number; // 默认图像质量
    maxWidth: number; // 最大宽度
    maxHeight: number; // 最大高度
    enableWebP: boolean; // 是否启用WebP
    progressive: boolean; // 是否使用渐进式加载
  };
  
  // API请求优化配置
  apiOptimization: {
    enableCache: boolean; // 是否启用缓存
    defaultCacheTTL: number; // 默认缓存时间(ms)
    enableDeduplication: boolean; // 是否启用去重
    retryTimes: number; // 重试次数
    retryDelay: number; // 重试延迟(ms)
  };
  
  // 性能监控配置
  performanceMonitor: {
    enabled: boolean; // 是否启用性能监控
    reportInterval: number; // 性能报告间隔(ms)
    slowApiThreshold: number; // 慢API阈值(ms)
  };
}

export const performanceConfig: PerformanceConfig = {
  imageLazyLoad: {
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU1ZTUiIC8+PC9zdmc+',
    errorImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZjYiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==',
    threshold: 300,
    rootMargin: '300px 0px 300px 0px'
  },
  
  virtualList: {
    bufferSize: 5,
    itemDefaultHeight: 100
  },
  
  pagePreload: {
    enabled: true,
    threshold: 300,
    delay: 300,
    maxCacheSize: 10
  },
  
  memoryManager: {
    maxSize: 200,
    gcThreshold: 0.75,
    gcEnabled: true
  },
  
  imageOptimizer: {
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    enableWebP: true,
    progressive: true
  },
  
  apiOptimization: {
    enableCache: true,
    defaultCacheTTL: 5 * 60 * 1000, // 5分钟
    enableDeduplication: true,
    retryTimes: 2,
    retryDelay: 1000
  },
  
  performanceMonitor: {
    enabled: true,
    reportInterval: 30 * 1000, // 30秒
    slowApiThreshold: 1000 // 1秒
  }
};

/**
 * 动态更新性能配置
 */
export function updatePerformanceConfig(newConfig: Partial<PerformanceConfig>): void {
  Object.assign(performanceConfig, newConfig);
}