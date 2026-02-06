<!--
    @name: index
    @author: kahu4
    @date: 2023-10-31 11:05
    @description：index
    @update: 2023-10-31 11:05
-->
<script setup>
import { useRouter } from "@/hooks/useRouter";
import { useDiscountCoupon } from "@/pages/discountCoupon/index.utils";
import CouponItem from "@/pages/discountCoupon/components/CouponItem.vue";
import Empty from "@/components/Empty/index.vue"
import { emptyCouponIcon } from "@/utils/images";
import ReturnTop from "@/components/ReturnTop/index.vue";
import { useScroll } from "@/hooks/useScroll";

const { goBack } = useRouter();
const { scrollTop } = useScroll()

const {
  tabList,
  tabCurrent,
  handleTabsChange,
  couponList,
  showEmpty,
  cdkey,
  handleRedeem
} = useDiscountCoupon()
</script>

<template>
  <view class="discount-coupon">
    <!-- header -->
    <view class="sticky-header">
      <!-- tab -->
      <view class="tabs-row">
        <uv-tabs :current="tabCurrent" :list="tabList" lineColor="#00CBCC" :activeStyle="{ color: '#00CBCC' }"
          :itemStyle="{ width: `calc( 100% / ${tabList.length} )`, 'box-sizing': 'border-box', 'height': '80rpx' }"
          keyName="label" @change="handleTabsChange" />
      </view>
    </view>
    <!-- redemption -->
    <view class="redeem-row">
      <view class="redeem-box">
        <view class="redeem-input-wrap">
          <input class="redeem-input" v-model="cdkey" placeholder="请输入兑换码" placeholder-class="redeem-placeholder" />
        </view>
        <view class="redeem-btn" @tap="handleRedeem">
          兑换
        </view>
      </view>
    </view>
    <!-- coupon list -->
    <view class="coupon-box">
      <template v-if="!showEmpty">
        <view class="coupon-list" v-for="item in couponList">
          <CouponItem :coupons="item" :tabType="tabCurrent" />
        </view>
      </template>
      <Empty v-else>
        <template #icon>
          <image :src="emptyCouponIcon" class="empty-icon" />
        </template>
        您暂时没有可使用的优惠券~
      </Empty>
    </view>
    <ReturnTop :scroll-top="scrollTop" />
  </view>
</template>
<style lang="scss">
page {
  background: #fff !important;
}

.discount-coupon {
  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 99;
    // background: #fff;
  }

  .tabs-row {
    width: 100%;
    box-sizing: border-box;
    background: #fff;
  }

  .redeem-row {
    padding: 30rpx 35rpx 10rpx;
    box-sizing: border-box;

    .redeem-box {
      display: flex;
      align-items: center;

      .redeem-input-wrap {
        flex: 1;
        height: 80rpx;
        background: #E7E7E7;
        border-radius: 45rpx;
        padding: 0 40rpx;
        display: flex;
        align-items: center;
        margin-right: 30rpx;

        .redeem-input {
          flex: 1;
          height: 100%;
          font-size: 32rpx;
          color: #999;
        }

        .redeem-placeholder {
          color: #999;
        }
      }

      .redeem-btn {
        width: 160rpx;
        height: 80rpx;
        background: #E7E7E7;
        border-radius: 45rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        color: #999999;

        &:active {
          opacity: 0.8;
        }
      }
    }
  }

  .coupon-box {
    padding: 35rpx;
    box-sizing: border-box;
    width: 100%;

    .coupon-list {
      margin-bottom: 24rpx;
    }
  }
}

.empty-icon {
  width: 250rpx;
  height: 155rpx;
}
</style>
