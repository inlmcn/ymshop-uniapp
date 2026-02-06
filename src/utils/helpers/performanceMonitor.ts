/**
 * 性能监控工具
 * 用于监控页面加载、API请求、渲染等方面的性能
 */

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoadedTime: number;
  resourcesLoadedTime: number;
  firstPaintTime: number;
  firstContentfulPaintTime: number;
  largestContentfulPaintTime: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  interactionToNextPaint: number;
}

interface ApiPerformanceMetrics {
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  statusCode?: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    domContentLoadedTime: 0,
    resourcesLoadedTime: 0,
    firstPaintTime: 0,
    firstContentfulPaintTime: 0,
    largestContentfulPaintTime: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    interactionToNextPaint: 0
  };

  private apiMetrics: ApiPerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;
  private performanceEntries: PerformanceEntry[] = [];

  constructor() {
    this.setupPerformanceMonitoring();
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    // 监控页面加载时间
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        this.metrics.pageLoadTime = performance.now();
      });

      window.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoadedTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
      });
    }

    // 监控Paint指标（如果支持）
    if ('performance' in window && 'getEntriesByType' in performance) {
      // 监控FCP和LCP
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaintTime = entry.startTime;
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.metrics.largestContentfulPaintTime = entry.startTime;
          } else if (entry.entryType === 'layout-shift') {
            if (!(entry as any).hadRecentInput) {
              this.metrics.cumulativeLayoutShift += (entry as any).value;
            }
          }
        });
      });

      // 监控paint和layout shift
      this.observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
    }

    // 监控资源加载
    this.monitorResourceLoading();
  }

  /**
   * 监控资源加载
   */
  private monitorResourceLoading(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      setTimeout(() => {
        const resources = performance.getEntriesByType('resource');
        if (resources.length > 0) {
          this.metrics.resourcesLoadedTime = Math.max(...resources.map(r => r.responseEnd));
        }
      }, 3000); // 等待资源加载完成
    }
  }

  /**
   * 记录API请求性能
   */
  recordApiPerformance(url: string, method: string, startTime: number, endTime: number, success: boolean, statusCode?: number): void {
    const duration = endTime - startTime;

    const apiMetric: ApiPerformanceMetrics = {
      url,
      method,
      startTime,
      endTime,
      duration,
      success,
      statusCode
    };

    this.apiMetrics.push(apiMetric);
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取API性能指标
   */
  getApiMetrics(): ApiPerformanceMetrics[] {
    return [...this.apiMetrics];
  }

  /**
   * 获取慢API请求
   */
  getSlowApiCalls(threshold: number = 1000): ApiPerformanceMetrics[] {
    return this.apiMetrics.filter(metric => metric.duration > threshold);
  }

  /**
   * 获取平均API响应时间
   */
  getAverageApiResponseTime(): number {
    if (this.apiMetrics.length === 0) return 0;
    
    const total = this.apiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / this.apiMetrics.length;
  }

  /**
   * 记录性能指标到日志
   */
  logPerformance(): void {
    console.group('📈 性能指标');
    console.log('页面加载时间:', this.metrics.pageLoadTime, 'ms');
    console.log('DOM内容加载时间:', this.metrics.domContentLoadedTime, 'ms');
    console.log('资源加载时间:', this.metrics.resourcesLoadedTime, 'ms');
    console.log('首次绘制时间:', this.metrics.firstPaintTime, 'ms');
    console.log('首次内容绘制时间:', this.metrics.firstContentfulPaintTime, 'ms');
    console.log('最大内容绘制时间:', this.metrics.largestContentfulPaintTime, 'ms');
    console.log('累积布局偏移:', this.metrics.cumulativeLayoutShift);
    console.log('首次输入延迟:', this.metrics.firstInputDelay, 'ms');
    console.log('API平均响应时间:', this.getAverageApiResponseTime(), 'ms');
    console.log('慢API请求 (>' + 1000 + 'ms):', this.getSlowApiCalls(1000).length);
    console.groupEnd();
  }

  /**
   * 上报性能指标
   */
  async reportPerformance(): Promise<void> {
    // 这里可以将性能指标上报到服务器
    // 示例实现
    try {
      const perfData = {
        timestamp: Date.now(),
        metrics: this.getMetrics(),
        apiMetrics: this.getApiMetrics(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown'
      };

      // 在实际项目中，这里应该调用API上报性能数据
      console.log('Performance data ready for reporting:', perfData);
      
      // 示例上报逻辑（需要替换为实际的上报API）
      // await api.reportPerformance(perfData);
    } catch (error) {
      console.error('Reporting performance metrics failed:', error);
    }
  }

  /**
   * 清除性能指标
   */
  clearMetrics(): void {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      resourcesLoadedTime: 0,
      firstPaintTime: 0,
      firstContentfulPaintTime: 0,
      largestContentfulPaintTime: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      interactionToNextPaint: 0
    };
    this.apiMetrics = [];
  }

  /**
   * 销毁性能监控器
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.clearMetrics();
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 性能测量装饰器
 */
export function measurePerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    
    // 如果是异步方法，需要特殊处理
    if (result instanceof Promise) {
      return result.finally(() => {
        const end = performance.now();
        console.log(`⏱️ ${target.constructor.name}.${propertyKey} took ${end - start} milliseconds`);
      });
    } else {
      const end = performance.now();
      console.log(`⏱️ ${target.constructor.name}.${propertyKey} took ${end - start} milliseconds`);
      return result;
    }
  };

  return descriptor;
}

/**
 * API性能监控装饰器
 */
export function monitorApiPerformance(url: string, method: string = 'GET') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let statusCode: number | undefined;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        success = false;
        if (error && error.statusCode) {
          statusCode = error.statusCode;
        }
        throw error;
      } finally {
        const endTime = Date.now();
        performanceMonitor.recordApiPerformance(url, method, startTime, endTime, success, statusCode);
      }
    };

    return descriptor;
  };
}