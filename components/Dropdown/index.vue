<template>
  <view class="dropdown-wrapper">
    <!-- 触发器 -->
    <view :id="uid" class="dropdown-trigger" @tap.stop="handleTriggerClick">
      <slot></slot>
    </view>
    
    <!-- 下拉菜单 -->
    <view 
      v-if="visible" 
      class="dropdown-menu"
      :class="{
        'dropdown-menu-top': position === 'top',
        'dropdown-menu-bottom': position === 'bottom'
      }"
      :style="menuStyle"
      @tap.stop
      ref="menuRef"
      :id="menuId"
    >
      <slot name="dropdown"></slot>
    </view>
  </view>
</template>

<script setup>
import { uniqueId } from 'lodash-es'
import { ref, nextTick, getCurrentInstance, onUnmounted, provide } from 'vue'
import { useOutsideClick } from '@/hooks/useOutsideClick'

const uid = ref(uniqueId('dropdown-trigger-'))
const menuId = ref(uniqueId('dropdown-menu-'))

// 全局事件名称
const DROPDOWN_EVENT = 'DROPDOWN_CLOSE_ALL'

const emit = defineEmits(['open', 'close'])

const instance = getCurrentInstance()
const visible = ref(false)
const position = ref('bottom') // 'top' | 'bottom'
const menuStyle = ref({})
const menuRef = ref(null)

// 监听全局关闭事件
const handleGlobalClose = (eventUid) => {
  // 如果收到的 uid 不是自己的 uid，则关闭下拉菜单和透明捕获层
  if (eventUid && eventUid !== uid.value && visible.value) {
    close()
  }
}

// 初始化事件监听
const initEvent = () => {
  // 监听全局关闭事件，不要先off，让所有实例都监听
  uni.$on(DROPDOWN_EVENT, handleGlobalClose)
}

// 处理触发器点击
const handleTriggerClick = async (e) => {
  e.stopPropagation()
  
  if (visible.value) {
    // 如果当前菜单已打开，直接关闭
    close()
  } else {
    // 如果当前菜单未打开，先关闭其他所有下拉菜单（传入当前 uid）
    uni.$emit(DROPDOWN_EVENT, uid.value)
    await nextTick()
    
    // 点击时立即获取触发器位置（此时触发器肯定在可视区域）
    await calculateTriggerPosition()
    
    // 然后显示菜单
    open()
  }
}

// 使用 useOutsideClick 监听外部点击（不使用捕获层）
useOutsideClick({
  handler: () => {
    if (visible.value) {
      close()
    }
  },
  targets: [
    `#${uid.value}`, // 触发器
    `#${menuId.value}` // 菜单
  ],
  enabled: visible
})

// 获取触发器位置并计算初始菜单位置
const calculateTriggerPosition = () => {
  return new Promise((resolve) => {
    // 使用 getCurrentInstance 获取组件实例
    const query = instance ? uni.createSelectorQuery().in(instance) : uni.createSelectorQuery()
    
    // 获取触发器位置信息
    query
      .select(`#${uid.value}`)
      .boundingClientRect()
      .exec((res) => {
        const triggerRect = res[0]
        
        if (!triggerRect || triggerRect.width === 0 || triggerRect.height === 0) {
          resolve()
          return
        }
        
        // 获取系统信息
        uni.getSystemInfo({
          success: (systemInfo) => {
            const { windowHeight } = systemInfo
            const triggerBottom = triggerRect.bottom
            const triggerTop = triggerRect.top
            const triggerLeft = triggerRect.left
            const triggerWidth = triggerRect.width
            
            // 计算可用空间
            const spaceBelow = windowHeight - triggerBottom
            const spaceAbove = triggerTop
            
            // 先根据可用空间估算位置（菜单还没渲染，先用估算值）
            const estimatedMenuHeight = 200 // 估算菜单高度
            
            if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
              // 上方空间更大，先显示在上方
              position.value = 'top'
              menuStyle.value = {
                bottom: `${windowHeight - triggerTop + 4}px`, // 往上偏移4px
                left: `${triggerLeft}px`,
                minWidth: `${triggerWidth}px`,
                maxHeight: `${Math.max(spaceAbove - 20, 100)}px`
              }
            } else {
              // 默认显示在下方
              position.value = 'bottom'
              menuStyle.value = {
                top: `${triggerBottom + 4}px`, // 往下偏移4px
                left: `${triggerLeft}px`,
                minWidth: `${triggerWidth}px`,
                maxHeight: `${Math.max(spaceBelow - 20, 100)}px`
              }
            }
            
            resolve()
          },
          fail: () => {
            resolve()
          }
        })
     })
  })
}

