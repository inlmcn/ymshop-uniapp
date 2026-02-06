<template>
  <view :class="['order']" v-if="data">
    <view class="order-header-top" @tap="toOrderInfo">
      <view>
        <text class="order-time">下单时间：{{ formattedDate(data.createTime) }}</text>
      </view>
      <view class="order-status" v-if="data._status" :class="getStatusClass(data._status._title)">
        <text class="order-status" :class="getStatusClass(data.status)">
          {{ data._status._type === '8' && data.shippingType === 2 ? "待核销" : data._status._title }}
        </text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="order-goods">
      <view v-for="(item, index) in data.cartInfo" :key="index" class="order-item" @tap="toOrderInfo">
        <image class="item-image" :src="item.productInfo?.image || item.image" mode="aspectFill" />
        <view class="item-info">
          <text class="item-name">{{ item.productInfo?.storeName || item.storeName }}</text>
          <view class="item-spec" v-if="item.attrInfo">
            <text class="spec-text">{{ item.attrInfo }}</text>
          </view>
          <view class="item-bottom">
            <text class="item-price">¥{{ item.truePrice || item.productInfo?.price }}</text>
            <text class="item-quantity">x{{ item.cartNum }}</text>
          </view>
        </view>
      </view>
      <!-- 赠品列表 -->
      <template v-if="data.giftProductList && data.giftProductList.length > 0">
        <view v-for="(gift, giftIndex) in data.giftProductList" :key="'gift-' + giftIndex" class="order-item gift-item"
              @tap.stop="toggleGiftTooltip(giftIndex)">
          <view class="image-container">
            <image class="item-image" :src="gift.image" mode="aspectFill" />
            <view class="gift-badge">
              <text class="gift-text">赠</text>
            </view>
          </view>
          <view class="item-info">
            <text class="item-name">{{ gift.storeName }}</text>
            <view class="item-bottom">
              <text class="item-price gift-price">¥ 0</text>
              <text class="item-quantity">x{{ gift.storeProduct?.stock || 1 }}</text>
            </view>
          </view>
          <!-- 提示气泡 -->
          <view v-if="currentGiftIndex === giftIndex" class="gift-tooltip" @tap.stop>
            此商品不支持售后，有疑问可以联系客服哦
          </view>
        </view>
      </template>
    </view>

    <view class="order-info-monery" @tap="toOrderInfo">
      <view class="text flex flex-ai__center">总金额：
        <view class="total-price">¥{{ payPrice }}</view>
      </view>
    </view>
    <view v-if="data._status" class="order-ct-wrap">
      <view class="order-actions-main-left">
        <Dropdown v-if="isShowMore">
          <view class="order-actions-more">
            更多
          </view>
          <template #dropdown>
            <dropdown-item v-if="isShowCancel" @click="showModal(1)">
              取消订单
            </dropdown-item>
            <dropdown-item v-if="isShowCancelAnOrder" @click="showModal(3)">
              取消订单
            </dropdown-item>
            <dropdown-item v-if="isShowDelete" @click="showModal(0)">
              删除订单
            </dropdown-item>
            <dropdown-item v-if="isShowRefund" @click="toSelectRefundGood(data.id)">
              申请退款
            </dropdown-item>
            <dropdown-item v-if="isShowAfterSale" @click="toAfterSale(data.orderId)">
              售后详情
            </dropdown-item>
          </template>
        </Dropdown>
        <!-- 支付倒计时 -->
        <view class="countdown-wrapper" v-if="data._status._type === '0' && data._status._payRemainTime">
          <text class="countdown-text">支付剩余：</text>
          <uv-count-down :customStyle="{ fontSize: '22rpx', color: '#ff4444 !important', fontWeight: '600' }"
                         :time="parseInt(data._status._payRemainTime)" format="mm:ss" @finish="handleCountdownFinish">
          </uv-count-down>
        </view>
      </view>
      <view class="order-actions-wrap">
        <!-- 未支付 -->
        <view class="order-actions-left">
        </view>
        <view class="order-actions-btns">
          <!-- <view v-if="['-1', '-2'].includes(data._status._type)" class="order-actions-default"
            @tap="toAfterSale(data.orderId)">
            售后详情
          </view> -->
          <!-- <view v-if="data._status._type === '0'" class="order-actions-default" @tap="showModal(1)">
            取消订单
          </view> -->
          <!-- <view
            v-if="(data.shippingType === 1 && ['1', '2', '3', '4', '8', '6'].includes(data._status._type)) || data.shippingType === 2 && ['6'].includes(data._status._type)"
            class="order-actions-default" @tap="toSelectRefundGood(data.id)">
            申请退款
          </view> -->
          <view v-if="data._status._type == 3" class="order-actions-default"
                @tap="toEvaluate(data.cartInfo, data.orderId)">
            立即评价
          </view>

          <view v-if="data.isFollow == 1" class="order-actions-default"
                @tap="toFollowUp(data.cartInfo, data.orderId, data.id)">
            追评
          </view>
          <!-- <view v-if="(data.shippingType === 2 && ['8'].includes(data._status._type))" class="order-actions-default"
            @tap="showModal(3)">
            取消订单
          </view> -->

          <!-- _type: 2待收货 3已收货 4已完成 8代发货 6待成团 7已成团 -->
          <view v-if="data._status._type === '8' && data.shippingType === 2" class="order-actions-primary"
                @tap="emit('checkOffCode', data.writeOffCode)">
            核销码
          </view>
          <view class="order-actions-default" v-if="data._status._type === '2'" @tap="toOrderInfo">
            查看物流
          </view>
          <view v-if="data._status._type === '2'" class="order-actions-primary" @tap="showModal(2)">
            确认收货
          </view>
          <!-- <view v-if="['4', '5', '-2'].includes(data._status._type)" class="order-actions-default" @tap="showModal(0)">
            删除订单
          </view> -->
          <view v-if="data._status._type === '6'" class="order-actions-primary"
                @tap="goGroupByDetail({ teamworkId: data.teamworkId })">
            邀请好友拼团
          </view>
          <view v-if="data._status._type === '0'" class="order-actions-primary" @tap="handlePay">
            立即付款
          </view>
          <view v-if="['4', '5'].includes(data._status._type)" class="order-actions-primary"
                @tap.stop="handleRepurchase">
            再来一单
          </view>
        </view>
      </view>
    </view>
    <Modal ref="modalRef" :content="modalTitle" @confirm="confirmModal" />
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { cancelAfterVerification, orderTake } from '@/api/order'
import dayjs from 'dayjs';
import Modal from "@/components/Modal/index.vue"

