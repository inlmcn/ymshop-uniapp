/**
 * 内存管理工具
 * 用于优化内存使用，管理组件生命周期和资源释放
 */

interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  usagePercent: number;
}

interface ResourceReference {
  id: string;
  type: 'component' | 'timer' | 'observer' | 'listener' | 'data';
  reference: any;
  createdAt: number;
  lastAccessed: number;
  size?: number;
}

export class MemoryManager {
  private resources: Map<string, ResourceReference> = new Map();
  private maxSize: number;
  private gcThreshold: number; // 垃圾回收阈值
  private monitoringInterval: number | null = null;
  private gcEnabled: boolean = true;

  constructor(maxSize: number = 100, gcThreshold: number = 0.8) {
    this.maxSize = maxSize;
    this.gcThreshold = gcThreshold;
    this.startMonitoring();
  }

  /**
   * 注册资源引用
   */
  registerResource(id: string, type: ResourceReference['type'], reference: any, size?: number): void {
    const resource: ResourceReference = {
      id,
      type,
      reference,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      size
    };

    this.resources.set(id, resource);
    this.checkMemoryPressure();
  }

  /**
   * 释放资源
   */
  releaseResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (!resource) {
      return false;
    }

    // 根据资源类型执行相应的清理操作
    switch (resource.type) {
      case 'timer':
        if (typeof resource.reference === 'number') {
          clearInterval(resource.reference);
          clearTimeout(resource.reference);
        }
        break;
      case 'observer':
        if (resource.reference && typeof resource.reference.disconnect === 'function') {
          resource.reference.disconnect();
        }
        break;
      case 'listener':
        // 假设reference是一个包含target和handler的对象
        if (resource.reference && resource.reference.target && resource.reference.handler) {
          resource.reference.target.removeEventListener(resource.reference.event, resource.reference.handler);
        }
        break;
      case 'component':
        // 组件清理逻辑
        if (resource.reference && typeof resource.reference.unmount === 'function') {
          resource.reference.unmount();
        }
        break;
    }

    this.resources.delete(id);
    return true;
  }

  /**
   * 批量释放资源
   */
  releaseResources(ids: string[]): number {
    let releasedCount = 0;
    for (const id of ids) {
      if (this.releaseResource(id)) {
        releasedCount++;
      }
    }
    return releasedCount;
  }

  /**
   * 清理未使用的资源
   */
  cleanUnusedResources(thresholdMinutes: number = 30): number {
    const now = Date.now();
    const thresholdMs = thresholdMinutes * 60 * 1000;
    const resourcesToRelease: string[] = [];

    for (const [id, resource] of this.resources.entries()) {
      if (now - resource.lastAccessed > thresholdMs) {
        resourcesToRelease.push(id);
      }
    }

    return this.releaseResources(resourcesToRelease);
  }

  /**
   * 获取内存统计
   */
  getStats(): MemoryStats {
    const currentSize = this.resources.size;
    const usagePercent = currentSize / this.maxSize;

    return {
      used: currentSize,
      total: this.maxSize,
      limit: this.maxSize,
      usagePercent
    };
  }

  /**
   * 检查内存压力
   */
  checkMemoryPressure(): void {
    const stats = this.getStats();
    if (stats.usagePercent > this.gcThreshold && this.gcEnabled) {
      this.performGarbageCollection();
    }
  }

  /**
   * 执行垃圾回收
   */
  performGarbageCollection(): void {
    console.log('🔍 Performing garbage collection...');
    
    // 清理最久未使用的资源，保留一定数量
    const sortedResources = Array.from(this.resources.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);

    const resourcesToRemove = Math.ceil(sortedResources.length * 0.2); // 清理20%的资源
    const resourcesToRelease = sortedResources.slice(0, resourcesToRemove).map(([id]) => id);

    const releasedCount = this.releaseResources(resourcesToRelease);
    console.log(`🧹 Released ${releasedCount} resources during garbage collection.`);
  }

  /**
   * 开始内存监控
   */
  startMonitoring(intervalMs: number = 30000): void { // 默认每30秒检查一次
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryPressure();
      this.logMemoryUsage();
    }, intervalMs) as unknown as number;
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * 记录内存使用情况
   */
  logMemoryUsage(): void {
    const stats = this.getStats();
    console.group('🧠 内存使用情况');
    console.log(`使用量: ${stats.used}/${stats.total} (${(stats.usagePercent * 100).toFixed(2)}%)`);
    console.log(`GC阈值: ${(this.gcThreshold * 100).toFixed(2)}%`);
    console.groupEnd();
  }

  /**
   * 获取资源列表
   */
  getResources(): ResourceReference[] {
    return Array.from(this.resources.values());
  }

  /**
   * 获取特定类型的资源
   */
  getResourcesByType(type: ResourceReference['type']): ResourceReference[] {
    return Array.from(this.resources.values()).filter(resource => resource.type === type);
  }

  /**
   * 更新资源访问时间
   */
  touchResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (resource) {
      resource.lastAccessed = Date.now();
      return true;
    }
    return false;
  }

  /**
   * 设置GC启用状态
   */
  setGCEnabled(enabled: boolean): void {
    this.gcEnabled = enabled;
  }

  /**
   * 获取GC启用状态
   */
  isGCEnabled(): boolean {
    return this.gcEnabled;
  }

  /**
   * 销毁内存管理器
   */
  destroy(): void {
    this.stopMonitoring();
    
    // 释放所有资源
    const allIds = Array.from(this.resources.keys());
    this.releaseResources(allIds);
    
    this.resources.clear();
  }
}

// 创建全局内存管理实例
export const memoryManager = new MemoryManager(200, 0.75); // 最大200个资源，75%阈值

/**
 * 内存管理装饰器
 * 用于自动注册和释放组件资源
 */
export function managedMemory(idSuffix?: string) {
  return function (constructor: Function) {
    const originalOnInit = constructor.prototype.onInit || (() => {});
    const originalOnDestroy = constructor.prototype.onDestroy || (() => {});

    constructor.prototype.onInit = function () {
      const id = idSuffix ? `${constructor.name}_${idSuffix}` : `${constructor.name}_${Date.now()}`;
      memoryManager.registerResource(id, 'component', this);
      return originalOnInit.call(this);
    };

    constructor.prototype.onDestroy = function () {
      const id = idSuffix ? `${constructor.name}_${idSuffix}` : `${constructor.name}_${Date.now()}`;
      memoryManager.releaseResource(id);
      return originalOnDestroy.call(this);
    };
  };
}

/**
 * 自动内存管理Hook
 * 用于Vue组件中自动管理资源
 */
export function useMemoryManager(componentInstanceId: string) {
  const registerResource = (id: string, type: ResourceReference['type'], reference: any, size?: number) => {
    const resourceId = `${componentInstanceId}_${id}`;
    memoryManager.registerResource(resourceId, type, reference, size);
  };

  const releaseResource = (id: string) => {
    const resourceId = `${componentInstanceId}_${id}`;
    return memoryManager.releaseResource(resourceId);
  };

  const cleanup = () => {
    const resources = memoryManager.getResourcesByType('component')
      .filter(r => r.id.startsWith(componentInstanceId));
    
    resources.forEach(r => memoryManager.releaseResource(r.id));
  };

  // 组件销毁时自动清理
  onUnmounted(cleanup);

  return {
    registerResource,
    releaseResource,
    cleanup,
    memoryManager
  };
}