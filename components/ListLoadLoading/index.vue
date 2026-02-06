<!--
    @name: index
    @author: kahu4
    @date: 2023-11-06 18:08
    @description：index
    @update: 2023-11-06 18:08
-->
<script setup>
import { toRefs } from "vue";
const props = defineProps({
  text: {
    type: String,
    default: () => '加载中...'
  },
  showLine :{
    type: Boolean,
    default:true
  }
})
const {text} = toRefs(props)
</script>

<template>
  <view class="load-over flex flex-ai__center flex-jc__center">
    <view class="line" v-if="showLine"></view>
    <view class="text-box flex flex-ai__center flex-jc__center">
      <view
          :class="{text:true}"
          :style="{animationDelay: `${index*0.2}s`}"
          v-for="(item,index) in text"
          :key="index"
      >
        {{ item }}
      </view>
    </view>
    <view class="line" v-if="showLine"></view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.load-over {
  position: relative;
  color: $tips-color;

  .line {
    width: 130rpx;
    height: 2rpx;
    border-radius: 2rpx;
    background: $tips-color;
  }

  .text-box {
    @include usePadding(30, 20);

    .text {
      @include usePadding(5, 0);
      animation: jump 3s ease-in-out infinite;
    }
  }
}

@keyframes jump {
  0%, 60% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-15rpx);
  }
  40% {
    transform: translateY(15rpx);
  }
}
</style>
