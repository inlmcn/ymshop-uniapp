<!--
    @name: 付款弹窗
    @author: kahu
    @date: 2023-11-08 10:53
    @description：index
    @update: 2023-11-08 10:53
-->
<script setup>
import Popup from '@/components/Popup/index.vue';
import {computed, ref, toRefs, unref} from "vue";
import UvRadioGroup from "@/uni_modules/uv-radio/components/uv-radio-group/uv-radio-group.vue";
import UvRadio from "@/uni_modules/uv-radio/components/uv-radio/uv-radio.vue";
import { doPayment } from "@/utils/paymentUtils";
import { orderInfo as orderInfoRequest } from "@/api/order";
import { useInterface } from "@/hooks/useInterface";
import { useRouter } from "@/hooks/useRouter";
import { useMainStore } from "@/store/modules/useMainStore";
import { PAY_INSTANCE_TYPE, payRows } from "@/utils/payModule.js";

const props = defineProps({
  isInvite: {
    type: Number,
    default: 0,
    required: true
  }
})
const {isInvite} = toRefs(props)

const {toast} = useInterface()
const {push} = useRouter()
const emits = defineEmits(['confirm', 'close']);
const mainStore = useMainStore()
const popupRef = ref()

async function show(orderId,uid) {
  await doGetOrderDetail(orderId,uid)
  unref(popupRef).show()
}

function close() {
  emits('close')
}

const filterPayRows = computed(() => {
  // 判断是否是好友代付
  if (isInvite.value !== 1) {
    return payRows
  } else {
    return payRows.filter(item => item.type !== PAY_INSTANCE_TYPE.FRIENDS)
  }
})

defineExpose({show})

const payType = ref(PAY_INSTANCE_TYPE.WECHAT) // 支付方式

const orderInfo = ref({}) // 订单信息
const zeroPrice = ref(false) // 本单金额是否为0
async function doGetOrderDetail(orderId,uid) {
  let params = {key: orderId}
  if(uid){
    params.uid = uid
  }
  orderInfo.value = await orderInfoRequest(params);
  if (orderInfo.value.totalPrice <= 0) {
    payType.value = PAY_INSTANCE_TYPE.LOCAL
    zeroPrice.value = true
    toast?.({title: '支付金额为0.00，自动选择余额支付', icon: 'none', duration: 3000})
  } else {
    zeroPrice.value = false
  }
}

const subLoading = ref(false)

async function handleSubmit() {
  try {
    subLoading.value = true
    await doPayment({type: payType.value, payInfo: orderInfo.value, isGroup: orderInfo.value.campaignType === 1, helpPay: isInvite.value === 1})
    subLoading.value = false
    if(payType.value !== PAY_INSTANCE_TYPE.FRIENDS){
      emits('confirm')
    }
    close()
  } catch (e) {
    console.error(e)
    if(payType.value !== PAY_INSTANCE_TYPE.FRIENDS) {
      toast?.({title: '支付失败了'})
      push?.({url: '/pages/payStatus/index'}, {type: 'redirectTo'})
    }
    close()
  }
}

</script>

<template>
  <Popup
      ref="popupRef"
      title="支付"
      @close="close"
  >
    <view class="pay-container">
      <uv-radio-group
          placement="column"
          iconPlacement="right"
          v-model="payType"
          class="pay-box__inner flex flex-ai__center flex-jc__center flex-wrap"
          shape="circle"
          activeColor="#00CBCC"
      >
        <template
            v-for="pay in filterPayRows"
            :key="pay.type"
        >
          <uv-radio
              :name="pay.type"
              :disabled="pay.disabled|| (pay.type===PAY_INSTANCE_TYPE.WECHAT&&zeroPrice) || (mainStore.user.nowMoney===0 &&!zeroPrice&&pay.type===PAY_INSTANCE_TYPE.LOCAL)"
          >
            <view class="pay-row flex flex-ai__center">
              <image
                  class="icon"
                  :src="pay.icon"
              />
              <view class="info">
                <view
                    class="label flex flex-nowrap flex-ai__end"
                    style="white-space: nowrap">
                  {{ pay.label }}
                  <span
                      v-if="pay.type===PAY_INSTANCE_TYPE.LOCAL"
                      style="font-size: 16rpx;white-space: nowrap;">
                    （{{ mainStore.user.nowMoney }}元）
                    </span>
                </view>
                <view>
                  {{ pay.eLabel }}
                </view>
              </view>
            </view>
          </uv-radio>
        </template>
      </uv-radio-group>
      <view
          class="animation-button sub-button"
          :class="{active:subLoading}"
          @click="handleSubmit"
      >
        立即支付
      </view>
    </view>
  </Popup>
</template>

<style
    scoped
    lang="scss"
>
.pay-container {
  @include usePadding(35, 0);
  width: 100%;

  .pay-row {

    @include usePadding(0, 20);
    font-size: 20rpx;
    color: $tips-color;
    border-bottom: 1rpx solid #e5e5e5;

    &:last-child {
      border-bottom: none;
    }

    .icon {
      width: 80rpx;
      height: 80rpx;
      margin-right: 30rpx;
    }

    .info {
      .label {
        font-size: 28rpx;
        color: #333;
      }
    }
  }

  :deep(.uv-radio) {
    width: 100%;
    transition: all .3s;

    &:active {
      scale: 1.1;
    }
  }

  .sub-button {
    $button-height: 80rpx;
    margin: 20rpx auto;
    height: $button-height;
    line-height: $button-height;
    border-radius: $button-height;
    text-align: center;
  }
}
</style>
