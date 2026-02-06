<template>
  <view class="upvideo-box">
    <Header :show-return="true" :show-right="true" header-area-bg="#000000" system-bar-area-bg="#000000">
      <template #left>
        <view class="header-left">
          <uv-icon name="arrow-left" size="20" color="#fff" @click="goBack" />
        </view>
      </template>
      <text class="header-title"></text>
    </Header>

    <video
      :controls="true"
      :custom-cache="false"
      :show-play-btn="true"
      play-btn-position="center"
      :show-center-play-btn="true"
      v-if="videoUrl"
      :style="{ width: '100%', height: `calc(100vh - ${headerHeight}px - ${safeAreaBottom}px)` }"
      :autoplay="true"
      :src="videoUrl"
    ></video>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import Header from "@/components/Header/index.vue";

// 响应式数据
const videoUrl = ref("");
const systemInfo = ref({});

// 计算属性
const headerHeight = computed(() => {
  const statusBarHeight = systemInfo.value.statusBarHeight || 0;
  return 44 + statusBarHeight;
});

const safeAreaBottom = computed(() => {
  return systemInfo.value.safeAreaInsets?.bottom || 10;
});

// 生命周期钩子
onMounted(() => {
  systemInfo.value = uni.getSystemInfoSync();
});

onLoad((options) => {
  if (options.url) {
    videoUrl.value = uni.getStorageSync("videoUrl");
  }
});

// 方法
const goBack = () => {
  uni.navigateBack({
    delta: 1,
  });
};
</script>

<style lang="scss">
.upvideo-box {
  height: 100vh;
  background-color: #000000;
}

.upvideo-btns {
  position: fixed;
  bottom: 80rpx;
  left: 0;
  width: 100vw;
  box-sizing: border-box;
  padding: 0 50rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 99;

  & > view {
    width: 200rpx;
    text-align: center;
    font-size: 32rpx;
    color: white;
    box-sizing: 0 0 2px rgba(0, 0, 0, 0.6);
  }
}

.videoup-btns {
  padding: 20rpx 0 0;
  box-shadow: 0rpx -1rpx 10rpx 0rpx rgba(0, 0, 0, 0.13);
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 9;
  background-color: white;
}

.videoup-btns-inner {
  display: flex;
  justify-content: space-around;

  view:first-child {
    width: 30%;
    line-height: 80rpx;
    background: #ffffff;
    border: 1px solid #dd2e1e;
    border-radius: 40rpx;
    text-align: center;
    font-size: 32rpx;
    color: #d63131;
  }

  view:nth-child(2) {
    width: 30%;
    line-height: 80rpx;
    background: #ffffff;
    border: 1px solid #dd2e1e;
    border-radius: 40rpx;
    text-align: center;
    font-size: 32rpx;
    color: #d63131;
  }

  view:nth-child(3) {
    position: relative;
    width: 30%;
    line-height: 80rpx;
    background: linear-gradient(-90deg, #f2672a, #da2626);
    box-shadow: 0rpx 4rpx 10rpx 0rpx rgba(193, 23, 23, 0.51);
    border-radius: 40rpx;
    text-align: center;
    font-size: 32rpx;
    color: #ffffff;
  }
}
</style>