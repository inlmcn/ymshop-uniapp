<template>
  <layout>
    <uv-navbar
        :fixed="false"
        title="提交订单"
        left-arrow
        @leftClick="goBack"
    />
    <view v-if="orderDetailData">
      <card>
        <view class="y-subsection">
          <uv-subsection
              :list="shippingTypeList"
              :current="shippingType"
              mode="subsection"
              activeColor="#333333"
              @change="change"
          ></uv-subsection>
        </view>
        <view
            class="address"
            v-if="main.selectAddress"
            @tap="toAddress"
        >
          <view class="address-icon">
            <uv-icon
                name="map"
                size="22"
            />
          </view>
          <view class="address-main">
            <view class="address-header">
              <view class="address-name">{{ main.selectAddress.realName }}</view>
              <view class="address-phone">{{ main.selectAddress.phone }}</view>
            </view>
            <view class="address-content">
              <view class="address-desc">{{ main.selectAddress.detail }}</view>
            </view>
          </view>
          <view class="address-actions">
            <view class="address-actions-edit">
              <img
                  class="image"
                  src="https://hnapi.booseng.com/static/images/next.png"
                  alt=""
              >
            </view>
          </view>
        </view>
        <view
            class="address"
            v-if="!main.selectAddress"
            @tap="toAddress"
        >
          <view class="address-icon">
            <uv-icon
                name="map"
                size="22"
            />
          </view>
          <view class="address-main">
            <view class="address-header">
              <view class="address-name">暂无位置</view>
              <view class="address-phone">***</view>
            </view>
            <view class="address-content">
              <view class="address-desc">***</view>
            </view>
          </view>
          <view class="address-actions">
            <view class="address-actions-edit">
              <img
                  class="image"
                  src="https://hnapi.booseng.com/static/images/next.png"
                  alt=""
              >
            </view>
          </view>
        </view>
        <!-- <view
          class="delivery-card"
          v-if="shippingType == 1"
        >
          <view class="address">
            <view class="address-icon">
              <uv-icon
                name="shop-o"
                size="22"
              />
            </view>
            <view class="address-main">
              <view class="address-header">
                <view class="address-name">会飞的鱼</view>
                <view class="address-phone">176****0283</view>
              </view>
              <view class="address-content">
                <view class="address-desc">广东省深圳市南山区高新地铁C口</view>
              </view>
            </view>
            <view class="address-actions">
              <view class="address-actions-edit">
                <img
                class="image"
                  src="https://hnapi.booseng.com/static/images/next.png"
                  alt=""
                >
              </view>
            </view>
          </view>
        </view> -->
      </card>
      <blank size="15"></blank>
      <view class="card full">
        <view class="card-head">
          <view class="card-title">
            商品清单 <span class="card-title-sub">共{{ orderDetailData.cartInfo.length }}件</span>
          </view>
        </view>
        <view class="goods">
          <goods
              list
              interval
              desc="3"
              showAction
              model
              :purchase="item.cartNum"
              :data="item.productInfo"
              v-for="(item, index) in orderDetailData.cartInfo"
          />
        </view>
      </view>
      <blank size="15"></blank>
      <!-- <van-cell-group>
        <van-cell
          title="优惠"
          value="-￥20"
          is-link
        />
        <van-cell
          title="运费"
          value="免运费"
        />
      </van-cell-group>
      <blank size="15"></blank> -->
      <!-- <card>
        <van-radio-group v-model="checked">
          <view class="pay-type">
            <view class="pay-type-item">
              <van-radio name="1">
                <view class="simple-cell">
                  <view class="icon simple-cell-icon">
                    <img
                      src="https://hnapi.booseng.com/static/images/swiper.png"
                      alt=""
                    >
                  </view>
                  <view class="simple-cell-content">
                    <view class="simple-cell-title">
                      微信支付
                    </view>
                    <view class="simple-cell-label">
                      Wechat pay
                    </view>
                  </view>
                </view>
              </van-radio>
            </view>
            <view class="line"></view>
            <view class="pay-type-item">
              <van-radio name="2">
                <view class="simple-cell">
                  <view class="icon simple-cell-icon">
                    <img
                      src="https://hnapi.booseng.com/static/images/swiper.png"
                      alt=""
                    >
                  </view>
                  <view class="simple-cell-content">
                    <view class="simple-cell-title">
                      支付宝
                    </view>
                    <view class="simple-cell-label">
                      Alipay pay
                    </view>
                  </view>
                </view>
              </van-radio>
            </view>
          </view>
        </van-radio-group>
      </card> -->
      <!-- <blank size="15"></blank> -->
      <card>
        <view class="submitOrder-info infos">
          <view class=" info-cell">
            <view class=" info-cell-label">
              商品总价
            </view>
            <view class=" info-cell-value">
              ¥{{ orderDetailData.priceGroup.totalPrice }}
            </view>
          </view>
          <view class=" info-cell">
            <view class=" info-cell-label">
              优惠
            </view>
            <view class=" info-cell-value">
              ¥{{ orderDetailData.priceGroup.storeFreePostage }}
            </view>
          </view>
          <view class=" info-cell">
            <view class=" info-cell-label">
              运费
            </view>
            <view class=" info-cell-value">
              ¥{{ orderDetailData.priceGroup.storePostage }}
            </view>
          </view>
          <view class=" info-cell">
            <view class=" info-cell-label">
              总计
            </view>
            <view class=" info-cell-value">
              ¥{{ orderDetailData.priceGroup.totalPrice }}
            </view>
          </view>
        </view>
      </card>

      <view class="blank"></view>

      <view class="action-bar ">
        <view class="action-info">
          <view class="action-total">
            总计：￥{{ orderDetailData.priceGroup.totalPrice }}
          </view>
        </view>

        <view class="action-btns">
          <uv-button
              type="primary"
              text="结算"
              @click="onSubmitOrder"
          ></uv-button>
        </view>
      </view>
    </view>
  </layout>
