<template>
  <view class="coupon-exchange">
    <!-- 兑换码输入区域 -->
    <view class="exchange-section">
      <view class="input-container">
        <input class="exchange-input" placeholder="请输入兑换码" v-model="exchangeCode"
          placeholder-style="color: #999999; font-size: 32rpx;" />
      </view>
      <view class="exchange-btn">
        <text>兑换</text>
      </view>
    </view>
    <!-- 优惠券列表 -->
    <view class="coupon-list">
      <view class="coupon-item" v-for="(coupon, index) in couponList" :key="index">
        <view class="coupon-left">
          <view class="coupon-value">
            <text class="currency" v-if="coupon.type === 'cash'">¥</text>
            <text class="amount">{{ coupon.amount }}</text>
            <text class="unit" v-if="coupon.type === 'discount'">折</text>
          </view>
          <view class="coupon-condition">{{ coupon.condition }}</view>
          <view class="use-btn" @click="useCoupon(coupon)">去使用</view>
        </view>
        <view class="coupon-right">
          <view class="coupon-title">{{ coupon.title }}</view>
          <view class="coupon-info">
            <view class="coupon-time">{{ coupon.time }}</view>
            <view class="coupon-limit">
              <text>{{ coupon.limit }}</text>
              <image src="/static/coupon/image_1.png" class="info-icon" />
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '@/hooks/useRouter'

const { goBack } = useRouter()
const exchangeCode = ref('')

// 优惠券数据
const couponList = ref([
  {
    type: 'cash',
    amount: '25',
    condition: '满100元可用',
    title: '满100减25元劵',
    time: '04.01 00:00-04.03 23:59',
    limit: '仅限定制装可用'
  },
  {
    type: 'discount',
    amount: '6.8',
    condition: '打折劵',
    title: '满100减25元劵',
    time: '04.01 00:00-04.03 23:59',
    limit: '仅限定制装可用'
  },
  {
    type: 'cash',
    amount: '25',
    condition: '满200元可用',
    title: '满100减25元劵',
    time: '04.01 00:00-04.03 23:59',
    limit: '仅限定制装可用'
  }
])

// 使用优惠券
const useCoupon = (coupon) => {
  uni.showToast({
    title: '跳转到使用页面',
    icon: 'none'
  })
}
</script>

<style lang="scss" scoped>
.coupon-exchange {
  min-height: 100vh;
  background-color: #ffffff;
  position: relative;
}

// 兑换区域
.exchange-section {
  display: flex;
  align-items: center;
  margin-top: 200rpx;
  padding: 16rpx 40rpx;

  .input-container {
    flex: 1;
    height: 80rpx;
    background-color: #f2f3f5;
    border-radius: 48rpx;
    padding: 0 56rpx;
    box-sizing: border-box;

    .exchange-input {
      width: 100%;
      height: 100%;
      font-size: 32rpx;
      color: #333333;
      background: transparent;
      border: none;
      outline: none;
    }
  }

  .exchange-btn {
    width: 190rpx;
    height: 80rpx;
    background-color: #e7e7e7;
    border-radius: 40rpx;
    margin-left: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    text {
      font-family: MiSans;
      font-size: 28rpx;
      font-weight: 500;
      color: #999999;
      line-height: 40rpx;
      letter-spacing: 0.84rpx;
    }
  }
}

// 优惠券列表
.coupon-list {
  padding: 24rpx 40rpx;

  .coupon-item {
    display: flex;
    background-color: #ebfefe;
    border-radius: 24rpx;
    height: 240rpx;
    margin-bottom: 24rpx;
    overflow: hidden;

    &:last-child {
      margin-bottom: 0;
    }

    .coupon-left {
      width: 200rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80rpx 40rpx;
      box-sizing: border-box;
      // 点状虚线
      border-right: 2rpx dashed rgba(188, 224, 224, 1);

      .coupon-value {
        display: flex;
        align-items: baseline;
        font-family: OPPO Sans;
        font-weight: bold;
        color: #00b0b1;
        line-height: 56rpx;
        margin-bottom: 8rpx;

        .currency {
          font-size: 36rpx;
          font-weight: 600;
        }

        .amount {
          font-size: 56rpx;
        }

        .unit {
          font-size: 36rpx;
          font-weight: 600;
        }
      }

      .coupon-condition {
        font-family: MiSans;
        font-size: 28rpx;
        color: #00b0b1;
        line-height: 48rpx;
        margin-bottom: 4rpx;
        white-space: nowrap;
      }

      .use-btn {
        width: 160rpx;
        height: 44rpx;
        background-color: #00cbcc;
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        text {
          font-family: MiSans;
          font-size: 22rpx;
          color: #ffffff;
          line-height: 32rpx;
        }
      }
    }

    .coupon-right {
      flex: 1;
      padding: 44rpx 0;
      margin-left: 48rpx;

      .coupon-title {
        font-family: MiSans;
        font-size: 36rpx;
        font-weight: 600;
        color: #222222;
        line-height: 56rpx;
        margin-bottom: 16rpx;
      }

      .coupon-info {
        .coupon-time {
          font-family: MiSans;
          font-size: 24rpx;
          color: #666666;
          line-height: 40rpx;
          margin-bottom: 8rpx;
        }

        .coupon-limit {
          display: flex;
          align-items: center;

          text {
            font-family: MiSans;
            font-size: 24rpx;
            color: #666666;
            line-height: 40rpx;
          }

          .info-icon {
            width: 28rpx;
            height: 28rpx;
            margin-left: 8rpx;
          }
        }
      }
    }
  }
}

// 底部指示器
.bottom-indicator {
  position: fixed;
  bottom: 68rpx;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;

  .indicator-line {
    width: 268rpx;
    height: 10rpx;
    background-color: #000000;
    border-radius: 200rpx;
  }
}
</style>
