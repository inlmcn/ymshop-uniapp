<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 16:30
    @description：分销订单
    @update: 2024-01-17 16:30
-->
<script setup>
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import { ref } from "vue";
import DistributorInfoItem from "./component/DistributorInfoItem.vue";
import UniDatetimePicker from "@/pages/components/Uni/uni-datetime-picker/uni-datetime-picker.vue";
import { usePaging } from "@/hooks/usePaging";
import { getDistributionDetail, pageDistributionOrder } from "@/api/distribution";
import dayjs from "dayjs";
import { emptyOrderIcon } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";

// ======================= hooks =====================
const {scrollTop} = useScroll()
onPageScroll(() => {
})

// ======================== level tab ====================
const leverTabs = ref([
  {label: '全部', filed: '', value: 0, time: []},
  {
    label: '今日',
    filed: '',
    value: 1,
    time: [dayjs().format("YYYY-MM-DD 00:00:00"), dayjs().format("YYYY-MM-DD 23:59:59")]
  },
  {
    label: '昨日',
    filed: '',
    value: 2,
    time: [dayjs().subtract(1, "days").format("YYYY-MM-DD 00:00:00"), dayjs().subtract(1, "days").format("YYYY-MM-DD 23:59:59")]
  },
  {
    label: '本月', filed: '', value: 3, time: [
      dayjs()
          .startOf("month")
          .format("YYYY-MM-DD 00:00:00"),
      dayjs()
          .endOf("month")
          .format("YYYY-MM-DD 23:59:59")
    ]
  },
  {label: '自定义', filed: '', value: 4, time: []}
])
const leverCurrent = ref(0)

function leverSelect(value) {
  if (value === 4) {
    showSelectTime()
    leverCurrent.value = value
  } else {
    leverTabs.value[4].time = []
    leverCurrent.value = value
    otherParams.value.createTime = leverTabs.value[leverCurrent.value].time
    if (!otherParams.value.createTime || otherParams.value.createTime.length <= 0) {
      delete otherParams.value.createTime
    }
    refreshPage()
    doGetDistributionDetail()
  }
}

// ==================== date ==============================
const dateRangeRef = ref()

function showSelectTime() {
  dateRangeRef.value.show()
}

function timeChange(e) {
  leverTabs.value[4].time = e
  // 请求接口
  otherParams.value.createTime = e
  refreshPage()
  doGetDistributionDetail()
}

// ===================== data ==============================
const {otherParams, list, loading, refreshPage} = usePaging({
  request: pageDistributionOrder,
  load: false
});

const distributionDetail = ref({
  "refuseAmount": 0,
  "amount": 0,
  "orderCount": 0
})

/**
 * 获取分销佣金详情
 * @return {Promise<void>}
 */
async function doGetDistributionDetail() {
  const data = {}
  if (otherParams.value.createTime && otherParams.value.createTime.length > 0) {
    data.createTime = otherParams.value.createTime
  }
  distributionDetail.value = await getDistributionDetail(data);
}

onLoad(() => {
  otherParams.value.createTime = leverTabs.value[leverCurrent.value].time
  if (!otherParams.value.createTime || otherParams.value.createTime.length <= 0) {
    delete otherParams.value.createTime
  }
  refreshPage()
  doGetDistributionDetail()
})
</script>

<template>
  <view class="distribution-order">
    <Header
        :scroll-top="scrollTop"
        header-area-bg="#fff"
        system-bar-area-bg="#fff">
      分销订单
    </Header>
    <!-- tabs -->
    <view class="tab-content">
      <view
          class="tab-item"
          :class="{current:leverCurrent===lever.value}"
          v-for="lever in leverTabs"
          :key="lever.value"
          @click="leverSelect(lever.value)"
      >
        {{ lever.label }}
      </view>
    </view>
    <!-- main -->
    <view class="distribution-order__inner">
      <!-- 统计 -->
      <view class="statistics-card">
        <view class="header">
          共{{ distributionDetail.orderCount }}笔订单
        </view>
        <view class="row flex flex-jc__sb flex-ai__center">
          <view class="item">
            <view class="count">{{ distributionDetail.refuseAmount }}</view>
            <view class="title gray-color">待结算佣金(元)</view>
          </view>
          <view class="item">
            <view class="count">{{ distributionDetail.amount }}</view>
            <view class="title gray-color">已结算佣金(元)</view>
          </view>
        </view>
      </view>
      <view class="user-list">
        <template v-if="list.length>0">
          <DistributorInfoItem
              v-for="item in list"
              :data="item" />
        </template>
        <Empty
            v-else
            :icon-src="emptyOrderIcon" />
      </view>
    </view>
    <!-- 时间选择器 -->
    <uni-datetime-picker
        style="width: 0;height: 0;overflow: hidden;"
        ref="dateRangeRef"
        type="datetimerange"
        :value="leverTabs[4].time"
        @change="timeChange"
    >
    </uni-datetime-picker>
  </view>
</template>

<style
    scoped
    lang="scss">
.distribution-order {
  width: 100%;

  .tab-content {
    width: 100%;
    background: #fff;
    @include usePadding(34, 34);
    @include useFlex(space-between, center, row, nowrap, 30rpx);

    .tab-item {
      @include usePadding(0, 16);
      text-align: center;
      border-radius: 15rpx;
      flex: 1 0 auto;
      background: #f6f8f8;
      color: #333333;
      transition: all .3s;

      &.current {
        background: $primary-color;
        color: $white-color;
      }
    }
  }

  &__inner {
    @include usePadding(34, 34)
  }

  .statistics-card {
    width: 100%;
    @include usePadding(8, 8);
    border-radius: 15rpx;
    background: #333333;
    color: #fff;

    .header {
      width: 100%;
      @include usePadding(24, 16);
      border-radius: 15rpx;
      background: linear-gradient(to right, rgba(246, 246, 246, 0.4) 0%, rgba(246, 246, 246, 0.2) 15%, transparent 50%);
    }

    .row {
      @include usePadding(0, 32);

      .item {
        flex: 1 0 auto;
        font-size: 24rpx;
        @include useFlex(center, center, column);
        border-right: 1rpx solid #fff;

        &:last-child {
          border-right: none;
        }

        .count {
          font-size: 32rpx;
          font-weight: bold;
        }
      }
    }
  }

  .user-list {
    @include usePadding(0, 34)
  }

  .gray-color {
    color: #999999;
  }

}
</style>

<style>
// #ifdef MP-WEIXIN
.uni-date {
  position: absolute;
  top: -500px !important;
}

.uni-calendar--fixed {
	bottom: 25rpx !important;
}

// #endif
</style>
