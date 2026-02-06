<script setup>
// 复制 pages/payment/payment.vue 的界面与能力，并改造成与 components/PayPopup/index.vue 一样的调用方式：
// - 通过 ref 暴露 show(orderId, uid)
// - 使用 Popup 作为承载容器
// - emits: confirm, close

import Popup from '@/components/Popup/index.vue'
import { ref, computed, unref } from 'vue'
import { useRouter } from '@/hooks/useRouter'
import { orderInfo as orderInfoRequest, payOrder, getTemplate } from '@/api/order'
 import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from "@/utils/imgpath";

const props = defineProps({
  // 是否好友代付（保持与 PayPopup 一致的 props）
  isInvite: {
    type: Number,
    default: 0,
    required: true
  }
})

const emits = defineEmits(['confirm', 'close'])

// 弹窗 ref，与 PayPopup 保持一致的调用方式
const popupRef = ref()

// 订单数据（与 pages/payment/payment.vue 接近的结构）
const orderData = ref({
  orderId: '',
  orderKey: '',
  payAmount: 0,
  orderInfo: null,
  _status: {}
})

// 倒计时逻辑（保留支付页的交互体验，且以 _status._payRemainTime 为准）
const countdownTime = ref(30 * 60) // 单位：秒
const countdownText = ref('')
const countdownTimer = ref(null)
const isCountdownActive = ref(true)

// 顶部 UI 尺寸（简化处理）
const statusBarHeight = ref(0)
const navBarHeight = ref(44)
const headerContentHeight = ref(120)
const orderInfoHeight = ref(80)

const headerTotalHeight = computed(() => {
  return statusBarHeight.value + navBarHeight.value + headerContentHeight.value + orderInfoHeight.value
})

const cardMarginTop = computed(() => {
  return -60
})

function formatAmount(amount) {
  const num = Number(amount || 0)
  if (Number.isNaN(num)) return '0.00'
  return num.toFixed(2)
}

function formatCountdown(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function startCountdown(initialSeconds = 30 * 60) {
  if (countdownTimer.value) clearInterval(countdownTimer.value)
  // 以秒为单位的倒计时，优先使用后端提供的 _status._payRemainTime（毫秒）转换结果
  const init = Math.max(0, Number(initialSeconds) || 0)
  countdownTime.value = init
  isCountdownActive.value = init > 0
  countdownText.value = formatCountdown(countdownTime.value)

  if (!isCountdownActive.value) {
    // 无剩余时间，直接结束逻辑
    handleCountdownEnd()
    return
  }

  countdownTimer.value = setInterval(() => {
    countdownTime.value--
    countdownText.value = formatCountdown(Math.max(0, countdownTime.value))
    if (countdownTime.value <= 0) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
      isCountdownActive.value = false
      handleCountdownEnd()
    }
  }, 1000)
}

