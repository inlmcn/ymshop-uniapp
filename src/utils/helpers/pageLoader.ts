/**
 * 页面懒加载工具
 * 用于实现页面级别的懒加载
 */

interface PageLoaderOptions {
  /** 预加载阈值，距离页面底部多少距离时开始预加载 */
  preloadThreshold?: number;
  /** 加载延迟，防止频繁触发 */
  loadDelay?: number;
}

interface LoadedPage {
  url: string;
  component: any;
  loadedAt: number;
  lastAccessed: number;
}

export class PageLoader {
  private loadedPages: Map<string, LoadedPage> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private preloadThreshold: number;
  private loadDelay: number;
  private maxCacheSize: number = 10; // 最大缓存页面数量

  constructor(options: PageLoaderOptions = {}) {
    this.preloadThreshold = options.preloadThreshold ?? 300; // 默认300px
    this.loadDelay = options.loadDelay ?? 300; // 默认300ms防抖
  }

  /**
   * 动态加载页面组件
   */
  async loadPage(pagePath: string): Promise<any> {
    // 检查是否已经在缓存中
    const cachedPage = this.loadedPages.get(pagePath);
    if (cachedPage) {
      cachedPage.lastAccessed = Date.now();
      return cachedPage.component;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(pagePath)) {
      return this.loadingPromises.get(pagePath);
    }

    // 创建加载Promise
    const loadPromise = this.importPageComponent(pagePath)
      .then(component => {
        // 加载完成后，清理加载Promise
        this.loadingPromises.delete(pagePath);
        
        // 添加到缓存
        this.addToCache(pagePath, component);
        
        return component;
      })
      .catch(error => {
        // 加载失败也要清理Promise
        this.loadingPromises.delete(pagePath);
        throw error;
      });

    this.loadingPromises.set(pagePath, loadPromise);

    return loadPromise;
  }

  /**
   * 预加载页面
   */
  async preloadPage(pagePath: string): Promise<void> {
    try {
      await this.loadPage(pagePath);
      console.log(`Preloaded page: ${pagePath}`);
    } catch (error) {
      console.error(`Failed to preload page: ${pagePath}`, error);
    }
  }

  /**
   * 预加载多个页面
   */
  async preloadPages(pagePaths: string[]): Promise<void> {
    const preloadPromises = pagePaths.map(path => this.preloadPage(path));
    await Promise.all(preloadPromises);
  }

  /**
   * 检查页面是否已加载
   */
  isPageLoaded(pagePath: string): boolean {
    return this.loadedPages.has(pagePath);
  }

  /**
   * 获取加载的页面数量
   */
  getLoadedPageCount(): number {
    return this.loadedPages.size;
  }

  /**
   * 清理缓存（保留最近使用的页面）
   */
  cleanupCache(keepCount: number = this.maxCacheSize): void {
    const sortedPages = Array.from(this.loadedPages.entries())
      .sort((a, b) => b[1].lastAccessed - a[1].lastAccessed)
      .slice(keepCount);

    sortedPages.forEach(([pagePath]) => {
      this.loadedPages.delete(pagePath);
    });

    console.log(`Cleaned up ${sortedPages.length} pages from cache`);
  }

  /**
   * 清空所有缓存
   */
  clearCache(): void {
    this.loadedPages.clear();
    this.loadingPromises.clear();
  }

  /**
   * 导入页面组件
   */
  private async importPageComponent(pagePath: string): Promise<any> {
    // 标准化路径
    const normalizedPath = this.normalizePath(pagePath);
    
    try {
      // 使用动态导入加载页面组件
      // 注意：在实际项目中，这需要根据你的项目结构调整
      const module = await import(`@/src/pages${normalizedPath}/index.vue`);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load page component: ${normalizedPath}`, error);
      
      // 尝试其他可能的文件名
      const alternativePaths = [
        `@/src/pages${normalizedPath}/index`,
        `@/src/pages${normalizedPath}/${normalizedPath.split('/').pop()}`,
        `@/src/pages${normalizedPath}`
      ];

      for (const altPath of alternativePaths) {
        try {
          const module = await import(altPath);
          return module.default || module;
        } catch (altError) {
          continue;
        }
      }

      throw new Error(`Cannot find page component: ${pagePath}`);
    }
  }

  /**
   * 添加到缓存
   */
  private addToCache(pagePath: string, component: any): void {
    // 如果缓存已满，清理最久未使用的页面
    if (this.loadedPages.size >= this.maxCacheSize) {
      this.cleanupCache(this.maxCacheSize - 1);
    }

    this.loadedPages.set(pagePath, {
      url: pagePath,
      component,
      loadedAt: Date.now(),
      lastAccessed: Date.now()
    });
  }

  /**
   * 标准化路径
   */
  private normalizePath(path: string): string {
    // 移除开头的斜杠
    let normalized = path.startsWith('/') ? path.slice(1) : path;
    
    // 确保路径以 .vue 结尾（如果不是目录）
    if (!normalized.includes('/') && !normalized.endsWith('.vue')) {
      normalized += '.vue';
    }
    
    return normalized;
  }

  /**
   * 监听滚动事件以实现预加载
   */
  setupScrollPreload(containerSelector: string = '.page-container', pagesToPreload: string[]): void {
    let timeoutId: number | null = null;

    const handleScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        // 检查是否接近页面底部
        const container = document.querySelector(containerSelector) as HTMLElement;
        if (!container) return;

        const scrollBottom = container.scrollTop + container.clientHeight;
        const totalHeight = container.scrollHeight;

        if (totalHeight - scrollBottom < this.preloadThreshold) {
          // 接近底部，预加载页面
          this.preloadPages(pagesToPreload).catch(console.error);
        }
      }, this.loadDelay) as unknown as number;
    };

    // 添加滚动监听器
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 返回清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    totalCached: number;
    totalLoading: number;
    memoryUsage: number;
  } {
    return {
      totalCached: this.loadedPages.size,
      totalLoading: this.loadingPromises.size,
      memoryUsage: this.loadedPages.size // 简化的内存使用估计
    };
  }
}

// 创建全局页面加载器实例
export const pageLoader = new PageLoader();

/**
 * 页面懒加载装饰器
 */
export function lazyLoadPage(pagePath: string) {
  return function (constructor: Function) {
    // 这里可以添加页面懒加载的元数据
    (constructor as any).__lazyLoadPath = pagePath;
  };
}

/**
 * 预加载页面的Hook
 * @param pagePaths 需要预加载的页面路径数组
 */
export function usePagePreloader(pagePaths: string[]) {
  const preload = async () => {
    await pageLoader.preloadPages(pagePaths);
  };

  return {
    preload,
    isLoaded: (path: string) => pageLoader.isPageLoaded(path),
    loader: pageLoader
  };
}