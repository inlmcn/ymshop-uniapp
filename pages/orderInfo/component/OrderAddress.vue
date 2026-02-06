<!--
    @name: OrderAddress
    @author: kahu4
    @date: 2024-01-22 11:41
    @description：OrderAddress
    @update: 2024-01-22 11:41
-->
<script setup>

import { toRefs } from "vue";

import {addressEditIcon, orderAddressIcon} from "@/utils/images";
import {useRouter} from "@/hooks/useRouter";
const { push } = useRouter()

const props = defineProps({
  orderInfoData: {
    type: Object,
    required: true
  }
})

const {orderInfoData} = toRefs(props)

/**
 * 去选择地址
 */
function gotoSelectAddress() {
  push?.({url: '/pages/address/address'}, {
    data: {
      type: 'select', orderId: orderInfoData.value.orderId
    }
  })
}
</script>

<template>
  <view class="address noBorder">
    <view class="address-icon">
      <image
          :src="orderAddressIcon"
          class="image"
      />
    </view>
    <view class="address-main">
        <view class="address-header">
          <view class="address-name">{{ orderInfoData.shippingType!==2?orderInfoData.realName:orderInfoData.storeName }}</view>
          <view class="address-phone" v-if="orderInfoData.shippingType!==2">{{ orderInfoData.userPhone }}</view>
        </view>
        <view class="address-content">
          <view class="address-desc">{{ orderInfoData.shippingType!==2?orderInfoData.userAddress:orderInfoData.shopAddress }}</view>
        </view>
    </view>
    <view class="btn-edit-address" @click="gotoSelectAddress" v-if="[0,99].includes(orderInfoData.status)">
      <image
          class="image"
          :src="addressEditIcon"
      />
    </view>
  </view>
</template>

<style
    scoped
    lang="scss">
.btn-edit-address .image{
  width: 32rpx;
  height: 32rpx;
}
</style>