function stopCountdown() {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

function handleCountdownEnd() {
  // 倒计时结束时的处理：关闭可支付能力，但不强制关闭弹窗，允许用户查看信息或返回
  isCountdownActive.value = false
}

// 与 PayPopup 一致的 show(orderId, uid) 调用方式
async function show(orderId, uid) {
  // 获取并填充订单详情（按后端约定，传 key）
  try {
    const params = { key: orderId }
    if (uid) params.uid = uid
    const info = await orderInfoRequest(params)
    console.log('获取订单详情成功：', info)
    orderData.value = {
      orderId: info?.orderId || info?.order_id || '',
      orderKey: orderId,
      payAmount: info?.payPrice ?? info?.totalPrice ?? 0,
      orderInfo: info || null,
      _status: info?._status || {}
    }
  } catch (e) {
    console.error('获取订单详情失败：', e)
    // 保底：至少让弹窗打开，用户可以重试
    orderData.value = {
      orderId: '',
      orderKey: orderId,
      payAmount: 0,
      orderInfo: null
    }
  }

  // 获取系统信息（简化）
  try {
    uni.getSystemInfo({
      success: (res) => {
        statusBarHeight.value = res.statusBarHeight || 0
      }
    })
  } catch (e) { }

  // 打开弹窗并启动倒计时
  unref(popupRef)?.show()
  // 从订单详情中取 _status._payRemainTime（单位毫秒），转换为秒做倒计时
  const remainMs = Number(orderData.value?._status?._payRemainTime) || 0
  const remainSeconds = Math.floor(remainMs / 1000)
  startCountdown(remainSeconds > 0 ? remainSeconds : 30 * 60)
}

function close() {
  emits('close')
  stopCountdown()
}

defineExpose({ show })

// 跳转/路由
const { push } = useRouter()

async function getTemplateData() {
  try {
    await getTemplate({})
  } catch (e) {
    // 静默处理模板获取失败
    console.warn('获取支付模板失败：', e?.message || e)
  }
}

// 支付逻辑，沿用 pages/payment/payment.vue 的接口调用
async function handlePay() {
  await getTemplateData()

  if (!isCountdownActive.value) {
    uni.showModal({
      title: '支付超时',
      content: '订单支付已超时，请重新下单',
      showCancel: false
    })
    return
  }

  if (!orderData.value.orderId) {
    uni.showModal({
      title: '订单信息不完整',
      content: '订单信息不完整，请重新下单或联系客服',
      showCancel: true,
      confirmText: '重新下单',
      cancelText: '联系客服'
    })
    return
  }

  uni.showLoading({ title: '支付处理中...' })
  try {
    const payRes = await payOrder({
      orderId: orderData.value.orderId,
      payType: 'weixin_applet',
      from: 'weixin_applet'
    })

    if (payRes) {
      uni.requestPayment({
        provider: 'wxpay',
        timeStamp: payRes.timeStamp,
        nonceStr: payRes.nonceStr,
        package: payRes.package,
        signType: payRes.signType,
        paySign: payRes.paySign,
        success: () => {
          uni.hideLoading()
          // 与 PayPopup 保持一致：对外抛出 confirm 事件，供父级处理（如跳转）。
          emits('confirm')
          close()
          // 兜底跳转：
          push?.({ url: '/pages/payStatus/index?status=success&orderId=' + orderData.value.orderId }, { type: 'redirectTo' })
        },
        fail: () => {
          uni.hideLoading()
          close()
          push?.({ url: '/pages/orderList/orderList' }, { type: 'redirectTo' })
        }
      })
    } else {
      uni.hideLoading()
      emits('confirm')
      close()
      push?.({ url: '/pages/payStatus/index?status=success&orderId=' + orderData.value.orderId }, { type: 'redirectTo' })
    }
  } catch (error) {
    console.error('支付出错:', error)
    uni.hideLoading()
    close()
    uni.showModal({
      title: '支付失败',
      content: error?.message || '支付过程中出现错误，请重试或联系客服',
      showCancel: true,
      confirmText: '重新支付',
      cancelText: '查看订单'
    })
  }
}

</script>

<template>
  <Popup ref="popupRef" title="选择支付方式" @close="close">
    <view class="payment-popup__container">
      <!-- 订单信息区域 -->
      <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="order-info-container">
          <view class="order-status">
            <image class="check-icon" :src="COMMON_IMG_PATH + 'dui.png'" />
            <text>订单已提交</text>
          </view>
          <view class="countdown">
            (请尽快完成支付，剩余时间{{ countdownText }})
          </view>
        </view>
      </view>

      <!-- 支付详情 -->
      <view class="payment-detail-card" :style="{ marginTop: cardMarginTop + 'px' }">
        <view class="detail-item-top">
          <view class="label">支付金额</view>
          <view class="amount">
            <text class="currency">¥</text>
            <text class="value">{{ formatAmount(orderData.payAmount) }}</text>
          </view>
        </view>

        <view class="divider" />

        <view class="detail-item">
          <view class="label">订单编号</view>
          <view class="info">{{ orderData.orderId }}</view>
        </view>

        <view class="divider" />

        <view class="detail-item">
          <view class="label">收款方</view>
          <view class="info">FCYUU TRANDING LIMITED（香港）</view>
        </view>
      </view>

      <!-- 支付方式与按钮 -->
      <view class="content">
        <view class="payment-method-card">
          <view class="method-title">支付方式</view>
          <view class="method-content">
            <view class="method-item">
              <view class="wechat-pay-icon">
                <image :src="COMMON_IMG_PATH + 'wx.png'" />
              </view>
              <text>微信</text>
            </view>
            <view class="selected-icon">
              <icon type="success" size="20" color="#00c853" />
            </view>
          </view>
        </view>

        <button class="pay-button" :class="{ 'disabled-button': !isCountdownActive }" @click="handlePay"
          :disabled="!isCountdownActive">
          {{ isCountdownActive ? '立即支付' : '支付已超时' }}
        </button>

        <view class="guarantee-info">
          <view class="guarantee-icon">
            <image :src="COMMON_IMG_PATH + 'guarantee.png'" />
          </view>
          <text class="guarantee-text">小程序交易保障</text>
          <text class="guarantee-desc">正品保证 | 中国人保险承保 | 准时发货</text>
        </view>
      </view>
    </view>
  </Popup>

</template>
<style scoped lang="scss">
.header {
  background: linear-gradient(147deg, #52EAB5 19%, #00CBCC 100%);
  border-radius: 0rpx 0rpx 36rpx 36rpx;
  padding: 20rpx 30rpx 120rpx 30rpx;
  position: relative;
  box-shadow: 0 8rpx 24rpx rgba(0, 200, 204, 0.15);
}

.order-info-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  padding: 20rpx 0 20rpx 0;
  min-height: 80rpx;
}

.order-status {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 500;

  .check-icon {
    width: 40rpx;
    height: 40rpx;
    margin-right: 12rpx;
  }
}

.countdown {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 400;
  letter-spacing: 1rpx;
}

.payment-detail-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-left: 30rpx;
  margin-right: 30rpx;
  margin-bottom: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 15;
}

