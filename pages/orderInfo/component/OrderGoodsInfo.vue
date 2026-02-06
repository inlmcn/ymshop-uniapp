<!--
    @name: OrderGoodsInfo
    @author: kahu4
    @date: 2024-01-22 11:55
    @description：OrderGoodsInfo
    @update: 2024-01-22 11:55
-->
<script setup>
import { ref, toRefs } from "vue";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store/modules/useMainStore";
import UvIcon from "@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue";
const mainStore = useMainStore();
const { integralName } = storeToRefs(mainStore);

const props = defineProps({
  orderInfoData: {
    type: Object,
    required: true
  }
})

const { orderInfoData } = toRefs(props)

const isPriceDetailExpanded = ref(false)

const togglePriceDetail = () => {
  isPriceDetailExpanded.value = !isPriceDetailExpanded.value
}

// 赠品提示气泡索引
const currentGiftIndex = ref(-1)

const toggleGiftTooltip = (index) => {
  if (currentGiftIndex.value === index) {
    currentGiftIndex.value = -1
  } else {
    currentGiftIndex.value = index
  }
}


/**
 * 去评价
 */
const toEvaluate = (unique, orderId, isRedirectTo) => {
  let config = {
    data: {
      unique: unique,
      orderId: orderId
    }
  }
  if (isRedirectTo) {
    config.type = 'redirectTo'
  }
  push({ url: '/pages/evaluate/evaluate' }, config)
}
</script>

<template>
  <view class="order-good">
    <view v-for="item in orderInfoData.cartInfo" :key="item.unique"
      :class="{ evaluateBtn: orderInfoData._status._type == 3 }" class="order-evaluate">
      <goods :data="item.productInfo" :isOld="orderInfoData.isOld" :price="item.truePrice" :purchase="item.cartNum"
        desc="3" interval link list model showAction>
        <template #price>
          ￥{{ item.truePrice }}
        </template>
        <template #action>
          <view class="flex flex-column flex-ai__end">
            <view class="after-sale-box" v-if="item.orderDetailState !== 1">
              <span v-if="item.orderDetailState === 2"> 售后中 </span>
              <span v-if="item.orderDetailState === 3"> 售后完成 </span>
            </view>
          </view>
        </template>
      </goods>
      <view v-if="orderInfoData.status == 2 && item.isReply === 0" class="order-actions-primary order-evaluate-btn"
        @tap.stop="toEvaluate(item.unique, orderInfoData.orderId, true)">去评价
      </view>
    </view>

    <!-- 赠品列表 -->
    <template v-if="orderInfoData.giftProductList && orderInfoData.giftProductList.length > 0">
      <view v-for="(gift, giftIndex) in orderInfoData.giftProductList" :key="'gift-' + giftIndex"
        class="order-evaluate gift-item" @tap.stop="toggleGiftTooltip(giftIndex)">
        <view class="gift-wrapper">
          <view class="image-container">
            <image class="gift-image" :src="gift.image" mode="aspectFill" />
            <view class="gift-badge">
              <text class="gift-text">赠</text>
            </view>
          </view>
          <view class="gift-info">
            <text class="gift-name">{{ gift.storeName }}</text>
            <view class="gift-bottom">
              <text class="gift-price">¥0</text>
              <text class="gift-quantity">x{{ 1 }}</text>
            </view>
          </view>
        </view>
        <!-- 提示气泡 -->
        <view v-if="currentGiftIndex === giftIndex" class="gift-tooltip" @tap.stop>
          此商品不支持售后，有疑问可以联系客服哦
        </view>
      </view>
    </template>

    <view class="order-infos infos-wrap infos-right">
      <view class="info-cell" @click="togglePriceDetail">
        <view class="info-cell-label">{{ isPriceDetailExpanded ? '商品总价：' : '实付款：' }}</view>
        <view class="expandable-value">
          <view class="info-cell-value">¥{{ isPriceDetailExpanded ? orderInfoData.cost : orderInfoData.payPrice }}
          </view>
          <view class="expand-arrow">
            <uv-icon v-if="!isPriceDetailExpanded" name="arrow-down"></uv-icon>
            <uv-icon v-else name="arrow-up"></uv-icon>
          </view>
        </view>
      </view>
      <template v-if="isPriceDetailExpanded">
        <view class="info-cell ">
          <view class="info-cell-label">优惠：</view>
          <view class="info-cell-value">¥{{ orderInfoData.totalCouponPrice }}</view>
        </view>
        <view class="info-cell ">
          <view class="info-cell-label">运费：</view>
          <view class="info-cell-value">¥{{ orderInfoData.totalPostage }}</view>
        </view>
        <view class="info-cell" v-if="orderInfoData.payIntegral && orderInfoData.payIntegral > 0">
          <view class="info-cell-label">{{ integralName }}：</view>
          <view class="info-cell-value">{{ orderInfoData.payIntegral }}</view>
        </view>
        <view class="info-cell ">
          <view class="info-cell-label">实付款：</view>
          <view class="info-cell-value">¥{{ orderInfoData.payPrice }}</view>
        </view>
      </template>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-good {
  background: #fff;
  border-radius: 15rpx;
}