import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";
import { useOrder } from "@/hooks/useOrder";
import { useJump } from "@/hooks/useJump";
import { getCartAdd, deleteCartByIds } from "@/api/cart";
import Dropdown from "@/components/Dropdown/index.vue";
import DropdownItem from "@/components/Dropdown/DropdownItem.vue";
import { useShoppingCartStore } from "@/store/modules/useShoppingCart";

const {
  modalRef,
  modalType,
  modalTitle,
  showModal,
  cancelOrder,
  deleteOrder,
  toEvaluate,
  toFollowUp,
  toSelectRefundGood,
  showWsReceipt,
} = useOrder()
const shoppingCartStore = useShoppingCartStore()

const { push } = useRouter()
const { goGroupByDetail } = useJump()

const { toast } = useInterface()

const emit = defineEmits(['refresh', 'pay', 'checkOffCode'])

const props = defineProps(['class', 'data', 'logoSrc'])

const data = ref(props.data)

// 运费金额
const totalPostage = ref(props.data.totalPostage)
// 实际支付金额
const payPrice = ref(props.data.payPrice)
// 优惠券金额
const couponPrice = ref(props.data.totalCouponPrice)
// 订单总价
const totalPrice = ref(props.data.totalPrice)
const isRepurchasing = ref(false)

// 赠品提示气泡索引
const currentGiftIndex = ref(-1)

