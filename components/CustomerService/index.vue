<template>
  <view 
    class="customer-service-btn" 
    :style="btnStyle"
    @click="handleClick">
    <image 
      class="service-icon" 
      :src="icon"
      mode="aspectFit" 
    />
    <text class="service-text">{{ text }}</text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import CustomerServiceUtil from '@/utils/customerService.js'

const props = defineProps({
  // 距离底部距离
  bottom: {
    type: Number,
    default: 100
  },
  // 距离右侧距离
  right: {
    type: Number,
    default: 20
  },
  // 按钮文字
  text: {
    type: String,
    default: '客服'
  },
  // 图标路径
  icon: {
    type: String,
    default: '/static/images/customer-service.png'
  },
  // 按钮大小
  size: {
    type: Number,
    default: 100
  }
})

// 计算按钮样式
const btnStyle = computed(() => {
  return {
    bottom: `${props.bottom}rpx`,
    right: `${props.right}rpx`,
    width: `${props.size}rpx`,
    height: `${props.size}rpx`
  }
})

// 点击处理
const handleClick = () => {
  CustomerServiceUtil.open()
}
</script>

<style scoped lang="scss">
.customer-service-btn {
  position: fixed;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  z-index: 9999;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
  }
  
  .service-icon {
    width: 40rpx;
    height: 40rpx;
    margin-bottom: 4rpx;
  }
  
  .service-text {
    font-size: 20rpx;
    color: #ffffff;
    font-weight: 500;
  }
}
</style>
