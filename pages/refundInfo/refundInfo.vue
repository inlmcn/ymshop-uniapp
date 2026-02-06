<template>
  <layout class="orderInfo">
    <Header system-bar-area-bg="#fff" header-area-bg="#fff" :scroll-top="scrollTop">
      <template #left>
        <view class="header-left">
          <uv-icon name="arrow-left" size="20" color="#000" @click="goBackList" />
          <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
        </view>
      </template>
      <text class="header-title">售后订单详情</text>
    </Header>
    <view v-if="orderInfoData">
      <view class="orderInfo-header background-warp" :class="orderInfoData.state === 0 && 'mb-100'">
        <view class="background">
          <image class="image" :src="afterSalesBg" mode="widthFix" />
        </view>
        <view class="background-content page-space">
          <view class="order-status-info">
            <view class="order-status" :class="'order-status-' + orderInfoData.state">
              <view>
                {{ refundOrderStatus[orderInfoData.state] }}
              </view>
            </view>
            <view class="order-date"
              v-if="parseInt(orderInfoData.remainTime) > 0 && ![3, 4].includes(orderInfoData.state)">
              {{ remainTimeStr }}
            </view>
          </view>
        </view>
      </view>
      <view class="page-space">
        <view class="mb-20 card" v-if="orderInfoData.realName">
          <view class="card-head">
            <view class="card-title">
              商家收货信息
            </view>
          </view>
          <view class="card-content">
            <view class="infos">
              <view class="info-cell">
                <view class="info-cell-label">
                  收货人
                </view>
                <view class="info-cell-value">
                  <view class="address-name">{{ orderInfoData.realName }}</view>
                  <view class="address-phone">{{ orderInfoData.userPhone }}</view>
                </view>

              </view>
              <view class="info-cell">
                <view class="info-cell-label">
                  地
                  <text class="wem1"></text>
                  址
                </view>
                <view class="info-cell-value">
                  {{ orderInfoData.userAddress }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="mb-20 card" v-if="orderInfoData.deliverySn">
          <view class="card-head">
            <view class="card-title">
              物流信息
            </view>
          </view>
          <view class="card-content">
            <view class="infos">
              <view class="info-cell">
                <view class="info-cell-label">
                  物流单号
                </view>
                <view class="info-cell-value">
                  {{ orderInfoData.deliverySn }}
                </view>

              </view>
              <view class="info-cell">
                <view class="info-cell-label">
                  物流公司
                </view>
                <view class="info-cell-value">
                  {{ orderInfoData.deliveryName }}
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="order-goods  page-card mb-20">
          <goods list link interval desc="3" showAction model :purchase="item.cartNum" :data="item.productInfo"
            :price="item.truePrice" v-for="(item, index) in orderInfoData.cartInfo">
          </goods>
          <view class="order-infos infos mb-20 infos-right border-top">
            <view class="info-cell">
              <view class="info-cell-label">商品总价：</view>
              <view class="info-cell-value">¥{{ orderInfoData.totalPrice }}</view>
            </view>
            <view class="info-cell ">
              <view class="info-cell-label">优惠：</view>
              <view class="info-cell-value">¥{{ orderInfoData.couponPrice }}</view>
            </view>
            <view class="info-cell ">
              <view class="info-cell-label">运费：</view>
              <view class="info-cell-value">¥{{ orderInfoData.totalPostage }}</view>
            </view>
            <view class="info-cell ">
              <view class="info-cell-label">总计：</view>
              <view class="info-cell-value">¥{{ orderInfoData.payPrice.toFixed(2) }}</view>
            </view>
          </view>
        </view>

        <view class="mb-20 card">
          <view class="card-head">
            <view class="card-title">
              售后信息
            </view>
          </view>
          <view class="card-content">
            <view class="infos">
              <view class="info-cell">
                <view class="info-cell-label">
                  退款金额
                </view>
                <view class="info-cell-value">
                  ¥{{ orderInfoData.refundAmount.toFixed(2) }}
                </view>

              </view>
              <view class="info-cell">
                <view class="info-cell-label">
                  服务类型
                </view>
                <view class="info-cell-value">
                  {{ orderInfoData.serviceType === 0 ? '仅退款' : '退货退款' }}
                </view>
              </view>
              <view class="info-cell">
                <view class="info-cell-label">
                  订单编号
                </view>
                <view class="info-cell-value">
                  {{ orderInfoData.orderId }}
                </view>
                <view class="info-cell-operation" @click="setData(orderInfoData.orderId, '复制成功')">
                  复制
                </view>
              </view>
              <view class="info-cell">
                <view class="info-cell-label">
                  退款原因
                </view>
                <view class="info-cell-value">
                  {{ orderInfoData.reasons }}
                </view>
              </view>
              <view class="info-cell">
                <view class="info-cell-label">
                  详细说明
                </view>
                <view class="info-cell-value">
                  <view>{{ orderInfoData.explains }}</view>
                  <view>
                    <view></view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="mb-20 card" v-if="orderInfoData.status > 1">
          <view class="card-head">
            <view class="card-title">
              物流信息
            </view>
          </view>
          <view class="card-content " v-if="expressData">
            <view class="paddingH-10">
              <uv-steps current="0" direction="column" activeColor="#00CBCC" inactiveColor="#E5E5E5">
                <uv-steps-item v-for="(item, index) in expressData" :key="index" :title="item.acceptStation"
                  :desc="item.acceptTime"></uv-steps-item>
              </uv-steps>
            </view>
          </view>
        </view>
      </view>
      <view class="bottom-bar-bg"></view>

      <view class="refund-actions bottom-bar">
        <!-- 已发货 待收货 -->
        <view class="refund-actions-left">
        </view>
        <view class="refund-actions-btns">
          <view class="refund-actions-default" @tap="showModal(0)" v-if="[3, 4].includes(orderInfoData.state)">
            删除记录
          </view>
          <view class="refund-actions-default" @tap="showModal(1)" v-if="[0, 1].includes(orderInfoData.state)">
            撤销申请
          </view>
          <view class="refund-actions-default" @tap="toRefund" v-if="orderInfoData.state === 5">
            再次申请
          </view>
          <view class="refund-actions-default" @tap="toAddLogistics" v-if="orderInfoData.state === 1">
            填写物流
          </view>
        </view>
      </view>

    </view>
  </layout>
  <Modal ref="modalRef" :content="modalTitle" @confirm="confirmModal" />
</template>

<script setup>
import { computed, ref, unref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useMainStore } from '@/store/modules/useMainStore'
import Header from '@/components/Header/index.vue'
import { formatDate } from '@/utils/utils'
import { orderCancel, checkForAfterSalesInfo, orderTake, orderDelete, orderExpress, afterSalesOrderDelete, afterSalesOrderRevoke } from '@/api/order'
import { orderReStatus } from '@/config'
import { useRouter } from "@/hooks/useRouter";
import { useGlobalProperties } from "@/hooks";
import { useShearPlate } from "@/hooks/useShearPlate";
import { formatRemainTime } from '@/utils/utils'
import Modal from "@/components/Modal/index.vue";
import { afterSalesBg } from "@/utils/images";
import config from "@/uni_modules/uv-ui-tools/libs/config/config";
import { useScroll } from "@/hooks/useScroll";
import { COMMON_IMG_PATH } from '@/utils/imgpath'

const { $timeFormat } = useGlobalProperties()
const { scrollTop } = useScroll();
const { getUrlParams, push, toHome } = useRouter()
const { setData } = useShearPlate();
const orderInfoData = ref(null)
const orderInfoStatusMsg = ref('')
const expressData = ref(null)
const id = ref(0)
const orderId = ref(0)
const remainTimeStr = ref('')
const refundOrderStatus = ref({
  0: '请耐心等待平台审核',
  1: '平台已同意退货申请，请尽早退货',
  2: '请耐心等待平台确认收货',
  3: '退款成功',
  4: '用户已取消',
  5: '商家已拒绝',
})


const handleOrderInfo = async (option) => {
  const res = await checkForAfterSalesInfo(option)
  orderInfoData.value = res
  remainTimeStr.value = formatRemainTime(orderInfoData.value.remainTime)
}

const modalRef = ref()
const modalType = ref(0) // 0删除记录 1撤销申请
const modalTitle = computed(() => {
  const tipsArr = ['确认删除记录吗？', '确认撤销申请吗？']
  return tipsArr[modalType.value]
})

/**
 * 打开弹窗
 * @param {number} type 0删除记录 1撤销申请
 */
function showModal(type) {
  modalType.value = type
  unref(modalRef).show()
}

/**
 * 确认弹窗
 */
function confirmModal() {
  const funcArr = [doDeleteRequest, doRevoke]
  funcArr[modalType.value]()
}

/**
 * 确认删除
 */
async function doDeleteRequest() {
  await afterSalesOrderDelete({
    id: id.value || orderInfoData.value.id,
    orderCode: orderInfoData.value.orderId
  })
  uni.showToast({
    title: '已删除',
    duration: 2000
  });
  setTimeout(() => {
    toRefundList()
  }, 2000)
}

/**
 * 确认撤销
 */
async function doRevoke() {
  await afterSalesOrderRevoke({
    id: id.value || orderInfoData.value.id,
    key: orderInfoData.value.orderId
  })
  uni.showToast({
    title: '已撤销',
    duration: 2000
  });
  setTimeout(() => {
    toRefundList()
  }, 2000)
}

// 跳转列表
const toRefundList = () => {
  // 使用navigateBack返回上一页，保持之前的标签状态
  uni.navigateBack();
}

// 填写物流
const toAddLogistics = () => {
  push({ url: '/pages/addLogistics/addLogistics' }, {
    data: {
      id: orderInfoData.value.id,
      orderCode: orderInfoData.value.orderCode
    }
  })
}


// 再次申请
const toRefund = () => {
  push({ url: '/pages/refund/refund' }, {
    data: {
      refundType: orderInfoData.value.serviceType,
      goods: orderInfoData.value.cartInfo.map(v => {
        return v.productAttrUnique
      }).toString(),
      id: orderId.value
    }
  })
}

// 返回列表
const goBackList = () => {
  // 使用navigateBack返回上一页，保持之前的标签状态
  uni.navigateBack();
}

onShow(() => {
  const params = getUrlParams()
  console.log(params, 'params')
  id.value = params.id
  orderId.value = params.orderId  
  handleOrderInfo({
    key: params.id || params.orderId
  })
})

</script>

<style lang="scss" scoped>
@import "../../style/images";

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #121212;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;

  .icon-home {
    width: 48rpx;
    height: 48rpx;
  }
}

