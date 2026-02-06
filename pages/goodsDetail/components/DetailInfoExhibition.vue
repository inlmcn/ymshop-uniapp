<!--
    @name: DetailInfoExhibition
    @author: kahu4
    @date: 2024-01-16 14:10
    @description：商品信息展示
    @update: 2024-01-16 14:10
-->
<script setup>
import { computed, onMounted, toRefs } from "vue";
import Common from "@/pages/goodsDetail/components/GoodsPrice/Common.vue";
import Activity from "@/pages/goodsDetail/components/GoodsPrice/Activity.vue";
import Integral from "@/pages/goodsDetail/components/GoodsPrice/Integral.vue";

const emits = defineEmits(['timeOver'])
/**
 * @property goodsDetail 商品信息
 * @property sku 商品sku信息（使用这个判断）
 */
const props = defineProps({
  goodsDetail: {
    type: Object,
    required: true
  },
  sku: {
    type: Object,
  }
})
const {goodsDetail, sku} = toRefs(props)

const goodsInDetail = computed(() => goodsDetail.value.storeInfo)

onMounted(() => {
  // console.log(goodsInDetail.value, sku.value)
})

// ========================== 活动属性相关 ==============================
/** 活动类型 1、拼团，2、秒杀，3、限时折扣 */
const activityType = computed(() => Number(sku.value && sku.value.campaignType))
const activityOldPrice = computed(() => (sku.value && sku.value.price || (goodsInDetail.value && goodsInDetail.value.otPrice)).toFixed(2))
const activityPrice = computed(() => (sku.value && sku.value.campaignPrice).toFixed(2))
/** 活动状态 0-未开始 1-进行中 2-已结束 3-预热*/
const activityState = computed(() => Number(sku.value && sku.value.campaignState))
const activityTime = computed(() => {
  // 判断状态
  if ([0, 3].includes(activityState.value)) {
    console.log('预热', sku.value.startTime)
    // 未开始、预热
    return sku.value && sku.value.startTime
  } else if ([1].includes(activityState.value)) {
    // 已经开始
    return sku.value && sku.value.endTime
  }
})
/** 是否是活动商品 */
const isActivity = computed(() => {
  if (!sku.value) return false
  return [1, 2, 3, 4].includes(Number(sku.value.campaignType))
})
</script>

<template>
  <view
      class="goods-info"
      v-if="sku&&goodsInDetail">
    <!-- price row -->
    <!-- 普通商品 -->
    <Common
        v-if="!isActivity"
        :old-price="sku.otPrice||goodsInDetail.otPrice ||'0.00'"
        :price="sku.price || goodsInDetail.price || '0.00'"
        :sales="goodsInDetail.sales || 0"
    />
    <!-- 活动商品 -->
    <Integral v-else-if="activityType === 4"
              :old-price="sku.otPrice || goodsInDetail.otPrice"
              :price="sku.campaignPrice"
              :integral="sku.integral"
    />
    <Activity
        v-else
        :type="activityType"
        :old-price="activityOldPrice"
        :price="activityPrice"
        :state="activityState"
        :time="activityTime"
        @time-over="emits('timeOver')"
    />
    <!-- name row -->
    <view class="name-row box">
      <productTag :data="goodsDetail.tag" size="large" /> {{activityType === 4? goodsDetail.campaignName : goodsInDetail.storeName }}
    </view>
    <div class="remark-row">
      {{activityType === 4? goodsDetail.campaignRemark: goodsInDetail.storeInfo }}
    </div>
    <!-- label stock -->
    <view class="label-row box">
      <view class="label-col">
        <template v-if="false">
          <view class="label-item">
            多买优惠
          </view>
        </template>
      </view>
      <view class="stock-col" v-if="activityType === 4">
        已兑换：{{ sku.campaignTotal - sku.campaignStock }}件
      </view>
      <view class="stock-col" v-else>
        仅剩{{ isActivity ? sku.campaignStock : goodsInDetail.stock }}件
      </view>
    </view>
  </view>
</template>

<style
    lang="scss"
    scoped>
.goods-info {
  width: 100%;

  .box {
    width: 100%;
    @include usePadding(30, 30);
  }

  .name-row {
    padding-top: 10rpx;
    background: $white-color;
    font-weight: 500;
    font-size: 32rpx;
    word-break: break-all;
  }

  .remark-row{
    font-size: 24rpx;
    color: #999999;
    line-height: 28rpx;
    background-color: #ffffff;
    @include usePadding(30, 0);
  }

  .label-row {
    font-size: 24rpx;
    background: $white-color;
    padding-top: 10rpx;
    @include useFlex(space-between, flex-start);

    .label-col {
      @include useFlex(flex-start, center);
      flex-wrap: wrap;
      gap: 10rpx;

      .label-item {
        flex-shrink: 0;
        color: $primary-color;
        border: 1rpx solid $primary-color;
        padding: 3rpx 6rpx;
        box-sizing: border-box;
      }
    }

    .stock-col {
      flex-shrink: 0;
      color: $tips-color;
    }
  }
}
</style>
