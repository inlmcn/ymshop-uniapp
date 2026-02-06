<!--
    @name: Options
    @author: kahu4
    @date: 2024-01-16 18:21
    @description：Options
    @update: 2024-01-16 18:21
-->
<script setup>
import { toRefs, computed } from "vue";
import Dropdown from "@/components/Dropdown/index.vue";
import DropdownItem from "@/components/Dropdown/DropdownItem.vue";

const emits = defineEmits(['cancel', 'pay', 'refund', 'delete', 'confirm', 'invite', 'cancelRefund', 'afterSale', 'repurchase', 'checkOffCode'])
/**
 * @property {status} 订单状态
 */
const props = defineProps({
  status: {
    type: String,
    required: true
  },
  shopType: {
    type: [String, Number],
    required: true
  },
  showMore: {
    type: Boolean,
    default: false
  },
  isFollow: {
    type: Boolean,
    default: false
  }
})
const { status, shopType, isFollow } = toRefs(props)

// 是否显示取消订单
const isShowCancel = computed(() => {
  return (status.value === '0');
})

// 是否显示取消订单2
const isShowCancelAnOrder = computed(() => {
  return shopType.value === 2 && ['8'].includes(status.value);
})

// 是否显示删除订单
const isShowDelete = computed(() => {
  return ['4', '5', '-2'].includes(status.value);
})

// 是否显示申请退款
const isShowRefund = computed(() => {
  return (shopType.value === 1 && ['1', '2', '3', '4', '8', '6'].includes(status.value)) 
    || (shopType.value === 2 && ['6'].includes(status.value));
})

// 是否显示售后详情
const isShowAfterSale = computed(() => {
  return ['-1', '-2'].includes(status.value);
})

// 是否显示更多
const isShowMore = computed(() => {
  return props.showMore 
    && (
        isShowCancel.value 
        || isShowCancelAnOrder.value 
        || isShowDelete.value 
        || isShowRefund.value 
        || isShowAfterSale.value
      );
})
</script>

<template>
  <view class="options-wrap">
    <view>
      <Dropdown v-if="isShowMore">
        <view class="order-actions-more">
          更多
        </view>
        <template #dropdown>
          <dropdown-item v-if="isShowCancel" @click="emits('cancel')">
            取消订单
          </dropdown-item>
          <dropdown-item v-if="isShowCancelAnOrder" @click="emits('cancelRefund')">
            取消订单
          </dropdown-item>
          <dropdown-item v-if="isShowDelete" @click="emits('delete')">
            删除订单
          </dropdown-item>
          <dropdown-item v-if="isShowRefund" @click="emits('refund')">
            申请退款
          </dropdown-item>
          <dropdown-item v-if="isShowAfterSale" @click="emits('afterSale')">
            售后详情
          </dropdown-item>
        </template>
      </Dropdown>
    </view>

    <view class="options">
      <view v-if="!showMore && ['-1', '-2'].includes(status)" class="order-actions-delete item" @click="emits('afterSale')">
        售后详情
      </view>
      <view v-if="!showMore && status === '0'" class="order-actions-delete item" @click="emits('cancel')">
        取消订单
      </view>
      <!-- 除了待付款和已取消 -->
      <view
        v-if="!showMore && ((shopType === 1 && ['1', '2', '3', '4', '8', '6'].includes(status)) || (shopType === 2 && ['6'].includes(status)))"
        class="order-actions-delete item" @tap="emits('refund')">
        申请退款
      </view>
      <view v-if="!showMore && (shopType === 2 && ['8'].includes(status))" class="order-actions-default item"
        @tap="emits('cancelRefund')">
        取消订单
      </view>
      <view v-if="status == 3" class="order-actions-default item" @tap="emits('evaluate')">
        立即评价
      </view>
      <view v-if="isFollow == 1" class="order-actions-default item" @tap="emits('followUp')">
        追评
      </view>
      <!-- 核销码 -->
      <view v-if="status === '8' && shopType === 2" class="order-actions-primary item" @tap="emits('checkOffCode')">
        核销码
      </view>
      <!-- 已完成 -->
      <view v-if="!showMore && ['4', '5', '-2'].includes(status)" class="order-actions-primary item" @tap="emits('delete')">
        删除订单
      </view>
      <!-- 已发货 待收货 -->
      <view v-if="status === '2'" class="order-actions-primary item" @tap="emits('confirm')">
        确认收货
      </view>
      <!-- 已发货 待收货 -->
      <view v-if="status === '6'" class="order-actions-primary item" @tap="emits('invite')">
        邀请好友拼团
      </view>
      <view v-if="status === '0'" class="order-actions-primary item" @tap="emits('pay')">
        立即付款
      </view>
      <view v-if="['4', '5'].includes(status)" class="order-actions-primary item" @tap.stop="emits('repurchase')"
        @click.stop="emits('repurchase')">
        再来一单
      </view>
    </view>
  </view>

</template>

<style lang="scss" scoped>
.options-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-actions-more {
  font-size: 24rpx;
  color: #333333;
}

.options {
  display: flex;

  .item {
    border-radius: 30rpx;
  }

}
</style>
