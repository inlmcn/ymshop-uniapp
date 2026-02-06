<template>
  <uv-tabs 
    :list="list" 
    @click="handleClick" 
    :itemStyle="itemStyle"
    lineWidth="100rpx" 
    lineColor="#00CBCC" 
    :current="current" 
    :scrollable="scrollable"
  >
  </uv-tabs>
</template>

<script setup lang="ts">
import { computed, PropType } from 'vue';
import type { OrderNavItem } from '@/src/types/order';
import { useSystem } from '@/src/hooks/useSystem';

interface Props {
  list: OrderNavItem[];
  current: number;
}

interface Emits {
  (e: 'change', data: OrderNavItem): void;
}

const props = defineProps<{
  list: OrderNavItem[];
  current: number;
}>();

const emit = defineEmits<Emits>();

const itemStyle = computed(() => ({
  width: '100rpx',
  padding: '15rpx',
  marginBottom: '10rpx'
}));

const scrollable = computed(() => {
  // 根据屏幕宽度动态决定是否可滚动
  try {
    const { getWindowInfo } = useSystem();
    const winInfo = typeof getWindowInfo === 'function' ? getWindowInfo() : null;
    const screenWidth = winInfo?.screenWidth || 375;
    return (props.list.length * 90) > screenWidth || screenWidth < 360;
  } catch (e) {
    return props.list.length > 5;
  }
});

function handleClick(data: OrderNavItem) {
  emit('change', data);
}
</script>

<style lang="scss" scoped>
// uv-tabs 组件样式由uv-ui库处理
</style>