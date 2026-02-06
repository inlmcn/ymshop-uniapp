<template>
  <view 
    class="virtual-list" 
    :style="{ height: containerHeight + 'px' }"
    @scroll="onScroll"
    :scroll-y="true"
  >
    <view 
      class="virtual-list-container"
      :style="{ height: totalHeight + 'px', position: 'relative' }"
    >
      <view 
        class="virtual-list-spacer"
        :style="{ height: offset + 'px' }"
      ></view>
      <view 
        class="virtual-list-content"
        :style="{ position: 'absolute', top: offset + 'px', width: '100%' }"
      >
        <view
          v-for="item in visibleItems"
          :key="itemKey ? item[itemKey] : item.id || item.index"
          class="virtual-list-item"
          :style="{ height: itemHeight + 'px' }"
        >
          <slot :item="item" :index="item.index"></slot>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

interface Props {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  itemKey?: string; // 用于生成key的字段名
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 100,
  containerHeight: 400,
  itemKey: undefined
});

// 当前滚动位置
const scrollTop = ref(0);
// 缓冲区大小，用于提前渲染上下方的元素
const buffer = 5;

// 计算总高度
const totalHeight = computed(() => props.items.length * props.itemHeight);

// 计算可见区域起始索引
const startIndex = computed(() => {
  const index = Math.floor(scrollTop.value / props.itemHeight) - buffer;
  return Math.max(0, index);
});

// 计算可见区域结束索引
const endIndex = computed(() => {
  const calculatedEndIndex = startIndex.value + Math.ceil(props.containerHeight / props.itemHeight) + buffer * 2;
  return Math.min(props.items.length, calculatedEndIndex);
});

// 计算偏移量
const offset = computed(() => startIndex.value * props.itemHeight);

// 计算可见项目
const visibleItems = computed(() => {
  return props.items
    .slice(startIndex.value, endIndex.value)
    .map((item, index) => ({
      ...item,
      index: startIndex.value + index
    }));
});

// 滚动处理
const onScroll = (e: any) => {
  scrollTop.value = e.detail.scrollTop;
};

// 监听items变化，重置滚动位置
watch(() => props.items, () => {
  scrollTop.value = 0;
});

// 初始滚动到顶部
onMounted(() => {
  scrollTop.value = 0;
});
</script>

<style scoped>
.virtual-list {
  overflow-y: auto;
}

.virtual-list-container {
  width: 100%;
}

.virtual-list-item {
  width: 100%;
  box-sizing: border-box;
}
</style>