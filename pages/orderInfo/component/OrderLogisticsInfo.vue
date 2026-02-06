<!--
    @name: OrderLogisticsInfo
    @author: kahu4
    @date: 2024-01-22 12:02
    @description：OrderLogisticsInfo
    @update: 2024-01-22 12:02
-->
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  orderInfoData: {
    type: Object,
    required: true
  },
  expressData: {
    type: Object,
    required: true
  }
})

const {orderInfoData, expressData} = toRefs(props)
</script>

<template>
  <view
      v-if="orderInfoData.status >= 1 && expressData"
      class="logistics-container"
  >
    <view class="logistics-header">
      <view class="logistics-title">
        物流信息
      </view>
    </view>
    <view
        v-if="expressData"
        class="logistics-body"
    >
      <view class="logistics-content">
        <view
            v-if="expressData.length === 0"
            class="logistics-empty">暂无轨迹信息
        </view>
        <uv-steps
            v-else
            activeColor="#00CBCC"
            current="0"
            direction="column"
            inactiveColor="#E5E5E5"
        >
          <uv-steps-item
              v-for="(item, index) in expressData"
              :key="index"
              :desc="item.AcceptTime"
              :title="item.AcceptStation"
          ></uv-steps-item>
        </uv-steps>
      </view>
    </view>
  </view>

</template>

<style
    scoped
    lang="scss">
.logistics-container {
  margin-bottom: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.logistics-header {
  padding: 24rpx 30rpx 20rpx;
  /* border-bottom: 1rpx solid #f5f5f5; */
}

.logistics-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  line-height: 44rpx;
}

.logistics-body {
  padding: 20rpx 0;
}

.logistics-content {
  padding: 0 20rpx;
}

.logistics-empty {
  padding: 40rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999999;
  line-height: 40rpx;
}
</style>
