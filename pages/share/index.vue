<!--
    @name: 分享跳转页面
    @author: kahu4
    @date: 2023-11-10 11:33
    @description：index
    @update: 2023-11-10 11:33
-->
<script
    setup
>
import {  onBeforeUnmount, onMounted, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { lazyLoading } from "@/utils/images";
import {  useShareInner } from "@/hooks/useShare";

let colorTime
const textColor = ref('#cccccc')
const text = ref('数据处理中...')

const {
  params,
  analysisParams
} = useShareInner()
onMounted(() => {
  colorTime = setInterval(() => {
    textColor.value = textColor.value === '#333' ? "#cccccc" : "#333"
  }, 800)
})

onLoad(options => {
  // 解析参数
  analysisParams(options)
})

onBeforeUnmount(() => {
  colorTime && clearInterval(colorTime)
})
</script>

<template>
  <view class="share-container">
    <view class="main-box">
      <view
          class="loading"

      >
        <image :src="lazyLoading" />
      </view>
      <view
          class="text"
          :style="{color:textColor}"
      >
        <view
            :style="{animationDelay: `${index*0.2}s`}"
            v-for="(item,index) in text"
            :key="index"
        >
          {{ item }}
        </view>
      </view>
    </view>
  </view>
</template>


<style lang="scss">
page {
  background: #fafafa;
}
</style>
<style
    scoped
    lang="scss"
>
.share-container {
  width: 100%;

  .main-box {
    position: absolute;
    top: 30%;
    left: 0;
    width: 100%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .loading {
      image{
        width: 300px;
        height: 300px;

      }
    }

    .text {
      margin: 30rpx 0;
      transition: all .3s;
      font-size: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      view {
        margin: 0 5rpx;
        animation: jump 3s ease-in-out infinite;
      }
    }
  }
}

@keyframes spin {
  0% {
    rotate: 0deg;
  }
  100% {
    rotate: 360deg;
  }
  80% {
    rotate: 460deg;
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
