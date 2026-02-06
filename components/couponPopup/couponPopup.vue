<template>
  <!-- 使用 uv-popup 底部弹窗 -->
  <uv-popup ref="popup" mode="bottom" :custom-style="{ height: '80vh', width: '100%' }" :close-on-click-overlay="true"
    @close="handleClose" @change="onPopupChange" @maskClick="onMaskClick">
    <!-- 弹窗内容 -->
    <view class="popup-content" @touchmove.stop.prevent>
      <!-- 弹窗头部 -->
      <view class="popup-header">
        <text class="header-title">优惠券</text>
        <view class="close-btn" @tap="handleClose">
        </view>
      </view>

      <!-- 兑换优惠券区域 -->
      <view class="exchange-section">
        <view class="exchange-input-wrapper">
          <input class="exchange-input" type="text" placeholder="输入优惠券兑换码即可领取" v-model="exchangeCode" :maxlength="20" />
          <view class="exchange-btn" @tap="handleExchangeCoupon" :class="{ disabled: exchangeLoading }">
            <text class="exchange-btn-text">{{ exchangeLoading ? '兑换中...' : '兑换' }}</text>
          </view>
        </view>
      </view>

      <!-- 优惠券列表 -->
      <scroll-view class="coupon-list" scroll-y="true" :show-scrollbar="false">
        <!-- 加载中 -->
        <view v-if="loading" class="loading-container">
          <text class="loading-text">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view v-else-if="couponListData.length === 0" class="empty-container">
          <text class="empty-text">暂无可用优惠券</text>
        </view>

        <!-- 有数据时显示 -->
        <template v-else>
          <!-- 不使用选项 -->
          <view class="no-use-option" @tap="handleSelectNone">
            <!-- <view class="coupon-checkbox" :class="{ checked: selectedCouponIndex === -1 }">
              <text v-if="selectedCouponIndex === -1" class="checkbox-icon">✓</text>
            </view> -->
            <text class="no-use-text">不使用</text>
          </view>

          <!-- 优惠券卡片 -->
          <view class="coupon-card" v-for="(coupon, index) in couponListData" :key="coupon.detailId || coupon.id"
            @tap="handleSelectCoupon(coupon, index)" :class="{ selected: selectedCouponIndex === index }">
            <!-- 选中标记 -->
            <!-- <view class="coupon-checkbox" :class="{ checked: selectedCouponIndex === index }">
              <text v-if="selectedCouponIndex === index" class="checkbox-icon">✓</text>
            </view> -->

            <view class="coupon-left">
              <view class="amount-section">
                <!-- 满减券显示金额，折扣券显示折扣 -->
                <template v-if="coupon.couponType === 1">
                  <text class="amount-symbol">¥</text>
                  <text class="amount-value">{{ coupon.couponValue }}</text>
                </template>
                <template v-else-if="coupon.couponType === 2">
                  <text class="amount-value discount-value">{{ coupon.discount }}</text>
                  <text class="discount-label">折</text>
                </template>
              </view>
              <view class="threshold-tag">
                <text class="threshold-text">{{ coupon.thresholdText }}</text>
              </view>
            </view>

            <view class="coupon-divider"></view>

            <view class="coupon-right">
              <view class="coupon-info">
                <text class="coupon-name">{{ coupon.couponName }}</text>
                <text class="coupon-expire">{{ coupon.expireText || '无限制时间' }}</text>
                <text v-if="coupon.remark" class="coupon-remark">{{ coupon.remark }}</text>
              </view>
            </view>
          </view>
        </template>
      </scroll-view>

      <!-- 底部按钮 -->
      <view class="popup-footer">
        <view class="close-button" @tap="handleClose">
          <text class="close-button-text">关闭</text>
        </view>
      </view>
    </view>
  </uv-popup>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { getCouponList, getProductCoupon, getCartCoupon, getCouponListById, receiveByCdkey, receiveACoupon } from "@/api/coupon"

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  coupons: {
    type: Array,
    default: () => []
  },
  cartIds: {
    type: String,
    default: ''
  },
  selectedCoupon: {
    type: Object,
    default: null
  },
  activityId:{
    type:[Number , null],
    default:null
  }
})

// Emits
const emit = defineEmits(['close', 'select'])

// 弹窗引用
const popup = ref(null)

// 优惠券列表数据
const couponListData = ref([])
const loading = ref(false)
const selectedCouponIndex = ref(-1)  // 记录选中的优惠券索引

