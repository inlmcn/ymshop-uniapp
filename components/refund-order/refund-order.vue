<template>
  <view>
    <view :class="['order', props.className]" v-if="data">

      <view class="order-header" @tap="toOrderInfo">
        <view class="order-logo">
          <view class="color-y">HealthCoast</view>
          <view>营养严选</view>
        </view>
        <view class="order-status status-2">
          {{ refundOrderStatus[data.state] }}
        </view>
      </view>
      <view class="order-goods" @tap="toOrderInfo">
        <goods list interval desc="3" showAction model :purchase="item.cartNum" :data="item.productInfo"
          :price="item.truePrice" v-for="(item, index) in data.cartInfo" :key="index" />
      </view>
      <view class="refund-order-info-detail" @tap="toOrderInfo">
        <text class="text" :class="data.state === 3 && 'color-y'">{{ data.state === 3 ? '成功退款' : '待平台处理' }}
        </text>
        <text class="text">{{ data.state === 3 ? '成功' : '' }}退款¥{{ accurateRefundAmount.toFixed(2) }}</text>
      </view>

      <view class="order-actions">
        <!-- 已完成 -->
        <view class="order-actions-left">
        </view>
        <view class="order-actions-btns">
          <view class="order-actions-default" @tap="showModal(0)" v-if="[3, 4].includes(data.state)">
            删除记录
          </view>
          <view class="order-actions-default" @tap="showModal(1)" v-if="[0, 1].includes(data.state)">
            撤销申请
          </view>
          <view class="order-actions-default" @tap="toRefund" v-if="data.state === 5">
            再次申请
          </view>
          <view class="order-actions-default" @tap="toAddLogistics" v-if="data.state === 1">
            填写物流
          </view>
          <view class="order-actions-primary" @tap="toOrderInfo">
            查看详情
          </view>
        </view>
      </view>

    </view>
    <Modal ref="modalRef" :content="modalTitle" @confirm="confirmModal" />
  </view>
</template>

<script setup>
import { computed, ref, unref } from 'vue';
import { afterSalesOrderDelete, afterSalesOrderRevoke } from '@/api/order'
import Modal from '@/components/Modal/index.vue'
import { useRouter } from "@/hooks/useRouter";
import { refundOrderStatus } from '@/config'
import { useInterface } from "@/hooks/useInterface";

const { push } = useRouter()
const { toast } = useInterface();

const emit = defineEmits(['refresh'])

const props = defineProps(['class', 'data', 'className'])

const data = ref(props.data)

// 运费金额
const freightPrice = ref(props.data.freightPrice)
// 实际支付金额
const payPrice = ref(props.data.payPrice)
// 优惠券金额
const couponPrice = ref(props.data.couponPrice)
// 订单总价
const totalPrice = ref(props.data.totalPrice)

// 计算精确的退款金额
const accurateRefundAmount = computed(() => {
  if (!data.value || !data.value.cartInfo || !Array.isArray(data.value.cartInfo)) {
    return data.value?.refundAmount || 0
  }
  
  // 使用cartInfo中的payPrice重新计算，避免精度问题
  let totalRefund = 0
  data.value.cartInfo.forEach(item => {
    const itemPrice = item.payPrice || item.refundablePrice || item.truePrice || 0
    const quantity = item.cartNum || 1
    totalRefund += itemPrice * quantity
  })
  
  return totalRefund
})

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
 * @returns {Promise<void>}
 */
async function doDeleteRequest() {
  await afterSalesOrderDelete({
    id: data.value.id,
    orderCode: data.value.orderCode
  })
  data.value = null
  toast({ title: '已删除' });
  emit('refresh')
}

/**
 * 确认撤销
 * @returns {Promise<void>}
 */
async function doRevoke() {
  await afterSalesOrderRevoke({
    id: data.value.id,
    key: data.value.orderCode
  })
  data.value = null
  toast({ title: '已撤销' });
  emit('refresh')
}

// 查看详情
const toOrderInfo = () => {
  push({ url: '/pages/refundInfo/refundInfo' }, {
    data: {
      id: data.value.id,
      orderId: data.value.orderId
    }
  })
}

// 填写物流
const toAddLogistics = () => {
  push({ url: '/pages/addLogistics/addLogistics' }, {
    data: {
      id: data.value.id,
      orderCode: data.value.orderCode
    }
  })
}


// 再次申请
const toRefund = () => {
  push({ url: '/pages/refund/refund' }, {
    data: {
      refundType: data.value.serviceType,
      goods: data.value.cartInfo.map(v => {
        return v.productAttrUnique
      }).toString(),
      id: data.value.orderId
    }
  })
}

</script>

<style lang="scss">
.refund-order-info-detail {
  border-top: 1rpx solid #E6E6E6;
  border-bottom: 1rpx solid #E6E6E6;
  line-height: 74rpx;
  font-size: 24rpx;
  color: #333333;

  .text {
    margin-left: 20rpx;

    &:first-child {
      font-weight: bold;
    }

    &.color-y {
      color: #00CBCC;
    }
  }
}
</style>
