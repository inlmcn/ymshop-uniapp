/**
 * 错误处理和监控工具
 * 用于捕获、记录和上报错误
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  type: 'js' | 'promise' | 'resource' | 'ajax' | 'vue';
  component?: string;
  propsData?: any;
  info?: string;
}

interface MonitorConfig {
  enableErrorCapture: boolean;
  enablePerformanceMonitor: boolean;
  enableApiMonitor: boolean;
  enableUserBehavior: boolean;
  reportUrl?: string;
  samplingRate: number; // 采样率 (0-1)
}

export class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private config: MonitorConfig;
  private performanceObserver: PerformanceObserver | null = null;

  constructor(config: Partial<MonitorConfig> = {}) {
    this.config = {
      enableErrorCapture: true,
      enablePerformanceMonitor: true,
      enableApiMonitor: true,
      enableUserBehavior: true,
      samplingRate: 1.0,
      ...config
    };

    if (this.config.enableErrorCapture) {
      this.setupErrorCapturing();
    }

    if (this.config.enablePerformanceMonitor) {
      this.setupPerformanceMonitoring();
    }

    if (this.config.enableUserBehavior) {
      this.setupUserBehaviorTracking();
    }
  }

  /**
   * 设置错误捕获
   */
  private setupErrorCapturing(): void {
    // 捕获 JavaScript 运行时错误
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        timestamp: event.timeStamp,
        type: 'js'
      });
    });

    // 捕获 Promise 拒绝错误
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack,
        timestamp: Date.now(),
        type: 'promise'
      });
    });

    // Vue 错误处理
    if (typeof Vue !== 'undefined') {
      Vue.config.errorHandler = (err: Error, vm: any, info: string) => {
        this.captureError({
          message: err.message,
          stack: err.stack,
          component: vm?.$options.name,
          propsData: vm?.$options.propsData,
          info,
          timestamp: Date.now(),
          type: 'vue'
        });
      };
    }
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    if ('performance' in window) {
      // 监控长期任务
      if ('longTask' in PerformanceObserver.supportedEntryTypes) {
        this.performanceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.warn('Long task detected:', entry);
            // 可以上报长期任务
          });
        });
        this.performanceObserver.observe({ entryTypes: ['longtask'] });
      }

      // 监控资源加载
      if ('resource' in PerformanceObserver.supportedEntryTypes) {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 200) { // 资源加载超过200ms
              console.warn('Slow resource:', entry.name, entry.duration);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
      }
    }
  }

  /**
   * 设置用户行为跟踪
   */
  private setupUserBehaviorTracking(): void {
    // 跟踪页面停留时间
    let pageStartTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const pageVisitDuration = Date.now() - pageStartTime;
      this.trackUserBehavior('page_unload', {
        duration: pageVisitDuration,
        url: window.location.href
      });
    });

    // 跟踪点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackUserBehavior('click', {
        element: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent?.substring(0, 50)
      });
    });
  }

  /**
   * 捕获错误
   */
  captureError(errorInfo: Omit<ErrorInfo, 'timestamp'>): void {
    // 根据采样率决定是否记录错误
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    const fullErrorInfo: ErrorInfo = {
      ...errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.errors.push(fullErrorInfo);

    // 输出到控制台
    console.error('Captured error:', fullErrorInfo);

    // 如果有上报URL，则上报错误
    if (this.config.reportUrl) {
      this.reportError(fullErrorInfo);
    }

    // 限制错误数组大小
    if (this.errors.length > 100) {
      this.errors.shift();
    }
  }

  /**
   * 上报错误
   */
  private async reportError(errorInfo: ErrorInfo): Promise<void> {
    if (!this.config.reportUrl) return;

    try {
      await fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'error',
          data: errorInfo
        })
      });
    } catch (err) {
      console.error('Failed to report error:', err);
    }
  }

  /**
   * 跟踪用户行为
   */
  trackUserBehavior(action: string, data?: any): void {
    if (!this.config.enableUserBehavior) return;

    const behaviorData = {
      action,
      data,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.log('User behavior tracked:', behaviorData);

    // 如果有上报URL，则上报行为数据
    if (this.config.reportUrl) {
      fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'behavior',
          data: behaviorData
        })
      }).catch(err => {
        console.error('Failed to report behavior:', err);
      });
    }
  }

  /**
   * 监控API请求
   */
  monitorApi(url: string, method: string, startTime: number, endTime: number, success: boolean, error?: any): void {
    if (!this.config.enableApiMonitor) return;

    const duration = endTime - startTime;
    const apiData = {
      url,
      method,
      duration,
      success,
      error: error?.message,
      timestamp: startTime,
      userAgent: navigator.userAgent
    };

    console.log('API monitored:', apiData);

    // 如果请求时间过长或失败，记录为潜在问题
    if (duration > 5000 || !success) {
      this.captureError({
        message: `Slow or failed API call: ${method} ${url}`,
        info: `Duration: ${duration}ms, Success: ${success}`,
        type: 'ajax'
      });
    }

    // 如果有上报URL，则上报API数据
    if (this.config.reportUrl) {
      fetch(this.config.reportUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'api',
          data: apiData
        })
      }).catch(err => {
        console.error('Failed to report API data:', err);
      });
    }
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    recent: ErrorInfo[];
  } {
    const byType: Record<string, number> = {};
    this.errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
    });

    return {
      total: this.errors.length,
      byType,
      recent: this.errors.slice(-10) // 最近10个错误
    };
  }

  /**
   * 清除错误日志
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 销毁监控器
   */
  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    this.errors = [];
  }
}

// 创建全局错误处理器实例
export const errorHandler = new ErrorHandler({
  enableErrorCapture: true,
  enablePerformanceMonitor: true,
  enableApiMonitor: true,
  enableUserBehavior: true,
  samplingRate: 1.0 // 100% 采样率，生产环境中可能需要降低
});

/**
 * 错误边界组件（用于Vue）
 */
export function withErrorBoundary(WrappedComponent: any) {
  return {
    name: `ErrorBoundary${WrappedComponent.name}`,
    data() {
      return {
        hasError: false,
        error: null
      };
    },
    methods: {
      onErrorCaptured(err: Error, vm: any, info: string) {
        this.hasError = true;
        this.error = err;
        
        errorHandler.captureError({
          message: err.message,
          stack: err.stack,
          component: vm?.$options.name,
          propsData: vm?.$options.propsData,
          info,
          type: 'vue'
        });
      }
    },
    render(h: any) {
      if (this.hasError) {
        return h('div', { class: 'error-boundary' }, [
          h('h2', '出错了！'),
          h('p', this.error?.message),
          h('button', {
            on: {
              click: () => {
                this.hasError = false;
                this.error = null;
              }
            }
          }, '重试')
        ]);
      }
      
      return h(WrappedComponent);
    }
  };
}

/**
 * API监控装饰器
 */
export function monitorApiCall(url: string, method: string = 'GET') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      let success = true;
      let error;

      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (err) {
        success = false;
        error = err;
        throw err;
      } finally {
        const endTime = Date.now();
        errorHandler.monitorApi(url, method, startTime, endTime, success, error);
      }
    };

    return descriptor;
  };
}