const toggleGiftTooltip = (index) => {
  if (currentGiftIndex.value === index) {
    currentGiftIndex.value = -1
  } else {
    currentGiftIndex.value = index
  }
}

// 订单状态映射
const statusMap = {
  '待付款': { text: '待付款', class: 'status-pending' },
  '待发货': { text: '待发货', class: 'status-shipping' },
  '待收货': { text: '待收货', class: 'status-receiving' },
  '待评价': { text: '待评价', class: 'status-evaluate' },
  '已完成': { text: '已完成', class: 'status-completed' },
  '已取消': { text: '已取消', class: 'status-cancelled' },
  '已退款': { text: '已退款', class: 'status-refunded' }
}

// 是否显示取消订单
const isShowCancel = computed(() => {
  return (data.value?._status?._type === '0');
})

// 是否显示取消订单2
const isShowCancelAnOrder = computed(() => {
  return data.value?.shippingType === 2 && ['8'].includes(data.value?._status?._type)
})

// 是否显示申请退款
const isShowRefund = computed(() => {
  return (
      data.value?.shippingType === 1
      && ['1', '2', '3', '4', '8', '6'].includes(data.value?._status?._type)
  ) || (
      data.value?.shippingType === 2
      && ['6'].includes(data.value?._status?._type)
  )
})

// 是否显示删除订单
const isShowDelete = computed(() => {
  return ['4', '5', '-2'].includes(data.value?._status?._type)
})

// 是否显示售后详情
const isShowAfterSale = computed(() => {
  return ['-1', '-2'].includes(data.value?._status?._type)
})

// 是否显示更多
const isShowMore = computed(() => {
  return isShowCancel.value
      || isShowCancelAnOrder.value
      || isShowRefund.value
      || isShowDelete.value
      || isShowAfterSale.value;
})

const formattedDate = (value) => {
  return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
}
// 获取状态样式类
const getStatusClass = (status) => {
  return statusMap[status]?.class || ''
}


/**
 * 确认取消订单
 * @returns {Promise<void>}
 */
async function doCancelOrder() {
  cancelOrder(data.value).then(() => {
    emit('refresh')
  })
}

const handleCountdownFinish = () => {
  if (!data.value || !data.value._status) {
    console.warn('倒计时结束，但订单数据不存在')
    return
  }
  console.log('倒计时结束，订单状态:', data.value._status._type)
  // uni.showModal({
  // 	title: '支付提醒',
  // 	content: '支付时间已到期，订单将自动取消。请重新下单或联系客服处理。',
  // 	showCancel: true,
  // 	cancelText: '知道了',
  // 	confirmText: '重新下单',
  // 	confirmColor: '#00cbcc',
  // 	success: (res) => {
  // 		if (res.confirm) {
  // 			// 用户选择重新下单，可以跳转到商品详情或购物车
  // 			uni.showToast({
  // 				title: '即将跳转到重新下单',
  // 				icon: 'none',
  // 				duration: 1500
  // 			})
  // 			// 这里可以添加跳转逻辑
  // 		}
  // 	}
  // })

  // 触发刷新，更新订单状态
  // emit('refresh')
  // 取消订单
  // doCancelOrder()
}
const toAfterSale = (orderId) => {
  push({ url: '/pages/refundInfo/refundInfo' }, { data: { orderId } })
}

