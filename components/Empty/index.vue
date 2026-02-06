<!--
    @name: 空状态组件
    @author: kahu4
    @date: 2023-10-30 16:47
    @description：index
    @update: 2023-10-30 16:47
-->
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  iconSrc: {},
  padding: {
    type: String,
    default: () => '260rpx 0 0 0'
  }
})

const {iconSrc, padding} = toRefs(props)

</script>

<template>
  <view
      class="empty-container"
      :style="{padding}"
  >
    <view class="icon-box">
      <slot name="icon">
        <image :src="iconSrc" />
      </slot>
    </view>
    <view class="info-row">
      <slot>空空如也~</slot>
    </view>
    <view class="bottom-row">
      <slot name="bottom"></slot>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding-top: 260rpx;

  .icon-box {
    image {
      width: 170rpx;
      height: 170rpx;
    }
  }

  .info-row {
    padding: 20rpx 0 30rpx 0;
    font-size: 28rpx;
    color: #333333;
  }
}
</style>
