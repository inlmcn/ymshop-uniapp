<template>
  <uv-popup 
    mode="bottom" 
    :closeable="false" 
    :safe-area-inset-bottom="true" 
    round="30rpx" 
    padding="40rpx"
    ref="drugDetailRef"
    @change="closeModal"
    >
    <view class="drug-detail">
      <view class="drug-detail-content">
        <scroll-view scroll-x="true" scroll-y="false" style="height: 65vh">
          <rich-text :nodes="description" bindtap="onOpenLink" />
        </scroll-view>
        <view class="drug-detail-button">
          <view type="primary" @click="close">返回</view>
        </view>
      </view>
      <view class="drug-detail-close" @click="close">
        <uv-icon name="close" color="#ffffff" size="20" bold></uv-icon>
      </view>
    </view>
  </uv-popup>
</template>

<script setup>
import { ref, defineExpose } from "vue";

const emit = defineEmits(["closeModal"]);

// 弹窗引用
const drugDetailRef = ref(null);

// 描述内容
const description = ref("");

// 打开弹窗
const open = (content) => {
  description.value = content;
  drugDetailRef.value.open();
};

// 关闭弹窗
const close = () => {
  drugDetailRef.value.close();
};

const closeModal = ({show}) => {
  if(!show) emit("closeModal");
};

// 对外暴露方法
defineExpose({
  open,
  close
});
</script>

<style scoped lang="scss">
.drug-detail {
  background-color: white;
  border-radius: 30rpx 30rpx 0 0;
  position: relative;
}

.drug-detail-content {
  padding: 30rpx 30rpx 0;
}

.drug-detail-close {
  position: absolute;
  right: 50rpx;
  top: -80rpx;
  z-index: 99;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drug-detail-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0 10rpx;

  view {
    line-height: 78rpx;
    background: #00cbcc;
    border-radius: 48rpx;
    border: 0;
    font-size: 28rpx;
    color: white;
    width: 300rpx;
    text-align: center;
  }
}
</style>