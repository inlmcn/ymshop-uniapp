<template>
  <layout>
    <uv-navbar
        :fixed="false"
        title="选择商品"
        left-arrow
        @leftClick="goBack"
    />
    <uv-checkbox-group
        v-if="goodsList"
        v-model="goodsSelect"
        shape="circle"
        activeColor="#00CBCC"
        @change="handleGoodsSelect"
    >
      <space
          direction="vertical"
          fill
      >
        <card class="shopping-checkbox">
          <view
              v-for="(item, index) in goodsList"
              :key="item.id"
              class="goods-row"
          >
            <view class="checkbox-wrapper">
              <uv-checkbox
                  :name="item.cartInfo.productAttrUnique"
                  iconSize="20"
              />
            </view>
            <view class="goods-col">
              <Goods
                  row
                  imgWidth="200rpx"
                  info-padding="10rpx 40rpx"
                  :goods="item.cartInfo.productInfo"
              >
                <template #options>
                  <view class="goods-options">
                    <!-- sku select -->
                    <view class="sku-row flex">
                      <view
                          class="sku-info flex flex-jc__sb flex-ai__center"
                      >
                        <view class="info">
                          {{
                            item.cartInfo.productInfo && item.cartInfo.productInfo.attrInfo && item.cartInfo.productInfo.attrInfo.sku
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
                      <view class="cart-num">
                        x {{ item.cartInfo.cartNum }}
                      </view>
                    </view>
                  </view>
                </template>
              </Goods>
            </view>
          </view>
          <!-- 选中了的结算统计信息 -->
          <view :class="{'select-product-settle-info':true,show:goodsSelect.length>0}">
            <view
                class="row flex flex-ai__center flex-jc__sb"
                v-for="(item,index) in settleFields"
                :key="index"
            >
              <view class="label">
                {{ item.label }}
              </view>
              <view v-if="statisticsInfo">
                {{ item.prefix }} {{ statisticsInfo[item.field].toFixed(2) }}
              </view>
            </view>
          </view>
        </card>
      </space>
    </uv-checkbox-group>
    <view class="action-bar column">
      <view class="action-info">
        <view class="action-checkbox">
          <uv-checkbox-group
              shape="circle"
              activeColor="#00CBCC"
          >
            <view class="checkbox-wrapper">
              <uv-checkbox
                  name="all"
                  :checked="goodsSelectAll"
                  @change="handleGoodsSelectAll"
                  iconSize="20"
              >
                全选
              </uv-checkbox>
            </view>
          </uv-checkbox-group>
        </view>
        <view class="action-total">
          {{ goodsSelect.length }} 件商品
        </view>
        <view class="action-total">
          总计：￥{{ statisticsInfo.totalPrice.toFixed(2) }} 积分：{{ statisticsInfo.integral.toFixed(2) }}
        </view>
      </view>
      <view class="action-btns select-refund-action-btns">
        <view
            class="select-refund-action-btn select-refund-action-btn--outline"
            @click="toRefund(0)"
        >
          仅退款
        </view>
        <view
            v-if="status !== 0 && status !== 5"
            class="select-refund-action-btn select-refund-action-btn--solid"
            @click="toRefund(1)"
        >
          退货退款
        </view>
      </view>
    </view>
  </layout>
</template>

<script setup>

import { ref, watch } from 'vue'
import { applyForAfterSalesInfo } from '@/api/order'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from "@/hooks/useRouter";
import Goods from "@/components/goodsComponents/Goods.vue";
import { settleFields } from "@/pages/selectRefundGood/index.data";
import { useInterface } from "@/hooks/useInterface";

const {toast} = useInterface();
const {getParams, push, goBack} = useRouter()
const goodsSelect = ref([])
const goodsSelectAll = ref(false)
const orderId = ref(null)
const id = ref(null)
const refundType = ref(null)
const status = ref(0)
const allDisabled = ref(true)
const statisticsInfo = ref({
  truePrice: 0,
  couponPrice: 0,
  postagePrice: 0,
  totalPrice: 0,
  integral: 0
})

const handleGoodsSelectAll = (e) => {
  goodsSelectAll.value = e
  if (!goodsSelectAll.value) {
    goodsSelect.value = []
    return
  }
  goodsSelect.value = goodsList.value.map(item => item.cartInfo.productAttrUnique)
}

const handleGoodsSelect = (value) => {
  goodsSelectAll.value = value.length === goodsList.value.length
}

watch(goodsSelect, (goodsSelect) => {
  statisticsInfo.value = {
    truePrice: 0,
    couponPrice: 0,
    postagePrice: 0,
    totalPrice: 0,
    integral: 0
  }
  let postagePrice = 0
  
  goodsList.value.filter(item => goodsSelect.includes(item.cartInfo.productAttrUnique)).forEach((item, index) => {
    console.log(`商品${index + 1}原始数据:`, {
      truePrice: item.cartInfo.truePrice,
      cartNum: item.cartInfo.cartNum,
      totalCouponPrice: item.totalCouponPrice,
      refundablePrice: item.refundablePrice,
      postagePrice: item.cartInfo.postagePrice,
      '计算验证': {
        '支付总价': item.cartInfo.truePrice * item.cartInfo.cartNum,
        '退款价格': item.refundablePrice * item.cartInfo.cartNum,
        '优惠券': item.totalCouponPrice * item.cartInfo.cartNum,
        '支付总价-退款价格': (item.cartInfo.truePrice * item.cartInfo.cartNum) - (item.refundablePrice * item.cartInfo.cartNum)
      }
    })
    
    // 每一步计算都进行精度处理
    const itemTruePrice = Math.round((item.cartInfo.truePrice * item.cartInfo.cartNum) * 100) / 100
    const itemIntegral = Math.round((item.refundableIntegral * item.cartInfo.cartNum) * 100) / 100
    
    // 优惠券金额：使用支付总价 - 退款价格来计算，确保精度
    const rawRefundPrice = item.refundablePrice * item.cartInfo.cartNum
    const calculatedCoupon = Math.round((itemTruePrice - rawRefundPrice) * 100) / 100
    
    // 如果计算出的优惠券接近整数（误差小于0.02），则四舍五入到整数
    let itemCouponPrice = calculatedCoupon
    const roundedCoupon = Math.round(calculatedCoupon)
    if (Math.abs(calculatedCoupon - roundedCoupon) <= 0.01) {
      itemCouponPrice = roundedCoupon
    }
    
    // 退款价格 = 支付总价 - 优惠券（使用修正后的优惠券重新计算）
    const itemRefundPrice = Math.round((itemTruePrice - itemCouponPrice) * 100) / 100
    const itemPostagePrice = Math.round(item.cartInfo.postagePrice * 100) / 100
    
    console.log(`商品${index + 1}计算结果:`, {
      itemTruePrice,
      itemIntegral,
      '原始优惠券': Math.round((item.totalCouponPrice * item.cartInfo.cartNum) * 100) / 100,
      '计算优惠券': itemCouponPrice,
      itemRefundPrice,
      itemPostagePrice
    })
    
    statisticsInfo.value.truePrice = Math.round((statisticsInfo.value.truePrice + itemTruePrice) * 100) / 100
    statisticsInfo.value.integral = Math.round((statisticsInfo.value.integral + itemIntegral) * 100) / 100
    statisticsInfo.value.couponPrice = Math.round((statisticsInfo.value.couponPrice + itemCouponPrice) * 100) / 100
    statisticsInfo.value.totalPrice = Math.round((statisticsInfo.value.totalPrice + itemRefundPrice) * 100) / 100
    postagePrice = Math.round((postagePrice + itemPostagePrice) * 100) / 100
  })
  
  console.log('计算完成后的统计信息:', statisticsInfo.value)
  
  // 未发货退邮费
  if (status.value === 0) {
    statisticsInfo.value.postagePrice = Math.round(postagePrice * 100) / 100
    statisticsInfo.value.totalPrice = Math.round((statisticsInfo.value.totalPrice + statisticsInfo.value.postagePrice) * 100) / 100
  }
})

const goodsList = ref([])

const handleOrderInfo = async () => {
  try {
    const res = await applyForAfterSalesInfo({
      key: id.value
    })
     console.log(res,'=>>>>>>>>>>>>>>>>>>')
    goodsList.value = res
    orderId.value = res[0].orderId
    status.value = res[0].status
  } catch (e) {
    if (e.msg === "订单明细不存在！") {
      toast({title: '该笔订单已无商品可以售后'})
      goBack({}, 2000)
    }
  }
}

const toRefund = async (type) => {
  if (goodsSelect.value.length <= 0) {
    toast({title: '请勾选商品'})
    return
  }
  refundType.value = type
  push({url: '/pages/refund/refund'}, {
    data: {
      refundType: refundType.value,
      goods: goodsSelect.value.toString(),
      orderId: orderId.value,
      id: id.value
    },
    type: 'redirectTo'
  })
}


onLoad((options) => {
  const params = getParams(options)
  id.value = params.id
  handleOrderInfo()
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

.select-refund-action-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 20rpx;
  padding: 0 34rpx;
  box-sizing: border-box;
}

.select-refund-action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 40rpx;
}

.select-refund-action-btn--outline {
  border: 2rpx solid #00CBCC;
  background: #fff;
  color: #00CBCC;
}

.select-refund-action-btn--solid {
  background: #00CBCC;
  color: #fff;
}

.checkbox-wrapper {
  padding: 20rpx;
  margin: -20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goods-row {
  @include useFlex(space-between, center);
  @include usePadding(20, 10);
  width: 100%;

  .goods-col {
    width: 90%;
  }
}

// 商品SKU 数量等操作条
.goods-options {
  width: 100%;

  .sku-row {
    margin-bottom: 30rpx;

    .sku-info {
      @include usePadding(10, 4);
      border: 1rpx solid #ccc;
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
        border: 2rpx solid #cccccc;
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
</style>
