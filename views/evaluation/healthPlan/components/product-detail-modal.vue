<template>
  <view class="detail">
    <uv-popup ref="productDetailPopupRef" mode="bottom" :round="10" :customStyle="{
      width: '100%',
      height: '80vh',
      padding: '0',
    }" :safeAreaInsetBottom="true" @open="onPopupOpen" @close="onPopupClose">
      <view class="product-detail-popup" @touchmove.stop.prevent="moveHandle">
        <!-- 关闭按钮 -->
        <view class="product-detail-popup-close" @click="close">
          <uv-icon name="close" size="32rpx" color="#ffffff"></uv-icon>
        </view>

        <view
          style="width: 100%; height: 100%; border-radius: 20rpx 20rpx 0 0; overflow: hidden; background-color: #ffffff">
          <!-- 滚动区域 -->
          <scroll-view class="popup-content" scroll-y>
            <slot></slot>
          </scroll-view>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<script setup>
import { ref, defineExpose } from "vue";

// 弹窗引用
const productDetailPopupRef = ref(null);
const showDetailPopupRef = ref(null);
const productId = ref(null)

const moveHandle = () => {
  // 阻止滚动穿透
};

// 关闭弹窗方法（对外暴露）
const close = () => {
  productDetailPopupRef.value.close();
};

// 弹窗打开事件
const onPopupOpen = () => {
  // 弹窗打开时的逻辑
  // 禁用父页面滚动 (适用于小程序环境)
  // 通过给页面根节点添加类名来控制滚动
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const pageEl = currentPage.$el;
  if (pageEl) {
    pageEl.classList.add("popup-open");
  }
};

// 弹窗关闭事件
const onPopupClose = () => {
  // 弹窗关闭时的逻辑
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const pageEl = currentPage.$el;
  if (pageEl) {
    pageEl.classList.remove("popup-open");
  }
};

// 打开弹窗方法（对外暴露）
const open = async (id) => {
  productId.value = id;
  productDetailPopupRef.value.open();
};

// 对外暴露方法
defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.product-detail-popup {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* 弹窗打开时禁用页面滚动 */
:global(.popup-open) {
  overflow: hidden !important;
  position: fixed !important;
  width: 100% !important;
}

.product-detail-popup-close {
  position: absolute;
  top: -80rpx;
  right: 20rpx;
  width: 45rpx;
  height: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 10;
  border: 2px solid #ffffff;
}

.popup-content {
  flex: 1;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
}
</style>
