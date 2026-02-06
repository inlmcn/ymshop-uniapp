<!--
    @name: GoodsItemOptions
    @author: kahu4
    @date: 2024-01-16 11:57
    @description：拼团商品底部按钮
    @update: 2024-01-16 11:57
-->
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  goods: {
    type: Object,
    required: true
  }
})
const {goods} = toRefs(props)
</script>

<template>
  <view class="options flex flex-jc__sb flex-ai__end">
    <view class="left-info">
      <view class="row">
        3人团
      </view>
      <view class="price-row flex flex-ai__end">
        ￥329
        <view class="old-price">
          ￥666
        </view>
      </view>
    </view>
    <view class="button animation-button" @click.stop="">
      立即拼团
    </view>
  </view>
</template>

<style lang="scss"
       scoped>
.options {
  width: 100%;


  .left-info{
    color:$tips-color;
    font-size: 24rpx;
    .price-row{
      margin-top: 5rpx;
      color: $primary-color;
      font-size: 30rpx;
      .old-price{
        text-decoration: line-through;
        color:$tips-color;
        font-size: 20rpx;
        margin-left: 10rpx;
      }
    }
  }
  .button{
    min-width: 45%;
    background: $primary-color;
    color: #fff;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