const handleRepurchase = async () => {
  if (isRepurchasing.value) return
  if (!data.value || !Array.isArray(data.value.cartInfo)) return
  console.log(data.value, '11111111===>');

  const products = data.value.cartInfo.map(item => {
    const productId = item?.productInfo?.id || item?.productId || item?.id
    const cartNum = Number(item?.cartNum || 1)
    const uniqueId = item?.productInfo?.attrInfo?.unique || item?.productAttrUnique || item?.unique || ""
    return { productId, cartNum, uniqueId }
  }).filter(item => item.productId)

  if (products.length === 0) {
    toast({ title: '订单商品为空' })
    return
  }

  // 区分处理：send类型订单走orderPay（需要先加入购物车），其他类型走confirmOrder（使用tag=1参数格式）
  if (data.value.orderType === 'send') {
    isRepurchasing.value = true
    uni.showLoading({ title: '处理中...', mask: true });
    try {
      shoppingCartStore.cartIds = []
      shoppingCartStore.activityId = 0
      for (const product of products) {
        const cartRes = await getCartAdd({
          new: 1,
          orderType: 1,
          productId: product.productId,
          uniqueId: product.uniqueId || "",
          cartNum: product.cartNum,
        })
        if (cartRes?.cartId) {
          shoppingCartStore.cartIds.push(cartRes.cartId)
        }
      }

      if (shoppingCartStore.cartIds.length === 0) {
        toast({ title: '添加购物车失败' })
        return
      }

      // 跳转到确认订单页面
      uni.navigateTo({ url: '/pages/orderList/orderPay' })

    } catch (error) {
      console.error(error)
      toast({ title: '再来一单失败' })
    } finally {
      uni.hideLoading();
      isRepurchasing.value = false
    }
  } else {
    // 非send类型订单，直接使用tag=1的格式传递参数（id-num,id-num），跳过购物车添加步骤
    // 这种方式利用了confirmOrder.vue中针对tag=1的特殊处理逻辑（不重新拉取购物车列表）
    const dataStr = products.map(p => `${p.productId}-${p.cartNum}`).join(',')
    uni.navigateTo({ url: '/pages/orderList/confirmOrder?data=' + dataStr + '&tag=1' })
  }
}
/**
 * 确认删除订单
 * @returns {Promise<void>}
 */
async function doDeleteOrder() {
  deleteOrder(data.value).then(() => {
    emit('refresh')
  })
}

/**
 * 确认收货
 * @returns {Promise<void>}
 */
async function doTakeGoods() {
  let option = {
    uni: data.value.orderId,
  }
  try {
    let payInfo = JSON.parse(data.value.payInfo)
    const res = await showWsReceipt(payInfo.transaction_id)
    if (res !== 'success') return
    await orderTake(option)
    emit('refresh')
    toast({ title: '已收货' });
  } catch (e) {
    console.error(e)
    toast({ title: '收货失败', icon: 'error' });
  }
}


const doCancelAnOrder = async () => {
  await cancelAfterVerification({ id: data.value.orderId })
  toast({ title: '取消成功' })
  emit('refresh')
}

const doEvaluate = async () => {
  // 跳转到评论页面，传递本订单的商品列表和订单ID
  // pages/comment/comment 页面在 onLoad 中会读取 details 参数（通过 useRouter.getParams），
  // 并从 params.unique 数组生成待评价的商品列表
  push({ url: '/pages/comment/comment' }, {
    data: {
      unique: data.value.cartInfo || [],
      orderId: data.value.orderId
    }
  })
}

/**
 * 确认弹窗
 */
function confirmModal() {
  const funcArr = [doDeleteOrder, doCancelOrder, doTakeGoods, doCancelAnOrder, doEvaluate]
  funcArr[modalType.value]()
}

function handlePay() {
  emit('pay', data.value.orderId)
}


function toOrderInfo() {
  push({ url: '/pages/orderInfo/orderInfo' }, {
    data: {
      key: data.value.unique,
      orderId: data.value.orderId,
    }
  })
}


</script>

<style lang="scss">
.order {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 24rpx 20rpx !important;
  margin: 20rpx 24rpx !important;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.order-ct-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;

  .order-actions-main-left {
    flex: 1;
    display: flex;
    align-items: center;

    .countdown-wrapper {
      display: flex;
      align-items: center;
      padding: 8rpx 16rpx;
      border-radius: 20rpx;

      .countdown-text {
        font-size: 22rpx;
        font-weight: 500;
      }
    }

    .order-actions-more {
      font-size: 28rpx;
      line-height: 64rpx;
      margin-right: 20rpx;
    }
  }
}

