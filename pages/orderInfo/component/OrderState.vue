<!--
    @name: OrderState
    @author: kahu4
    @date: 2024-01-22 11:38
    @description：OrderState
    @update: 2024-01-22 11:38
-->
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  orderInfoData: {
    type: Object,
    required: true
  },
  remainTimeStr: {
    type: String,
    default: ''
  }
})

const { orderInfoData, remainTimeStr } = toRefs(props)
</script>

<template>
  <view class="order-status-info">
    <template
      v-if="orderInfoData.shippingType !== 2 || (orderInfoData.status === 2 && orderInfoData._status._type === '4')">
      <view :class="'order-status-' + orderInfoData.status" class="order-status">
        <view>{{ orderInfoData._status._title }}</view>
      </view>
      <view class="order-date">
        {{ orderInfoData._status._type === "2" ? `${remainTimeStr}` : orderInfoData._status._msg }}
      </view>
    </template>
    <template v-else>
      <!-- 核销订单  订单状态为8 待发货且shippingType为2 展示待核销 -->
      <template v-if="orderInfoData._status._type === '8'">
        <view :class="'order-status-' + orderInfoData.status" class="order-status">
          <view>待核销</view>
        </view>
        <view class="order-date">
          为保障您的权益，未到店前请不要将核销码提供给商家
        </view>
      </template>
      <!-- 否则和普通展示一样 -->
      <template v-else>
        <view :class="'order-status-' + orderInfoData.status" class="order-status">
          <view>{{ orderInfoData._status._title }}</view>
        </view>
        <view class="order-date">
          {{ orderInfoData._status._type === "2" ? `${remainTimeStr}` : orderInfoData._status._msg }}
        </view>
      </template>

    </template>
  </view>
</template>

<style scoped lang="scss">
@import "../../../style/images";

.order-status-info {
  padding: 50rpx 0;


  .order-status {
    display: flex;
    align-items: center;
    height: 42rpx;
    font-size: 30rpx;
    color: #222222;
    margin-bottom: 20rpx;
    padding-left: 50rpx;
    background-size: 40rpx 40rpx;
    background-position: left center;
    background-repeat: no-repeat;

    .image {
      width: 40rpx;
      height: 40rpx;
      margin-right: 10rpx;
    }

    &.order-status-0,
    &.order-status--1,
    &.order-status-4,
    &.order-status-5,
    &.order-status-6,
    &.order-status-7 {
      background-image: $orderStateMoney;
    }

    &.order-status-1,
    &.order-status-99 {
      background-image: $orderStateReturn;
    }

    &.order-status-2,
    &.order-status-3 {
      background-image: $orderStateFinish;
    }
  }

  .order-date {
    height: 33rpx;
    font-size: 24rpx;
    color: #666666;
    padding-left: 50rpx;
  }
}
</style>
