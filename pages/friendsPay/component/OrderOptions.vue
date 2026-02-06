<script setup>
import { toRefs } from "vue";

const emits = defineEmits(['pay', 'invite'])
/**
 * @property {status} 订单状态
 */
const props = defineProps({
  status: {
    type: String,
    required: true
  },
  isInvite: {
    type: Number,
    default: 0,
    required: true
  }
})
const {status, isInvite} = toRefs(props)
</script>

<template>
  <view class="warp">
    <view class="tip" v-if="status === '0' && isInvite === 0">如果订单申请退款，已支付金额将原路退还给您的好友</view>
    <view class="options">
      <view
          v-if="status === '0' && isInvite === 1"
          class="order-actions-primary item"
          @tap="emits('pay')"
      >
        立即付款
      </view>
      <view
          v-else-if="status === '0' && isInvite === 0"
          class="order-actions-primary item"
          @tap="emits('invite')"
      >
        发送给微信好友
      </view>
    </view>
  </view>
</template>

<style
    lang="scss"
    scoped>
.tip{
  font-size: 24rpx;
  color: #999999;
  line-height: 28rpx;
  padding: 34rpx 0;
  text-align: center;
}
.options {
  display: flex;
  background-color: #fff;
  padding: 24rpx 34rpx;
  .item {
    flex: 1;
    margin: 0;
    height: 80rpx;
    font-size: 28rpx;
  }

}
</style>
