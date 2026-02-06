/**
 * 保持向后兼容的useRouter入口文件
 * 用于支持旧的导入路径
 */

import { useRouter as useRouterTs } from '../src/hooks/useRouter';

export function useRouter() {
  const hook = useRouterTs();
  
  return {
    navigateTo: hook.navigateTo,
    redirectTo: hook.redirectTo,
    switchTab: hook.switchTab,
    reLaunch: hook.reLaunch,
    navigateBack: hook.navigateBack,
    push: hook.push,
    pushToTab: hook.pushToTab,
    getUrlParams: hook.getUrlParams,
    getPageStack: hook.getPageStack,
    getPageStackSize: hook.getPageStackSize
  };
}