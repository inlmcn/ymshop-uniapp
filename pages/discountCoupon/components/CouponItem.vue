<!--
    @name: CouponItem
    @author: kahu4
    @date: 2023-10-31 11:22
    @description：CouponItem
    @update: 2023-10-31 11:22
-->
<script setup>
import { toRefs } from "vue";
import { receiveACoupon } from "@/api/coupon";
import { useRouter } from "@/hooks/useRouter";

const emit = defineEmits(['receiveCoupon'])

const { push } = useRouter()
const props = defineProps({
  coupons: {
    type: Object,
    default: () => ({})
  },
  type: {
    type: String,
    default: 'select'
  },
  tabType: {
    type: Number,
    default: 0
  }
})

const {
  coupons
} = toRefs(props)

const getCoupon = async () => {
  await receiveACoupon(coupons.value.id)
  emit('receiveCoupon')
  uni.showToast({
    title: "领取成功",
    icon: "none",
    duration: 2000
  });

}

const goToProduct = (coupons) => {
  push({ url: '/pages/goodsList/goodsList' }, { data: { couponId: coupons.id } })
}

// Date formatter
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  let date;
  if (typeof timeStr === 'number' || !isNaN(Number(timeStr))) {
    date = new Date(Number(timeStr));
  } else {
    // Handle string dates like "2023-10-31 11:22:00"
    date = new Date(timeStr.replace(/-/g, '/'));
  }

  if (isNaN(date.getTime())) return timeStr;

  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const d = date.getDate().toString().padStart(2, '0');
  const h = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  // include year for robustness
  return `${y}.${m}.${d}`;
}
</script>

<template>
  <view class="coupon-item" :class="{ 'is-disabled': tabType === 1 }">
    <!-- Left: Price & Action -->
    <view class="left-part">
      <view class="price-box">
        <template v-if="coupons.couponType === 1">
          <text class="unit">¥</text>
          <text class="value">{{ coupons.couponValue }}</text>
        </template>
        <template v-else>
          <text class="value">{{ coupons.discount }}</text>
          <text class="unit">折</text>
        </template>
      </view>

      <view class="condition-box">
        <text class="condition-text">{{ coupons.couponType === 1 ? (coupons.threshold > 0 ? `满${coupons.threshold}元可用` :
          '无门槛') : '打折券' }}</text>

        <!-- Button -->
        <view class="btn-wrapper">
          <view class="btn" v-if="type === 'select' && tabType !== 1" @click.stop="goToProduct(coupons)">
            <text>去使用</text>
          </view>
          <view class="btn disabled" v-else-if="type === 'select' && tabType === 1">
            <text>去使用</text>
          </view>
          <view class="btn" v-else-if="type === 'get'" @click.stop="getCoupon">
            <text>领取</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Right: Info -->
    <view class="right-part">
      <view class="title">{{ coupons.couponName || (coupons.couponType == 1 ? '满减券' : '折扣券') }}</view>
      <view class="info-group">
        <view class="date">
          {{ coupons.takingEffectTime ? formatTime(coupons.takingEffectTime) : '无限制时间' }}{{ coupons.expirationTime ? '-'
            +
            formatTime(coupons.expirationTime) : '' }}
        </view>
        <view class="limit-row">
          <text class="limit-text">{{ coupons.remark || (coupons.couponScope === 1 ? '所有商品可用' : coupons.couponScope ===
            2 ?
            '指定商品可用' :
            coupons.couponScope === 3 ? '指定商品不可用' : '全场通用') }}</text>
          <uv-icon v-if="tabType !== 1" name="arrow-right" size="10" color="#999" class="arrow-icon"></uv-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.coupon-item {
  width: 100%;
  background: #F0FDFF;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: 0;
  /* Design has specific padding inside children */

  .left-part {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30rpx 0;
    border-right: 2rpx dotted #BEE7E6;
    flex-shrink: 0;
    width: 220rpx;

    .price-box {
      color: #00CBCC;
      display: flex;
      align-items: baseline;
      margin-bottom: 8rpx;

      .unit {
        font-size: 36rpx;
        font-weight: bold;
      }

      .value {
        font-size: 56rpx;
        font-weight: bold;
      }
    }

    .condition-box {
      display: flex;
      flex-direction: column;
      align-items: center;

      .condition-text {
        font-size: 28rpx;
        color: #00B0B1;
        margin-bottom: 16rpx;
      }

      .btn-wrapper {
        .btn {
          width: 130rpx;
          height: 48rpx;
          background: #00CBCC;
          border-radius: 24rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22rpx;
          color: #FFFFFF;

          &.disabled {
            background: #CCCCCC;
            color: #FFFFFF;
          }
        }
      }
    }
  }

  .right-part {
    flex: 1;
    padding: 30rpx 32rpx;

    .title {
      font-size: 36rpx;
      color: #222222;
      font-weight: bold;
      margin-bottom: 16rpx;
    }

    .info-group {
      .date {
        font-size: 24rpx;
        color: #666666;
        margin-bottom: 8rpx;
      }

      .limit-row {
        display: flex;
        align-items: center;

        .limit-text {
          font-size: 24rpx;
          color: #666666;
        }

        .arrow-icon {
          margin-left: 8rpx;
        }
      }
    }
  }

  // Disabled/Used/Expired State
  &.is-disabled {
    background: #EEEEEE; // Light gray background

    .left-part {
      border-right-color: #D8D8D8; // Gray dashed line

      .price-box {
        color: #999999; // Gray price
      }

      .condition-box .condition-text {
        color: #999999; // Gray condition text
      }

      .btn-wrapper .btn {
        background: #CCCCCC; // Gray button

        &.disabled {
          background: #CCCCCC;
        }
      }
    }

    .right-part {
      .title {
        color: #999999; // Gray title
      }

      .info-group {

        .date,
        .limit-row .limit-text {
          color: #999999; // Gray info text
        }
      }
    }
  }
}
</style>
