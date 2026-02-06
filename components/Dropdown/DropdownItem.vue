<template>
  <view 
    class="dropdown-item"
    :class="{
      'dropdown-item-disabled': disabled,
      'dropdown-item-active': active
    }"
    @tap="handleClick"
  >
    <slot></slot>
  </view>
</template>

<script setup>
import { inject } from 'vue'

const props = defineProps({
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否激活状态
  active: {
    type: Boolean,
    default: false
  },
  // 值
  value: {
    type: [String, Number],
    default: ''
  }
})

const emit = defineEmits(['click'])

// 注入父组件的关闭方法
const dropdownClose = inject('dropdownClose', null)

const handleClick = () => {
  if (props.disabled) return
  emit('click', props.value)
  // 点击后关闭下拉菜单
  if (dropdownClose) {
    dropdownClose()
  }
}
</script>

<style lang="scss" scoped>
.dropdown-item {
  padding: 20rpx 32rpx;
  font-size: 26rpx;
  color: #333;
  line-height: 1.5;
  transition: background-color 0.2s;
  position: relative;
  
  &:active {
    background-color: #f5f5f5;
  }
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 32rpx;
    right: 32rpx;
    bottom: 0;
    height: 1rpx;
    background-color: #f0f0f0;
    transform: scaleY(0.5);
  }
}

.dropdown-item-disabled {
  color: #c0c0c0;
  cursor: not-allowed;
  
  &:active {
    background-color: transparent;
  }
}

.dropdown-item-active {
  color: #00cbcc;
  background-color: #f0fafa;
}
</style>