// 打开下拉菜单
const open = async () => {
  visible.value = true
  emit('open')
  
  // 等待DOM渲染完成
  await nextTick()
  
  // 菜单渲染后，重新计算位置（获取实际菜单高度）
  setTimeout(() => {
    calculateMenuPosition()
  }, 50)
}

// 关闭下拉菜单
const close = () => {
  if (!visible.value) return
  
  visible.value = false
  emit('close')
}

// 计算菜单位置（基于实际菜单高度，调整位置）
const calculateMenuPosition = () => {
  if (!menuRef.value || !visible.value) {
    return
  }
  
  // 使用 getCurrentInstance 获取组件实例
  const query = instance ? uni.createSelectorQuery().in(instance) : uni.createSelectorQuery()
  
  // 获取触发器和菜单的位置信息
  query.select(`#${uid.value}`).boundingClientRect()
  query.select(`#${menuId.value}`).boundingClientRect()
  
  query.exec((res) => {
    const triggerRect = res[0]
    const menuRect = res[1]
    
    if (!triggerRect || !menuRect || !menuRect.height) {
      // 如果菜单还没渲染完，稍后再试一次（只试一次）
      setTimeout(() => {
        if (visible.value) {
          calculateMenuPosition()
        }
      }, 100)
      return
    }
    
    // 获取系统信息
    uni.getSystemInfo({
      success: (systemInfo) => {
        const { windowHeight } = systemInfo
        const triggerBottom = triggerRect.bottom
        const triggerTop = triggerRect.top
        const triggerLeft = triggerRect.left
        const triggerWidth = triggerRect.width
        
        // 计算可用空间
        const spaceBelow = windowHeight - triggerBottom
        const spaceAbove = triggerTop
        
        // 使用实际菜单高度进行精确计算
        const menuHeight = menuRect.height
        const minSpace = 20 // 最小缓冲空间
        const needHeight = menuHeight + minSpace
        
        // 判断是否能在下方显示
        const canShowBelow = spaceBelow >= needHeight
        // 判断是否能在上方显示
        const canShowAbove = spaceAbove >= needHeight
        
        if (canShowBelow) {
          // 下方空间足够，显示在下方
          position.value = 'bottom'
          menuStyle.value = {
            top: `${triggerBottom + 4}px`, // 往下偏移4px
            left: `${triggerLeft}px`,
            minWidth: `${triggerWidth}px`,
            maxHeight: `${Math.max(spaceBelow - minSpace, 100)}px`
          }
        } else if (canShowAbove) {
          // 上方空间足够，显示在上方
          position.value = 'top'
          menuStyle.value = {
            bottom: `${windowHeight - triggerTop + 4}px`, // 往上偏移4px
            left: `${triggerLeft}px`,
            minWidth: `${triggerWidth}px`,
            maxHeight: `${Math.max(spaceAbove - minSpace, 100)}px`
          }
        } else {
          // 上下都不足，选择空间更大的方向
          if (spaceBelow >= spaceAbove) {
            position.value = 'bottom'
            menuStyle.value = {
              top: `${triggerBottom + 4}px`, // 往下偏移4px
              left: `${triggerLeft}px`,
              minWidth: `${triggerWidth}px`,
              maxHeight: `${Math.max(spaceBelow - minSpace, 100)}px`
            }
          } else {
            position.value = 'top'
            menuStyle.value = {
              bottom: `${windowHeight - triggerTop + 4}px`, // 往上偏移4px
              left: `${triggerLeft}px`,
              minWidth: `${triggerWidth}px`,
              maxHeight: `${Math.max(spaceAbove - minSpace, 100)}px`
            }
          }
        }
      }
    })
  })
}

// 组件卸载时清理
onUnmounted(() => {
  uni.$off(DROPDOWN_EVENT, handleGlobalClose)
  close()
})

// 初始化事件监听
initEvent()

// 提供给子组件使用的方法
provide('dropdownClose', close)

// 暴露方法
defineExpose({
  open,
  close,
  toggle: () => visible.value ? close() : open()
})
</script>

<style lang="scss" scoped>
.dropdown-wrapper {
  position: relative;
}

.dropdown-menu {
  position: fixed;
  z-index: 999;
  background-color: #fff;
  border-radius: 8rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  animation: dropdown-fade-in 0.2s ease-out;
  box-sizing: border-box;
}

.dropdown-menu-bottom {
  transform-origin: top;
}

.dropdown-menu-top {
  transform-origin: bottom;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-10rpx) scaleY(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scaleY(1);
  }
}
</style>