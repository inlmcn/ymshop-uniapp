<!--
    @name: 支付状态
    @author: kahu
    @date: 2023-11-08 12:10
    @description：index
    @update: 2023-11-08 12:10
-->
<script setup>
import { useRouter } from "@/hooks/useRouter";
import { computed, nextTick, ref, unref } from "vue";
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { checkPay, checkRecharge, orderInfo } from "@/api/order";
import { CacheKey } from "@/utils/config";
import Header from '@/components/Header/index.vue'
import Recommend from '@/components/Recommend/index.vue'
import { useInterface } from "@/hooks/useInterface";
import { useScroll } from "@/hooks/useScroll";
import Modal from "@/components/Modal/index.vue";
import ListLoadLoading from "@/components/ListLoadLoading/index.vue"
import { lazyLoading, payError, paySuccess } from "@/utils/images";
// ========================== hooks相关 ===================================
const { getParams, goBack, push, pushToTab } = useRouter()
const { loading, hideLoading } = useInterface()
const { scrollTop } = useScroll()

// ========================== 全局定义相关 ===================================
const retryTime = ref(3) // 重试次数
const campaignType = ref(0)  // 1拼团为成团 (2秒杀 3砍价)未使用 4拼团成团
const payStatusType = ref(0) // 支付状态 ： 0支付中 1支付成功 2支付失败
const orderType = ref(1) // 1商品 2充值
const uid = ref(undefined)
const title = computed(() => (['查询中...', '支付成功', '支付失败'][payStatusType.value]))
const imageIcon = computed(() => ([lazyLoading, paySuccess, payError][payStatusType.value]))

// ========================== 检查支付状态相关 ===================================
/**
 * 查询服务端支付状态
 */
async function queryOrderStatus() {
  loading?.({ title: '查询中...' })
  // 异步去查，有可能接口比微信快
  setTimeout(async () => {
    try {
      const payInfoStr = uni.getStorageSync(CacheKey.PAY_INFO);
      // 没有订单缓存直接跳到订单页面
      if (!payInfoStr) {
        payStatusType.value === 1
        return orderType.value === 2 ? toMyBalance() : toOrderList()
      }
      const parse = JSON.parse(payInfoStr);
      orderType.value === 1 ? await checkOrderPay(parse) : await checkRechargePay(parse)
    } catch (e) {
      retryTime.value = 0
      payStatusType.value = 2
      uni.removeStorageSync(CacheKey.PAY_INFO)
    } finally {
      hideLoading?.()
    }
  }, 1000)
}

/**
 * 检查商品订单支付情况
 * @param data
 * @return {Promise<void>}
 */
async function checkOrderPay(data) {
  const res = await checkPay({
    ...data.payData,
    uni: data.payData.orderId || '',
    uid: uid.value
  });
  await afterCheck(res)
  // 拼团
  if (data?.options?.isGroup) {
    campaignType.value = 1 // 默认设置待成团
    // 获取到拼团信息，查询是否成团
    const order = await orderInfo({ key: data.payData.orderId })
    if (order?._status?._type === '8') {
      campaignType.value = 4
    }
  }
}

/**
 * 检查充值订单支付情况
 * @param data
 * @return {Promise<void>}
 */
async function checkRechargePay(data) {
  const res = await checkRecharge({
    id: data.payData.orderId
  })
  await afterCheck(res)
}

/**
 * 检查支付状态之后逻辑处理
 * @param flag
 * @return {Promise<void>}
 */
async function afterCheck(flag) {
  if (!flag) {
    // 支付失败重新查询
    if (retryTime.value > 0) {
      retryTime.value--
      await queryOrderStatus()
    } else {
      // 没有重试次数直接失败掉
      payStatusType.value = 2
      uni.removeStorageSync(CacheKey.PAY_INFO)
    }
  } else {
    payStatusType.value = 1
    uni.removeStorageSync(CacheKey.PAY_INFO)
  }
}

// ========================== 跳转相关 ===================================
/**
 * 去订单列表
 */
