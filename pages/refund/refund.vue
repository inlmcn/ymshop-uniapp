<template>
  <layout>
    <uv-navbar :fixed="false" :title="title" left-arrow @leftClick="goBack" />
    <view v-if="orderInfoData" style="padding-bottom: 100rpx">
      <view class="th-wrap">
        <card v-for="(item, index) in goodsList" :key="index" class="card-item">
          <Goods row imgWidth="200rpx" info-padding="10rpx 40rpx" :goods="item.cartInfo.productInfo">
            <template #options>
              <view class="goods-options">
                <!-- sku select -->
                <view class="sku-row flex">
                  <view class="sku-info flex flex-jc__sb flex-ai__center">
                    <view class="info">
                      {{
                        item.cartInfo.productInfo && item.cartInfo.productInfo.attrInfo &&
                        item.cartInfo.productInfo.attrInfo.sku
                      }}
                    </view>
                  </view>
                </view>
                <!-- bottom -->
                <view class="price-row flex flex-ai__center flex-jc__sb">
                  <!-- price -->
                  <view class="price-box flex flex-ai__end">
                    ￥{{ item.cartInfo.truePrice }}
                  </view>
                  <view class="cart-num flex flex-ai__center" @click.stop>
                    <view class="button" @click="setCartNum(item, index, 0)">-
                    </view>
                    <view class="input">
                      <input type="text" v-model="goodsCartNumList[index]"
                        @blur="(e) => changeCartNumInput(e, item, index)" />
                    </view>
                    <view class="button" @click="setCartNum(item, index, 1)">+
                    </view>
                  </view>
                </view>
              </view>
            </template>
          </Goods>
        </card>
      </view>
      <view class="t-list">
        <uv-list :border="false">
          <uv-list-item title="货物状态" clickable right-text="请选择" show-arrow v-if="refundType === 1">
            <view class="t-list-content">
              <view class="t-list-label">货物状态</view>
              <view class="t-list-select-placeholder" @tap="openReceivingStatusPicker" v-if="!data.receivingStatus">
                请选择
              </view>
              <view class="t-list-select" @tap="openReceivingStatusPicker" v-if="data.receivingStatus">
                {{ data.receivingStatus }}
              </view>
            </view>
            <uv-picker ref="receivingStatusPicker" :columns="receivingStatusClumns"
              @confirm="receivingStatusConfirm"></uv-picker>
          </uv-list-item>
          <uv-list-item title="退款原因" clickable right-text="请选择" show-arrow>
            <view class="t-list-content">
              <view class="t-list-label">退款原因</view>
              <view class="t-list-select-placeholder" @tap="openReasonForApplicationPicker"
                v-if="!data.reasonForApplication">
                请选择
              </view>
              <view class="t-list-select" @tap="openReasonForApplicationPicker" v-if="data.reasonForApplication">
                {{ data.reasonForApplication }}
              </view>
            </view>
          </uv-list-item>
        </uv-list>
        <uv-picker ref="reasonForApplicationPicker" :columns="reasonForApplication"
          @confirm="reasonForApplicationConfirm"></uv-picker>
      </view>
      <view class="t-list">
        <uv-list :border="false">
          <uv-list-item>
            <view class="t-list-content">
              <view class="t-list-label">退款金额</view>
              <view class="t-list-value">
                ¥{{ totalPrice }}
              </view>
            </view>
          </uv-list-item>
          <uv-list-item>
            <view class="t-list-content">
              <view class="t-list-label">退款积分</view>
              <view class="t-list-value">
                {{ totalIntegral }}
              </view>
            </view>
          </uv-list-item>
          <uv-list-item>
            <view class="t-list-content">
              <view class="t-list-label">退款说明</view>
              <view class="t-list-input">
                <uv-input placeholder="请输入退款说明" border="none" v-model="data.applicationInstructions"></uv-input>
              </view>
            </view>
          </uv-list-item>
        </uv-list>
      </view>
      <view class="card noBorder full">
        <view class="card-head">
          <view class="card-title">上传凭证</view>
        </view>
        <view class="card-content">
          <upload-file v-model="list" />
        </view>
      </view>
    </view>
    <view class="refund-form-buttons">
      <view class="refund-submit-btn" :class="{ disabled: isSubmitting }" @tap="handleApplyForAfterSales">
        提交
      </view>
    </view>
  </layout>
