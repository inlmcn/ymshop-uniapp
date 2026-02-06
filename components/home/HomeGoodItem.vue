<!--
    @name: HomeGoodItem
    @author: kahu4
    @date: 2023-10-27 14:47
    @description：HomeGoodItem
    @update: 2023-10-27 14:47
-->
<script setup>
import { useRouter } from "@/hooks/useRouter";
const {push} = useRouter()
const props = defineProps({
  good: {
    type: Object
  },
  background: {
    type: String,
    default: '#fff'
  },
  infoPadding: {
    type: Number,
    default: 0
  }
})
const toDetail = () => {
  push({url: '/pages/goodsDetail/goodsDetail'},{data:{id: props.good.id}})
}
</script>

<template>
  <view
      class="good-item"
      :style="{background:props.background}"
      @tap="toDetail"
  >
    <view class="image">
      <image
          :src="props.good.image"
          mode="aspectFill"
      />
    </view>
    <view
        class="info-box"
        :style="{padding:`0 ${props.infoPadding}rpx`}"
    >
      <view class="title-row">
        {{ props.good.storeName }}
      </view>
      <view class="price-row">
        <slot
            name="bottom"
            :good="good"
        ></slot>
      </view>
    </view>
    <view class="blank"></view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.good-item {
  position: relative;
  width: 100%;
  border-radius: 15rpx;
  overflow: hidden;
  .image {
    width: 100%;
    aspect-ratio: 1 / 1;

    image {
      width: 100%;
      height: 100%;
      border-radius: 10rpx;
    }
  }

  .info-box {
    width: 100%;
    box-sizing: border-box;

    .title-row {
      margin: 14rpx 0;

      max-width: 25vw;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      font-weight: 500;
      font-size: 26rpx;
    }
  }

  .blank {
    width: 100%;
    height: 22rpx;
  }

}
</style>
