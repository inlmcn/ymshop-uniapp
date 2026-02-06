import { ref, onMounted, onUnmounted } from 'vue';

/**
 * 页面滚动Hook
 * 用于处理页面滚动相关的功能
 */
export function useScroll() {
  const scrollTop = ref(0);

  // 监听页面滚动事件
  const onPageScroll = (e: UniApp.OnPageScrollOptions) => {
    scrollTop.value = e.scrollTop;
  };

  // 滚动到顶部
  const scrollToTop = (duration: number = 300) => {
    uni.pageScrollTo({
      scrollTop: 0,
      duration: duration
    });
  };

  // 滚动到指定位置
  const scrollTo = (top: number, duration: number = 300) => {
    uni.pageScrollTo({
      scrollTop: top,
      duration: duration
    });
  };

  // 检查是否滚动到底部
  const isScrollToBottom = (threshold: number = 100): boolean => {
    // 这里需要结合页面实际高度判断，简单返回false
    return false;
  };

  return {
    scrollTop,
    onPageScroll,
    scrollToTop,
    scrollTo,
    isScrollToBottom
  };
}