</template>

<script setup>
import { ref } from 'vue'
import { orderConfirm, orderCreate } from '@/api/order'
import { onLoad } from '@dcloudio/uni-app'
import { useMainStore } from '@/store/modules/useMainStore';
import { useRouter } from "@/hooks/useRouter";
import { getAddressList } from "@/api/address";

const {getParams, push, goBack} = useRouter()

const main = useMainStore()

const orderDetailData = ref(null)
const shippingType = ref(0)
const shippingTypeList = ref(['配送到家', '门店自取'],)
const cartId = ref(null)
const selectAddress = ref({})
const handleOrderConfirm = async (cartId, addressId) => {
  const orderDetail = await orderConfirm({cartId, addressId})
  if (orderDetail) {
    orderDetailData.value = orderDetail
  }
}

const change = (value) => {
  shippingType.value = value
}

const onClickLeft = () => {
  goBack()
}

const toAddress = () => {
  push({url: '/pages/address/address'}, {data: {type: 'select', cartId: cartId.value}})
}

const onSubmitOrder = async () => {
  if (!main.selectAddress?.id) {
    uni.showToast({
      icon: 'none',
      title: '请选择收货地址',
      duration: 2000
    });
    return
  }

  uni.showLoading({
    title: '提交中',
    mask: true,
  })

  // 提交订单
  let res = await orderCreate({
    key: orderDetailData.value.orderKey,
    addressId: main.selectAddress.id,
    bargainId: 0,
    combinationId: 0,
    couponId: 0,
    from: '',
    mark: '',
    pinkId: 0,
    seckillId: 0,
    shippingType: shippingType.value,
    useIntegral: 0,
    isChannel: 1,
  })

  uni.showToast({
    title: "订单创建成功",
    icon: "none",
    duration: 2000
  });
  uni.hideLoading()
  const {key, orderId} = res.result
  push({url: '/pages/selectPlay/selectPlay'}, {data: {key, orderId}})
}

const getAddressListFn = async (page) => {
  if (!main.selectAddress?.id) {
    let res = await getAddressList({page: page})
    main.selectAddress = res[0]
  }
  handleOrderConfirm(cartId.value, main.selectAddress?.id)
}


onLoad(options => {
  const params = getParams(options)
  cartId.value = params.cartId
  main.cartId = params.cartId
  getAddressListFn(1)
})

</script>

<style lang="scss">
.shopping-checkbox {
  padding-left: 34rpx;
}

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
  }

  &-btn {
    width: 224rpx;
  }
}

.delivery-card {
  margin: 0 var(--van-padding-md);
  background: #FFFFFF;
  border: 1rpx solid var(--van-border-color);
  border-top: 0;
  opacity: 1;
}

.pay-type {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx 0;

  &-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .line {
    width: 1rpx;
    height: 50rpx;
    background: #E6E6E6;
  }
}


.submit-order-action {
  padding-left: 34rpx;
  flex: 1;
  display: flex;
  justify-content: space-between;


  &-total {
    line-height: 48rpx;
    font-size: 28rpx;
    color: #333333;


  }

  &-btn {
    width: 224rpx;
  }
}


.address {
  padding: 30rpx 35rpx;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;

  &-main {
    flex: 1
  }

  &-actions {
    &-edit {
      width: 33rpx;
      height: 33rpx;

      .image {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

  }


  &.noBorder {
    &::after {
      display: none;
    }
  }

  &::after {
    content: '';
    position: absolute;
    left: 35rpx;
    top: 0;
    right: 0;
    height: 1rpx;
    background: #E6E6E6;

  }

  &-icon {
    margin-right: 20rpx;
  }

  background: #fff;

  &-header {
    display: flex;
    align-items: center;
  }

  &-name {
    line-height: 40rpx;
    font-size: 28rpx;
    color: #333333;
    margin-right: 30rpx;

  }

  &-phone {
    line-height: 40rpx;
    font-size: 28rpx;
    color: #333333;
  }

  &-content {
    display: flex;
    align-items: center;
  }

  &-default {
    margin-right: 82rpx;
  }

  &-desc {
    line-height: 33rpx;
    font-size: 24rpx;
    color: #999999;
  }
}

.goods {
  padding-left: 15rpx;
}
</style>