.orderList {
  padding: 20rpx 0;
}

.page-space {
  position: relative;
  z-index: 2;
}

// #ifdef MP-WEIXIN
.bottom-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  // 提升层级，避免被页面内容覆盖
  z-index: 99;
  border-radius: 20rpx 20rpx 0 0;
  // 兼容 iOS 安全区，防止被 home 指示条遮挡
  padding-bottom: env(safe-area-inset-bottom);
  padding-bottom: constant(safe-area-inset-bottom);
}

// #endif

// 预留与底部操作栏等高的占位，避免页面内容被固定栏遮挡
.bottom-bar-bg {
  height: calc(150rpx + env(safe-area-inset-bottom));
  height: calc(150rpx + constant(safe-area-inset-bottom));
}

/* 重写售后页底部操作栏样式，避免受全局 .order-actions 干扰 */
.refund-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 34rpx;
  // 与 .bottom-bar 结合生效（固定在底部）
  // 在 iOS 上由 .bottom-bar 的 padding-bottom 处理安全区
}

.refund-actions-left {
  display: flex;
  align-items: center;
}

.refund-actions-btns {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.refund-actions-default {
  min-width: 169rpx;
  height: 60rpx;
  padding: 0 20rpx;
  border: 1rpx solid #00CBCC;
  border-radius: 30rpx;
  line-height: 58rpx;
  text-align: center;
  color: #00CBCC;
  font-size: 24rpx;
  background: #fff;
}

.order-status-info {
  padding: 50rpx 0;

  .order-status {
    display: flex;
    align-items: center;
    height: 42rpx;
    font-size: 30rpx;
    color: #FFFFFF;
    margin-bottom: 20rpx;
    padding-left: 50rpx;
    background-size: 40rpx 40rpx;
    background-position: left center;
    background-repeat: no-repeat;

    &.order-status-0,
    &.order-status-1,
    &.order-status-2,
    &.order-status-5 {
      background-image: $orderStateClock;
    }

    &.order-status-3,
    &.order-status-4 {
      background-image: $orderStateFinish;
    }

    .image {
      width: 40rpx;
      height: 40rpx;
      margin-right: 10rpx;
    }
  }

  .order-date {
    height: 33rpx;
    font-size: 24rpx;
    color: #FFFFFF;
  }
}

.order-infos {
  margin: 0 40rpx;
  padding: 40rpx 0 20rpx;

  &:after {
    content: '';
  }
}

.infos {
  .info-cell-label {
    .wem1 {
      width: 1em;
      display: inline-block;
    }
  }

  .info-cell-value {
    display: flex;
  }
}
</style>