.content {
  padding: 0 30rpx 30rpx 30rpx;
}

.detail-item-top {
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #464646;
  margin-bottom: 40rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;

  &:last-child {
    .divider {
      display: none;
    }
  }
}

.label {
  color: #666666;
  font-size: 28rpx;
}

.amount {
  font-weight: bold;
}

.currency {
  font-size: 34rpx;
  margin-right: 4rpx;
}

.value {
  font-size: 60rpx;
  font-weight: bold;
}

.info {
  font-size: 28rpx;
  color: #333333;
}

.divider {
  height: 1rpx;
  background-color: #f0f0f0;
  width: 100%;
}

.payment-method-card {
  background-color: #ffffff;
  border-radius: 20rpx;
  margin-top: 20rpx;
  padding: 30rpx;
}

.method-title {
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 30rpx;
}

.method-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method-item {
  display: flex;
  align-items: center;
}

.wechat-pay-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.wechat-pay-icon image {
  width: 56rpx;
  height: 56rpx;
}

.selected-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 2rpx solid #07c160;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #07c160;
}

.pay-button {
  background-color: #00c8b5;
  color: #ffffff;
  font-size: 32rpx;
  height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  margin-top: 40rpx;
  font-weight: normal;
  letter-spacing: 2rpx;
}

.disabled-button {
  background-color: #cccccc;
  color: #999999;
}

.guarantee-info {
  display: flex;
  align-items: center;
  margin-top: 30rpx;
  font-size: 24rpx;
  color: #666666;
}

.guarantee-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.guarantee-icon image {
  width: 100%;
  height: 100%;
}

.guarantee-text {
  color: #07c160;
  margin-right: 20rpx;
}

.guarantee-desc {
  color: #999999;
}

@media (prefers-color-scheme: dark) {
  .header {
    background: linear-gradient(147deg, #2d7a5f 19%, #006b6b 100%);
  }
}
</style>