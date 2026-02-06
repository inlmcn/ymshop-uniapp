import type { RouteParams } from '@/src/types/utils';

/**
 * 路由管理Hook
 * 用于处理页面跳转相关的功能
 */
export function useRouter() {
  /**
   * 导航到页面
   */
  const navigateTo = (options: Omit<RouteParams, 'type'>) => {
    return uni.navigateTo({
      url: options.url,
      animationType: options.animationType,
      animationDuration: options.animationDuration
    });
  };

  /**
   * 重定向到页面
   */
  const redirectTo = (options: Omit<RouteParams, 'type'>) => {
    return uni.redirectTo({
      url: options.url
    });
  };

  /**
   * 切换到 tabBar 页面
   */
  const switchTab = (options: Omit<RouteParams, 'type'>) => {
    return uni.switchTab({
      url: options.url
    });
  };

  /**
   * 重启当前页面
   */
  const reLaunch = (options: Omit<RouteParams, 'type'>) => {
    return uni.reLaunch({
      url: options.url
    });
  };

  /**
   * 返回上一页
   */
  const navigateBack = (delta: number = 1) => {
    return uni.navigateBack({
      delta
    });
  };

  /**
   * 通用跳转方法，根据类型执行不同跳转
   */
  const push = (options: RouteParams) => {
    const { type = 'navigateTo', ...rest } = options;
    
    switch (type) {
      case 'navigateTo':
        return navigateTo(rest);
      case 'redirectTo':
        return redirectTo(rest);
      case 'switchTab':
        return switchTab(rest);
      case 'reLaunch':
        return reLaunch(rest);
      case 'navigateBack':
        return navigateBack(rest.delta || 1);
      default:
        return navigateTo(rest);
    }
  };

  /**
   * 跳转到 tabBar 页面（带类型检查）
   */
  const pushToTab = (options: Omit<RouteParams, 'type'>) => {
    return switchTab(options);
  };

  /**
   * 获取当前页面参数
   */
  const getUrlParams = (): Record<string, any> => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    return currentPage?.options || {};
  };

  /**
   * 获取页面栈
   */
  const getPageStack = () => {
    return getCurrentPages();
  };

  /**
   * 获取页面栈长度
   */
  const getPageStackSize = () => {
    return getCurrentPages().length;
  };

  return {
    navigateTo,
    redirectTo,
    switchTab,
    reLaunch,
    navigateBack,
    push,
    pushToTab,
    getUrlParams,
    getPageStack,
    getPageStackSize
  };
}