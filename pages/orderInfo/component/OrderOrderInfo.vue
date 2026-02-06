<!--
    @name: OrderOrderInfo
    @author: kahu4
    @date: 2024-01-22 12:01
    @description：OrderOrderInfo
    @update: 2024-01-22 12:01
-->
<script setup>
import { toRefs, computed } from "vue";
import { useShearPlate } from "@/hooks/useShearPlate";
import { useGlobalProperties } from "@/hooks";

const props = defineProps({
  orderInfoData: {
    type: Object,
    required: true,
  },
});

const { orderInfoData } = toRefs(props);
const { setData } = useShearPlate();
const { $timeFormat } = useGlobalProperties();
const payTypeStr = computed(() => {
  const type = orderInfoData.value.payType;
  if (type === "yue") return "余额支付";
  if (type && type.includes("weixin")) return "微信支付";
  if (type === "ali") return "支付宝支付";
  if (orderInfoData.value._status && orderInfoData.value._status._payType) {
    return orderInfoData.value._status._payType;
  }
  return "";
});

const payInfo = computed(() => {
  if (!orderInfoData.value.payInfo) return "";
  try {
    const payInfo = JSON.parse(orderInfoData.value.payInfo);
    console.log("payInfo", payInfo);
    return payInfo || "";
  } catch (e) {
    return "";
  }
});
</script>

<template>
  <view class="mb-20 card">
    <view class="card-content-wrap">
      <view class="infos-wrap">
        <view class="info-cell">
          <view class="info-cell-label"> 收货信息 </view>
          <view class="info-cell-value" style="text-align: end">
            <view>{{ orderInfoData.realName }}{{ orderInfoData.userPhone }}</view>
            <view>{{ orderInfoData.userAddress }}</view>
          </view>
        </view>
        <view class="info-cell">
          <view class="info-cell-label"> 订单编号 </view>
          <view class="info-cell-value">
            {{ orderInfoData.orderId }}
          </view>
          <!-- <view
              class="info-cell-operation"
              @click="setData(orderInfoData.orderId,'复制成功')"
          >
            复制
          </view> -->
        </view>
        <view class="info-cell">
          <view class="info-cell-label"> 支付方式 </view>
          <view class="info-cell-value">微信支付</view>
        </view>
        <view class="info-cell">
          <view class="info-cell-label"> 交易编号 </view>
          <view class="info-cell-value">
            {{ payInfo.transaction_id || '--' }}
          </view>
        </view>
        <view class="info-cell">
          <view class="info-cell-label"> 创建时间 </view>
          <view class="info-cell-value">
            {{ $timeFormat(orderInfoData.createTime, "yyyy-mm-dd hh:MM:ss") }}
          </view>
        </view>
        <view
          v-if="orderInfoData.status > 0 && orderInfoData.payTime"
          class="info-cell"
        >
          <view class="info-cell-label"> 付款时间 </view>
          <view class="info-cell-value">
            {{ $timeFormat(orderInfoData.payTime, "yyyy-mm-dd hh:MM:ss") }}
          </view>
        </view>
        <view v-if="orderInfoData.deliveryTime" class="info-cell">
          <view class="info-cell-label"> 发货时间 </view>
          <view class="info-cell-value">
            {{ $timeFormat(orderInfoData.deliveryTime, "yyyy-mm-dd hh:MM:ss") }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.infos-wrap {
  padding: 0 40rpx;
}

.infos-wrap.infos-right .info-cell-value {
  text-align: right;
}

.infos-wrap .info-cell {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: justify;
  -webkit-justify-content: space-between;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding-bottom: 32rpx;
}

.infos-wrap .info-cell-label {
  margin-right: 30rpx;
  line-height: 32rpx;
  font-size: 28rpx;
  color: #222;
}

.infos-wrap .info-cell-value {
  line-height: 32rpx;
  font-size: 28rpx;
  color: #222;
}

.infos-wrap .info-cell-operation {
  line-height: 32rpx;
  font-size: 24rpx;
  color: #00cbcc;
}

.card-content {
  padding: 20rpx 0 0;
}
</style>
