<!--
    @name: DistributorDataItem
    @author: kahu4
    @date: 2024-01-17 15:50
    @description：DistributorDataItem
    @update: 2024-01-17 15:50
-->
<script setup>

import { distributorDataList } from "../index.data";
import { computed, toRefs } from "vue";

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const {data} = toRefs(props)

const tagType = computed(() => {
  return ["待结算", "已结算", "已取消"][data.value.status]
})
const tagClass = computed(() => {
  return ["", "success-tag", "default-tag"][data.value.status]
})
</script>

<template>
  <view class="user-item">
    <view class="userinfo-row flex flex-jc__start">
      <view class="userinfo flex flex-column flex-jc__sb">
        <view class="username flex flex-jc__sb">
          {{ data.userName }}
          <text
              class="tag default-tag"
              :class="tagClass">
            {{ tagType }}
          </text>
        </view>
        <view class="time">订单号：{{ data.orderId }}</view>
      </view>
    </view>
    <view class="distribution-info-row">
      <view
          class="info-item"
          v-for="distributorData in distributorDataList"
          :key="distributorData.label">
        <view class="title">{{ distributorData.label }}</view>
        <view class="count">{{ data[distributorData.field] || 0 }}</view>
      </view>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss">
.user-item {
  margin-bottom: 16rpx;
  @include usePadding(32, 32);
  background: $white-color;
  border-radius: 15rpx;

  .userinfo-row {
    padding-bottom: 16rpx;
    margin-bottom: 16rpx;
    border-bottom: 1rpx solid $page-bg-color;

    image {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      background: #fbfbfb;
    }

    .userinfo {
      width: 100%;

      .username {
        width: 100%;
        font-size: 28rpx;
        font-weight: bold;
        @include useFlex(space-between, center);

        .tag {
          @include usePadding(24, 4);
          margin-left: 12rpx;
          color: $primary-color;
          background: #E85A2B12;
          border-radius: 50rpx;
          font-size: 24rpx;
          font-weight: normal;
        }

        .default-tag {
          color: #999999;
          background: #F6F6F6;
        }

        .success-tag {
          background: #EAF9EC !important;
          color: #28c445 !important;
        }
      }

      .time {
        color: $tips-color;
        font-size: 24rpx;
      }
    }
  }

  .distribution-info-row {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 16rpx;

    .info-item {
      @include usePadding(16, 16);
      border-radius: 15rpx;
      background: #f6f6f6;
      color: #7A7A7A;
      font-size: 24rpx;

      .title {
        white-space: nowrap;
      }

      .count {
        color: #333;
        font-weight: bold;
      }
    }
  }

}

</style>
