<template>
  <Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
      </view>
    </template>
    <text class="header-title">订单确认</text>
  </Header>
  <view class="order-pay-container">
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 地址选择区域 -->
      <view class="address-selector" @click="selectAddress">
        <view class="address-content">
          <image class="location-icon" referrerpolicy="no-referrer" :src="PRODUCT_IMG_PATH + '7e51906ba8846e8.png'"
                 mode="aspectFit" />

          <!-- 未选择地址时显示 -->
          <view v-if="!shippingAddress.id" class="address-placeholder">
            <text class="address-text">请选择收货地址</text>
          </view>

          <!-- 已选择地址时显示 -->
          <view v-else class="address-info">
            <view class="address-header">
              <text class="recipient-name">{{ shippingAddress.name }}</text>
              <text class="recipient-phone">{{ shippingAddress.phone }}</text>
              <view v-if="shippingAddress.isDefault" class="default-tag">
                <text class="default-text">默认</text>
              </view>
            </view>
            <text class="address-detail">{{ shippingAddress.address }}</text>
          </view>
        </view>
        <view class="arrow-right"></view>
      </view>

      <!-- 商品信息区域 -->
      <view class="product-section">
        <view class="product-card">
          <!-- 主商品 -->
          <view
              v-for="(item, index) in cartInfo"
              :key="index"
              class="main-product"
          >
            <view class="product-image">
              <image :src="item.productInfo.image" mode="aspectFill" />
            </view>
            <view class="product-info">
              <view class="product-title">
                <text class="overseas-tag">海外</text>
                <text class="title">{{ item.productInfo.storeName }}</text>
              </view>
              <text class="product-desc">{{ item.productInfo.storeInfo }}</text>
              <view class="product-min"
              >起售 {{ item.productInfo.onSale }} 件
              </view
              >
              <text class="product-tax">进口税（含运费税款）：商品已含税</text>
              <view class="product-price">
                <view class="price">¥ {{ item.truePrice }}/月</view>
                <view class="quantity-control">
                  <view
                      class="quantity-btn"
                      :class="{ disabled: isUpdatingQuantity }"
                      @click="decreaseQuantity(item,index)"
                  >
                    <text>-</text>
                  </view>
                  <text class="quantity">{{ item.cartNum }}</text>
                  <view
                      class="quantity-btn"
                      :class="{ disabled: isUpdatingQuantity }"
                      @click="increaseQuantity(item,index)"
                  >
                    <text>+</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 赠品区域 -->
          <view v-if="allGifts && allGifts.length > 0" class="gift-section">
            <view class="gift-header" @click="showGiftSelectPopup">
              <text class="gift-title-text">赠品</text>
              <scroll-view class="gift-preview" scroll-x="true" :show-scrollbar="false">
                <view class="gift-preview-wrapper">
                  <view v-for="(gift, giftIndex) in allGifts" :key="giftIndex" class="gift-preview-item"
                        :class="{ 'selected': isGiftSelected(gift) }">
                    <image :src="gift.image" mode="aspectFill" />
                  </view>
                </view>
              </scroll-view>
              <view class="gift-count">
                <text>共{{ allGifts.length }}种可选</text>
                <view class="arrow-right"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 价格详情区域 -->
      <view class="price-section">
        <view class="price-card">
          <view class="price-details">
            <view class="price-item">
              <text class="label">商品合计</text>
              <text class="value">¥ {{ priceGroup.costPrice || 0 }}</text>
            </view>
            <view class="price-item">
              <text class="label">活动优惠</text>
              <text class="value discount">-¥{{ priceGroup.randomInst || 0 }}</text>
            </view>
            <!-- 活动优惠 -->
            <view v-if="priceGroup.randomInst" class="activity-section">
              <view class="activity-header">
                <text class="activity-title">活动优惠明细</text>
              </view>
              <view class="activity-detail">
                <text class="label">随机立减</text>
                <text class="value discount">-¥{{ priceGroup.randomInst || 0 }}</text>
              </view>
            </view>
            <view class="price-item" @click="showCouponPopup">
              <text class="label">优惠券</text>
              <view class="coupon-info">
                <text class="no-coupon" :style="{
                  color: priceGroup.couponPrice > 0 ? '#FF5C4C' : '#666666',
                }">
                  {{
                    priceGroup.couponPrice > 0
                        ? `-¥${priceGroup.couponPrice}`
                        : "无可用"
                  }}
                </text>
                <text class="arrow"></text>
              </view>
            </view>
            <view class="price-item">
              <view class="service-item" @click="showTariffPopup">
                <text class="label">关税服务</text>
                <image class="question-icon" referrerpolicy="no-referrer"
                       :src="PRODUCT_IMG_PATH + '2042f9f7dd82.png'" />
              </view>

              <view class="service-info">
                <text class="value">商家承担</text>
              </view>
            </view>
            <view class="price-item">
              <text class="label">运费</text>
              <text class="value">{{
                  priceGroup.storePostage > 0
                      ? `¥ ${priceGroup.storePostage}`
                      : "包邮"
                }}</text>
            </view>
            <view class="price-item" v-if="mainStore.user?.payCount == 0">
              <text class="label">说明</text>
              <view class="description">
                <text class="desc-text">&nbsp;</text>
                <view class="guarantee-badge-container">
                  <image class="guarantee-badge" referrerpolicy="no-referrer"
                         :src="PRODUCT_IMG_PATH + '78cbdd94b1a05e1.png'" />
                  <text class="privilege-text">新用户特权</text>
                </view>
              </view>
            </view>
            <view v-if="mainStore.user?.payCount == 0" class="guarantee-desc-2">
              <view class="guarantee-desc-item">支持14天无理由退货</view>
              <view class="guarantee-desc-item">若开封剩余量超50%，可获50%退款</view>
            </view>
            <view class="guarantee-icon">
              <view class="guarantee-section" @click="openAssurancePopup">
                <image class="protection-icon" referrerpolicy="no-referrer"
                       :src="PRODUCT_IMG_PATH + '674451b981887ae139.png'" />
                <text class="guarantee-title">消费者权益保障</text>
              </view>
              <view class="guarantee-content">
                <text class="guarantee-desc">正品保障｜放心买｜品质严保</text>
              </view>
            </view>
          </view>

          <!-- 分隔线 -->
          <view class="price-divider"></view>

          <!-- 合计金额 -->
          <view class="total-section">
            <text class="total-label">总金额：</text>
            <text class="total-amount">¥ {{ priceGroup.totalPrice || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部支付区 -->
    <view class="bottom-pay-section">
      <!-- <view class="agreement-section">
        <view
          class="checkbox"
          :class="{ checked: isAgreed }"
          @click="toggleAgreement"
        >
          <text v-if="isAgreed">✓</text>
        </view>
        <text class="agree-text" @click="toggleAgreement">同意</text>
        <text class="agreement-text" @click="toNewsDetail(17)">
          《HealthCoast营养严选用户协议》
        </text>
      </view> -->

      <view class="pay-info">
        <view class="pay-status">
          <text class="status-text">待支付</text>
          <text class="pay-amount">¥ {{ priceGroup.totalPrice || 0 }}</text>
        </view>
        <view class="pay-button" :class="{ disabled: isUpdatingQuantity }" @click="onSubmitOrder">
          <text class="pay-button-text">微信支付</text>
        </view>
      </view>
    </view>
  </view>
  <uv-popup ref="addressPopupRef" mode="bottom" :custom-style="{ height: '90vh' }">
    <addressEdit ref="addressEditRef" v-model="addressForm" @close="closePopup" @save="onAddressSave" />
  </uv-popup>
  <coupon-popup :visible="couponVisible" :coupons="couponList" :cartIds="currentCartIds"
                :selectedCoupon="selectedCoupon" :activityId="shoppingCartStore.activityId" @close="handlePopupClose" @select="handleCouponSelect" />
  <!-- 赠品选择弹窗 -->
  <GiftSelectPopup :visible="giftSelectVisible" :giftList="zpProductList" :selectedGifts="selectedGifts"
                   :multiple="false" @close="handleGiftPopupClose" @confirm="handleGiftSelect" />
  <!-- 保障弹窗（居中） -->
  <AssurancePopup ref="assurancePopupRef" />
  <!-- 关税服务说明弹窗 -->
  <CommonPopup v-model:show="tariffPopupVisible" title="关税说明" :showFooter="false" :closeable="true"
               :customStyle="{ width: '650rpx' }">
    <view class="tariff-content">
      <rich-text :nodes="tariffPopupText"></rich-text>
    </view>
  </CommonPopup>
  <CommonPopup v-model:show="agreementPopupVisible" title="温馨提示" :showFooter="true" :closeable="false"
               :customStyle="{ width: '650rpx' }" :contentStyle="{
      padding: '32rpx',
      fontSize: '28rpx',
      lineHeight: '42rpx',
      color: '#333',
    }">
    <view class="hc-agree-popup__content">
      <text>已阅读并同意</text>
      <text class="hc-agree-popup__link" @click="toNewsDetail(17)">《HealthCoast营养严选用户协议》</text>
      <text>、</text>
      <text class="hc-agree-popup__link" @click="toAgreement(0)">《隐私政策》</text>
    </view>
    <template #footer>
      <view class="hc-agree-popup__footer" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
        <view class="hc-agree-popup__btn hc-agree-popup__btn--cancel" style="
            flex: 1;
            height: 80rpx;
            border-radius: 40rpx;
            background-color: #f5f5f5;
            color: #666;
            border: 2rpx solid #eaeaea;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            margin-right: 20rpx;
          " @click="handleAgreementCancel">不同意</view>
        <view class="hc-agree-popup__btn hc-agree-popup__btn--confirm" style="
            flex: 1;
            height: 80rpx;
            border-radius: 40rpx;
            background-color: #00cbcc;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
          " @click="handleAgreementConfirm">同意</view>
      </view>
    </template>
  </CommonPopup>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import Header from '@/components/Header/index.vue'
import addressEdit from '@/components/addressEdit/addressEdit.vue'
import couponPopup from '@/components/couponPopup/couponPopup.vue'
import AssurancePopup from '@/components/AssurancePopup/index.vue'
import GiftSelectPopup from "./components/index.vue";
import CommonPopup from '@/components/CommonPopup/index.vue'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'
import { useRouter } from '@/hooks/useRouter'
import { getCartAdd, getCartNum, getCartClear } from '@/api/cart'
import { orderConfirm,payOrder, orderCreate } from '@/api/order'
import { getAddressList, getAddressAddAndEdit } from '@/api/address'
import { emitter } from '@/utils/emitter'
import TencentAdSDK from "@/utils/tencentAd";
import { useMainStore } from '@/store/modules/useMainStore'
import { TENCENT_ADS_ACCESS_TOKEN, APP_ID } from "@/config";
import { requestUtil } from "@/utils/request";
import { orderPayment } from '@/utils/orderPayment'
import { getNotice } from '@/api/user'
import { useShoppingCartStore } from '@/store/modules/useShoppingCart'

const { goBack, push, toHome } = useRouter()
const mainStore = useMainStore()
const shoppingCartStore = useShoppingCartStore()
// 响应式数据
const statusBarHeight = ref(20)
const isAgreed = ref(false)
const addressPopupRef = ref(null)
// 防抖定时器
let confirmOrderTimer = null
let updateCartTimer = null
// 数量更新中的状态
const isUpdatingQuantity = ref(false)

// 收货地址信息
const shippingAddress = reactive({
  id: '',
  name: '请选择收货地址',
  phone: '',
  address: '',
  isDefault: false
})
const isLoading = ref(false)
const isPaymentLoading = ref(false) // 是否支付中
const orderInfo = ref(null)
const productInfo = ref({
  productNum: 4
})
const main = reactive({
  selectAddress: null
})
const cartInfo = ref([])
const priceGroup = ref({})
// 赠品选择相关
const giftSelectVisible = ref(false);
const selectedGifts = ref([]); // 转换后的赠品数据（用于显示）
const selectedOriginalGifts = ref([]); // 原始赠品数据（用于提交）
const originalGiftList = ref([]); // 原始API返回的赠品列表
// 赠品列表 - 使用真实数据结构
const zpProductList = ref([]);

// 所有礼品平铺列表（用于预览显示）
const allGifts = computed(() => {
  if (!zpProductList.value || zpProductList.value.length === 0) return [];
  // 判断是否为分组数据
  if (zpProductList.value[0].list && Array.isArray(zpProductList.value[0].list)) {
    return zpProductList.value.reduce((acc, group) => {
      return acc.concat(group.list || []);
    }, []);
  }
  return zpProductList.value;
});

// 优惠券相关
const couponVisible = ref(false)
const couponList = ref([])
const selectedCoupon = ref(null)
const assurancePopupRef = ref(null)
const tariffPopupVisible = ref(false)
const tariffPopupText = ref('')
const agreementPopupVisible = ref(false)
const openAssurancePopup = () => {
  assurancePopupRef.value?.open?.()
}
const showTariffPopup = async () => {
  console.log('点击关税服务')
  const data = await getNotice(41)
  tariffPopupText.value = data.content || ''
  tariffPopupVisible.value = true
  // console.log("tariffPopupVisible:", tariffPopupVisible.value);
}
const handleAgreementConfirm = () => {
  isAgreed.value = true
  agreementPopupVisible.value = false
  onSubmitOrder()
}
const handleAgreementCancel = () => {
  agreementPopupVisible.value = false
}
const addressForm = ref({
  id: undefined,
  realName: undefined,
  phone: undefined,
  detail: undefined,
  isDefault: undefined,
  address: {
    province: undefined,
    city: undefined,
    district: undefined,
    cityId: undefined
  }
})
// 获取系统信息
onMounted(() => {
  uni.getSystemInfo({
    success: (res) => {
      statusBarHeight.value = res.statusBarHeight || 20
    }
  })
})
// 监听地址选择事件
onMounted(() => {
  emitter.on('selectAddress', (address) => {
    console.log('选择的地址:', address)
    try {
      if (!address) return
      // 统一走函数，内部已做平铺/嵌套兼容与过滤
      updateShippingAddress(address)
      console.log('选择的地址2222:', shippingAddress)
    } catch (err) {
      console.error('selectAddress 回调异常:', err, address)
    }
    console.log('选择的地址333:', shippingAddress)
  })
})

// 组件卸载时移除事件监听并清理定时器
onUnmounted(() => {
  emitter.off('selectAddress')
  // 清理防抖定时器
  if (confirmOrderTimer) {
    clearTimeout(confirmOrderTimer)
    confirmOrderTimer = null
  }
  if (updateCartTimer) {
    clearTimeout(updateCartTimer)
    updateCartTimer = null
  }
})

onLoad(async (options) => {
  try {
    // 显示加载状态
    uni.showLoading({
      title: '加载订单信息...',
      mask: true
    })

    // 获取地址列表
    await fetchAddressList()
    console.log('解析订单:', options)
    // 解析订单数据
    let cartIds = shoppingCartStore.cartIds
    if (cartIds.length === 0) {
      uni.hideLoading()
      uni.showToast({
        title: '请先选择购买商品~',
        icon: 'none'
      })
      return
    }
    // 初次提交订单
    const confirmRes = await confirmOrder(
        main.selectAddress?.id || 0,
        shoppingCartStore.useIntegral
    )
    console.log('提交订单成功', confirmRes)
    // 隐藏加载状态
    uni.hideLoading()
  } catch (error) {
    console.error('加载订单数据失败:', error)
    uni.hideLoading()
    uni.showToast({
      title: error.message || '加载订单数据失败',
      icon: 'none',
      duration: 3000
    })
    // 如果是规格信息错误，返回上一页
    if (error.message && error.message.includes('规格')) {
      setTimeout(() => {
        uni.navigateBack()
      }, 2000)
    }
  }
})
onUnload(async () => {
  console.log('页面卸载，清空确认订单数据')
  await getCartClear()
})

// 选择地址
const selectAddress = () => {
  // 使用路由导航到地址选择页面
  push?.(
      {
        url: '/pages/address/address'
      },
      {
        data: {
          type: 'select'
        }
      }
  )
}

// 获取地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList({})
    console.log('获取地址列表返回数据:', res)

    // 检查返回的数据结构
    let addressList = []
    if (res && res.list && Array.isArray(res.list)) {
      addressList = res.list
    } else if (res && Array.isArray(res)) {
      addressList = res
    }

    if (addressList.length > 0) {
      // 找到默认地址
      const defaultAddress = addressList.find((addr) => addr.isDefault === 1)
      if (defaultAddress) {
        updateShippingAddress(defaultAddress)
      } else {
        // 如果没有默认地址，使用第一个地址
        updateShippingAddress(addressList[0])
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
    uni.showToast({
      title: '获取地址列表失败',
      icon: 'none'
    })
  }
}

// 更新收货地址信息
const updateShippingAddress = (address) => {
  shippingAddress.id = address?.id || ''
  shippingAddress.name = address?.realName || ''
  shippingAddress.phone = address?.phone || ''

  // 组合完整地址（支持平铺或嵌套在 address 下的结构，并过滤无效字符串）
  const province = address?.province ?? address?.address?.province
  const city = address?.city ?? address?.address?.city
  const district = address?.district ?? address?.address?.district
  const fullAddress = [province, city, district, address?.detail]
      .filter((v) => v && v !== 'undefined' && v !== 'null')
      .join(' ')

  shippingAddress.address = fullAddress
  shippingAddress.isDefault = !!(address?.isDefault === 1)

  // 保存完整的地址信息到main对象，用于后续订单确认
  main.selectAddress = address

  console.log('更新收货地址:', shippingAddress)

  // 如果有购物车ID，则更新订单信息
  // 即使地址ID为空，也需要更新订单，因为用户可能选择了新地址或修改了地址信息
  if (shoppingCartStore.cartIds.length>0) {
    // 如果地址ID存在，使用地址ID更新订单
    if (address?.id) {
      confirmOrder(address.id, 0)
    } else {
      // 如果地址ID为空，但地址信息有效，尝试使用完整地址信息更新订单
      // 这种情况可能是新添加的地址或者地址数据异常
      console.log('地址ID为空，尝试使用地址信息更新订单')
      // 尝试重新获取地址列表，获取最新的地址ID
      fetchAddressList().then(() => {
        // 如果获取到默认地址，使用默认地址ID更新订单
        if (main.selectAddress?.id) {
          confirmOrder(main.selectAddress.id, 0)
        }
      })
    }
  }
}

function fmtCart() {
  if (cartInfo.value && cartInfo.value.length > 0) {
    cartInfo.value.forEach((product) => {
      // todo:执行fmt
      console.log('格式化 购物车商品信息', product)
    })
  }
}

// 确认订单
const confirmOrder = async (addressId, useIntegral) => {
  if (isLoading.value) return
  isLoading.value = true
  try {
    const confirmParams = {
      orderType: 1,
      useIntegral: useIntegral || 0,
      cartId: shoppingCartStore.cartIds.toString(),
      addressId: addressId || 0,
      shippingType: 1,
      isApp:0
    }
    if (shoppingCartStore.activityId) {
      confirmParams.activityId = shoppingCartStore.activityId
    }

    let tag1 = 0;
    // 如果选择了优惠券，添加优惠券ID
    if (selectedCoupon.value && selectedCoupon.value.detailId) {
      confirmParams.couponId = selectedCoupon.value.detailId;
      console.log("订单确认使用优惠券ID:", selectedCoupon.value.detailId);
      if (selectedCoupon.value.detailId > 0) {
        tag1 = 1;
      }
    }

    const confirmRes = await orderConfirm(confirmParams);

    if (confirmRes) {
      console.log("订单确认返回数据:", confirmRes);

      if (tag1 == 1 && confirmRes.priceGroup.isCoupon == 0) {
        //表示 随机立减和优惠券不能同时使用，需要提示
        uni.showToast({
          title: "优惠券与活动不能同享",
          icon: "none",
          duration: 2000
        });
      }

      // 更新地址信息到页面
      if (confirmRes.addressInfo) {
        updateShippingAddress(confirmRes.addressInfo)
      }

      // 更新购物车信息
      if (confirmRes.cartInfo && confirmRes.cartInfo.length > 0) {
        cartInfo.value = confirmRes.cartInfo
        fmtCart(confirmRes.cartInfo)
      }

      // 更新价格信息
      if (confirmRes.priceGroup) {
        priceGroup.value = confirmRes.priceGroup
        if(confirmRes.priceGroup.couponId){
          selectedCoupon.value = {
            detailId: confirmRes.priceGroup.couponId
          }
        }
      }

      // 赠品数据转换函数
      const transformGiftData = (giftList, autoSelectFirst = false) => {
        if (!Array.isArray(giftList)) return [];

        // 判断是否为分组数据（包含 list 字段）
        const isGrouped = giftList.length > 0 && Array.isArray(giftList[0].list);

        if (isGrouped) {
          const transformedGroups = giftList.map(group => ({
            type: group.type,
            list: group.list.map(gift => ({
              id: gift.id,
              productId: gift.productId,
              storeName: gift.storeName,
              image: gift.image,
              price: gift.price || 0,
              cartNum: gift.stock,
              labelList: gift.labelList || [],
              description: gift.storeProduct?.specUnit || '',
              defaultNumber: gift.storeProduct?.defaultNumber || '',
              activityType: group.type // 标记所属活动类型
            }))
          }));

          // 如果需要自动选择，则每个活动默认选第一个
          if (autoSelectFirst) {
            const selected = [];
            const selectedOriginal = [];
            transformedGroups.forEach((group, gIdx) => {
              if (group.list.length > 0) {
                selected.push(group.list[0]);
                selectedOriginal.push(giftList[gIdx].list[0]);
              }
            });
            selectedGifts.value = selected;
            selectedOriginalGifts.value = selectedOriginal;
            console.log('分组自动选择默认赠品:', selected);
          }
          return transformedGroups;
        }

        // 非分组数据的原逻辑
        const transformedList = giftList.map(gift => ({
          id: gift.id,
          productId: gift.productId,
          storeName: gift.storeName,
          image: gift.image,
          price: gift.price || 0,
          cartNum: gift.stock,
          labelList: gift.labelList || [],
          description: gift.storeProduct?.specUnit || '',
          defaultNumber: gift.storeProduct?.defaultNumber || ''
        }));

        if (autoSelectFirst && transformedList.length > 0) {
          selectedGifts.value = [transformedList[0]];
          selectedOriginalGifts.value = [giftList[0]];
          console.log('自动选择第一个赠品:', transformedList[0]);
        }

        return transformedList;
      };

      // 更新赠品信息
      const gifts = confirmRes.pmapList
      if (gifts && Array.isArray(gifts)) {
        // 保存原始数据
        originalGiftList.value = gifts;
        // 转换数据用于显示，并自动选择第一个赠品（仅在首次加载且没有已选赠品时）
        const autoSelect = selectedGifts.value.length === 0;
        zpProductList.value = transformGiftData(gifts, true);
        console.log("获取赠品列表:", gifts);
        console.log("转换后的赠品列表:", zpProductList.value);
        if (autoSelect && gifts.length > 0) {
          console.log('已自动选择第一个赠品');
        }
      }

      // 保存订单信息，用于后续支付
      orderInfo.value = {
        orderId: confirmRes.orderId || confirmRes.orderKey,
        orderKey: confirmRes.orderKey,
        ...confirmRes
      }
      return confirmRes
    } else {
      throw new Error('订单确认失败')
    }
  } catch (error) {
    console.error('订单确认失败:', error)
    // 不在这里显示Toast，让调用方处理错误
    // 抛出错误，让防抖函数能够捕获并处理
    throw error
  } finally {
    isLoading.value = false
    uni.hideLoading()
  }
}

// 保存地址
const onAddressSave = async (form) => {
  try {
    // 保存地址到服务器
    const addressData = {
      ...form,
      postCode: undefined
    }

    let savedAddress
    if (form.id) {
      // 编辑现有地址
      savedAddress = await getAddressAddAndEdit(addressData)
      console.log('编辑地址成功:', savedAddress)
    } else {
      // 添加新地址
      savedAddress = await getAddressAddAndEdit(addressData)
      console.log('添加地址成功:', savedAddress)
    }

    // 确保返回的数据包含地址ID
    if (!savedAddress || !savedAddress.id) {
      console.warn('保存地址返回数据无效，尝试重新获取地址列表')
      // 如果返回的数据无效，尝试重新获取地址列表
      await fetchAddressList()
      // 如果获取到默认地址，使用默认地址
      if (main.selectAddress?.id) {
        savedAddress = main.selectAddress
      } else {
        throw new Error('保存地址失败，无法获取有效的地址ID')
      }
    }

    // 更新界面显示的地址
    updateShippingAddress(savedAddress)

    uni.showToast({
      title: '地址保存成功',
      icon: 'success'
    })

    closePopup()
  } catch (error) {
    console.error('保存地址失败:', error)
    uni.showToast({
      title: error.message || '保存地址失败',
      icon: 'none'
    })
  }
}
const closePopup = () => {
  addressPopupRef.value?.close()
}

// 防抖更新购物车数量和订单确认（1秒后执行）
const debouncedUpdateCartAndOrder = (cartId, newQuantity, oldQuantity) => {
  // 清除之前的定时器
  if (updateCartTimer) {
    clearTimeout(updateCartTimer)
    updateCartTimer = null
  }

  // 标记为更新中
  isUpdatingQuantity.value = true

  // 设置新的定时器
  updateCartTimer = setTimeout(async () => {
    if (shoppingCartStore.cartIds.length <= 0) {
      isUpdatingQuantity.value = false
      return
    }

    try {
      console.log('[防抖] 500ms后执行购物车数量更新，数量:', newQuantity)

      // 1. 先更新购物车数量
      await getCartNum({
        id: cartId,
        number: newQuantity
      })
      console.log('[防抖] 购物车数量更新成功')

      // 2. 再更新订单确认（获取最新价格）
      if (main.selectAddress?.id) {
        console.log('[防抖] 执行订单确认接口')
        const confirmRes = await confirmOrder(
            main.selectAddress.id,
            0
        )
        if (confirmRes) {
          console.log('[防抖] 订单确认成功，价格已更新')
        }
      } else {
        console.log('[防抖] 未选择地址，执行订单确认接口')
        const confirmRes = await confirmOrder(0, 0)
        if (confirmRes) {
          console.log('[防抖] 订单确认成功，价格已更新')
        }
      }
    } catch (error) {
      console.error('[防抖] 更新失败:', error)

      // 所有错误都先恢复数量
      // todo:需要处理这块debug， 多商品
      // quantity.value = oldQuantity
      if (productInfo.value) {
        productInfo.value.productNum = oldQuantity
      }

      // 根据错误类型显示不同提示
      if (
          error.code === 1008007005 ||
          (error.msg && error.msg.includes('请提交购买的商品'))
      ) {
        console.log('[防抖] 购物车商品异常，恢复原数量并提示')
        uni.showToast({
          title: error.msg || '购物车数据异常',
          icon: 'none',
          duration: 2000
        })
      } else if (
          error.code === 1008006002 ||
          (error.msg && error.msg.includes('库存不足'))
      ) {
        console.log('[防抖] 库存不足，恢复原数量:', oldQuantity)
        uni.showToast({
          title: error.msg || '库存不足',
          icon: 'none'
        })
      } else {
        console.log('[防抖] 其他错误，恢复原数量:', oldQuantity)
        uni.showToast({
          title: error.msg || '更新失败，请重试',
          icon: 'none'
        })
      }
    } finally {
      // 更新完成，解除锁定
      isUpdatingQuantity.value = false
    }
  }, 500) // 500毫秒延迟
}

// 增加数量
const increaseQuantity = async (item, index) => {
  selectedCoupon.value = null
  console.log(
      '【DEBUG】increaseQuantity被调用，当前quantity:',
      item.cartNum,
      'minSaleQuantity:',
      item.productInfo.onSale,
      'item===>',
      item
  )

  // 如果正在加载或正在更新数量，则禁止操作
  if (isLoading.value || isUpdatingQuantity.value) {
    console.log('【DEBUG】正在更新中，操作被阻止')
    return
  }

  if (item.cartNum >= 99) {
    console.log('【DEBUG】已达最大购买数量99')
    uni.showToast({
      title: '已达最大购买数量',
      icon: 'none'
    })
    return
  }

  console.log(
      '【DEBUG】增加数量，从',
      item.cartNum,
      '->',
      item.cartNum + 1
  )

  // 保存旧数量
  const oldQuantity = item.cartNum

  item.cartNum++

  // 更新商品信息中的数量
  if (productInfo.value) {
    productInfo.value.productNum = item.cartNum
  }

  // 使用防抖函数延迟更新购物车和订单，传递旧数量用于错误恢复
  debouncedUpdateCartAndOrder(item.id,item.cartNum, oldQuantity)
}

// 减少数量
const decreaseQuantity = async (item, index) => {
  selectedCoupon.value = null
  console.log(
      '【DEBUG】decreaseQuantity被调用，当前quantity:',
      item.cartNum,
      'minSaleQuantity:',
      item.productInfo.onSale,
      '可否减?',
      item.cartNum > item.productInfo.onSale
  )

  // 如果正在加载或正在更新数量，则禁止操作
  if (isLoading.value || isUpdatingQuantity.value) {
    console.log('【DEBUG】正在更新中，操作被阻止')
    return
  }

  // 检查是否达到最小起售数量
  console.log(
      '【DEBUG】decreaseQuantity检查：当前quantity:',
      item.cartNum,
      'minSaleQuantity:',
      item.productInfo.onSale
  )
  if (item.cartNum <= item.productInfo.onSale) {
    uni.showToast({
      title: `最低不能低于 ${item.productInfo.onSale} 件`,
      icon: 'none'
    })
    console.log('【DEBUG】已达最低起售数量，操作被阻止')
    return
  }

  // 保存旧数量
  const oldQuantity = item.cartNum

  item.cartNum--

  // 更新商品信息中的数量
  if (productInfo.value) {
    productInfo.value.productNum = item.cartNum
  }

  // 使用防抖函数延迟更新购物车和订单，传递旧数量用于错误恢复
  debouncedUpdateCartAndOrder(item.id, item.cartNum, oldQuantity)
}
// 定义订单详情数据和配送类型
const orderDetailData = ref({
  orderKey: "",
});
const shippingType = ref(1);

/**
 * 上报腾讯广告转化
 * @param {string} orderId - 订单ID
 * @param {number} payAmount - 支付金额
 */
const reportTencentAdsConversion = async (orderId, payAmount) => {
  try {
    // 1. 获取用户 openid
    const userOpenid =
        mainStore.user?.openid || mainStore.user?.routineOpenId || "";
    if (!userOpenid) {
      console.warn("[TAds] 用户 openid 不存在，跳过转化上报");
      return;
    }

    console.log("[TAds] 用户 openid:", userOpenid);

    // 2. 调用接口查询点击数据
    console.log("[TAds] 查询点击数据，openId:", userOpenid);
    const clickData = await requestUtil.get("/shop-datanexus/getClick", {
      id: userOpenid,
    });

    if (!clickData || !clickData.clickId) {
      console.log("[TAds] 未查询到点击数据，跳过转化上报（用户非从广告进入）");
      return;
    }

    console.log("[TAds] 查询到点击数据:", clickData);

    // 3. 准备上报数据
    const conversionData = {
      actionType: "COMPLETE_ORDER",
      userActionSetId: "70914037",
      wechatOpenid: userOpenid,
      wechatAppId: APP_ID,
      actionParam: {
        value: payAmount,
        // order_id: orderId,
        // product_id: cartInfo.value[0]?.productInfo?.id,
        // product_name: cartInfo.value[0]?.productInfo?.storeName
      },
    };

    console.log("[TAds] 准备上报转化数据:", conversionData);

    // 4. 上报转化
    await TencentAdSDK.reportConversionByOfficial(conversionData);
    console.log("[TAds] 转化上报成功");
  } catch (error) {
    console.warn("[TAds] 转化上报失败:", error);
  }
};

const onSubmitOrder = async () => {
  console.log('====================onSubmitOrder====================', isPaymentLoading.value)
  if (isPaymentLoading.value) return;

  // 检查是否正在更新数量
  if (isUpdatingQuantity.value) {
    uni.showToast({
      title: "正在更新价格，请稍候",
      icon: "none",
    });
    return;
  }

  // 检查是否同意协议
  // if (!isAgreed.value) {
  //   agreementPopupVisible.value = true;
  //   return;
  // }

  // 微信支付时检查是否选择了收货地址
  if (!main.selectAddress?.id) {
    uni.showToast({
      icon: "none",
      title: "请选择收货地址",
      duration: 2000,
    });
    return;
  }

  // 检查订单信息是否存在
  if (!orderInfo.value || !orderInfo.value.orderKey) {
    uni.showToast({
      icon: "none",
      title: "订单信息不完整，请重试",
      duration: 2000,
    });
    return;
  }

  isPaymentLoading.value = true;
  // 更新orderDetailData的orderKey
  orderDetailData.value.orderKey = orderInfo.value.orderKey;

  try {
    uni.showLoading({
      title: "处理中...",
      mask: true,
    });
    console.log(
        "============selectedCoupon==========" +
        JSON.stringify(selectedCoupon.value)
    );
    let couponId = 0;
    if (selectedCoupon.value == null) {
      couponId = orderInfo.value.priceGroup.couponId;
    } else {
      couponId =
          selectedCoupon.value && selectedCoupon.value.detailId
              ? selectedCoupon.value.detailId
              : 0;
    }
    console.log("============couponId==========" + couponId);

    //随机立减信息
    const campaign = {
      cid: orderInfo.value.priceGroup.cid,
      rid: orderInfo.value.priceGroup.rid,
      pid: orderInfo.value.priceGroup.pid,
      isCoupon: orderInfo.value.priceGroup.isCoupon,
      randomInst: orderInfo.value.priceGroup.randomInst
    }
    const campaignStr = JSON.stringify(campaign);
    // 创建订单参数
    const createParams = {
      key: orderDetailData.value.orderKey,
      addressId: main.selectAddress?.id || 0,
      bargainId: 0,
      combinationId: 0,
      couponId: couponId,
      from: "",
      mark: "",
      pinkId: 0,
      seckillId: 0,
      shippingType: shippingType.value,
      useIntegral: 0,
      isChannel: 1,
      orderType: 'send',
      giftProductList: selectedOriginalGifts.value,  // 提交原始赠品数据结构,
      cid: orderInfo.value.priceGroup.cid,
      zhyhPrice: orderInfo.value.priceGroup.randomInst,
      zhyhlist: campaignStr,
      isApp: 0
    };

    console.log("创建订单使用优惠券ID:", createParams.couponId);

    // 创建订单
    let res = await orderCreate(createParams);

    if (res && res.result) {
      const { key, orderId } = res.result;

      // 保存订单信息用于支付
      orderInfo.value = {
        ...orderInfo.value,
        orderId: orderId,
        orderKey: key,
      };

      const orderKey = key || orderId;

      await orderPayment(orderKey, {
        onSuccess: () => {
          setTimeout(() => {
            console.log("[TAds] 开始跳转到支付成功页面");
            uni.redirectTo({
              url: "/pages/payment/placeOrder",
            });
          }, 200);
        },
        onFailed: (err) => {
          if (err.errMsg === "requestPayment:fail cancel") {
            uni.redirectTo({
              url: "/pages/orderList/orderList",
            });
          } else {
            uni.redirectTo({
              url: "/pages/orderList/orderList",
            });
          }
        },
        onViewOrder: () => {
          uni.redirectTo({
            url: "/pages/orderList/orderList",
          });
        },
      });
    } else {
      throw new Error("订单创建失败");
    }
  } catch (error) {
    console.error("创建订单失败:", error);
    uni.showToast({
      title: error.message || "订单创建失败",
      icon: "none",
      duration: 2000,
    });
  } finally {
    uni.hideLoading();
    isPaymentLoading.value = false;
  }
};

function toNewsDetail(id) {
  console.log("======================" + id);
  push(
      {
        url: "/pages/webview/news",
      },
      {
        data: {
          id: id,
        },
      }
  );
}
function toAgreement(type) {
  uni.navigateTo({
    url: "/views/evaluation/startup/agreement",
  });
}
// 切换协议同意状态
const toggleAgreement = () => {
  isAgreed.value = !isAgreed.value;
};

// 当前购物车ID列表（用于优惠券查询）
const currentCartIds = computed(() => {
  if (shoppingCartStore.cartIds.length>0) {
    console.log('从 cartId 获取:', shoppingCartStore.cartIds)
    return String(shoppingCartStore.cartIds)
  }

  if (cartInfo.value && cartInfo.value.length > 0) {
    const cartIds = cartInfo.value
        .filter((item) => item.id)
        .map((item) => item.id)
        .join(',')
    console.log('从 cartInfo 提取 cartIds:', cartIds)
    return cartIds
  }

  console.log('没有可用的 cartIds')
  return ''
})

// 显示优惠券弹窗
const showCouponPopup = () => {
  console.log('=== 点击了优惠券区域 ===')
  console.log('cartIds:', shoppingCartStore.cartIds)
  console.log('cartInfo.value:', cartInfo.value)
  console.log('currentCartIds.value:', currentCartIds.value)
  console.log('======================')
  couponVisible.value = true
}

// 关闭优惠券弹窗
const handlePopupClose = () => {
  console.log('关闭优惠券弹窗')
  couponVisible.value = false
}

// 选择优惠券
const handleCouponSelect = async (coupon, index) => {
  console.log('选择的优惠券:', coupon)
  if (!coupon || coupon === -1) {
    // 不使用优惠券
    selectedCoupon.value = {
      detailId: -1
    }
    console.log('取消使用优惠券')
    // 重新确认订单获取最新价格
    if (shoppingCartStore.cartIds && shoppingCartStore.cartIds.length>0) {
      await confirmOrder(shippingAddress.id, 0)
    }
    return
  }

  selectedCoupon.value = coupon
  console.log('选择的优惠券:', coupon)

  // 选择优惠券后重新确认订单
  if (shoppingCartStore.cartIds && shoppingCartStore.cartIds.length>0) {
    await confirmOrder(shippingAddress.id, 0)
  }
}

// 显示赠品选择弹窗
const showGiftSelectPopup = () => {
  console.log('打开赠品选择弹窗，可选赠品:', zpProductList.value);
  giftSelectVisible.value = true;
};

// 关闭赠品选择弹窗
const handleGiftPopupClose = () => {
  console.log('关闭赠品选择弹窗');
  giftSelectVisible.value = false;
};

// 判断赠品是否被选中
const isGiftSelected = (gift) => {
  return selectedGifts.value.some(item =>
      (item.id && item.id === gift.id) ||
      (item.productId && item.productId === gift.productId)
  );
};

// 选择赠品
const handleGiftSelect = (gifts) => {
  console.log('选择的赠品:', gifts);
  selectedGifts.value = gifts;

  // 根据选中的转换后赠品，找到对应的原始赠品数据
  const originalGifts = [];
  const isOrigGrouped = originalGiftList.value.length > 0 && Array.isArray(originalGiftList.value[0].list);

  gifts.forEach(selectedGift => {
    if (isOrigGrouped) {
      // 分组数据中查找
      for (const group of originalGiftList.value) {
        const target = group.list.find(original => original.id === selectedGift.id || original.productId === selectedGift.productId);
        if (target) {
          originalGifts.push(target);
          break;
        }
      }
    } else {
      // 平铺数据中查找
      const target = originalGiftList.value.find(original => original.id === selectedGift.id || original.productId === selectedGift.productId);
      if (target) {
        originalGifts.push(target);
      }
    }
  });

  selectedOriginalGifts.value = originalGifts;
  console.log('选中的原始赠品数据:', selectedOriginalGifts.value);

  uni.showToast({
    title: `已选择${gifts.length}个赠品`,
    icon: 'success',
    duration: 2000
  });
};
</script>

<style lang="scss" scoped>
@import "orderPay";
</style>