// 兑换码相关
const exchangeCode = ref('')
const exchangeLoading = ref(false)

// 获取优惠券列表
const fetchCouponList = async () => {
  try {
    loading.value = true

    // 优先使用 getCartCoupon 获取购物车可用优惠券
    let res
    if (props.cartIds) {
      console.log('调用 getCartCoupon，cartIds:', props.cartIds)
      res = await getCartCoupon(props.cartIds,props.activityId)
      console.log('购物车优惠券列表原始数据:', res)
    } else {
      console.log('调用 getCouponListById')
      res = await getCouponListById()
      console.log('优惠券列表原始数据:', res)
    }

    // 处理不同的数据结构
    let dataList = []
    if (res && Array.isArray(res)) {
      dataList = res
    } else if (res && res.list && Array.isArray(res.list)) {
      dataList = res.list
    } else if (res && res.data && Array.isArray(res.data)) {
      dataList = res.data
    } else if (res && res.data && res.data.list && Array.isArray(res.data.list)) {
      dataList = res.data.list
    }

    console.log('解析后的数据列表:', dataList)

    if (dataList.length > 0) {
      // 转换后端数据为前端展示格式
      couponListData.value = dataList.map(item => ({
        // 原始数据
        detailId: item.detailId,
        id: item.id,
        couponName: item.couponName,
        couponValue: item.couponValue,
        couponType: item.couponType, // 1满减券 2折扣券
        threshold: item.threshold,
        discount: item.discount,
        couponScope: item.couponScope,
        scopeValues: item.scopeValues,
        number: item.number,
        receiveType: item.receiveType,
        limitNumber: item.limitNumber,
        expirationType: item.expirationType,
        takingEffectTime: item.takingEffectTime,
        expirationTime: item.expirationTime,
        expirationDay: item.expirationDay,
        remark: item.remark,
        receiveTime: item.receiveTime,

        // 转换为展示格式
        amount: item.couponType === 1 ? item.couponValue : item.discount,
        name: item.couponName,
        thresholdText: formatThreshold(item),
        expireText: formatExpireTime(item)
      }))

      console.log('转换后的优惠券数据:', couponListData.value)
    } else {
      console.log('没有可用优惠券')
    }
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
    uni.showToast({
      title: '获取优惠券失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 格式化门槛文本
const formatThreshold = (coupon) => {
  if (coupon.couponType === 1) {
    // 满减券
    return coupon.threshold > 0 ? `满${coupon.threshold}元可用` : '无门槛'
  } else if (coupon.couponType === 2) {
    // 折扣券
    return coupon.threshold > 0 ? `满${coupon.threshold}元可用` : '无门槛'
  }
  return '无门槛'
}

// 格式化过期时间文本
const formatExpireTime = (coupon) => {
  const formatDate = (ts) => {
    if (!ts) return ''
    const date = new Date(Number(ts))
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // 如果有明确的有效期时间范围，优先显示
  if (coupon.takingEffectTime && coupon.expirationTime) {
    return `${formatDate(coupon.takingEffectTime)} 至 ${formatDate(coupon.expirationTime)}`
  }

  if (coupon.expirationType === 1) {
    // 按时间
    if (coupon.expirationTime) {
      return `有效期至${formatDate(coupon.expirationTime)}`
    }
  } else if (coupon.expirationType === 2) {
    // 按天数
    return `领取后${coupon.expirationDay}天内有效`
  } else if (coupon.expirationType === 3) {
    // 无限制
    return '长期有效'
  } else if (coupon.expirationTime) {
    // 兜底：如果有过期时间但类型没说明
    return `有效期至${formatDate(coupon.expirationTime)}`
  }
  return ''
}

// 防止滚动穿透
const preventScroll = (e) => {
  e.preventDefault()
  e.stopPropagation()
}
const onPopupChange = (e) => {
  // uv-popup 关闭时会触发 change，e.show 为 false
  if (!e?.show) emit('close')
}

const onMaskClick = () => {
  // 遮罩被点击时，通知父层同步关闭状态
  emit('close')
}
// 监听visible变化，控制弹窗显示
watch(() => props.visible, (newVal) => {
  if (newVal) {
    popup.value?.open()
    // 弹窗打开时重新获取优惠券列表
    console.log('弹窗打开，当前 cartIds:', props.cartIds)
    fetchCouponList()
    // #ifdef H5
    document.body.style.overflow = 'hidden'
    document.addEventListener('touchmove', preventScroll, { passive: false })
    // #endif
  } else {
    popup.value?.close()
    // #ifdef H5
    document.body.style.overflow = 'auto'
    document.removeEventListener('touchmove', preventScroll)
    // #endif
  }
})

// 监听couponListData变化，在获取数据后初始化选中状态
watch(() => couponListData.value, (newVal) => {
  if (newVal && newVal.length > 0) {
    if (props.selectedCoupon && props.selectedCoupon.detailId) {
      const index = newVal.findIndex(
        item => item.detailId === props.selectedCoupon.detailId
      )
      selectedCouponIndex.value = index >= 0 ? index : -1
      console.log('优惠券列表加载完成，找到选中的优惠券，索引:', selectedCouponIndex.value)
    } else {
      selectedCouponIndex.value = -1
      console.log('优惠券列表加载完成，没有传入selectedCoupon，不默认选中')
    }
  }
}, { deep: true })

// 监听selectedCoupon Props变化
watch(() => props.selectedCoupon, (newVal) => {
  if (newVal && newVal.detailId) {
    // 如果列表已加载，立即匹配
    if (couponListData.value && couponListData.value.length > 0) {
      const index = couponListData.value.findIndex(
        item => item.detailId === newVal.detailId
      )
      selectedCouponIndex.value = index >= 0 ? index : -1
      console.log('selectedCoupon Props更新，找到选中的优惠券，索引:', selectedCouponIndex.value)
    } else {
      // 如果列表还没加载，设为-1，等待列表加载完成后会再次匹配
      selectedCouponIndex.value = -1
      console.log('selectedCoupon Props更新，但列表还未加载，稍后会匹配')
    }
  } else {
    selectedCouponIndex.value = -1
  }
}, { deep: true })

// 组件卸载时清理
onUnmounted(() => {
  // #ifdef H5
  document.body.style.overflow = 'auto'
  document.removeEventListener('touchmove', preventScroll)
  // #endif
})

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 选择不使用
const handleSelectNone = () => {
  emit('select', null)
  handleClose()
}

// 兑换优惠券
const handleExchangeCoupon = async () => {
  if (!exchangeCode.value.trim()) {
    uni.showToast({
      title: '请输入兑换码',
      icon: 'none',
      duration: 2000
    })
    return
  }

  try {
    exchangeLoading.value = true
    uni.showLoading({
      title: '兑换中...',
      mask: true
    })

    // 调用兑换接口
    const exchangeRes = await receiveByCdkey(exchangeCode.value.trim())
    console.log('兑换优惠券结果:', exchangeRes)

    uni.hideLoading()

    // 兑换成功
    uni.showToast({
      title: '兑换成功',
      icon: 'success',
      duration: 2000
    })

    // 清空兑换码
    exchangeCode.value = ''

    // 重新获取优惠券列表
    await fetchCouponList()

  } catch (error) {
    console.error('兑换优惠券失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '兑换失败，请检查兑换码是否正确',
      icon: 'none',
      duration: 2000
    })
  } finally {
    exchangeLoading.value = false
  }
}

// 选择优惠券
const handleSelectCoupon = async (coupon, index) => {
  try {
    // 显示加载提示
    // uni.showLoading({
    //   title: '领取中...',
    //   mask: true
    // })

    // 调用领取优惠券接口
    // const receiveRes = await receiveACoupon(coupon.id)
    // console.log('领取优惠券结果:', receiveRes)

    // uni.hideLoading()

    // 领取成功后提示
    // uni.showToast({
    //   title: '领取成功',
    //   icon: 'success',
    //   duration: 1500
    // })

    // 延迟一下再关闭弹窗和触发选择事件
    // setTimeout(() => {
    if (selectedCouponIndex.value === index) {
      emit('select', -1)
    } else {
      emit('select', coupon, index)
    }
    handleClose()
    // }, 1500)

  } catch (error) {
    console.error('领取优惠券失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '领取失败',
      icon: 'none',
      duration: 2000
    })
  }
}

</script>

<style lang="scss" scoped>
.popup-content {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border-radius: 30rpx 30rpx 0 0;
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0 auto;
  max-width: 750rpx;
}

/* 弹窗头部 */
.popup-header {
  padding: 32rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1rpx solid #f5f5f5;
}

.header-title {
  font-family: PingFang SC;
  font-weight: 600;
  font-size: 36rpx;
  line-height: 52rpx;
  color: #000000;
}

.close-btn {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 64rpx;
  height: 64rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 兑换优惠券区域 */
.exchange-section {
  padding: 32rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
  background-color: #FAFAFA;
}

.exchange-input-wrapper {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.exchange-input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  background-color: #ffffff;
  border: 2rpx solid #E5E5E5;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #333333;

  &:focus {
    border-color: #00CBCC;
  }

  &::placeholder {
    color: #999999;
    font-size: 28rpx;
  }
}

.exchange-btn {
  width: 120rpx;
  height: 80rpx;
  background-color: #00CBCC;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &:active {
    background-color: #00B5B6;
    transform: scale(0.98);
  }

  &.disabled {
    background-color: #CCCCCC;
    transform: none;
    pointer-events: none;
  }
}

.exchange-btn-text {
  font-family: MiSans;
  font-weight: 500;
  font-size: 28rpx;
  color: #ffffff;
}

.exchange-tip {
  font-family: MiSans;
  font-weight: 400;
  font-size: 24rpx;
  color: #999999;
  line-height: 36rpx;
}

/* 优惠券列表 */
.coupon-list {
  flex: 1;
  min-height: 0;
  padding: 0 40rpx;
  box-sizing: border-box;
  width: 100%;
}

/* 不使用选项 */
.no-use-option {
  padding: 40rpx 0;
}

.no-use-text {
  font-family: MiSans;
  font-weight: 400;
  font-size: 28rpx;
  line-height: 56rpx;
  color: #222222;
}

/* 优惠券卡片 */
.coupon-card {
  background-color: #FFF3F5;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  position: relative;
  max-width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
  border: 3rpx solid transparent;

  &.selected {
    border-color: #00CBCC;
    background-color: #F0FFFE;
    box-shadow: 0 0 0 1rpx #00CBCC inset;
  }
}

/* 复选框 */
.coupon-checkbox {
  width: 48rpx;
  height: 48rpx;
  border: 2rpx solid #DDD;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &.checked {
    background-color: #00CBCC;
    border-color: #00CBCC;
  }
}

.checkbox-icon {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.coupon-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180rpx;
  flex-shrink: 0;
}

.amount-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 8rpx;
}

.amount-symbol {
  font-family: OPPO Sans;
  font-weight: 500;
  font-size: 46rpx;
  color: #FF5C4C;
  margin-right: 4rpx;
}

.amount-value {
  font-family: OPPO Sans;
  font-weight: 500;
  font-size: 80rpx;
  line-height: 1em;
  color: #FF5C4C;
}

.threshold-tag {
  padding: 4rpx 8rpx;
}

.threshold-text {
  font-family: MiSans;
  font-weight: 400;
  font-size: 24rpx;
  line-height: 35rpx;
  color: #666666;
}

.coupon-divider {
  width: 2rpx;
  height: 100rpx;
  // background-color: #F8D8DC;
  margin: 0 30rpx;
  flex-shrink: 0;
}

.coupon-right {
  flex: 1;
}

.coupon-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  justify-content: center;
}