</template>

<script setup>

import { computed, ref, nextTick } from 'vue'
import { applyForAfterSales, applyForAfterSalesInfo } from '@/api/order'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";
import Goods from "@/components/goodsComponents/Goods.vue";


const { toast } = useInterface()
const { getParams, goBack, push } = useRouter()
const goodsList = ref([])
const goodsSelect = ref([])
const totalPrice = ref(0);
const totalIntegral = ref(0)
const orderInfoData = ref(null)
const reasonForApplicationPicker = ref(null)
const receivingStatusPicker = ref(null)

const refundType = ref(null)
const list = ref([])
const receivingStatusClumns = ref([[
  '未收到货',
  '已收到货'
]])
const reasonForApplication = ref([
  [
    "收货地址填错了",
    "与描述不符",
    "信息填错了，重新拍",
    "收到商品损坏了",
    "未按预定时间发货",
    "其它原因"
  ]
])

const data = ref({
  "orderId": "",
  // 服务类型 0仅退款1退货退款 serviceType;
  "serviceType": '',
  // 申请原因
  "reasonForApplication": "",
  // 申请说明
  "applicationInstructions": "",
  // 申请说明图片
  "applicationDescriptionPicture": "",
  "productParamList": [],
  receivingStatus: null
})


const title = computed(() => {
  return refundType.value === 0 ? `申请退款` : '申请退货退款';
});

// 打开退款原因窗口
const openReasonForApplicationPicker = async () => {
  await nextTick()
  reasonForApplicationPicker.value?.open()
}

// 退款原因窗口确认
const reasonForApplicationConfirm = (e) => {
  data.value.reasonForApplication = e.value[0]
  reasonForApplicationPicker.value?.close()
}

// 打开货物状态窗口
const openReceivingStatusPicker = async () => {
  await nextTick()
  receivingStatusPicker.value?.open()
}

// 货物状态窗口确认
const receivingStatusConfirm = (e) => {
  data.value.receivingStatus = e.value[0]
  receivingStatusPicker.value?.close()
}

const goodsCartNumList = ref([])


const setCartNum = (goods, index, type) => {
  if (type === 0) {
    // -
    if (goodsCartNumList.value[index] <= 1) {
      goodsCartNumList.value[index] = 1
    } else {
      --goodsCartNumList.value[index]
    }
  } else {
    console.log(goodsCartNumList.value[index], goods.cartInfo.cartNum, goodsCartNumList.value[index] >= goods.cartInfo.cartNum)
    if (goodsCartNumList.value[index] >= goods.cartInfo.cartNum) {
      goodsCartNumList.value[index] = goods.cartInfo.cartNum
    } else {
      ++goodsCartNumList.value[index]
    }
  }
  handleOrderInfo()
}

const changeCartNumInput = (e, goods, index) => {
  const value = Number(e.detail.value)
  if (value <= 0) {
    goodsCartNumList.value[index] = 0
  } else if (value >= goodsCartNumList.value[index]) {
    goodsCartNumList.value[index] = goods.cartInfo.cartNum
  } else {
    goodsCartNumList.value[index] = value
  }
  handleOrderInfo()
}


