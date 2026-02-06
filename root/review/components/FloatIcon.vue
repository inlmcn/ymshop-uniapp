<template>
  <view 
    class="float-icon" 
    :style="{ left: position.left + 'px', bottom: position.bottom + 'px', right: 'auto' }"
    @click="handleClick" 
    @touchstart="handleTouchstart" 
    @touchmove="handleTouchmove" 
    @touchend="handleTouchend"
  >
    <image :src="EVALUATION_IMG_PATH + 'free_cp.png'" mode="widthFix"></image>
  </view>
  <view class="float-icon-mask" :class="{ left: isNearLeft, right: isNearRight }"></view>
</template>

<script setup name="FloatIcon">
import { ref, onMounted, watch } from 'vue'
import { EVALUATION_IMG_PATH } from '@/utils/imgpath'

const emit = defineEmits(['click'])

const props = defineProps({
  topLimit: {
    type: Number,
    default: 0
  },
  bottomLimit: {
    type: Number,
    default: 0
  }
})

// 组件位置
const position = ref({
  left: 0,
  bottom: 0
})

// 拖拽相关状态
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startLeft = ref(0)
const startBottom = ref(0)
const screenWidth = ref(0)
const screenHeight = ref(0)
const isNearLeft = ref(false)
const isNearRight = ref(false)

onMounted(() => {
  // 获取屏幕信息
  const systemInfo = uni.getSystemInfoSync()
  screenWidth.value = systemInfo.windowWidth
  screenHeight.value = systemInfo.windowHeight
  
  // 将110rpx转换为px
  const iconWidth = uni.upx2px(110)
  
  // 初始化位置：右侧10px
  const bottomLimit = props.bottomLimit
  position.value.left = screenWidth.value - iconWidth - 10
  position.value.bottom = bottomLimit
})

const handleClick = (e) => {
  // 如果正在拖拽，不触发点击事件
  if (isDragging.value) {
    return
  }
  emit('click')
}

const handleTouchstart = (e) => {
  isDragging.value = false
  const touch = e.touches[0]
  startX.value = touch.clientX
  startY.value = touch.clientY
  startLeft.value = position.value.left
  startBottom.value = position.value.bottom
}

const handleTouchmove = (e) => {
  e.preventDefault()
  isDragging.value = true
  const touch = e.touches[0]
  
  // 计算移动距离
  const deltaX = touch.clientX - startX.value
  const deltaY = startY.value - touch.clientY // Y轴方向相反
  
  // 计算新位置
  let newLeft = startLeft.value + deltaX
  let newBottom = startBottom.value + deltaY
  
  // 将110rpx转换为px
  const iconWidth = 56
  const iconHeight = 55
  
  // 限制左右边界
  if (newLeft < 0) {
    newLeft = 0
  } else if (newLeft + iconWidth > screenWidth.value) {
    newLeft = screenWidth.value - iconWidth
  }
  
  // 限制底部最小距离为 bottomLimit
  const bottomLimit = props.bottomLimit
  if (newBottom < bottomLimit) {
    newBottom = bottomLimit
  }
  
  // 限制顶部最小距离为 topLimit
  const topLimit = props.topLimit + 15
  const topDistance = screenHeight.value - newBottom - iconHeight
  if (topDistance < topLimit) {
    newBottom = screenHeight.value - iconHeight - topLimit
  }
  
  // 检测是否进入磁吸区域（距离左右边缘不足60px）
  const distanceToLeft = newLeft
  const distanceToRight = screenWidth.value - newLeft - iconWidth
  
  if (distanceToLeft < 60) {
    isNearLeft.value = true
    isNearRight.value = false
  } else if (distanceToRight < 60) {
    isNearLeft.value = false
    isNearRight.value = true
  } else {
    isNearLeft.value = false
    isNearRight.value = false
  }
  
  // 实时更新位置
  position.value.left = newLeft
  position.value.bottom = newBottom
}

const handleTouchend = (e) => {
  if (!isDragging.value) {
    return
  }
  
  // 将110rpx转换为px
  const iconWidth = 56
  
  // 检查距离左右两边的距离
  const distanceToLeft = position.value.left
  const distanceToRight = screenWidth.value - position.value.left - iconWidth
  
  // 如果距离左边不足60px，吸附到左侧10px
  if (distanceToLeft < 60) {
    position.value.left = 10
  }
  // 如果距离右边不足60px，吸附到右侧10px
  else if (distanceToRight < 60) {
    position.value.left = screenWidth.value - iconWidth - 10
  }
  
  // 确保底部距离不小于 bottomLimit
  const bottomLimit = props.bottomLimit
  if (position.value.bottom < bottomLimit) {
    position.value.bottom = bottomLimit
  }
  
  // 确保顶部距离不小于 topLimit
  const iconHeight = 55
  const topLimit = props.topLimit + 15
  const topDistance = screenHeight.value - position.value.bottom - iconHeight
  if (topDistance < topLimit) {
    position.value.bottom = screenHeight.value - iconHeight - topLimit
  }
  
  // 拖拽结束后重置磁吸区域状态
  isNearLeft.value = false
  isNearRight.value = false
  
  // 延迟重置拖拽状态，避免触发点击事件
  setTimeout(() => {
    isDragging.value = false
  }, 100)
}

// 监听 bottomLimit 变化，如果当前位置超出限制则调整位置
watch(() => props.bottomLimit, (newBottomLimit) => {
  if (position.value.bottom < newBottomLimit) {
    // 检查调整后是否会超出顶部限制
    const iconHeight = 55
    const topLimit = props.topLimit + 15
    const newBottom = newBottomLimit
    const topDistance = screenHeight.value - newBottom - iconHeight
    
    // 如果调整后不会超出顶部限制，则直接调整到底部限制
    if (topDistance >= topLimit) {
      position.value.bottom = newBottomLimit
    } else {
      // 如果会超出顶部限制，则调整到顶部限制对应的底部位置
      position.value.bottom = screenHeight.value - iconHeight - topLimit
    }
  }
})

</script>

<style lang="scss" scoped>
.float-icon {
  position: fixed;
  width: max-content;
  z-index: 999;
  touch-action: none; // 防止默认触摸行为

  image {
    width: 56px;
    height: 55px;
  }

}

.float-icon-mask {
  position: fixed;
  top: 0;
  z-index: 1;
  height: 100vh;
  width: 0;
  pointer-events: none;

  &.left {
    left: 0;
    transition: box-shadow 0.2s ease;
    box-shadow: 0 0 12px 3px rgba(0, 203, 204, 0.5);
  }

  &.right {
    right: 0;
    transition: box-shadow 0.2s ease;
    box-shadow: 0 0 12px 3px rgba(0, 203, 204, 0.5);
  }
}

</style>