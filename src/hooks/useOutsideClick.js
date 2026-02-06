/**
 * @name: useOutsideClick
 * @author: 刘志佳
 * @date: 2024
 * @description: 类似 vueuse 的 useOutsideClick，用于监听点击外部区域
 * 适用于 uni-app 微信小程序，不使用捕获层
 * 
 * 注意：需要在页面模板的根元素上添加 @touchstart="handlePageTouchStart"
 * 并在页面 script 中导入 initPageTouchListener 并调用
 */

import { onMounted, onUnmounted, watch, getCurrentInstance } from 'vue'

// 全局事件名称
const OUTSIDE_CLICK_EVENT = 'OUTSIDE_CLICK_CHECK'

// 页面触摸监听器是否已初始化
let pageTouchListenerInitialized = false

// 页面触摸事件处理函数（需要在页面级别调用）
export function initPageTouchListener() {
  // 这个函数需要在页面的 script 中调用
  // 在页面模板的根元素上添加 @touchstart="handlePageTouchStart"
  return function handlePageTouchStart(e) {
    const touch = e.touches?.[0] || e.changedTouches?.[0]
    if (touch) {
      uni.$emit(OUTSIDE_CLICK_EVENT, {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY
      })
    }
  }
}

// 自动初始化页面触摸监听（尝试在组件中自动设置）
function autoInitPageTouchListener() {
  if (pageTouchListenerInitialized) return
  
  try {
    // 获取当前页面实例
    const pages = getCurrentPages()
    if (pages.length === 0) return
    
    const currentPage = pages[pages.length - 1]
    if (!currentPage) return
    
    // 在页面实例上添加触摸事件处理
    // 注意：在 uni-app 中，页面实例可能没有直接的触摸事件方法
    // 所以我们需要通过其他方式来实现
    // 这里我们只是标记已初始化，实际监听需要在页面模板中添加
    pageTouchListenerInitialized = true
  } catch (e) {
    console.warn('useOutsideClick: 自动初始化页面触摸监听失败', e)
  }
}

/**
 * useOutsideClick hook
 * @param {Object} options
 * @param {Function} options.handler - 点击外部时的回调函数
 * @param {Array} options.targets - 需要排除的元素选择器数组
 * @param {Ref|Boolean} options.enabled - 是否启用监听
 */
export function useOutsideClick(options = {}) {
  const {
    handler,
    targets = [],
    enabled
  } = options
  
  // 检查点击是否在目标元素外部
  const checkOutside = async (touchInfo) => {
    if (enabled && !enabled.value) return
    
    const { clientX, clientY } = touchInfo
    
    // 获取所有目标元素的位置信息
    const targetRects = []
    
    // 处理 targets（选择器数组）
    const targetList = Array.isArray(targets) ? targets : [targets]
    
    for (const target of targetList) {
      if (!target) continue
      
      try {
        let rect = null
        
        if (typeof target === 'string') {
          // 如果是选择器字符串
          rect = await new Promise((resolve) => {
            uni.createSelectorQuery()
              .select(target)
              .boundingClientRect((r) => {
                resolve(r)
              })
              .exec()
          })
        }
        
        if (rect) targetRects.push(rect)
      } catch (e) {
        // 忽略错误，继续检查其他元素
      }
    }
    
    // 检查点击是否在任何目标元素内
    let isInside = false
    for (const rect of targetRects) {
      if (rect && 
          clientX >= rect.left && 
          clientX <= rect.right && 
          clientY >= rect.top && 
          clientY <= rect.bottom) {
        isInside = true
        break
      }
    }
    
    if (!isInside && typeof handler === 'function') {
      handler()
    }
  }
  
  // 监听全局触摸事件
  const handleTouchEvent = (touchInfo) => {
    checkOutside(touchInfo)
  }
  
  // 初始化监听
  onMounted(() => {
    // 尝试自动初始化页面触摸监听
    autoInitPageTouchListener()
    uni.$on(OUTSIDE_CLICK_EVENT, handleTouchEvent)
  })
  
  // 清理监听器
  onUnmounted(() => {
    uni.$off(OUTSIDE_CLICK_EVENT, handleTouchEvent)
  })
  
  // 监听 enabled 变化
  if (enabled) {
    watch(enabled, (val) => {
      if (val) {
        uni.$on(OUTSIDE_CLICK_EVENT, handleTouchEvent)
      } else {
        uni.$off(OUTSIDE_CLICK_EVENT, handleTouchEvent)
      }
    })
  }
  
  return {}
}
