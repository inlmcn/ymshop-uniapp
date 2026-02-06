<script setup>
import { useRouter } from "@/hooks/useRouter";
import { onLoad, onPageScroll, onShow } from "@dcloudio/uni-app";
import { nextTick, onBeforeUnmount, ref, unref } from "vue";
import { useMainStore } from '@/store/modules/useMainStore';
import { storeToRefs } from "pinia";
import { orderConfirm, orderCreate,getTemplate } from "@/api/order";
import { useInterface } from "@/hooks/useInterface";
import { addressTabs, discountsPriceRows, priceRows } from "@/pages/submitOrder/index.data";
import Goods from "@/components/goodsComponents/Goods.vue"
import UvRadioGroup from "@/uni_modules/uv-radio/components/uv-radio-group/uv-radio-group.vue";
import UvRadio from "@/uni_modules/uv-radio/components/uv-radio/uv-radio.vue";
import { doPayment } from "@/utils/paymentUtils";
import CouponSelect from "@/pages/submitOrder/components/coupon-select.vue";
import Header from "@/components/Header/index.vue"
import { useScroll } from "@/hooks/useScroll";
import { nextIcon, shopIcon } from "@/utils/images";
import { emitter } from "@/utils/emitter";
import { h5InWeChat } from "@/utils";
import { PAY_INSTANCE_TYPE, payRows } from "@/utils/payModule";
import { IS_DEMO } from "@/config";
// ==================================== hooks =====================================
const {scrollTop} = useScroll()
onPageScroll(() => {
})
const {getParams, push, goBack} = useRouter()
const {toast, loading, hideLoading} = useInterface();
const mainStore = useMainStore();
const {integralName} = storeToRefs(mainStore);
const campaignType = ref(0)
const zeroPrice = ref(false) // 本单支付金额是否为0


/**
 * 重新计算价格
 * @return {Promise<void>}
 */
async function calculateOrder() {
  orderDetail.value = await orderConfirm({
    cartId: unref(routerParams)?.cartId,
    orderType: unref(routerParams)?.orderType,
    addressId: unref(selectAddress)?.id || undefined,
    shippingType: addressTabSelect.value, // 默认快递 1快递 2门店
    storeId: shopSelect.value?.id,
    useIntegral: useIntegral.value.length > 0,
    couponId: currentCouponId.value
  })
  // 余额为0 自动走余额支付
  if (orderDetail.value.priceGroup.totalPrice <= 0) {
    payType.value = PAY_INSTANCE_TYPE.LOCAL
    zeroPrice.value = true
    toast?.({title: '支付金额为0.00，自动选择余额支付', icon: 'none', duration: 3000})
  } else {
    zeroPrice.value = false
  }
}




// ==================================== 优惠券相关 ===========================================
const selectCouponRef = ref(false)
const currentCouponId = ref(undefined)
const selectCouponFn = async (coupon) => {
  currentCouponId.value = coupon.couponId
  await calculateOrder()
  selectCouponRef.value?.close()
}


const showCouponSelect = (index) => {
  if (index === 0) {
    selectCouponRef.value?.open()
  }
}

// =================================== 配送方式相关 ================================================
const addressTabSelect = ref(1) // 提货方式

/**
 * 选择提货方式
 * @param tab
 */
function changeAddressTab(tab) {
  addressTabSelect.value = tab.value
  shopSelect.value = undefined
  doGetInitConfirmOrder()
}

/**
 * 去选择地址
 */
function gotoSelectAddress() {
  push?.({url: '/pages/address/address'}, {
    data: {
      type: 'select', cartId: unref(routerParams)?.cartId
    }
  })
}

/**
 * 获取默认选择的地址
 */
async function doGetSelectAddress() {
  // 没有选中的地址且订单计算中有地址信息
  if (!selectAddress.value && orderDetail.value?.addressInfo) {
    selectAddress.value = orderDetail.value?.addressInfo
  }
  // 订单计算中没有地址信息
  if (!orderDetail.value?.addressInfo) {
    selectAddress.value = undefined
  }
  await doGetInitConfirmOrder()
}

const shopSelect = ref(null)  // 当前选择的店铺
const selectAddress = ref(null) // 当前选择的地址