function toOrderList() {
  // status 0 待支付 1 待发货 5待成团
  let status = 1;
  if (payStatusType.value === 1) {
    // 支付成功且未成团
    if (campaignType.value === 1) {
      status = 5
    }
    // 支付成功且已成团
    if (campaignType.value === 4) {
      status = 1
    }
  } else if (payStatusType.value === 2) {
    // 未支付成功
    status = 0
  }
  push?.({ url: '/pages/orderList/orderList' }, { data: { type: status }, type: 'reLaunch' })
}

/**
 * 去我的余额
 */
function toMyBalance() {
  push?.({ url: '/views/account/balance/index' }, { data: {}, type: 'reLaunch' })
}

/**
 * 返回首页
 */
function toBackHome() {
  pushToTab?.({ url: '/root/index/index' })
}

const recommendRef = ref(null)

onReachBottom(() => {
  unref(recommendRef).onReachBottom && unref(recommendRef).onReachBottom();
})

// ============================ h5弹窗相关 =================================
const modalRef = ref()

/**
 * 打开弹窗
 */
function showModal() {
  unref(modalRef).show()
}


onLoad(async (options) => {
  // 兼容本地跳转和服务端跳转
  if (options.details) {
    options = getParams?.(options)
  }
  orderType.value = Number(options.type) || 1
  if (options.uid) {
    uid.value = Number(options.uid)
  }

  // 处理从支付页面传递过来的状态参数
  if (options.status) {
    if (options.status === 'success') {
      payStatusType.value = 1 // 支付成功
    } else if (options.status === 'fail') {
      payStatusType.value = 2 // 支付失败
    }
  }

  // 保存订单ID，用于后续查询
  if (options.orderId) {
    const payInfoStr = uni.getStorageSync(CacheKey.PAY_INFO);
    if (payInfoStr) {
      const parse = JSON.parse(payInfoStr);
      parse.payData.orderId = options.orderId;
      uni.setStorageSync(CacheKey.PAY_INFO, JSON.stringify(parse));
    }
  }

  // H5 和 APP 需要弹窗去确认
  // #ifdef H5
  await nextTick(() => {
    showModal()
  })
  // #endif
  // #ifndef H5
  // 如果没有从支付页面传递状态，则查询支付状态
  if (!options.status) {
    await queryOrderStatus()
  }
  // #endif
})
</script>

<template>
  <view class="pay-status">
    <Header :scroll-top="scrollTop">
      {{ title }}
    </Header>
    <view class="status-main flex flex-column flex-ai__center">
      <image class="icon" :src="imageIcon" />
      <view class="text" v-if="[1, 2].includes(Number(payStatusType))">
        {{ title }}
      </view>
      <ListLoadLoading v-else :show-line="false" text="查询中..." />
    </view>
    <view class="button-group flex flex-ai__center flex-jc__center">
      <template v-if="orderType === 1">
        <view class="animation-button button white-button" v-if="Number(payStatusType) === 1" @click="toBackHome">
          继续逛逛
        </view>
        <view class="animation-button button" v-if="Number(payStatusType) === 1 && !uid" @click="toOrderList">
          查看订单
        </view>
        <view class="animation-button button" v-if="Number(payStatusType) === 2" @click="toOrderList">
          重新支付
        </view>
      </template>
      <template v-if="orderType === 2">
        <view class="animation-button button" @click="toMyBalance">
          我的余额
        </view>
      </template>
    </view>
    <!-- 商品推荐 -->
    <Recommend ref="recommendRef" />
    <Modal ref="modalRef" content="请确认支付是否完成？" @confirm="queryOrderStatus" @cancel="queryOrderStatus" />
  </view>
</template>

<style scoped lang="scss">
.pay-status {
  width: 100%;

  .status-main {
    @include usePadding(0, 130);
    width: 100%;
    font-size: 36rpx;

    .icon {
      width: 170rpx;
      height: 170rpx;
      margin-bottom: 30rpx;
    }

    .col-icon {
      width: 240rpx;
      height: 120rpx;
    }

  }

  .button-group {
    margin-bottom: 30rpx;
    gap: 30rpx;
    display: flex;
    justify-content: center;

    .button {
      width: 230rpx;
      height: 80rpx;
      background: #00CBCC;
      font-size: 34rpx;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1rpx solid #00CBCC;
    }

    .white-button {
      background: $white-color;
      color: #00CBCC;
      border: 1rpx solid #00CBCC;
    }
  }
}
</style>
