<template>
  <view class="order-info-container" @touchstart="handlePageTouchStart">
    <Header system-bar-area-bg="#fff" header-area-bg="#fff" :scroll-top="scrollTop">
      订单详情
    </Header>
    <view class="bg-image" mode="widthFix"></view>
    <view class="main-inner" v-if="orderInfoData">
      <!-- 订单状态信息 -->
      <OrderState :order-info-data="orderInfoData" :remain-time-str="remainTimeStr" />
      <!-- 地址 -->
      <!-- <OrderAddress :order-info-data="orderInfoData" /> -->
      <!-- group info 是拼团且已支付 -->
      <OrderGroupInfo
        v-if="orderInfoData.campaignType && orderInfoData.campaignType === 1 && orderInfoData._status._type !== '0' && orderInfoData.teamworkId"
        :order-info-data="orderInfoData" />
      <!-- goods list -->
      <OrderGoodsInfo :order-info-data="orderInfoData" />
      <!-- order info -->
      <OrderOrderInfo :order-info-data="orderInfoData" />
      <!-- logistics info -->
      <OrderLogisticsInfo v-if="expressData" :order-info-data="orderInfoData" :express-data="expressData" />
      <view class="bottom-bar-bg"></view>
      <!-- options -->
      <view class="order-actions bottom-bar">
        <OrderOptions 
          style="width: 100%" 
          :status="orderInfoData._status._type" 
          :shop-type="orderInfoData.shippingType"
          :is-follow="orderInfoData.isFollow"
          show-more
          @cancel="showModal(MODAL_TYPE.CANCEL)" @confirm="showModal(MODAL_TYPE.CONFIRM)"
          @delete="showModal(MODAL_TYPE.DELETE)" @pay="handlePay" @refund="toSelectRefundGood(orderInfoData.id)"
          @check-off-code="checkOffCode(orderInfoData.writeOffCode)"
          @invite="goGroupByDetail({ teamworkId: orderInfoData.teamworkId })"
          @cancel-refund="showModal(MODAL_TYPE.CANCEL_CHECK)" @after-sale="toAfterSale(orderInfoData.orderId)"
          @repurchase="handleRepurchase"
          @evaluate="toEvaluate(orderInfoData.cartInfo, orderInfoData.orderId)"
          @follow-up="toFollowUp(orderInfoData.cartInfo, orderInfoData.orderId, orderInfoData.id)"
        />
      </view>

    </view>
  </view>
  <!-- 支付弹窗（新组件，保持与 PayPopup 一样的调用方式） -->
  <!-- <PaymentPopup ref="payPopupRef" :isInvite="0" @confirm="paySuccess" /> -->

  <Modal ref="modalRef" :content="modalTitle" @confirm="confirmModal" />

  <!-- 核销 -->
  <!-- <CheckOffCode ref="checkOffCodeRef" /> -->

</template>

