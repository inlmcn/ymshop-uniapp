<template>
  <layout>
    <uv-navbar
        :fixed="false"
        title="选择门店"
        left-arrow
        @leftClick="goBack"
    />
    <blank size="15"></blank>

    <container>
      <space
          direction="vertical"
          fill
          size="15px"
      >
        <card class="store">
          <view class="store-header">
            <view class="store-name">深圳南山海德店</view>
            <view class="store-distance">距离982m</view>
          </view>
          <view class="store-content">
            <view class="store-address">
              <view class="icon">
                <uv-icon name="map" />
              </view>
              <view class="store-address-desc">深圳市南山区海德二道2873号茂业百货7楼</view>
            </view>
            <view class="store-time">
              <view class="icon">
                <uv-icon name="underway-o" />
              </view>
              <view class="store-time-desc">10:00~21:00</view>
            </view>
          </view>
          <view class="store-footer store-action">
            <view class="store-action-item">
              <view class="icon">
                <uv-icon name="phone-o" />
              </view>
              <view class="store-action-item-desc">门店电话</view>
            </view>
            <view class="store-action-item">
              <view class="icon">
                <uv-icon name="aim" />
              </view>
              <view class="store-action-item-desc">导航</view>
            </view>
          </view>
        </card>
        <card class="store select">
          <view class="store-header">
            <view class="store-name">深圳南山海德店</view>
            <view class="store-distance">距离982m</view>
          </view>
          <view class="store-content">
            <view class="store-address">
              <view class="icon">
                <uv-icon name="map" />
              </view>
              <view class="store-address-desc">深圳市南山区海德二道2873号茂业百货7楼</view>
            </view>
            <view class="store-time">
              <view class="icon">
                <uv-icon name="underway-o" />
              </view>
              <view class="store-time-desc">10:00~21:00</view>
            </view>
          </view>
          <view class="store-footer store-action">
            <view class="store-action-item">
              <view class="icon">
                <uv-icon name="phone-o" />
              </view>
              <view class="store-action-item-desc">门店电话</view>
            </view>
            <view class="store-action-item">
              <view class="icon">
                <uv-icon name="aim" />
              </view>
              <view class="store-action-item-desc">导航</view>
            </view>
          </view>
        </card>
      </space>
    </container>

    <blank size="15"></blank>
  </layout>
</template>

<script setup>
import { useRouter } from "@/hooks/useRouter";

const {goBack} = useRouter()
</script>

<style lang="scss">
.store {
  border-radius: 15rpx;
  overflow: hidden;

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 40rpx 40rpx 0;
    margin-bottom: 20rpx;
  }

  &-name {
    line-height: 48rpx;
    font-size: 34rpx;
    font-weight: 500;
    color: #333333;
  }

  &-distance {
    line-height: 33rpx;
    font-size: 24rpx;
    font-weight: 400;
    color: #999999;
  }

  &-content {
    margin-bottom: 30rpx;
    padding: 0 40rpx 0;

  }

  &-address,
  &-time {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;

    &-desc {
      margin-left: 5rpx;

      line-height: 32rpx;
      font-size: 24rpx;
      color: #333333;
    }
  }

  &-action {
    display: flex;
    background: #E6E6E6;

    &-item {
      height: 90rpx;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      .icon {
        color: #A1A1A1;

      }

      &-desc {
        margin-left: 10rpx;
        font-size: 30rpx;
        font-weight: 400;
        color: #A1A1A1;
      }
    }
  }

  &.select {
    border: 1rpx solid #00CBCC;

    .store-action {
      background: #00CBCC;

      .icon {
        color: #FFFFFF;
      }

      &-item {
        &-desc {
          color: #FFFFFF;
        }
      }
    }
  }
}
</style>
