<template>
  <Header system-bar-area-bg="#fff" header-area-bg="#fff">
    <image :src="COMMON_IMG_PATH + 'image_2.png'" class="logo-image"></image>
  </Header>
  <view class="coupon-share-page">
    <!-- 背景图片 -->
    <view class="background-container">
      <!-- 优惠券金额区域 -->
      <view class="coupon-amount-section">
        <image :src="COMMON_IMG_PATH + 'image_3.png'" class="coin-image" mode="aspectFit" />
        <view class="amount-display">
          <text class="amount-number">100</text>
          <text class="amount-unit">元</text>
        </view>
        <text class="coupon-type">优惠券包</text>
      </view>

      <!-- 二维码区域 -->
      <view class="qr-section">
        <view class="qr-container">
          <image :src="qrCode" :show-menu-by-longpress="true" class="qr-code"
            mode="aspectFit" />
          <view class="scan-hint">
            <image :src="COMMON_IMG_PATH + 'image_6.png'" class="scan-icon" mode="aspectFit" />
            <text class="scan-text">长按识别</text>
          </view>
          <view class="action-button">
            <text class="button-text">加好友立即领</text>
            <image :src="COMMON_IMG_PATH + 'image_8.png'" class="arrow-icon" mode="aspectFit" />
          </view>
        </view>

        <!-- 装饰元素 -->
        <image :src="COMMON_IMG_PATH + 'image_9.png'" class="decoration-right" mode="aspectFit" />
        <image :src="COMMON_IMG_PATH + 'image_10.png'" class="decoration-left" mode="aspectFit" />
      </view>

      <!-- 底部提示 -->
      <text class="bottom-hint">*所有渠道，每人限领1次</text>
    </view>
  </view>
</template>

<script setup>
	import { onMounted, ref } from 'vue';
import { COMMON_IMG_PATH } from '@/utils/imgpath'
import Header from "@/components/Header/index.vue";
import {getDictValue} from '@/api/evaluation/index.js'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import { useShare } from '@/hooks/useShare';

const { commonPageShare } = useShare()

const qrCode = ref('')


onMounted(()=>{
	getqrCode()
})
const getqrCode = async ()=>{
	const response = await getDictValue({
		dictType: 'mall_config_dict_type',
		label: 'coupon_qrcode'
	})
	qrCode.value = response
}

onShareAppMessage(()=>{
	return commonPageShare()
})

onShareTimeline(()=>{
	return commonPageShare()
})
</script>

<style>
page {
  background-color: #ffffff;
}
</style>

<style lang="scss" scoped>
.logo-image {
  // 靠左
  width: 345rpx;
  height: 32rpx;
}

.coupon-share-page {
  overflow: hidden;
  .background-container {
    width: 100%;
    position: relative;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 100rpx;
  }

  .coupon-amount-section {
    width: 100%;
    margin-top: 120rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 60rpx;

    .coin-image {
      width: 140rpx;
      height: 140rpx;
      position: absolute;
      top: -120rpx;
      right: 80rpx;
      z-index: 10;
    }

    .amount-display {
      display: flex;
      align-items: baseline;
      justify-content: center;

      .amount-number {
        font-size: 200rpx;
        font-weight: bold;
        color: #000000;
        line-height: 0.9;
        letter-spacing: -10rpx;
      }

      .amount-unit {
        font-size: 60rpx;
        font-weight: 500;
        color: #000000;
        margin-left: 4rpx;
        margin-bottom: 20rpx;
      }
    }

    .coupon-type {
      font-size: 44rpx;
      font-weight: 400;
      color: #AAAAAA;
      margin-top: 0;
      letter-spacing: 2rpx;
    }
  }

  .qr-section {
    width: 100%;
    margin-top: 40rpx;
    position: relative;
    display: flex;
    justify-content: center;
    padding: 0 40rpx;

    .qr-container {
      background: linear-gradient(180deg, #00CED1 0%, #00BCD4 100%);
      border-radius: 50rpx;
      padding: 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      box-shadow: 0 30rpx 60rpx rgba(0, 206, 209, 0.4);

      .qr-code {
        width: 400rpx;
        height: 400rpx;
        background: white;
        border-radius: 24rpx;
        padding: 20rpx;
        box-sizing: border-box;
      }

      .scan-hint {
        margin-top: 25rpx;
        display: flex;
        align-items: center;
        justify-content: center;

        .scan-icon {
          width: 48rpx;
          height: 48rpx;
        }

        .scan-text {
          margin-left: 16rpx;
          font-size: 36rpx;
          font-weight: 400;
          color: #FFFFFF;
        }
      }

      .action-button {
        width: 480rpx;
        height: 90rpx;
        margin-top: 50rpx;
        background: #FFFFFF;
        border-radius: 45rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);

        .button-text {
          font-size: 32rpx;
          font-weight: 400;
          color: #333333;
        }

        .arrow-icon {
          width: 28rpx;
          height: 28rpx;
          margin-left: 12rpx;
        }
      }
    }

    .decoration-right {
      width: 190rpx;
      height: 190rpx;
      position: absolute;
      bottom: -100rpx;
      right: 30rpx;
      z-index: 5;
    }

    .decoration-left {
      width: 150rpx;
      height: 150rpx;
      position: absolute;
      top: 100rpx;
      left: 40rpx;
      z-index: 5;
    }
  }

  .bottom-hint {
    position: absolute;
    bottom: 30rpx;
    left: 50%;
    transform: translateX(-50%);
    font-size: 26rpx;
    font-weight: 400;
    color: #BBBBBB;
    white-space: nowrap;
  }
}
</style>