// 注册事件监听
emitter.on('selectShop', (res) => {
  // 处理门店选择逻辑
  shopSelect.value = res
  doGetInitConfirmOrder()
})
emitter.on('selectAddress', async (item) => {
  // item
  selectAddress.value = item
  // 处理门店选择逻辑
  await doGetSelectAddress()
  await doGetInitConfirmOrder()
})

/**
 * 选择店铺
 */
function selectShop() {
  push?.({url: '/pages/submitOrder/shopSelect'}, {data: {shopSelect: shopSelect.value}})
}

// =============================== 订单信息相关 ======================================================
const flag = ref(false)

const payType = ref(PAY_INSTANCE_TYPE.WECHAT) // 支付方式
if(IS_DEMO){
	payType.value = PAY_INSTANCE_TYPE.LOCAL //演示阶段直接默认选择余额支付方式
}

const useIntegral = ref([1]) // 是否使用积分 length>0使用积分

// 订单信息
const orderDetail = ref({
  cartInfo: [],
  priceGroup: {
    costPrice: 0,
    payIntegral: 0,
    storeFreePostage: 0,
    storePostage: 0,
    totalPrice: 0,
    vipPrice: 0
  }
})

/**
 * 获取初始订单信息
 * 调用此方法可以重新生成订单信息（包括价格信息）
 */
async function doGetInitConfirmOrder() {
  await calculateOrder()
  cartIds.value = unref(routerParams)?.cartId
  currentCouponId.value = orderDetail.value.priceGroup?.couponId
  flag.value = true
}

/**
 * 改变是否使用积分
 */
function handleUseIntegralChange() {
  nextTick(() => {
    doGetInitConfirmOrder()
  })
}

const subLoading = ref(false) // 加载中

/**
 * 提交订单
 * @return {Promise<void>}
 */
async function handleConfirm() {
	// #ifdef MP-WEIXIN
	
	await checkSubscribePermission();
	// wx.requestSubscribeMessage({
	//   tmplIds: templates,
	//   success (res) { }
	// })
   // #endif
  if (addressTabSelect.value === 1 && (!unref(selectAddress) || !unref(selectAddress).id)) {
    toast?.({title: '请先选择地址'})
    return
  }
  if (addressTabSelect.value === 2 && !shopSelect.value) {
    toast?.({title: '请先选择门店'})
    return
  }
  subLoading.value = true
  try {
    const payInfo = await doCreateServiceOrder()
    // 去拉取支付
    await doPayment({type: payType.value, payInfo, isGroup: routerParams.value.campaignType === 1})
    if(payType.value !== PAY_INSTANCE_TYPE.FRIENDS){
      // #ifndef H5
      push?.({url: '/pages/payStatus/index'}, {type: 'redirectTo'})
      // #endif
      // 处理微信内h5
      // #ifdef H5
      if (h5InWeChat()) {
        push?.({url: '/pages/payStatus/index'}, {type: 'redirectTo'})
      }
      // #endif
    }

  } catch (e) {
    console.error(e)
    if(payType.value !== PAY_INSTANCE_TYPE.FRIENDS){
      toast?.({title: '支付失败'})
      push?.({url: '/pages/payStatus/index'}, {type: 'redirectTo'})
    }
  } finally {
    subLoading.value = false
    mainStore.cartId = null
  }
}



/**
 * 检查订阅消息权限
 * @param {Function} callback 回调函数
 */
const checkSubscribePermission = (callback) => {
  uni.getSetting({
    withSubscriptions: true, 
    success: (res) => {
      const subscriptionSetting = res.subscriptionsSetting || {};
      console.log("检查订阅消息权限", subscriptionSetting)

      if (subscriptionSetting.mainSwitch === true) {
        requestSubscribeMessageCall(callback);
      } else {
        // 用户未开启订阅消息总开关，提示用户开启
        uni.showModal({
          title: '提示',
          content: '您未开启订阅消息权限，是否前往设置开启？',
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.openSetting({
                success: (settingRes) => {
                  console.log('未开启订阅设置页面打开成功', settingRes);
                },
                fail: (err) => {
                  console.error('未开启订阅打开设置页面失败', err);
                }
              });
            } 
          }
        });
      }
    },
    fail: (err) => {
      console.error('检查订阅消息权限失败', err);
    }
  });
};