.coupon-name {
  font-family: MiSans;
  font-weight: 600;
  font-size: 36rpx;
  line-height: 56rpx;
  color: #222222;
}

.coupon-expire {
  font-family: MiSans;
  font-weight: 400;
  font-size: 24rpx;
  line-height: 40rpx;
  color: #666666;
}

.coupon-remark {
  font-family: MiSans;
  font-weight: 400;
  font-size: 20rpx;
  line-height: 32rpx;
  color: #999999;
  margin-top: 8rpx;
}

.discount-value {
  font-size: 72rpx;
}

.discount-label {
  font-family: OPPO Sans;
  font-weight: 700;
  font-size: 32rpx;
  color: #FF5C4C;
  margin-left: 4rpx;
}

.loading-container,
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
}

.loading-text,
.empty-text {
  font-family: MiSans;
  font-weight: 400;
  font-size: 28rpx;
  color: #999999;
}

/* 底部按钮 */
.popup-footer {
  padding: 30rpx 40rpx 40rpx;
  border-top: 1rpx solid #f5f5f5;
  margin-top: auto;
}

.close-button {
  width: 100%;
  max-width: 600rpx;
  height: 78rpx;
  background-color: #00CBCC;
  border-radius: 48rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 12px 0px rgba(103, 61, 17, 0.08);
  margin: 0 auto;
}

.close-button-text {
  font-family: MiSans;
  font-weight: 500;
  font-size: 28rpx;
  line-height: 40rpx;
  letter-spacing: 3%;
  color: #ffffff;
}
</style>