.order-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;

  .order-time {
    font-size: 22rpx;
    color: #999;
  }

  .order-status {
    font-size: 26rpx;
    font-weight: 500;

    &.status-pending {
      color: #ff6b00;
    }

    &.status-shipping,
    &.status-receiving {
      color: #00cbcc;
    }

    &.status-evaluate,
    &.status-completed {
      color: #00cbcc;
    }

    &.status-cancelled,
    &.status-refunded {
      color: #999;
    }
  }
}

.order-goods {
  margin-bottom: 16rpx;
}

/* 商品项 */
.order-item {
  display: flex;
  margin-bottom: 16rpx;

  .item-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 8rpx;
    flex-shrink: 0;
    background-color: #f8f8f8;
  }

  .item-info {
    flex: 1;
    margin-left: 16rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .item-name {
    font-size: 26rpx;
    color: #333;
    line-height: 36rpx;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    margin-bottom: 8rpx;
  }

  .item-spec {
    margin-bottom: 8rpx;

    .spec-text {
      font-size: 22rpx;
      color: #999;
      background-color: transparent;
      padding: 0;
    }
  }

  .item-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .item-price {
    font-size: 28rpx;
    color: #000;
    font-weight: 600;
  }

  .item-quantity {
    font-size: 24rpx;
    color: #999;
  }
}

/* 赠品样式 */
.gift-item {
  position: relative;

  .image-container {
    position: relative;
    flex-shrink: 0;
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

  .gift-price {
    color: #000 !important;
    font-weight: 600;
  }

  .gift-tags {
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex-wrap: wrap;
    margin-bottom: 8rpx;
  }

  .gift-tag {
    padding: 4rpx 12rpx;
    border-radius: 6rpx;
    font-size: 20rpx;
    line-height: 28rpx;
    font-weight: 500;
    border: 1rpx solid;
  }

  .gift-tooltip {
    position: absolute;
    left: 30rpx;
    bottom: -80rpx;
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

.order-info-monery {
  padding: 16rpx 0 12rpx;
  margin-top: 8rpx;

  .text {
    font-size: 28rpx;
    color: #000000;
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    margin-bottom: 8rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .total-price {
    font-size: 36rpx;
    color: #00cbcc;
    font-weight: 600;
    margin-left: 8rpx;
  }
}

/* 订单操作 */
.order-actions-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-actions-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.order-actions-btns {
  display: flex;
  align-items: center;
}

.order-actions-default,
.order-actions-primary {
  margin-left: 20rpx;
  width: 169rpx;
  height: 60rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30rpx;
  line-height: 58rpx;
  text-align: center;

  &:first-child {
    margin-left: 0;
  }
}

.order-actions-default {
  color: #00CBCC;
  background: #ffffff;
  border: 1rpx solid #00CBCC;
}

.order-actions-primary {
  background: #00CBCC;
  color: #ffffff;
}

// 商品SKU 数量等操作条
.goods-options {
  width: 100%;


  .sku-row {
    margin-bottom: 30rpx;

    .sku-info {
      @include usePadding(10, 4);
      border-radius: 5rpx;
      font-size: 24rpx;
      transition: all .3s;
      max-width: 100%;


      .info {
        width: 100%;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      &:active {
        scale: 1.1;
      }

      .icon {
        margin-left: 15rpx;
      }
    }
  }

  .price-row {
    width: 100%;

    .price-box {
      font-size: 30rpx;
      color: $primary-color;

      .old-price {
        font-size: 20rpx;
        color: $tips-color;
        text-decoration: line-through;
        margin-left: 10rpx;
      }
    }

    .after-sale-box {
      font-size: 22rpx;
      margin-right: 5rpx;
      color: $tips-color;
    }


    .cart-num {
      font-size: 24rpx;

      .input {
        width: 120rpx;


        input {
          width: 100%;
          text-align: center;
          color: #333;
        }
      }

      .button {
        font-size: 32rpx;
        width: 34rpx;
        aspect-ratio: 1/1;
        border-radius: 5rpx;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all .3s;

        &:active {
          scale: 1.2;
        }
      }
    }
  }
}
</style>