/**
 * 请求订阅消息
 * @param {Function} callback 回调函数
 */
const requestSubscribeMessageCall = async(callback) => {
  let templates = await getTemplate()
  uni.requestSubscribeMessage({
    tmplIds: templates, // 需要订阅的模板ID
    success: (subscriptionRes) => {
      console.log("请求订阅消息", subscriptionRes)
	  templates.forEach(templateId => {
		  if(subscriptionRes[templateId]){
			  if (subscriptionRes[templateId] === 'accept') {
			    // 用户同意订阅
			    callback && callback();
			  } else {
			    // 用户拒绝订阅
			    console.log('用户拒绝了订阅');
			    // 提示用户前往设置页面重新授权
				showSettingTip()
			  }
		  }
	  })
     
    },
    fail: (err) => {
      console.error('订阅失败:', err);
    }
  });
}

/**
 * 提示用户前往设置页面重新授权
 * @param {Function} callback 回调函数
 */
const showSettingTip = (callback) => {
  uni.showModal({
    title: '提示',
    content: '您拒绝了订阅消息，是否前往设置页面重新授权？',
    success: (res) => {
      console.log("提示用户前往设置页面重新授权", res);
      if (res.confirm) {
        // 用户点击确认，打开设置页面
        uni.openSetting({
          success: (settingRes) => {
            console.log('设置页面打开成功', settingRes);
          },
          fail: (err) => {
            console.error('打开设置页面失败', err);
          }
        });
      }
    }
  });
};

/**
 * 服务端创建订单
 */
async function doCreateServiceOrder() {
  try {
    loading?.({title: '订单创建中...'})
    const data = {
      key: unref(orderDetail)?.orderKey,
      addressId: unref(selectAddress)?.id,
      storeId: unref(shopSelect)?.id,
      bargainId: 0,
      combinationId: 0,
      couponId: currentCouponId.value,
      from: '',
      mark: '',
      pinkId: 0,
      seckillId: 0,
      shippingType: addressTabSelect.value,
      isChannel: 1,
      distributorId: unref(routerParams)?.distributorId, // 分销商ID
      useIntegral: useIntegral.value.length > 0,
      orderType: unref(routerParams)?.orderType,
    }
    setActivityData(data)
    const res = await orderCreate(data);
    return res.result
  } finally {
    hideLoading?.()
  }
}

/**
 * 设置活动参数
 * @param data
 */
function setActivityData(data) {
  // 处理活动数据 路由参数 orderType 1普通下单 2活动下单
  if (routerParams.value?.orderType !== 2) return
  // 活动商品
  data.campaignType = routerParams.value?.campaignType // 1拼团 2秒杀 3砍价

  data.campaignDetailId = routerParams.value?.campaignDetailId // 活动营销ID
  // 拼团 路由参数 campaignType 1拼团活动
  if (routerParams.value?.campaignType !== 1) return;
  data.teamworkType = routerParams.value?.teamworkType // 1发起拼团 2加入
  data.teamworkType === 2 ? data.teamworkId = routerParams.value?.teamworkId : void (0) // 加入拼团的id
}


// =============================== 生命周期 ========================================
const routerParams = ref({})
const cartIds = ref('')


/**
 * 检查路由参数
 */
function checkRouterParam(params) {
  if (!params.cartId) {
    toast?.({title: '路由参数错误'})
    return
  }
  routerParams.value = params
}


onLoad(async options => {
  try {
    const params = getParams?.(options)
    await checkRouterParam(params)
    campaignType.value = routerParams.value?.campaignType
  } catch (e) {
    console.error(e)
  }
})
onBeforeUnmount(() => {
  emitter.clear('selectShop')
  emitter.clear('selectAddress')
})

onShow(async () => {
  await doGetInitConfirmOrder()
  await doGetSelectAddress()
})
</script>