<script setup>
import Header from "@/components/Header/index.vue"
import { onBeforeUnmount, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { cancelAfterVerification, orderNewExpress, orderInfo, orderTake, editOrderAddress } from '@/api/order'
import { orderReStatus } from '@/config'
import { useRouter } from "@/hooks/useRouter";
import Modal from "@/components/Modal/index.vue";
import { useInterface } from "@/hooks/useInterface";
import { formatRemainTime } from "@/utils/utils";
import { useOrder } from "@/hooks/useOrder";
import OrderOptions from "@/pages/orderInfo/component/OrderOptions.vue";
import OrderState from "@/pages/orderInfo/component/OrderState.vue";
import { useScroll } from "@/hooks/useScroll";
import OrderGroupInfo from "@/pages/orderInfo/component/OrderGroupInfo.vue";
import OrderGoodsInfo from "@/pages/orderInfo/component/OrderGoodsInfo.vue";
import OrderOrderInfo from "@/pages/orderInfo/component/OrderOrderInfo.vue";
import OrderLogisticsInfo from "@/pages/orderInfo/component/OrderLogisticsInfo.vue";
import { useJump } from "@/hooks/useJump";
import { emitter } from "@/utils/emitter";
import { orderPayment } from "@/utils/orderPayment";
import { getCartAdd } from "@/api/cart";
import { initPageTouchListener } from '@/hooks/useOutsideClick'
import {useShoppingCartStore} from "@/store/modules/useShoppingCart";
// 初始化页面触摸监听
const handlePageTouchStart = initPageTouchListener()


const { goGroupByDetail } = useJump()
const shoppingCartStore = useShoppingCartStore()


const { scrollTop } = useScroll();


// const { payPopupRef, openPay, paySuccess } = usePay()

const { getParams, getUrlParams, goBack, push } = useRouter()
const { toast } = useInterface();

const orderInfoData = ref(null)
const orderInfoStatusMsg = ref('')
const expressData = ref(null)
const remainTimeStr = ref('')


const handleOrderInfo = async (option) => {
  const res = await orderInfo(option)
  orderInfoData.value = res
  res.status = res.paid === 1 && res.status === 0 ? 99 : res.status
  handleMsg(res.status)
  if (parseInt(res._status._type) > 1) {
    if (parseInt(res._status._type) === 2) {
      remainTimeStr.value = formatRemainTime(res._status._payRemainTime)
    }
    // _type: 2待收货 3已收货 4已完成 8代发货 6待成团 7已成团
    if ([2, 3, 4].includes(parseInt(res._status._type))) {
      if (res.shippingType === 2) return // 核销订单不需要物流'
      await orderNewExpress({
        key: orderInfoData.value.id,
      }).then(res => {
        console.log('orderNewExpress response:', res)

        try {
          let tracesData = null

          // 如果res是字符串，尝试解析JSON
          if (typeof res === 'string') {
            const parsed = JSON.parse(res)
            tracesData = parsed.Traces || parsed.traces || parsed
          } else if (res && typeof res === 'object') {
            // 如果res已经是对象，直接获取Traces
            tracesData = res.Traces || res.traces || res
          }

          // 确保tracesData是数组
          if (Array.isArray(tracesData)) {
            expressData.value = [...tracesData].reverse()
          } else {
            console.warn('Express data is not an array:', tracesData)
            expressData.value = []
          }
        } catch (parseError) {
          console.error('Failed to parse express data:', parseError, res)
          expressData.value = []
        }
      }).catch(err => {
        console.log(err, 'err', 'at pages/orderInfo/orderInfo.vue:107')
        expressData.value = []
      })
    }

  }
}

const {
  MODAL_TYPE,
  modalRef,
  checkOffCodeRef,
  modalType,
  modalTitle,
  showModal,
  cancelOrder,
  deleteOrder,
  toEvaluate,
  toSelectRefundGood,
  showWsReceipt,
  checkOffCode,
  toFollowUp,
} = useOrder(handleOrderInfo)


const handlePay = async () => {
  // openPay(orderInfoData.value.orderId)
  uni.showLoading({ title: '处理中...', mask: true });
  try {
    await orderPayment(orderInfoData.value.orderId, {
      onSuccess: () => {
        push?.({ url: '/pages/payStatus/index?status=success&orderId=' + orderInfoData.value.orderId }, { type: 'redirectTo' });
      }
    }, false)
  } finally {
    uni.hideLoading();
  }
}

const handleRepurchase = async () => {
  if (!orderInfoData.value || !orderInfoData.value.cartInfo) return
  console.log(orderInfoData.value, '11111111===>');
  const products = orderInfoData.value.cartInfo.map(item => ({
    productId: item.productInfo?.id,
    cartNum: item.cartNum,
    uniqueId: item.productInfo?.attrInfo ? item.productInfo.attrInfo.unique : ''
  })).filter(item => item.productId)

  if (products.length === 0) {
    toast({ title: '订单商品为空' })
    return
  }

  // 区分处理：send类型订单走orderPay（需要先加入购物车），其他类型走confirmOrder（使用tag=1参数格式）
  if (orderInfoData.value.orderType === 'send') {
    uni.showLoading({ title: '处理中...', mask: true });
    try {
      shoppingCartStore.activityId=0
      shoppingCartStore.cartIds=[]
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

    } catch (e) {
      console.error(e)
      toast({ title: '再来一单失败' })
    } finally {
      uni.hideLoading();
    }
  } else {
    // 非send类型订单，直接使用tag=1的格式传递参数（id-num,id-num），跳过购物车添加步骤
    const dataStr = products.map(p => `${p.productId}-${p.cartNum}`).join(',')
    console.log(dataStr, 'dataStr===');
    uni.navigateTo({ url: '/pages/orderList/confirmOrder?data=' + dataStr + '&tag=1' })
  }
}

// 返回列表
const goList = () => {
  let status = 0
  switch (orderInfoData.value.status) {
    case -1:
      status = -1
      break
    case 0:
      status = 0
      break
    case 4:
      status = -1
      break
    case 99:
      status = 1
      break
    default:
      status = orderInfoData.value.status + 1
  }
  push({ url: '/pages/orderList/orderList' }, {
    data: {
      type: status
    }
  })
}

/**
 * 确认弹窗
 */
function confirmModal() {
  const funcArr = [doDeleteOrder, doCancelOrder, doTakeGoods, doCancelAnOrder]
  funcArr[modalType.value]()
}

const handleMsg = (status) => {
  orderInfoStatusMsg.value = orderReStatus[status]
}

async function doDeleteOrder() {
  deleteOrder(orderInfoData.value).then(() => {
    setTimeout(() => {
      goList()
    }, 2000)
  })
}

async function doCancelOrder() {
  cancelOrder(orderInfoData.value).then(() => {
    setTimeout(() => {
      goList()
    }, 2000)
  })
}

async function doTakeGoods() {
  let option = {
    uni: orderInfoData.value.orderId,
  }
  let payInfo = JSON.parse(orderInfoData.value.payInfo)
  showWsReceipt(payInfo.transaction_id).then(async (res) => {
    if (res === 'success') {
      await orderTake(option)
      toast({ title: '收货成功' });
      await handleOrderInfo({
        key: option.uni
      })
    }
  })
}

const toAfterSale = (orderId) => {
  push({ url: '/pages/refundInfo/refundInfo' }, { data: { orderId } })
}

const doCancelAnOrder = async () => {
  await cancelAfterVerification({ id: orderInfoData.value.orderId })
  toast({ title: '取消成功' })
  goBack()
}

const doEditOrderAddress = async (addressId) => {
  await editOrderAddress({ orderId: orderInfoData.value.orderId, addressId })
  await handleOrderInfo({
    key: orderInfoData.value.orderId
  })
  toast({ title: '地址修改成功' })
}

onShow(() => {
  const params = getUrlParams()
  handleOrderInfo({
    key: params.orderId
  })
})

onBeforeUnmount(() => {
  emitter.clear('selectAddress')
})

emitter.on('selectAddress', async (item) => {
  await doEditOrderAddress(item.id)
})

</script>

<style lang="scss" scoped>
@import "../../style/images";

.order-info-container {
  width: 100%;
  min-height: 100vh;
  position: relative;

  .bg-image {
    position: absolute;
    left: 0;
    width: 100%;
    height: 300rpx;
    z-index: 0;
    background: linear-gradient(270deg, #D3FFFF 0%, #F4FFFF 100%);
    border-radius: 0rpx 0rpx 0rpx 0rpx;
  }

  .main-inner {
    position: relative;
    z-index: 1;
    @include usePadding(0, 0);
  }
}

.orderList {
  padding: 20rpx 0;
}


.order-infos {
  margin: 0 40rpx;
  padding: 40rpx 0 20rpx;

  &:after {
    content: '';
  }
}

.no-express {
  font-size: 26rpx;
  padding: 20rpx 14rpx 30rpx;
}

.order-actions {
  bottom: 0;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx 34rpx calc(30rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}
</style>
