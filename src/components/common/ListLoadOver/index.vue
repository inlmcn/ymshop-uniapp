<!--
    @name: index
    @author: kahu4
    @date: 2023-11-06 18:08
    @description：index
    @update: 2023-11-06 18:08
-->
<script setup>

</script>

<template>
  <view class="load-over flex flex-ai__center flex-jc__center">
    <view class="line"></view>
    <view class="text">
      <slot>
        到底了
      </slot>
    </view>
    <view class="line"></view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.load-over {
  font-size: 28rpx;
  position: relative;
  color: $tips-color;

  .line {
    width: 130rpx;
    height: 2rpx;
    border-radius: 2rpx;
    background: $tips-color;
  }

  .text {
    @include usePadding(30, 20)
  }
}
</style>
