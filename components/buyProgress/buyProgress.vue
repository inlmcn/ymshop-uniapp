<template>
  <view class="buy-progress">
    <space align="center">
      <view class="buy-progress-info">
        <view
          class="buy-progress-info-desc"
          v-if="surplus"
        >
          仅剩{{ surplus }}件
        </view>
      </view>
      <view class="buy-progress-action">
        <uv-button
          round
          block
          type="primary"
        >
          立即抢购
        </uv-button>
      </view>
    </space>
  </view>
</template>

<script>
export default {
  name: "buyProgress",
  data() {
    return {

    };
  }
}
</script>

<style lang="scss">
.buy-progress {
  &-info {
    flex: 1;

    &-desc {
      color: #999999;
      font-size: 24rpx;
      line-height: 40rpx;
    }
  }
}
</style>
