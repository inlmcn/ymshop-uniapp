<template>
  <view class="performance-demo-page">
    <uv-navbar 
      title="性能优化演示" 
      :safeAreaInsetTop="true"
      @leftClick="goBack"
    />

    <!-- 性能指标展示 -->
    <view class="perf-metrics">
      <view class="metric-card" v-for="metric in performanceMetrics" :key="metric.label">
        <text class="metric-label">{{ metric.label }}</text>
        <text class="metric-value">{{ metric.value }}</text>
      </view>
    </view>

    <!-- 虚拟滚动列表 -->
    <view class="section-title">虚拟滚动列表</view>
    <VirtualList
      :items="largeListData"
      :itemHeight="100"
      :containerHeight="400"
      itemKey="id"
    >
      <template #default="{ item }">
        <view class="list-item">
          <LazyImage 
            :src="item.avatar" 
            :width="80" 
            :height="80" 
            :radius="40"
            :animation="true"
            @load="onImageLoad"
            @error="onImageError"
          />
          <view class="item-content">
            <text class="item-title">{{ item.name }}</text>
            <text class="item-desc">{{ item.description }}</text>
          </view>
        </view>
      </template>
    </VirtualList>

    <!-- 懒加载图片网格 -->
    <view class="section-title">懒加载图片网格</view>
    <view class="image-grid">
      <view class="grid-item" v-for="image in imageData" :key="image.id">
        <LazyImage 
          :src="image.url" 
          :width="'100%'" 
          :height="150" 
          :radius="8"
          :animation="true"
        />
        <text class="image-caption">{{ image.caption }}</text>
      </view>
    </view>

    <!-- 性能测试按钮 -->
    <view class="controls">
      <button @click="measurePerformance" class="perf-btn">测量性能</button>
      <button @click="preloadPages" class="perf-btn">预加载页面</button>
      <button @click="cleanMemory" class="perf-btn">清理内存</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import VirtualList from '@/src/components/common/VirtualList.vue';
import LazyImage from '@/src/components/common/LazyImage.vue';
import { performanceMonitor, pageLoader, memoryManager } from '@/src/utils';

// 性能指标
const performanceMetrics = ref([
  { label: '页面加载时间', value: '0ms', key: 'pageLoadTime' },
  { label: 'FCP时间', value: '0ms', key: 'firstContentfulPaintTime' },
  { label: 'LCP时间', value: '0ms', key: 'largestContentfulPaintTime' },
  { label: 'API平均响应', value: '0ms', key: 'avgApiTime' }
]);

// 大列表数据
const largeListData = ref<any[]>([]);

// 图片数据
const imageData = ref([
  { id: 1, url: 'https://via.placeholder.com/300x150/FF6B6B/FFFFFF?text=Image+1', caption: '图片1' },
  { id: 2, url: 'https://via.placeholder.com/300x150/4ECDC4/FFFFFF?text=Image+2', caption: '图片2' },
  { id: 3, url: 'https://via.placeholder.com/300x150/45B7D1/FFFFFF?text=Image+3', caption: '图片3' },
  { id: 4, url: 'https://via.placeholder.com/300x150/96CEB4/FFFFFF?text=Image+4', caption: '图片4' },
  { id: 5, url: 'https://via.placeholder.com/300x150/FFEAA7/333333?text=Image+5', caption: '图片5' },
  { id: 6, url: 'https://via.placeholder.com/300x150/DDA0DD/FFFFFF?text=Image+6', caption: '图片6' }
]);

// 生成模拟的大列表数据
const generateLargeListData = () => {
  const data = [];
  for (let i = 1; i <= 1000; i++) {
    data.push({
      id: i,
      name: `项目 ${i}`,
      description: `这是第 ${i} 个项目的描述信息，用于展示虚拟滚动列表的性能优化效果`,
      avatar: `https://via.placeholder.com/80x80/RandomColor/FFFFFF?text=${i % 100}`
    });
  }
  largeListData.value = data;
};

// 更新性能指标
const updatePerformanceMetrics = () => {
  const metrics = performanceMonitor.getMetrics();
  const avgApiTime = performanceMonitor.getAverageApiResponseTime();
  
  performanceMetrics.value = performanceMetrics.value.map(metric => {
    let value = '0ms';
    
    if (metric.key === 'pageLoadTime') {
      value = `${Math.round(metrics.pageLoadTime)}ms`;
    } else if (metric.key === 'firstContentfulPaintTime') {
      value = `${Math.round(metrics.firstContentfulPaintTime)}ms`;
    } else if (metric.key === 'largestContentfulPaintTime') {
      value = `${Math.round(metrics.largestContentfulPaintTime)}ms`;
    } else if (metric.key === 'avgApiTime') {
      value = `${Math.round(avgApiTime)}ms`;
    }
    
    return { ...metric, value };
  });
};

// 测量性能
const measurePerformance = () => {
  performanceMonitor.logPerformance();
  updatePerformanceMetrics();
};

// 预加载页面
const preloadPages = async () => {
  try {
    uni.showLoading({ title: '预加载中...' });
    
    // 预加载一些常用页面
    const pagesToPreload = ['/pages/user/user', '/pages/order/orderList', '/pages/product/index'];
    await pageLoader.preloadPages(pagesToPreload);
    
    uni.hideLoading();
    uni.showToast({ title: '页面预加载完成', icon: 'success' });
  } catch (error) {
    console.error('页面预加载失败:', error);
    uni.hideLoading();
    uni.showToast({ title: '预加载失败', icon: 'error' });
  }
};

// 清理内存
const cleanMemory = () => {
  memoryManager.performGarbageCollection();
  memoryManager.logMemoryUsage();
  uni.showToast({ title: '内存清理完成', icon: 'success' });
};

// 图片加载成功回调
const onImageLoad = (e: any) => {
  console.log('图片加载成功:', e);
};

// 图片加载失败回调
const onImageError = (e: any) => {
  console.error('图片加载失败:', e);
};

// 返回上一页
const goBack = () => {
  uni.navigateBack();
};

onMounted(() => {
  generateLargeListData();
  updatePerformanceMetrics();
});

onUnmounted(() => {
  // 组件卸载时清理资源
  memoryManager.touchResource('performance-demo-page');
});
</script>

<style lang="scss" scoped>
.performance-demo-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin: 30rpx 0 20rpx 0;
  color: #333;
}

.perf-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.metric-card {
  background: white;
  border-radius: 12rpx;
  padding: 20rpx;
  min-width: 200rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.metric-label {
  display: block;
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.metric-value {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: white;
  border-bottom: 1rpx solid #f0f0f0;

  .item-content {
    margin-left: 20rpx;
    flex: 1;

    .item-title {
      display: block;
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 8rpx;
    }

    .item-desc {
      display: block;
      font-size: 24rpx;
      color: #666;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.grid-item {
  background: white;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .image-caption {
    display: block;
    padding: 15rpx 10rpx;
    font-size: 24rpx;
    color: #333;
    text-align: center;
  }
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 30rpx;
}

.perf-btn {
  background: #00CBCC;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}
</style>