<template>
  <view class="order-confirm">
    <!-- header -->
    <Header :scroll-top="scrollTop">
      提交订单
    </Header>
    <!-- 地址 -->
    <view class="address-box">
      <view class="address-box__inner">
        <view class="tab-box">
          <!-- tab top -->
          <view class="title-row flex flex-ai__center flex-jc__sb">
            <view
                class="item flex flex-ai__center flex-jc__center"
                :class="{active:addressTabSelect === tab.value}"
                v-for="tab in addressTabs"
                :key="tab.value"
                @click.stop="changeAddressTab(tab)"
            >
              {{ tab.label }}
            </view>
          </view>
          <!-- address info -->
          <template v-if="addressTabSelect === 1">
            <view
                v-if="selectAddress"
                class="address-row flex flex-ai__center flex-jc__sb"
                @click="gotoSelectAddress"
            >
              <view
                  class="flex flex-ai__center"
                  v-if="selectAddress"
              >
                <uv-icon
                    name="map"
                    size="22"
                />
                <view class="info">
                  <view>
                    {{ selectAddress.realName }} {{ selectAddress.phone }}
                  </view>
                  <view class="address-info">
                    {{ selectAddress.province }} - {{ selectAddress.city }}- {{ selectAddress.district }} -
                    {{ selectAddress.detail }}
                  </view>
                </view>
              </view>
              <image
                  class="arrow-icon"
                  :src="nextIcon"
                  alt=""
              />
            </view>
            <view
                class="address-row flex flex-ai__center flex-jc__sb"
                v-else
                @click="gotoSelectAddress"
            >
              点击选择地址
              <image
                  class="arrow-icon"
                  :src="nextIcon"
                  alt=""
              />
            </view>
          </template>
          <!-- 门店INFO -->
          <template v-else>
            <view
                class="shop-select"
                @click="selectShop">
              <image :src="shopIcon" />
              <view class="right flex flex-jc__sb flex-ai__center">
                <view
                    v-if="shopSelect">
                  <view>{{ shopSelect.storeName }}</view>
                  <view style="font-size: 23rpx;font-weight: normal">{{ shopSelect.address }}</view>
                </view>
                <view
                    v-else>
                  点击选择门店
                </view>
                <uv-icon name="arrow-right" />
              </view>
            </view>
          </template>
        </view>
      </view>
    </view>

    <!-- 商品清单 -->
    <view
        class="main-box goods-box"
        v-show="orderDetail.cartInfo.length>0"
    >
      <view class="title-row flex flex-ai__end">
        商品清单
        <span class="small">
          共 {{ orderDetail.cartInfo.length }} 件
        </span>
      </view>
      <template v-for="sku in orderDetail.cartInfo">
        <view class="goods-row">
          <Goods
              info-padding="0 10rpx 20rpx 10rpx"
              :goods="sku.productInfo"
              row
              imgWidth="200rpx"
          >
            <template #options="{goods}">
              <view
                  class="goods-detail"
                  style="width: 100%">
                <view class="sku-row">
                  {{ goods.attrInfo.sku }}
                </view>
                <view
                    class="price-row flex flex-ai__center flex-jc__sb"
                    style="width:100%;">
                  <view class="price flex flex-ai__end">
                    ￥{{ sku.truePrice }}
                    <span class="old-price">
                      ￥{{ goods.otPrice }}
                    </span>
                  </view>
                  <view class="cart-num">
                    x{{ sku.cartNum }}
                  </view>
                </view>
              </view>
            </template>
          </Goods>
        </view>
      </template>

    </view>

    <!-- 优惠价格信息 -->
    <view class="main-box price-box">
      <template
          v-for="(row,index) in discountsPriceRows"
          :key="index"
      >
        <view
            class="row flex flex-ai__center flex-jc__sb"
            @click="showCouponSelect(index)"
        >
          <view class="label">{{ row.label }}</view>
          <view class="value"  v-if="row.field=== 'couponPrice' && !orderDetail.deduction">
            活动商品不支持优惠券
          </view>
		  <view class="value"  v-else>
		    {{ row.prefix }}
		    {{ orderDetail["priceGroup"][row.field]?.toFixed(2) || '0.00' }}
		    <image
		        v-if="row.field=== 'couponPrice'"
		        class="arrow-icon"
		        :src="nextIcon"
		        alt=""
		    />
		  </view>
        </view>
      </template>
    </view>
    <view class="coupon-select" >
      <coupon-select
          v-if="flag"
          ref="selectCouponRef"
          :id="cartIds"
          :currentCouponId="currentCouponId"
          @submitCoupon="selectCouponFn"
      />
    </view>

    <!-- 支付方式 -->
    <view class="main-box pay-box">
      <uv-radio-group
          v-model="payType"
          class="pay-box__inner flex flex-ai__center flex-jc__center flex-wrap"
          shape="circle"
          activeColor="#00CBCC"
      >
        <template
            v-for="payItem in payRows"
            :key="payItem.type"
        >
          <view class="pay-item">
            <uv-radio
                :name="payItem.type"
                :disabled="
                payItem.disabled || ([PAY_INSTANCE_TYPE.WECHAT,PAY_INSTANCE_TYPE.FRIENDS].includes(payItem.type)&&zeroPrice) || (mainStore.user.nowMoney===0 &&!zeroPrice&&payItem.type===PAY_INSTANCE_TYPE.LOCAL) || ([PAY_INSTANCE_TYPE.FRIENDS].includes(payItem.type) && campaignType === 4)"
            >
              <view class="flex flex-ai__center flex-jc__sb">
                <view
                    class="pay_icon"
                >
                  <image
                      :src="payItem.icon"
                      alt=""
                  />
                </view>
                <view class="text">
                  <view
                      class="flex flex-nowrap flex-ai__end"
                      style="white-space: nowrap">
                    {{ payItem.label }}
                    <span
                        v-if="payItem.type===PAY_INSTANCE_TYPE.LOCAL"
                        style="font-size: 16rpx;white-space: nowrap;">
                    （{{ mainStore.user.nowMoney }}元）
                    </span>
                  </view>
                  <view class="e-text">
                    {{ payItem.eLabel }}
                  </view>
                </view>
              </view>
            </uv-radio>
          </view>
        </template>
      </uv-radio-group>
    </view>

    <!-- 价格信息 -->
    <view class="main-box price-box">
      <template
          v-for="(row,index) in priceRows"
          :key="index"
      >
        <view class="row flex flex-ai__center flex-jc__sb">
          <view class="label">{{ row.label }}</view>
          <view class="value">
            {{ row.prefix }}
            {{ orderDetail["priceGroup"][row.field]?.toFixed(2) || '0.00' }}
          </view>
        </view>
      </template>
      <!--会员  -->
      <view
          class="row flex flex-ai__center flex-jc__sb"
          v-if="orderDetail.priceGroup.isVip">
        <view class="label">会员优惠</view>
        <view class="value">
          -￥{{ orderDetail.priceGroup.vipDeductionAmount.toFixed(2) }}
        </view>
      </view>

      <view
          class="row flex flex-ai__center flex-jc__sb"
          v-if="campaignType === 4">
        <view class="label">{{ integralName }}抵扣(当前{{ integralName }}:<text class="primary-color">{{ orderDetail.priceGroup.integral }}</text>)</view>
        <view class="value flex flex-ai__center">
          <template v-if="orderDetail.priceGroup.payIntegral>0">
            - {{ orderDetail.priceGroup.payIntegral }}
          </template>
        </view>
      </view>

      <view
          class="row flex flex-ai__center flex-jc__sb"
          v-if="orderDetail.priceGroup.enableIntegral">
        <view class="label">{{ integralName }}抵扣</view>
        <view class="value flex flex-ai__center">
          当前{{ integralName }}:
          <text class="primary-color">{{ orderDetail.priceGroup.integral }}</text>
          <uv-checkbox-group
              style="margin-left: 10rpx;margin-top: 3rpx;"
              shape="circle"
              activeColor="#00CBCC"
              v-model="useIntegral"
              @change="handleUseIntegralChange">
            <uv-checkbox
                label=" "
                :name="1" />
          </uv-checkbox-group>
          <template v-if="useIntegral.length>0">
            -￥{{ orderDetail.priceGroup.deductionPrice.toFixed(2) }}
          </template>
        </view>
      </view>
    </view>

    <!-- 底部操作条 -->
    <view class="bottom-empty-height"></view>
    <view class="bottom-option-box flex flex-jc__sb flex-ai__center">
      <view class="info">
        总计：￥{{ orderDetail.priceGroup.totalPrice?.toFixed(2) }}
      </view>
      <view
          class="animation-button sub-button"
          :class="{disabled:subLoading}"
          @click="handleConfirm"
      >
        提交订单
      </view>
    </view>
  </view>