const handleOrderInfo = async () => {
  const productDetails = goodsList.value.map((goods, index) => {
    return {
      goods: goods.cartInfo.productAttrUnique,
      number: goodsCartNumList.value[index]
    }
  })

  const option = {
    key: key.value,
    productDetails
  }
  const res = await applyForAfterSalesInfo(option)
  orderInfoData.value = res
  goodsList.value = res.filter(item => goodsSelect.value.includes(item.cartInfo.productAttrUnique))
  if (goodsCartNumList.value.length < goodsList.value.length) {
    goodsCartNumList.value = goodsList.value.map(goods => goods.cartInfo.cartNum)
  }

  let price = 0
  let integral = 0
  let productParamList = []
  goodsList.value.forEach((item, index) => {
    // Use precise payPrice from cartInfo to avoid rounding errors
    const itemPrice = item.cartInfo.payPrice || item.refundablePrice
    price += itemPrice * goodsCartNumList.value[index]
    integral += item.refundableIntegral * goodsCartNumList.value[index]
    productParamList.push({
      productId: item.productId,
      productAttrUnique: item.cartInfo.productAttrUnique
    })
  })

  totalPrice.value = price.toFixed(2)
  totalIntegral.value = integral.toFixed(2)
  data.value.orderId = res[0].orderId
  data.value.serviceType = refundType.value
  data.value.productParamList = productParamList
}


const isSubmitting = ref(false)

const handleApplyForAfterSales = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true

  if (!data.value.receivingStatus && refundType.value === 1) {
    uni.showToast({
      icon: "none",
      title: '请选择货物状态',
      duration: 2000
    });
    isSubmitting.value = false
    return
  }
  if (!data.value.reasonForApplication) {
    uni.showToast({
      icon: "none",
      title: '请选择退款原因',
      duration: 2000
    });
    isSubmitting.value = false
    return
  }
  // if (!data.value.applicationInstructions) {
  //   uni.showToast({
  //     icon: "none",
  //     title: '请选择退款说明',
  //     duration: 2000
  //   });
  //   return
  // }
  uni.showLoading({
    title: '提交中...',
    mask: true
  })

  try {
    const payload = {
      ...data.value,
      receivingStatus: refundType.value === 1 ? (data.value.receivingStatus === '未收到货' ? 0 : 1) : data.value.receivingStatus,
      // 设置退货数量
      productParamList: data.value.productParamList.map((item, index) => ({
        ...item,
        number: goodsCartNumList.value[index]
      })),
      applicationDescriptionPicture: list.value.map(v => {
        return v.url
      }).join(',')
    }

    const res = await applyForAfterSales(payload)
    uni.hideLoading()
    toast({
      title: '申请成功，请等待审核'
    })
    push({ url: '/pages/refundInfo/refundInfo' }, {
      type: 'redirectTo',
      data: {
        id: res,
      },
    })
  } catch (e) {
    uni.hideLoading()
    isSubmitting.value = false
    console.error(e)
  }
}

const key = ref('')
onLoad((options) => {
  const params = getParams(options)
  key.value = params.id
  handleOrderInfo()
  goodsSelect.value = params.goods
  refundType.value = params.refundType
})


</script>

<style lang="scss">
.shopping-action {
  padding-left: 34rpx;
  flex: 1;
  display: flex;
  justify-content: space-between;

  &-checkbox {
    flex: 1
  }

  &-total {
    line-height: 48rpx;
    font-size: 34rpx;
    color: #333333;
    margin-right: 10rpx;
  }

  &-btn {
    width: 224rpx;
  }
}

.p-20 {
  padding: 20rpx;
  box-sizing: border-box;
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

.refund-form-buttons {
  width: 100%;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  padding: 20rpx 34rpx calc(20rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  z-index: 100;

  @supports (margin-bottom: constant(safe-area-inset-bottom)) {
    padding-bottom: calc(20rpx + constant(safe-area-inset-bottom));
  }
}

.refund-submit-btn {
  width: 100%;
  height: 80rpx;
  background-color: #00CBCC;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
}

.refund-submit-btn.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.t-list-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border: none;

  .t-list-input {
    input {
      text-align: right !important;
    }
  }
}

.th-wrap {
  margin: 20rpx;
}

.t-list,
.noBorder {
  margin: 20rpx;
}
</style>