.infos-wrap {
  padding: 0 40rpx
}

.infos-wrap.infos-right .info-cell-value {
  text-align: right;
}

.infos-wrap .info-cell {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding-bottom: 32rpx;
}

.infos-wrap .info-cell-label {
  margin-right: 30rpx;
  line-height: 32rpx;
  font-size: 28rpx;
  color: #222;
}

.infos-wrap .info-cell-value {
  -webkit-box-flex: 1;
  -webkit-flex: 1;
  -ms-flex: 1;
  flex: 1;
  line-height: 32rpx;
  font-size: 28rpx;
  color: #222;
}

.infos-wrap .info-cell-operation {
  line-height: 32rpx;
  font-size: 24rpx;
  color: #00CBCC;
}

.expandable-value {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

.expand-arrow {
  margin-left: 10rpx;
  line-height: 1;
  /* Aligns icon better */
}

.after-sale-box {
  font-size: 22rpx;
  color: $tips-color;
}

// 赠品样式
.gift-item {
  position: relative;

  .gift-wrapper {
    display: flex;
    padding: 24rpx;
  }

  .image-container {
    position: relative;
    flex-shrink: 0;
    width: 120rpx;
    height: 120rpx;
  }

  .gift-image {
    width: 100%;
    height: 100%;
    border-radius: 8rpx;
    background-color: #f8f8f8;
  }

  .gift-badge {
    position: absolute;
    top: -4rpx;
    right: -4rpx;
    width: 32rpx;
    height: 32rpx;
    background: linear-gradient(135deg, #00cbcc 0%, #00b8b9 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;

    .gift-text {
      font-size: 20rpx;
      color: #ffffff;
      font-weight: 700;
      text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
    }
  }

  .gift-info {
    flex: 1;
    margin-left: 16rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .gift-name {
    font-size: 26rpx;
    color: #333;
    line-height: 36rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .gift-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .gift-price {
    font-size: 28rpx;
    color: #000;
    font-weight: 600;
  }

  .gift-quantity {
    font-size: 24rpx;
    color: #999;
  }

  .gift-tooltip {
    position: absolute;
    left: 80rpx;
    bottom: -20rpx;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 12rpx 20rpx;
    border-radius: 8rpx;
    font-size: 24rpx;
    white-space: nowrap;
    z-index: 10;
    pointer-events: none;

    &::after {
      content: '';
      position: absolute;
      top: -10rpx;
      left: 30rpx;
      transform: translateX(-50%);
      border-width: 0 10rpx 10rpx 10rpx;
      border-style: solid;
      border-color: transparent transparent rgba(0, 0, 0, 0.7) transparent;
    }
  }
}
</style>
