<template>
  <layout class="play">
    <uv-navbar
        :fixed="false"
        title="提交订单"
        left-arrow
        @leftClick="goBack"
    />
    <view class="play-info">
      <view class="play-money">
        <view class="unit">¥</view>
        <view
            class="value"
            v-if="orderInfoData"
        >{{ orderInfoData?.payPrice }}
        </view>
      </view>
      <view class="play-date">支付剩余时间
        <uv-count-down
            :time="payRemainTime"
            format="HH:mm:ss"
            @finish="payRemainTimeFinish"
        ></uv-count-down>
      </view>
      <!-- <view class="store-name">王忠圈胡辣汤（五一路店) -1200675841253947588</view> -->
    </view>
    <blank size="15"></blank>
    <container>
      <view class="play-select">
        <uv-radio-group
            v-model="payType"
            iconPlacement="right"
            placement="column"
            shape="circle"
            activeColor="#00CBCC"
        >
          <view
              class="play-type"
              v-for="(item, index) in playTypes"
          >

            <uv-radio
                :key="index"
                :name="item.value"
                :disabled="item.disabled"
            >
              <view class="play-type-icon"></view>
              <view class="play-type-name">{{ item.label }}</view>
            </uv-radio>
          </view>
        </uv-radio-group>
      </view>
      <uv-button
          type="primary"
          text="确认支付"
          @click="handleOrderPay"
      ></uv-button>
    </container>

    <!-- <a :href="playUrl">去支付</a> -->

    <blank size="15"></blank>
    <uv-modal
        ref="payConfirmRef"
        title="支付确认"
        confirmText="已完成支付"
        :showCancelButton="true"
        @confirm="payConfirm"
    ></uv-modal>
  </layout>
</template>

<script setup>
import { ref } from 'vue'
import { orderInfo, orderPay } from '@/api/order'
import { onLoad } from '@dcloudio/uni-app'
import { useGlobalProperties } from '@/hooks'
import { useRouter } from "@/hooks/useRouter";
import { PAY_INSTANCE_TYPE } from "@/utils/payModule";

const {goBack} = useRouter()

const {$platform} = useGlobalProperties()

const playTypes = ref([
  {
    label: '微信支付',
    value: PAY_INSTANCE_TYPE.WECHAT,
    disabled: false
  },
  {
    label: '余额支付',
    value: PAY_INSTANCE_TYPE.LOCAL,
    disabled: true
  },
  {
    label: '支付宝支付',
    value: PAY_INSTANCE_TYPE.ALI,
    disabled: true
  }
])

const {push} = useRouter()

// alipay-支付宝 weixin-微信支付 yue余额支付。 from. 传 routine-小程序  h5是H%

const payType = ref(PAY_INSTANCE_TYPE.WECHAT)
const orderKey = ref(null)
const orderId = ref(null)
const orderInfoData = ref(null)
const playUrl = ref('')
const payConfirmRef = ref(null)
const payRemainTime = ref(1800000)

const handleOrderPay = async () => {
  if (!payType.value) {
    uni.showToast({
      icon: "none",
      title: '请选择支付方式',
      duration: 2000
    });
    return
  }
  const {data: payInfo} = await orderPay({
    from: $platform,
    paytype: payType.value,
    uni: orderId.value
  })
  push({
    url: '/pages/orderInfo/orderInfo'
  }, {
    data: {
      key: orderKey.value,
      orderId: orderId.value,
      // id: data.value.id,
    }
  })
  // console.log("gxs --> % handleOrderPay % data:\n", payInfo)
  //
  //
  // // #ifdef H5
  // // h5端
  //
  // // playUrl.value = payInfo.mweb_url
  // window.open(payInfo)
  // payConfirmRef.value.open()
  //
  // // #endif
  //
  // // #ifndef H5
  //
  // let orderInfo = {
  //   appId: payInfo.appId,
  //   nonceStr: payInfo.nonceStr,
  //   package: payInfo.package,
  //   // partnerid: payInfo.partnerid,
  //   // prepayid: payInfo.prepayid,
  //   paySign: payInfo.paySign,
  //   signType: payInfo.signType,
  //   timeStamp: payInfo.timeStamp + '',
  // }
  //
  //
  // console.log("gxs --> % handleOrderPay % orderInfo:\n", {
  //   provider: 'weixin',
  //   ...orderInfo,
  //   orderInfo
  // })
  //
  // uni.requestPayment({
  //   provider: 'weixin',
  //   ...orderInfo,
  //   orderInfo,
  //   success: (success) => {
  //     console.log("gxs --> % handleOrderPay % success:\n", success)
  //     navigateTo({
  //       url: '/pages/orderInfo/orderInfo',
  //       query: {
  //         key: orderKey.value,
  //         orderId: orderId.value,
  //         // id: data.value.id,
  //       }
  //     })
  //   },
  //   fail: (error) => {
  //     console.log("gxs --> % handleOrderPay % error:\n", error)
  //
  //   },
  // })
  // // #endif
}

// 支付确认
const payConfirm = () => {
  push({
    url: '/pages/orderInfo/orderInfo'
  }, {
    data: {
      key: orderKey.value,
      orderId: orderId.value
    }
  })
}

const handleOrderInfo = (option) => {
  orderInfo(option).then(res => {
    orderInfoData.value = res
    payRemainTime.value = parseInt(res._status._payRemainTime)
  })
}

// 倒计时结束
const payRemainTimeFinish = (e) => {
  uni.showToast({
    title: '已超时支付',
    duration: 2000
  });
  push({
    url: '/pages/orderInfo/orderInfo'
  }, {
    data: {
      key: orderKey.value,
      orderId: orderId.value
    }
  })
}

const {getParams} = useRouter()
onLoad(options => {
  const params = getParams(options)
  orderKey.value = params.key
  orderId.value = params.orderId
  let sendParams = {
    key: orderKey.value
  }
  if(params.uid){
    sendParams.uid = params.uid
  }
  handleOrderInfo(sendParams)
})

</script>

<style lang="scss">
.bargaining {
  background-color: #333333;
}

.play {


  &-info {
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  &-date {
    line-height: 32rpx;
    font-size: 20rpx;
    color: #333333;
    text-align: center;
  }

  &-money {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin: 10rpx 0;
    height: 70rpx;

    .unit {
      line-height: 50rpx;
      font-size: 30rpx;
      color: #000;
    }

    .value {
      line-height: 70rpx;
      font-size: 60rpx;
      color: #000;
    }
  }

  .store-name {
    line-height: 32rpx;
    font-size: 20rpx;
    text-align: center;

    color: #333333;
  }

  &-select {
    padding: 30rpx 0;

    .play-type {
      background: #fff;
      display: flex;
      align-items: center;
      padding: 10rpx 10rpx 10rpx 20rpx;
      box-sizing: border-box;

      :deep(.uv-radio) {
        width: 100%;
        @include usePadding(10, 20)
      }

      &-name {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
      }
    }
  }
}

// gxs --> % handleOrderPay % orderInfo:
//  {provider: "weixin", appId: "wx604d2ea4702620d2", nonceStr: "I62uU0Ts5trnE4qH", package: "prepay_id=wx192311123448065c6b0f91dff2c3120000", paySign: "7A7D782BEB5F69E2745F463301E245C5", …}
// WAServiceMainContext.js?t=wechat&s=1695131989147&v=3.0.2:1 支付回调页 mainControl= false
// WAServiceMainContext.js?t=wechat&s=1695131989147&v=3.0.2:1 支付回调页 hasFull= false
// selectPlay.js:83 gxs --> % handleOrderPay % success:
//  {errMsg: "requestPayment:ok"}
</style>