</template>


<style
    scoped
    lang="scss"
>
$bottomHeight: 100rpx;
// global
.main-box {
  @include usePadding(35, 0);
  margin-top: 20rpx;
  width: 100%;
  background: $white-color;
}

.arrow-icon {
  width: 20rpx;
  height: 20rpx;
  flex-shrink: 0;
}

.bottom-empty-height {
  width: 100%;
  height: $bottomHeight;
  padding-bottom: 30rpx;
}

// box
.order-confirm {
  position: relative;

  .address-box {
    @include usePadding(35, 30);
    width: 100%;
    background: $white-color;

    &__inner {
      width: 100%;
      border: 1px solid #E6E6E6;
      box-sizing: border-box;

      .tab-box {
        width: 100%;

        // tab top
        .title-row {
          .item {
            @include usePadding(0, 15);
            flex: 1 0 auto;
            background: #e6e6e6;
            transition: all .4s;

            &.active {
              background: #333;
              color: $white-color;
            }
          }
        }

        // address info
        .address-row {
          @include usePadding(25, 70);
          width: 100%;

          .info {
            margin-left: 20rpx;

            .address-info {
              color: #333333;
              margin: 10rpx 0;
              word-break: break-all;
            }
          }
        }

        .shop-select {
          @include usePadding(42, 42);
          @include useFlex(flex-start, center);

          .right {
            flex-grow: 1;
            font-size: 28rpx;
            font-weight: bold;
          }

          image {
            margin-right: 20rpx;
            width: 35rpx;
            height: 35rpx;
          }
        }
      }
    }
  }

  .goods-box {
    .title-row {
      @include usePadding(0, 17);
      color: #333;
      font-size: 32rpx;
      border-bottom: 1rpx solid #E6E6E6;

      .small {
        margin-left: 15rpx;
        font-size: 24rpx;
      }
    }

    .goods-row {
      @include usePadding(0, 40);

      .goods-detail {
        width: 100%;

        .sku-row {
          color: $tips-color;
          font-size: 24rpx;
          margin-bottom: 30rpx;
        }

        .price-row {
          color: $tips-color;

          .price {
            color: $primary-color;
            font-size: 30rpx;

            .old-price {
              color: $tips-color;
              margin-left: 10rpx;
              font-size: 20rpx;
              text-decoration: line-through;
            }
          }

          .cart-num {
            font-size: 24rpx;
          }
        }
      }

    }
  }

  .price-box {
    .row {
      @include usePadding(0, 30);
      color: #333;
      font-size: 28rpx;
      border-bottom: 1rpx solid #E6E6E6;

      &:last-child {
        border-bottom: none;
      }

      .value {
        color: #999;
      }
    }
  }


  .pay-box {

    :deep(.uv-radio-group ) {
      @include usePadding(0, 32);
      gap: 20rpx;


      .pay-item {
        flex: 1 0 45%;

        .pay_icon {
          width: 63rpx;
          margin: 0 20rpx;
          aspect-ratio: 1/1;

          image {
            width: 100%;
            height: 100%;
          }
        }

        .text {
          font-size: 24rpx;

          .e-text {
            font-size: 22rpx;
          }
        }
      }
    }
  }

  .bottom-option-box {
    position: fixed;
    width: 100%;
    height: $bottomHeight;
    bottom: env(safe-area-inset-bottom);
    left: 0;
    background: $white-color;

    .info {
      @include usePadding(34, 0)
    }

    .sub-button {
      @include usePadding(50, 0);
      height: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
      transition: all .3s;


    }
  }
}

:deep(.coupon-select) .uni-popup__wrapper {
  height: auto;
  max-height: 1000rpx;
  overflow-y: auto;
}

</style>
