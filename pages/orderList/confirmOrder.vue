<template>
  <Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
      </view>
    </template>
    <text class="header-title">确认订单</text>
    <!-- <template #right>
      <view class="header-right" @click="handleShare">
        <uv-icon name="share" size="20" color="#000" />
      </view>
    </template> -->
  </Header>
  <view class="confirm-order-page">
    <!-- 收货地址选择 -->
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

    <!-- 健康方案详情 -->
    <view class="health-plan-section">
      <view class="plan-title">{{ `${healthPlan.title || '个性化'}的营养补剂方案` }}</view>

      <!-- 服务标签 -->
      <view class="service-tags">
        <view class="tag-item">
          <uv-button plain color="#00cbcc" text="香港直邮" size="mini"></uv-button>
        </view>
        <view class="tag-item">
          <uv-button plain color="#00cbcc" text="营养师专业咨询" size="mini"></uv-button>
        </view>
        <view class="tag-item">
          <uv-button plain color="#00cbcc" text="原装进口" size="mini"></uv-button>
        </view>
      </view>

      <!-- 每日补剂信息 -->
      <view class="daily-supplements">
        <view class="supplements-label">每日补剂含：</view>
        <view class="supplement-badges">
          <view class="supplement-badge" v-for="(badge, index) in supplementBadges" :key="index">
            <view class="badge-content">
              <text class="badge-text">{{ badge.text }}</text>
              <image class="badge-img" referrerpolicy="no-referrer" :src="badge.img" />
            </view>
          </view>
          <view class="supplement-icon-wrapper" @click="toggleProductListCollapse">
            <image class="supplement-icon" referrerpolicy="no-referrer"
              :src="PRODUCT_IMG_PATH + 'a154f775fad8c83ae7f869b105513f04.png'"
              :style="{ transform: isProductListCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }" />
          </view>
        </view>
      </view>

      <!-- 产品列表 -->
      <view class="product-list" v-show="!isProductListCollapsed">
        <view class="products-container">
          <uv-swipe-action :autoClose="true">
            <uv-swipe-action-item v-for="(product, index) in productSpecs" :key="product.id"
              :options="swipeRightOptions" :name="index" :disabled="isFromShare" @click="onSwipeActionClick">
              <view class="product-item">
                <view class="product-main-info">
                  <view class="product-info">
                    <image class="product-image" referrerpolicy="no-referrer" :src="product.image ||
                      PRODUCT_IMG_PATH +
                      '465a3d2aca2d64946d747b820c12df53.png'
                      " />
                    <view style="display: flex; flex-direction: column; overflow: hidden;">
                      <text class="product-name">{{ product.name }}</text>
                      <text class="spec-text" v-if="product.specUnit">
                        规格：{{ product.specUnit }}
                      </text>
                    </view>
                  </view>

                  <view class="product-footer">
                    <text class="price-text" :style="{ color: product.priceColor }">
                      ¥{{ product.monthlyPrice }}/月
                    </text>
                    <view style="text-align: center;">
                      <!-- 数量控制：分享链接进入时禁用增减 -->
                      <view class="quantity-control">
                        <view class="quantity-btn" :class="{
                          disabled: isUpdatingQuantity || isFromShare,
                        }" @click="adjustQuantity('decrease', index)">
                          <text>-</text>
                        </view>
                        <text class="quantity">{{ product.quantity }}</text>
                        <view class="quantity-btn" :class="{
                          disabled: isUpdatingQuantity || isFromShare,
                        }" @click="adjustQuantity('increase', index)">
                          <text>+</text>
                        </view>
                      </view>
                      <text class="onsale-text" v-if="product.onSale && product.onSale > 1">
                        起售 {{ product.onSale }} 件
                      </text>
                    </view>
                  </view>
                </view>
              </view>
            </uv-swipe-action-item>
          </uv-swipe-action>
        </view>
      </view>

      <!-- 调整方案 -->
      <!-- 
        显示逻辑：
        1. 分享链接进入时不显示（isFromShare 为 true）
        2. tag != "1" 时，按原有逻辑显示（healthPlan.canAdjust 为 true）
        3. tag == "1" 时：
           - isup == "0" 时显示调整方案按钮
           - isup != "0" 时不显示
      -->
      <view class="adjust-plan" @click="adjustPlan" v-if="
        !isFromShare &&
        ((pageTag !== '1' && healthPlan.canAdjust) ||
          (pageTag === '1' && isup === '0'))
      ">
        <image class="adjust-icon" referrerpolicy="no-referrer" :src="PRODUCT_IMG_PATH + '0c8ded8a540a5163.png'" />
        <text class="adjust-text">调整补剂方案</text>
      </view>

      <!-- 赠品信息 -->
      <view class="gift-section" v-if="giftProductList && giftProductList.length > 0">
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

    <!-- 订单汇总 -->
    <view class="order-summary">
      <view class="summary-item">
        <text class="summary-label">商品合计</text>
        <text class="summary-value">¥&nbsp;{{ totalPrice || 0 }}</text>
      </view>

      <view class="summary-item">
        <text class="summary-label">活动优惠</text>
        <text class="summary-value discount">-¥{{ orderInfo.randomInst || 0 }}</text>
      </view>

      <view class="discount-detail" v-if="orderInfo.randomInst">
        <view class="discount-info">
          <text class="discount-title">活动优惠明细</text>
          <view class="discount-detail-text">
            <text class="discount-desc">随机立减</text>
            <text class="discount-amount">-¥{{ orderInfo.randomInst || 0 }}</text>
          </view>
        </view>
      </view>

      <view class="coupon-section">
        <text class="coupon-label">优惠券</text>
        <view class="coupon-info" @click="showCouponPopup">
          <text class="coupon-status" :style="{
            color: orderInfo.discountAmount > 0 ? '#FF5C4C' : '#666666',
          }">
            {{
              orderInfo.discountAmount > 0
                ? `-¥${orderInfo.discountAmount}`
                : "无可用"
            }}
          </text>
          <view class="coupon-arrow"></view>
        </view>
      </view>

      <view class="service-item">
        <view class="service-info" @click="showTariffPopup">
          <text class="service-label">关税服务</text>
          <image class="service-icon" referrerpolicy="no-referrer" :src="PRODUCT_IMG_PATH + '2042f9f7dd82.png'" />
        </view>
        <text class="service-value">商家承担</text>
      </view>

      <view class="summary-item">
        <text class="summary-label">运费</text>
        <text class="summary-value">{{
          orderInfo.shippingFee > 0
            ? "¥" + orderInfo.shippingFee.toFixed(2)
            : "包邮"
        }}</text>
      </view>

      <view class="guarantee-section" v-if="mainStore.user?.payCount == 0">
        <text class="guarantee-label">说明</text>
        <text class="guarantee-desc">&nbsp;</text>
        <view class="guarantee-badge-container">
          <image class="guarantee-badge" referrerpolicy="no-referrer" :src="PRODUCT_IMG_PATH + '78cbdd94b1a05e1.png'" />
          <text class="privilege-text">新用户特权</text>
        </view>
      </view>
      <view v-if="mainStore.user?.payCount == 0" class="guarantee-desc-2">
        <view class="guarantee-desc-item">支持14天无理由退货</view>
        <view class="guarantee-desc-item">若开封剩余量超50%，可获50%退款</view>
      </view>
      <view class="protection-section">
        <view class="protection-info" @click="openAssurancePopup">
          <view style="display: flex; align-items: center">
            <image class="protection-icon" referrerpolicy="no-referrer"
              :src="PRODUCT_IMG_PATH + '674451b981887ae139.png'" />
            <text class="protection-title">消费者权益保障</text>
          </view>
          <text class="protection-desc">正品保障｜放心买｜品质严保</text>
        </view>
      </view>

      <view class="total-section">
        <text class="total-label">合计金额：</text>
        <view class="total-amount">
          <text class="currency-symbol">¥</text>
          <text class="total-price">{{
            orderInfo.finalAmount.toFixed(2)
          }}</text>
        </view>
      </view>
    </view>

    <!-- 支付区域 -->
    <view class="payment-section">
      <!-- <view class="agreement-section">
        <view
          class="checkbox"
          :class="{ checked: paymentInfo.agreementAccepted }"
          @click="toggleAgreement"
        >
          <text v-if="paymentInfo.agreementAccepted">✓</text>
        </view>
        <text class="agree-text" @click="toggleAgreement">同意</text>
        <text class="agreement-text" @click.stop="viewAgreement">
          《HealthCoast营养严选用户协议》
        </text>
      </view> -->

      <view class="payment-info">
        <view class="payment-method">
          <view class="payment-desc">使用
            <image class="wechat-icon" referrerpolicy="no-referrer" :src="PRODUCT_IMG_PATH + '2d442be6907792e.png'" />
            微信支付
            <!-- ，大牌同款价格区间 -->
            <!-- <text class="price-range">¥600-¥3000</text> -->
          </view>
        </view>
        <view class="payment-actions">
          <view class="pay-button" :class="{ disabled: isUpdatingQuantity }" @click="confirmOrder">
            <text class="pay-text">立即支付&nbsp;&nbsp;¥&nbsp;{{
              isPaymentStarted
                ? frozenPaymentAmount.toFixed(2)
                : orderInfo.finalAmount.toFixed(2)
            }}</text>
          </view>

          <view class="delivery-info">
            <text class="delivery-text">近30天交付订单999+，100%准时发货</text>
          </view>
        </view>
      </view>
    </view>
	<!-- 优惠图片弹窗 -->
	<view v-if="showdiscountPic" class="campaign-overlay">
		<view class="assurance-card">
			<view class="campaign-close-btn" @click="showdiscountPic = false">
				<image style="width: 60rpx; height: 60rpx;" mode="widthFix" :src="COMMON_IMG_PATH + 'X.png'">
				</image>
			</view>
			<view>
				<image style="width: 100%;" mode="widthFix" :src="INDEX_IMG_PATH+'16e5824305b00c66ef313779e31f1477.png'"></image>
			</view>
		</view>
	</view>
	<view v-if="showTip" class="showtip-box">
		{{showtipText}}
	</view>
    <uv-popup ref="popup" mode="bottom" :custom-style="{ height: '90vh' }">
      <addressEdit ref="addressEditRef" v-model="addressForm" @close="closePopup" @save="onAddressSave" />
    </uv-popup>
    <!-- 赠品选择弹窗 -->
    <GiftSelectPopup :visible="giftSelectVisible" :giftList="giftProductList" :selectedGifts="selectedGifts"
      :multiple="false" @close="handleGiftPopupClose" @confirm="handleGiftSelect" />
    <!-- 调试：显示 cartIds -->
    <!-- {{ console.log('模板中的 currentCartIds:', currentCartIds) }} -->
    <coupon-popup :visible="couponVisible" :coupons="couponList" :cartIds="currentCartIds"
      :selectedCoupon="selectedCoupon" @close="handlePopupClose" @select="handleCouponSelect" />
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
        <text class="hc-agree-popup__link" @click="toAgreement()" style="color: #00cbcc">《HealthCoast营养严选用户协议》</text>
        <text>、</text>
        <text class="hc-agree-popup__link" @click="toPrivacy()" style="color: #00cbcc">《隐私政策》</text>
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

    <CustomToast ref="customToastRef" />
  </view>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch,unref } from "vue";
import { onLoad, onShow, onUnload, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH, INDEX_IMG_PATH } from "@/utils/imgpath";
import Header from "@/components/Header/index.vue";
import addressEdit from "@/components/addressEdit/addressEdit.vue";
import couponPopup from "@/components/couponPopup/couponPopup.vue";
import { useRouter } from "@/hooks/useRouter";
import { useSupplementStore } from "@/store/supplement";
import { useMainStore } from "@/store/modules/useMainStore";
import { getProductDetail } from "@/api/product";
import { getCartAdd, getCartNum, getCartList, deleteCartByIds, getCartClear } from "@/api/cart";
import { orderConfirm, orderCreate, getPlanOrderMinAmount, getPlanOrderMinCount } from "@/api/order";
import { getAddressList, getAddressAddAndEdit } from "@/api/address";
import { emitter } from "@/utils/emitter";
import AssurancePopup from "@/components/AssurancePopup/index.vue";
import CommonPopup from "@/components/CommonPopup/index.vue";
import GiftSelectPopup from "./components/index.vue";
import { useShare } from "@/hooks/useShare";
import { getNotice } from "@/api/user";
import CustomToast from "@/components/CustomToast/index.vue";
import { storeToRefs } from "pinia";
import { checkTheUser } from "@/api/auth";
const store = useSupplementStore();
const { push, toHome } = useRouter();
const mainStore = useMainStore()
const { user } = storeToRefs(mainStore);
import { orderPayment } from "@/utils/orderPayment";
const customToastRef = ref(null);
//优惠弹窗属性
const showdiscountPic = ref(false)
const showtipText = ref('')
const showTip = ref(false)
const isfirstshowTip = ref(true)
// 初始化分享功能
const { shareInfo, shareAppMessage, shareTimeline, shareH5, packageParameter,daikeShare } =
  useShare();

// 设置自定义分享内容
const setupCustomShare = () => {
  // 构建分享参数，包含购物车中所有商品的信息
  const products = productSpecs.value.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    uniqueId: item.uniqueId || "",
  }));

  // 将商品列表序列化为字符串
  const productsStr = encodeURIComponent(JSON.stringify(products));

  const invitationCode = unref(user) ? unref(user).invitationCode : "";
  console.log("======代客分享=======================invitationCode", invitationCode);

  const shareData = {
    // 购物车商品列表信息（序列化后的字符串）
    products: productsStr,
    // 价格信息
    totalPrice: totalPrice.value,
    // 页面标识，用于区分分享类型（分享链接会禁用数量控制）
    type: "confirmOrder",
	code: invitationCode
  };

  // 设置分享标题和图片
  const productCount = productSpecs.value.length;
  shareInfo.value.title = `HealthCoast健康方案确认订单(${productCount}件商品)`;
  shareInfo.value.imageUrl =
    productSpecs.value[0]?.image || uni.getStorageSync("commonImageUrl") || "";

  // 设置分享路径，直接跳转到确认订单页面
  const shareQuery = packageParameter("co", shareData);
  shareInfo.value.path = "/pages/orderList/confirmOrder";
  shareInfo.value.query = shareQuery;
  shareInfo.value.pathQuery = `${shareInfo.value.path}?${shareQuery}`;

  console.log("[分享] 设置确认订单分享内容:", shareInfo.value);
  console.log("[分享] 分享的商品数据:", products);
};

// 微信小程序分享给好友
onShareAppMessage(() => {
  setupCustomShare();
  return {
    title: shareInfo.value.title,
    path: shareInfo.value.pathQuery,
    imageUrl: shareInfo.value.imageUrl,
  };
});

// 微信小程序分享到朋友圈
onShareTimeline(() => {
  setupCustomShare();
  return {
    title: shareInfo.value.title,
    path: shareInfo.value.pathQuery,
    imageUrl: shareInfo.value.imageUrl,
  };
});

// 冻结的支付金额（到达支付步骤后不再更新）
const frozenPaymentAmount = ref(0.0);
// 产品规格数据
const productSpecs = ref([]);
// 是否已进入支付流程
const isPaymentStarted = ref(false);
// 防抖定时器
let updateCartTimer = null;
// 数量更新中的状态
const isUpdatingQuantity = ref(false);
// 页面标签，用于控制UI显示
const pageTag = ref("");
// 新老用户标识：0=新用户，1=老用户
const isNew = ref("0");
// 是否显示调整方案按钮：0=显示，1=不显示
const isup = ref("1");
//健康方案那边传过来的问卷报告id 大于0 才表示从健康方案那边过来的
const rpid = ref(0);

// 是否通过分享链接进入：true=分享链接进入，需要禁用数量控制
const isFromShare = ref(false);
const assurancePopupRef = ref(null);
const tariffPopupVisible = ref(false);
const tariffPopupText = ref("");
const agreementPopupVisible = ref(false);
//优惠券列表
const couponList = ref([]);
// 弹窗显示状态
const couponVisible = ref(false);

const orignData = ref({});
// 选中的优惠券
const selectedCoupon = ref(null);
// 页面参数存储
const pageParams = ref({});
// 总价相关变量
const totalPrice = ref("0");
// 加载状态管理
const isLoading = ref(false);
// 弹窗与地址编辑
const popup = ref();
const addressEditRef = ref();

// 是否从健康方案页过来
const isPlan = ref(false);
// 收货地址信息
const shippingAddress = reactive({
  id: "",
  name: "请选择收货地址",
  phone: "",
  address: "",
  isDefault: false,
});
// 订单基本信息
const orderInfo = reactive({
  orderId: "",
  totalAmount: 0.0,
  discountAmount: 0,
  shippingFee: 0,
  finalAmount: 0.0,
  randomInst: 0,
  couponId: 0,
  priceGroup: {}
});
// 健康方案信息
const healthPlan = reactive({
  title: "",
  description: "根据您的健康状况定制",
  canAdjust: true,
  products: [],
});
// 存储从商品详情获取的uniqueId信息
const productUniqueIds = ref(new Map()); // 用于存储商品ID到uniqueId的映射
// 补剂徽章数据 - 根据选中的产品动态生成
const supplementBadges = computed(() => {
  if (!productSpecs.value || productSpecs.value.length === 0) {
    return [];
  }

  return productSpecs.value.map((product) => ({
    text: `x${product.quantity || 1}`,
    img: product.image || PRODUCT_IMG_PATH + "6f7f8080eff8.png",
  }));
});

// 产品列表折叠状态
const isProductListCollapsed = ref(false);

// 切换产品列表的折叠/展开状态
const toggleProductListCollapse = () => {
  isProductListCollapsed.value = !isProductListCollapsed.value;
};
// 左滑操作按钮（右侧）
const swipeRightOptions = [
  {
    icon: "trash",
    style: {
      backgroundColor: "#FF3B30",
      color: "#ffffff",
      fontSize: "14px",
      borderRadius: "4px",
      height: "32px",
      width: "32px",
    },
  },
];
// 赠品信息
const giftProductList = ref([]); // 可选赠品列表（转换后用于显示）
const giftSelectVisible = ref(false); // 赠品选择弹窗显示状态
const selectedGifts = ref([]); // 已选赠品列表（转换后）
const selectedOriginalGifts = ref([]); // 已选赠品列表（原始数据用于提交）
const originalGiftList = ref([]); // 原始API返回的赠品列表
// 支付相关
const paymentInfo = reactive({
  method: "wechat",
  agreementAccepted: false,
  agreementText: "《HealthCoast营养严选用户协议》",
});
// 页面状态
const pageState = reactive({
  isInitialized: false, // 页面是否已初始化
  batchAddInProgress: false, // 批量添加是否正在进行
});

// 当前购物车ID列表（用于优惠券查询）
const currentCartIds = computed(() => {
  // 优先使用 orderInfo.cartIds
  if (orderInfo.cartIds) {
    console.log("从 orderInfo.cartIds 获取:", orderInfo.cartIds);
    return orderInfo.cartIds;
  }

  // 其次从 productSpecs 中提取
  if (productSpecs.value && productSpecs.value.length > 0) {
    const cartIds = productSpecs.value
      .filter((item) => item.cartId || item.id)
      .map((item) => item.cartId || item.id)
      .join(",");
    console.log("从 productSpecs 提取 cartIds:", cartIds);
    return cartIds;
  }

  console.log("没有可用的 cartIds");
  return "";
});

const isFromHealthPage = computed(() => {
  return pageTag.value == '1';
})

// 所有礼品平铺列表（用于小计和预览显示）
const allGifts = computed(() => {
  if (!giftProductList.value || giftProductList.value.length === 0) return [];
  // 判断是否为分组数据
  if (giftProductList.value[0].list && Array.isArray(giftProductList.value[0].list)) {
    return giftProductList.value.reduce((acc, group) => {
      return acc.concat(group.list || []);
    }, []);
  }
  return giftProductList.value;
});

// 显示赠品选择弹窗
const showGiftSelectPopup = () => {
  console.log('打开赠品选择弹窗，可选赠品:', giftProductList.value);
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
    cityId: undefined,
  },
});
const openAssurancePopup = () => {
  assurancePopupRef.value?.open?.();
};
const showTariffPopup = async () => {
  const data = await getNotice(41)
  tariffPopupText.value = data.content;
  tariffPopupVisible.value = true;
};
const handleAgreementConfirm = () => {
  paymentInfo.agreementAccepted = true;
  agreementPopupVisible.value = false;
  confirmOrder();
};
const handleAgreementCancel = () => {
  agreementPopupVisible.value = false;
};
const toAgreement = () => {
  push({ url: "/pages/webview/news" }, { data: { id: 17 } });
};
const toPrivacy = () => {
  uni.navigateTo({
    url: "/views/evaluation/startup/agreement",
  });
};
const goBack = () => {
  uni.navigateBack();
  store.setConfirmList([]);
};
const closePopup = () => {
  popup.value?.close();
};
// 关闭弹窗
const handlePopupClose = () => {
  console.log("关闭优惠券弹窗");
  couponVisible.value = false;
};
// 显示优惠券弹窗
const showCouponPopup = () => {
  console.log("=== 点击了优惠券区域 ===");
  console.log("orderInfo.cartIds:", orderInfo.cartIds);
  console.log("productSpecs.value:", productSpecs.value);
  console.log("currentCartIds.value:", currentCartIds.value);
  console.log("======================");
  couponVisible.value = true;

};
// 选择优惠券
const handleCouponSelect = async (coupon, index) => {
  if (!coupon || coupon === -1) {
    // 不使用优惠券
    selectedCoupon.value = { detailId: -1 };
    console.log("取消使用优惠券");
    // 重新计算价格
    await updateTotalAmount();
    return;
  }

  selectedCoupon.value = coupon;
  console.log("选择的优惠券:", coupon);

  // 选择优惠券后重新计算价格
  await updateTotalAmount();
};
// 处理左滑操作点击（删除）
const onSwipeActionClick = async ({ index, name }) => {
  const minCount = await getPlanOrderMinCount();
  if (isPlan.value && minCount !== 0 && productSpecs.value.length <= minCount) {
    customToastRef.value.show({
      title: `组合方案建议至少选取${minCount}款产品\n协同增效，收效更佳哦`,
    });
    return;
  }
  // index 为按钮索引，这里只有一个“删除”按钮；name 为我们绑定的商品索引
  const itemIndex = typeof name === "number" ? name : parseInt(name);
  if (isNaN(itemIndex)) return;
  const item = productSpecs.value[itemIndex];
  if (!item) return;

  try {
    // 二次确认
    const confirmRes = await new Promise((resolve) => {
      uni.showModal({
        title: "删除商品",
        content: `确定删除「${item.name}」吗？`,
        success: resolve,
      });
    });
    if (!confirmRes?.confirm) return;

    uni.showLoading({ title: "删除中..." });

    // 调用删除购物车接口（若存在 cartId）
    if (item.cartId) {
      try {
        await deleteCartByIds({ ids: [item.cartId], cartType: 1 });
      } catch (apiErr) {
        console.warn("删除购物车项失败，进行本地移除：", apiErr);
      }
    }

    // 本地移除列表项
    productSpecs.value.splice(itemIndex, 1);

    // 重新计算并保存 cartIds
    orderInfo.cartIds = productSpecs.value
      .filter((p) => p.cartId)
      .map((p) => p.cartId)
      .join(",");

    uni.hideLoading();
    uni.showToast({ title: "已删除", icon: "success" });

    // 刷新购物车列表与价格
    await fetchCartList();
    await updateTotalAmount();
  } catch (err) {
    uni.hideLoading();
    uni.showToast({ title: "删除失败", icon: "none" });
    console.error("删除商品失败:", err);
  }
};
// 验证地址数据
const validateAddress = (address) => {
  const errors = [];

  if (!address) {
    errors.push("地址信息不能为空");
    return errors;
  }

  if (!address.realName || address.realName.trim() === "") {
    errors.push("收货人姓名不能为空");
  } else if (address.realName.length > 20) {
    errors.push("收货人姓名不能超过20个字符");
  }

  if (!address.phone || address.phone.trim() === "") {
    errors.push("手机号码不能为空");
  } else {
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(address.phone)) {
      errors.push("请输入正确的手机号码");
    }
  }

  if (!address.detail || address.detail.trim() === "") {
    errors.push("详细地址不能为空");
  } else if (address.detail.length > 100) {
    errors.push("详细地址不能超过100个字符");
  }

  // 验证省市区信息
  if (address.address) {
    if (!address.address.province) {
      errors.push("请选择省份");
    }
    if (!address.address.city) {
      errors.push("请选择城市");
    }
    if (!address.address.district) {
      errors.push("请选择区县");
    }
  }

  return errors;
};
// 选择收货地址
const selectAddress = () => {
  push?.(
    { url: "/pages/address/address" },
    {
      data: {
        type: "select",
      },
    }
  );
};

// 监听地址选择事件
onMounted(() => {
  emitter.on("selectAddress", (address) => {
    try {
      if (!address) return;
      updateShippingAddress(address);
      console.log("选择的地址（已更新）:", shippingAddress);
    } catch (err) {
      console.error("selectAddress 回调异常:", err, address);
    }
  });
});

// 组件卸载时移除事件监听并清理定时器
onUnmounted(() => {
  emitter.off("selectAddress");
  // 清理防抖定时器
  if (updateCartTimer) {
    clearTimeout(updateCartTimer);
    updateCartTimer = null;
  }
});

// 获取地址列表
const fetchAddressList = async () => {
  try {
    const res = await getAddressList({});
    console.log("获取地址列表返回数据:", res);

    // 检查返回的数据结构
    let addressList = [];
    if (res && res.list && Array.isArray(res.list)) {
      addressList = res.list;
    } else if (res && Array.isArray(res)) {
      addressList = res;
    }

    if (addressList.length > 0) {
      // 找到默认地址
      const defaultAddress = addressList.find((addr) => addr.isDefault === 1);
      if (defaultAddress) {
        updateShippingAddress(defaultAddress);
      } else {
        // 如果没有默认地址，使用第一个地址
        updateShippingAddress(addressList[0]);
      }
    } else {
      // 如果没有地址，重置地址信息并更新价格
      shippingAddress.id = "";
      shippingAddress.name = "请选择收货地址";
      shippingAddress.phone = "";
      shippingAddress.address = "";
      shippingAddress.isDefault = false;
      console.log("没有可用地址，使用默认参数更新订单");
      updateTotalAmount();
    }
  } catch (error) {
    console.error("获取地址列表失败:", error);
    uni.showToast({
      title: "获取地址列表失败",
      icon: "none",
    });
  }
};

// 更新收货地址信息
const updateShippingAddress = (address) => {
  if (!address) {
    console.warn("地址信息为空");
    return;
  }

  shippingAddress.id = address?.id || "";
  shippingAddress.name = address?.realName || "";
  shippingAddress.phone = address?.phone || "";

  // 组合完整地址（支持平铺或嵌套在 address 下的结构，并过滤无效字符串）
  const province = address?.province ?? address?.address?.province;
  const city = address?.city ?? address?.address?.city;
  const district = address?.district ?? address?.address?.district;
  const fullAddress = [province, city, district, address?.detail]
    .filter((v) => v && v !== "undefined" && v !== "null")
    .join(" ");

  shippingAddress.address = fullAddress;
  shippingAddress.isDefault = !!(address?.isDefault === 1);

  console.log("更新收货地址:", shippingAddress);

  // 获取当前购物车ID列表
  const currentCartIds = productSpecs.value
    .filter((item) => item.cartId)
    .map((item) => item.cartId)
    .join(",");

  // 如果有购物车ID，尝试更新订单信息
  if (currentCartIds) {
    // 如果地址ID为空，尝试重新获取地址列表
    if (!address?.id) {
      console.warn("地址ID为空，尝试重新获取地址列表");
      fetchAddressList()
        .then(() => {
          // 重新获取地址列表后，使用默认地址ID更新订单
          // if (shippingAddress.id) {
          console.log("使用默认地址ID更新订单:", shippingAddress.id);
          updateTotalAmount();
          // }
        })
        .catch((err) => {
          console.error("重新获取地址列表失败:", err);
        });
    } else {
      // 直接使用当前地址ID更新订单
      console.log("使用当前地址ID更新订单:", address.id);
      updateTotalAmount();
    }
  }
};

// 保存地址
const onAddressSave = async (form) => {
  try {
    // 验证表单数据
    const validationErrors = validateAddress(form);
    if (validationErrors.length > 0) {
      uni.showToast({
        title: validationErrors[0],
        icon: "none",
      });
      return;
    }

    // 保存地址到服务器
    const addressData = {
      ...form,
      postCode: undefined,
    };

    console.log("保存地址数据:", addressData);

    let savedAddress;
    if (form.id) {
      // 编辑现有地址
      console.log("编辑现有地址，ID:", form.id);
      savedAddress = await getAddressAddAndEdit(addressData);
    } else {
      // 添加新地址
      console.log("添加新地址");
      savedAddress = await getAddressAddAndEdit(addressData);
    }

    console.log("地址保存成功，返回数据:", savedAddress);

    // 更新界面显示的地址
    updateShippingAddress(savedAddress || form);

    uni.showToast({
      title: "地址保存成功",
      icon: "success",
    });

    closePopup();

    // 检查保存的地址是否有有效的ID
    if (!savedAddress?.id) {
      console.warn("保存的地址ID为空，尝试重新获取地址列表");
      try {
        // 重新获取地址列表以确保数据同步
        await fetchAddressList();

        // 获取当前购物车ID列表
        const currentCartIds = productSpecs.value
          .filter((item) => item.cartId)
          .map((item) => item.cartId)
          .join(",");

        // 如果有购物车ID且有地址ID，更新订单信息
        if (currentCartIds && shippingAddress.id) {
          console.log("使用重新获取的地址ID更新订单:", shippingAddress.id);
          await updateTotalAmount();
        }
      } catch (error) {
        console.error("重新获取地址列表或更新订单失败:", error);
      }
    } else {
      // 重新获取地址列表以确保数据同步
      await fetchAddressList();
    }
  } catch (error) {
    console.error("保存地址失败:", error);
    uni.showToast({
      title: error.message || "保存地址失败",
      icon: "none",
    });
  }
};

// 确认订单
const confirmOrder = async () => {
  if (isLoading.value) return;

  // 检查是否正在更新数量
  if (isUpdatingQuantity.value) {
    uni.showToast({
      title: "价格更新中，请稍候",
      icon: "none",
    });
    return;
  }

  if (isPlan.value) {
    const minCount = await getPlanOrderMinCount();
    if (minCount !== 0 && productSpecs.value.length < minCount) {
      customToastRef.value.show({
        title: `组合方案建议至少选取${minCount}款产品\n协同增效，收效更佳哦`,
      });
      return;
    }

    const minAmount = await getPlanOrderMinAmount();
    if (minAmount !== 0 && orderInfo.finalAmount < minAmount) {
      customToastRef.value.show({
        title: `组合方案满${minAmount}元起购\n协同增效，收效更佳哦`,
      });
      return;
    }
  }

  // 在点击立即支付时冻结当前金额，标记进入支付流程
  if (!isPaymentStarted.value) {
    isPaymentStarted.value = true;
    frozenPaymentAmount.value = orderInfo.finalAmount;
    console.log("点击立即支付，冻结当前金额:", frozenPaymentAmount.value);
  }

  if (!shippingAddress.id) {
    uni.showToast({
      title: "请选择收货地址",
      icon: "none",
    });
    return;
  }
  // if (!paymentInfo.agreementAccepted) {
  //   agreementPopupVisible.value = true;
  //   return;
  // }

  isLoading.value = true;

  try {
    // 显示加载提示
    uni.showLoading({
      title: "处理中...",
      mask: true,
    });

    // 检查是否有可用的 cartId
    let availableCartId = null;

    // 1. 优先从 productSpecs 中获取已有的 cartId（购物车跳转场景）
    if (productSpecs.value && productSpecs.value.length > 0) {
      const cartIds = productSpecs.value
        .filter((item) => item.cartId)
        .map((item) => item.cartId)
        .join(",");

      if (cartIds) {
        availableCartId = cartIds;
        console.log("从购物车数据中获取的cartIds:", availableCartId);
      }
    }

    // 2. 如果没有 cartId，则需要添加到购物车（商品详情跳转场景）
    if (!availableCartId) {
      console.log("未找到现有cartId，执行添加购物车操作");
      const cartResult = await addToCart();
      if (!cartResult) {
        throw new Error("添加购物车失败");
      }
      availableCartId = cartResult.cartId;
    }

    // 3. 确认订单
    const confirmResult = await confirmOrderApi(
      availableCartId,
      shippingAddress.id || 0
    );
    console.log("订单确认结果:", confirmResult);
    if (!confirmResult) {
      throw new Error("订单确认失败");
    }


    // 显示加载提示
    uni.showLoading({
      title: "处理中...",
      mask: true,
    });

    // 4. 创建订单
    const createResult = await createOrder(confirmResult.orderKey);
    if (!createResult) {
      throw new Error("订单创建失败");
    }

    const key = createResult.result.key || createResult.result.orderId;

    await orderPayment(key, {
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
  } catch (error) {
    console.error("订单处理失败:", error);
    // 重置支付状态，允许用户重新支付
    isPaymentStarted.value = false;
    frozenPaymentAmount.value = 0.0;
    uni.showToast({
      title: error.message || "订单处理失败",
      icon: "none",
      duration: 2000,
    });
  } finally {
    isLoading.value = false;
    uni.hideLoading();
  }
};
// 防抖更新购物车数量和订单确认（1秒后执行）
const debouncedUpdateCartAndOrder = (
  cartId,
  newQuantity,
  oldQuantity,
  index
) => {
  // 清除之前的定时器
  if (updateCartTimer) {
    clearTimeout(updateCartTimer);
  }

  // 标记为更新中
  isUpdatingQuantity.value = true;

  // 设置新的定时器
  updateCartTimer = setTimeout(async () => {
    if (!cartId) {
      isUpdatingQuantity.value = false;
      return;
    }

    try {
      console.log("[防抖] 500毫秒秒后执行购物车数量更新，数量:", newQuantity);

      // 1. 先更新购物车数量
      await getCartNum({
        id: cartId,
        number: newQuantity,
      });
      console.log("[防抖] 购物车数量更新成功");

      // 2. 再更新订单确认（获取最新价格）
      await updateTotalAmount();
      console.log("[防抖] 订单确认成功，价格已更新");
    } catch (error) {
      console.error("[防抖] 更新失败:", error);

      // 恢复原来的数量
      const item = productSpecs.value[index];
      if (item) {
        item.quantity = oldQuantity;
      }

      // 根据错误类型显示不同提示
      if (
        error.code === 1008007005 ||
        (error.msg && error.msg.includes("请提交购买的商品"))
      ) {
        console.log("[防抖] 购物车商品异常，恢复原数量并提示");
        uni.showToast({
          title: error.msg || "购物车数据异常",
          icon: "none",
          duration: 2000,
        });
      } else if (
        error.code === 1008006002 ||
        (error.msg && error.msg.includes("库存不足"))
      ) {
        console.log("[防抖] 库存不足，恢复原数量:", oldQuantity);
        uni.showToast({
          title: error.msg || "库存不足",
          icon: "none",
        });
      } else {
        console.log("[防抖] 其他错误，恢复原数量:", oldQuantity);
        uni.showToast({
          title: error.msg || "更新失败，请重试",
          icon: "none",
        });
      }
    } finally {
      // 更新完成，解除锁定
      isUpdatingQuantity.value = false;
    }
  }, 500); // 500毫秒延迟
};

// 调整商品数量
const adjustQuantity = async (type, index) => {
  console.log("adjustQuantity 被调用:", type, index);
  // selectedCoupon.value = { detailId: -1 };
  selectedCoupon.value = null;
  // 如果是通过分享链接进入，禁止调整数量
  if (isFromShare.value) {
    console.log("【分享】分享链接进入，禁止调整数量");
    uni.showToast({
      title: "分享订单不可修改数量",
      icon: "none",
    });
    return;
  }

  // 如果正在更新数量，则禁止操作
  if (isUpdatingQuantity.value) {
    console.log("【DEBUG】正在更新中，操作被阻止");
    return;
  }

  if (index < 0 || index >= productSpecs.value.length) {
    console.log("索引无效:", index, productSpecs.value.length);
    return;
  }

  const item = productSpecs.value[index];
  console.log("调整前商品信息:", item);

  // 保存旧数量
  const oldQuantity = item.quantity;

  // 获取最小购买数量：tag=1时使用起售数量，否则最低1件
  const minQuantity = pageTag.value === "1" ? item.onSale || 1 : 1;
  console.log(
    `商品 ${item?.id} 的最小购买数量:`,
    minQuantity,
    `(tag=${pageTag.value}, 起售量=${item.onSale || 1})`
  );

  if (type === "increase") {
    item.quantity += 1;
  } else if (type === "decrease") {
    // 数量不能低于最小购买数量
    if (item.quantity > minQuantity) {
      item.quantity -= 1;
    } else {
      // 已经是最低数量，无法继续减少
      uni.showToast({
        title: `最低不能低于 ${minQuantity} 件`,
        icon: "none",
      });
      console.log(`商品 ${item?.id} 已是最低数量 ${minQuantity}，不能继续减少`);
      return;
    }
  }

  console.log("调整后数量:", item.quantity);

  // 获取购物车ID
  const cartId = item.cartId || "";

  if (!cartId) {
    console.log("无购物车ID，无法更新");
    uni.showToast({
      title: "商品信息异常",
      icon: "none",
    });
    // 恢复数量
    item.quantity = oldQuantity;
    return;
  }

  // 使用防抖函数延迟更新购物车和订单
  debouncedUpdateCartAndOrder(cartId, item.quantity, oldQuantity, index);
};

// 同步购物车信息到商品列表
const syncProductSpecsWithCartInfo = (cartInfo) => {
  if (!cartInfo || !Array.isArray(cartInfo)) return;
  console.log("syncProductSpecsWithCartInfo 同步商品信息:", cartInfo);

  // 创建现有商品的映射，用于保留状态（如onSale, originalData）
  const existingItemsMap = new Map();
  if (productSpecs.value && productSpecs.value.length > 0) {
    productSpecs.value.forEach((item) => {
      // 优先使用cartId作为键
      if (item.cartId) {
        existingItemsMap.set(String(item.cartId), item);
      }
      // 同时使用 productId_uniqueId 作为备用键
      const key = `${item.productId || item.id}_${item.uniqueId || ""}`;
      existingItemsMap.set(key, item);
    });
  }

  // 更新商品列表
  productSpecs.value = cartInfo.map((item) => {
    const productId = item.productId || item.productInfo?.id || item.id;

    // 获取uniqueId
    let uniqueId = "";
    if (productId && productUniqueIds.value.has(productId)) {
      uniqueId = productUniqueIds.value.get(productId);
    } else {
      uniqueId = item.productInfo?.attrInfo?.unique || item.unique || "";
    }

    const cartId = item.id || item.cartId || "";

    // 尝试查找现有商品以保留状态
    let existingItem = null;
    if (cartId) {
      existingItem = existingItemsMap.get(String(cartId));
    }
    if (!existingItem) {
      const key = `${productId}_${uniqueId}`;
      existingItem = existingItemsMap.get(key);
    }

    const price = parseFloat(item.truePrice || item.productInfo?.price || 0);

    return {
      // 保留现有属性
      ...(existingItem || {}),
      // 更新核心属性
      id: item.productInfo?.id || item.id,
      productId: productId,
      name: item.productInfo?.storeName || item.productInfo?.productName || "商品",
      quantity: item.cartNum || 1,
      unitPrice: price,
      monthlyPrice: price,
      color: "#7a7a7a",
      priceColor: "#000000",
      image: item.productInfo?.image || PRODUCT_IMG_PATH + "465a3d2aca2d64946d747b820c12df53.png",
      uniqueId: uniqueId,
      cartId: cartId,
      specUnit: item.productInfo?.specUnit || "",
      // 确保重要状态字段存在
      onSale: existingItem?.onSale || 1,
      originalData: existingItem?.originalData || {}
    };
  });
  console.log("同步完成，最新productSpecs:", productSpecs.value);
};

// 更新总金额 - 从服务端获取价格而不是本地计算
const updateTotalAmount = async () => {
  console.log("updateTotalAmount 被调用，将调用接口获取最新价格");

  // 如果已经进入支付流程，不再更新价格
  if (isPaymentStarted.value) {
    console.log("已进入支付流程，不更新价格");
    return;
  }

  // 收集所有 cartId
  const cartIds = productSpecs.value
    .filter((item) => item.cartId)
    .map((item) => item.cartId)
    .join(",");

  if (!cartIds) {
    console.log("没有可用的cartId，无法更新价格");
    return;
  }

  // 如果没有地址，也无法调用接口
  try {
    let isApp = 0;
    if (pageTag.value == '1') {
      isApp = 1;
    }
    // 调用订单确认接口获取最新价格
    const confirmParams = {
      orderType: 1,
      useIntegral: 0,
      cartId: cartIds,
      addressId: shippingAddress.id || 0,
      shippingType: 1,
      isApp: isApp
    };
    let tag1 = 0;
    // 如果选择了优惠券，添加优惠券ID
    if (selectedCoupon.value && selectedCoupon.value.detailId) {
      confirmParams.couponId = selectedCoupon.value.detailId;
      console.log("使用优惠券ID:", selectedCoupon.value.detailId);
      if (selectedCoupon.value.detailId > 0) {
        tag1 = 1;
      }
    }

    const confirmRes = await orderConfirm(confirmParams);

    if (confirmRes && confirmRes.priceGroup) {
      // 从接口返回的 priceGroup 中获取价格
      const priceGroup = confirmRes.priceGroup;
      orderInfo.priceGroup = priceGroup;
      // 更新订单信息
      orderInfo.totalAmount = priceGroup.costPrice || 0; // 商品原价
      orderInfo.discountAmount = priceGroup.couponPrice || 0; // 优惠金额
      orderInfo.shippingFee = priceGroup.storePostage || 0; // 运费
      orderInfo.finalAmount = priceGroup.totalPrice || 0; // 最终支付金额
      orderInfo.couponId = priceGroup.couponId; //优惠券id
      orderInfo.randomInst = priceGroup.randomInst || 0;//随机立减
      if (tag1 == 1 && priceGroup.isCoupon == 0) {
        //表示 随机立减和优惠券不能同时使用，需要提示
        uni.showToast({
          title: "优惠券与活动不能同享",
          icon: "none",
          duration: 2000
        });
      }
      // 更新小计显示
      totalPrice.value = (priceGroup.costPrice || 0).toFixed(2);

      console.log("从接口获取的价格信息:", {
        商品原价: orderInfo.totalAmount,
        优惠金额: orderInfo.discountAmount,
        运费: orderInfo.shippingFee,
        最终金额: orderInfo.finalAmount,
        随机立减金额: orderInfo.randomInst,
      });
      // 更新赠品列表
      const gifts = confirmRes.pmapList
      if (gifts && Array.isArray(gifts)) {
        // 保存原始数据
        originalGiftList.value = gifts;
        // 转换数据用于显示
        giftProductList.value = transformGiftData(gifts, true);
        console.log("获取赠品列表:", gifts);
        console.log("转换后的赠品列表:", giftProductList.value);
      }
      // 更新购物车信息和商品列表（同步最新价格）
      if (confirmRes.cartInfo && confirmRes.cartInfo.length > 0) {
        syncProductSpecsWithCartInfo(confirmRes.cartInfo);
      }
    }
  } catch (error) {
    console.error("更新价格失败:", error);
  }
};
//侦听活动优惠变化
watch(
	() => orderInfo.randomInst,
		(newVal, oldVal) => {
		if(oldVal==0&&newVal>0&&isfirstshowTip.value){
			showdiscountPic.value = true
			isfirstshowTip.value = false
		}else if(newVal!==oldVal){
			showtipText.value = '订单已调整，请关注最新优惠哦'
			showTip.value = true
			setTimeout(()=>{
				showTip.value = false
			},2000)
		}
	}
)
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
// 调整补剂方案
const adjustPlan = () => {
  if (!healthPlan.canAdjust) {
    uni.showToast({
      title: "当前方案不可调整",
      icon: "none",
    });
    return;
  }
  // 重置优惠券
  selectedCoupon.value = null;
  const confirmList = JSON.parse(orignData.value);
  store.setConfirmList(confirmList);
  console.log(confirmList, "-----------------------");
  uni.navigateTo({
    url: "/pages/product/replenish",
  });
};

// 切换协议同意状态
const toggleAgreement = () => {
  paymentInfo.agreementAccepted = !paymentInfo.agreementAccepted;
};

// 查看用户协议
const viewAgreement = () => {
  push(
    {
      url: "/pages/webview/news",
    },
    {
      data: {
        id: 17,
      },
    }
  );
};

// 获取购物车数量
// 规则：数量最少为1
const getMinCartNum = (product) => {
  // 获取当前数量，如果 null 则使用 1
  let currentQuantity = product?.quantity || 1;

  // 确保当前数量不小于1
  if (currentQuantity < 1) {
    currentQuantity = 1;
    console.log(
      `商品 ${product?.id} 的数量 ${product?.quantity} 小于1，已调整为1`
    );
  }

  return currentQuantity;
};

// 添加到购物车
const addToCart = async () => {
  try {
    // 从产品规格中获取第一个商品的信息
    const product = productSpecs.value[0];
    if (!product || !product.id) {
      throw new Error("商品信息不完整");
    }

    // 构建购物车参数
    const cartParams = {
      new: 1,
      orderType: 1,
      productId: product.id,
      uniqueId: product.uniqueId || "", // 如果有规格，需要传递uniqueId
      cartNum: getMinCartNum(product),
      cartType: 1,
    };

    console.log("添加购物车参数:", cartParams);

    // 调用添加购物车API
    const cartRes = await getCartAdd(cartParams);
    console.log("添加购物车成功:", cartRes);

    if (!cartRes || !cartRes.cartId) {
      throw new Error("购物车返回数据异常");
    }

    return cartRes;
  } catch (error) {
    console.error("添加购物车失败:", error);
    throw error; // 重新抛出错误，让上层处理
  }
};

// 批量添加商品到购物车
const batchAddToCart = async () => {
  // 防止重复执行
  if (pageState.batchAddInProgress) {
    console.log("batchAddToCart 正在执行中，跳过重复调用");
    return;
  }
  pageState.batchAddInProgress = true;
  console.log("开始执行 batchAddToCart");

  try {
    // 检查并合并 supplementStore 的新数据
    if (store.confirmList && store.confirmList.length > 0) {
      console.log("检查 supplementStore.confirmList 数据:", store.confirmList);

      // 将 supplementStore.confirmList 数据转换为 productSpecs 格式
      const convertedSpecs = store.confirmList
        .map((item) => {
          const storeInfo = item?.storeInfo || {};

          // 详细调试item的数据结构
          console.log(`商品${storeInfo.id}的完整数据:`, item);
          console.log(`商品${storeInfo.id}的productValue:`, item.productValue);

          // 从productValue中获取真正的uniqueId（与handleGetDetail逻辑保持一致）
          let uniqueId = "";

          if (item.productValue && Object.keys(item.productValue).length > 0) {
            console.log(
              `商品${storeInfo.id}的productValue:`,
              item.productValue
            );

            // 获取所有SKU的key
            const skuKeys = Object.keys(item.productValue);
            console.log(`商品${storeInfo.id}可用的SKU keys:`, skuKeys);

            // 选择第一个有库存的SKU作为默认SKU
            for (const skuKey of skuKeys) {
              const sku = item.productValue[skuKey];
              if (sku && sku.unique) {
                const trueStock =
                  sku.campaignState === 1 ? sku.campaignStock : sku.stock;
                if (trueStock > 0) {
                  uniqueId = sku.unique;
                  console.log(
                    `商品${storeInfo.id}从有库存的SKU获取uniqueId: ${uniqueId}`
                  );
                  break;
                }
              }
            }

            // 如果没有找到有库存的SKU，使用第一个SKU
            if (!uniqueId && skuKeys.length > 0) {
              const firstSku = item.productValue[skuKeys[0]];
              if (firstSku && firstSku.unique) {
                uniqueId = firstSku.unique;
                console.log(
                  `商品${storeInfo.id}从第一个SKU获取uniqueId: ${uniqueId}`
                );
              }
            }
          }

          // 备用方法：从productAttr中获取
          if (
            !uniqueId &&
            Array.isArray(item.productAttr) &&
            item.productAttr.length > 0
          ) {
            console.log(
              `商品${storeInfo.id}的productAttr数组内容:`,
              item.productAttr
            );
            const attrWithUnique = item.productAttr.find(
              (attr) => attr && attr.unique
            );
            if (attrWithUnique) {
              uniqueId = attrWithUnique.unique;
              console.log(
                `商品${storeInfo.id}从productAttr获取uniqueId: ${uniqueId}`
              );
            }
          }

          // 最后的备用方法：从item的直接字段获取
          if (!uniqueId) {
            uniqueId = item.unique || item.productAttrUnique || "";
            if (uniqueId) {
              console.log(
                `商品${storeInfo.id}从item直接字段获取uniqueId: ${uniqueId}`
              );
            }
          }

          // 如果还是没有找到，生成默认值
          if (!uniqueId) {
            uniqueId = `default_${storeInfo.id}`;
            console.log(`商品${storeInfo.id}生成默认uniqueId: ${uniqueId}`);
          }

          console.log(`商品${storeInfo.id}的最终uniqueId: ${uniqueId}`);

          // 获取起售数量（从storeInfo中获取）
          let onSale = storeInfo.onSale || 1;
          if (isFromHealthPage.value) {
            // 健康页跳转过来有限取健康起售数
            onSale = storeInfo.lzNum || onSale;
          }
          console.log(`商品${storeInfo.id}的起售数量:`, onSale);

          return {
            id: storeInfo.id, // 商品ID，用于 getCartAdd 的 productId
            productId: storeInfo.id, // 明确添加 productId 字段
            uniqueId: uniqueId, // 使用真正的uniqueId
            name: storeInfo.storeName || storeInfo.productName,
            price: parseFloat(storeInfo.price || 0), // 确保价格为数字
            quantity: parseInt(item.quantity || item.num || 1), // 确保数量为整数，用于 getCartAdd 的 cartNum
            image: storeInfo.image,
            onSale: onSale, // 存储起售数量
            specUnit: storeInfo.specUnit || "",
            productAttr: Array.isArray(item.productAttr)
              ? item.productAttr
              : [],
            // 保留原始数据用于调试
            originalData: item,
          };
        })
        .filter((item) => item.id); // 过滤掉没有商品ID的项

      // 合并现有的 productSpecs 和新转换的数据，避免重复
      const existingProductKeys = new Set();
      if (productSpecs.value && productSpecs.value.length > 0) {
        productSpecs.value.forEach((item) => {
          const key = `${item.productId || item.id}_${item.uniqueId || ""}`;
          existingProductKeys.add(key);
        });
      }

      // 过滤出不重复的新商品
      const newSpecs = convertedSpecs.filter((item) => {
        const key = `${item.productId || item.id}_${item.uniqueId || ""}`;
        return !existingProductKeys.has(key);
      });

      // 合并数据
      if (newSpecs.length > 0) {
        productSpecs.value = [...(productSpecs.value || []), ...newSpecs];
        console.log("合并后的 productSpecs:", productSpecs.value);
      } else {
        console.log("没有新的商品需要合并");
      }
    }

    // 如果最终 productSpecs 仍为空，直接返回
    if (!productSpecs.value || productSpecs.value.length === 0) {
      console.log("productSpecs 为空，无法继续");
      return;
    }

    // 显示加载提示
    uni.showLoading({
      title: "处理中...",
    });
    const params = { cartType: 1 };
    // 获取当前购物车商品列表，用于对比
    const cartList = await getCartList(params);
    console.log("获取购物车列表用于对比:", cartList);

    // 创建购物车商品映射表，用于快速查找
    const cartProductMap = new Map();
    if (cartList && cartList.valid && Array.isArray(cartList.valid)) {
      cartList.valid.forEach((cartItem) => {
        const productInfo = cartItem.productInfo || {};
        const attrInfo = productInfo.attrInfo || {};
        const productId = cartItem.productId || productInfo.id;
        const uniqueId = cartItem.productAttrUnique || attrInfo.unique || "";
        const key = `${productId}_${uniqueId}`;
        cartProductMap.set(key, {
          cartId: cartItem.id || cartItem.cartId,
          quantity: parseInt(cartItem.onSale || cartItem.num || 1),
        });
        console.log(
          `购物车商品映射: ${key} -> cartId: ${cartItem.id}, quantity: ${cartItem.onSale}`
        );
      });
    }

    // 筛选出需要添加到购物车的商品（购物车中不存在的商品）
    const itemsToAdd = [];
    productSpecs.value.forEach((item, index) => {
      const key = `${item.productId || item.id}_${item.uniqueId || ""}`;
      const cartItem = cartProductMap.get(key);

      if (cartItem) {
        // 商品已在购物车中，设置cartId
        item.cartId = cartItem.cartId;
        console.log(`商品${index}已在购物车中，设置cartId: ${cartItem.cartId}`);
      } else {
        // 商品不在购物车中，需要添加
        itemsToAdd.push({ item, index });
        console.log(`商品${index}不在购物车中，需要添加:`, item);
      }
    });

    // 如果没有需要添加的商品，直接返回
    if (itemsToAdd.length === 0) {
      console.log("所有商品都已在购物车中，无需添加");
      uni.hideLoading();
      return;
    }

    console.log(`需要添加到购物车的商品数量: ${itemsToAdd.length}`);

    // 创建商品ID到索引的映射，用于检测重复商品
    const productIdMap = new Map();
    itemsToAdd.forEach(({ item, index }) => {
      const key = `${item.productId || item.id}_${item.uniqueId || ""}`;
      if (!productIdMap.has(key)) {
        productIdMap.set(key, index);
      }
    });

    // 并行处理需要添加的商品
    const promises = itemsToAdd.map(async ({ item, index }) => {
      // 检查是否是重复商品
      const key = `${item.productId || item.id}_${item.uniqueId || ""}`;
      const firstIndex = productIdMap.get(key);
      if (firstIndex !== index) {
        // 这是重复商品，检查第一个相同商品是否已有cartId
        const firstItem = productSpecs.value[firstIndex];
        if (firstItem.cartId) {
          // 复用第一个相同商品的cartId
          item.cartId = firstItem.cartId;
          console.log(
            `商品${index}与商品${firstIndex}相同，复用cartId:${item.cartId}`
          );
          return { success: true, index, cartId: item.cartId };
        }
      }

      // 构建购物车参数
      // tag="1"时，如果数量小于起售量，使用起售量
      let cartNum = item.quantity;
      if (pageTag.value === "1" && item.onSale && cartNum < item.onSale) {
        cartNum = item.onSale;
        console.log(
          `商品${index}数量${item.quantity}小于起售量${item.onSale}，调整为${cartNum}`
        );
        // 同时更新商品的quantity
        productSpecs.value[index].quantity = cartNum;
      }

      const cartParams = Object.assign({
        productId: item.productId || item.id,
        cartNum: cartNum,
        uniqueId: item.uniqueId || "",
        isNew: 1,
        combinationId: 0,
        secKillId: 0,
        bargainId: 0,
        cartType: 1,
      }, isFromHealthPage.value ? { rpid: rpid.value } : undefined);

      try {
        // 调用添加购物车API
        console.log(`添加商品${index}到购物车:`, cartParams);
        const result = await getCartAdd(cartParams);

        if (result && result.cartId) {
          // 保存cartId到商品信息中
          productSpecs.value[index].cartId = result.cartId;
          console.log(`商品${index}添加成功，cartId:${result.cartId}`);
          return { success: true, index, cartId: result.cartId };
        } else {
          console.error(`商品${index}添加失败:`, result);
          return { success: false, index, error: "添加购物车失败" };
        }
      } catch (error) {
        console.error(`商品${index}添加异常:`, error);
        return { success: false, index, error: error.message || "网络异常" };
      }
    });

    // 等待所有请求完成
    const results = await Promise.all(promises);

    // 统计成功和失败数量
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.length - successCount;

    // 拼接所有成功的cartId（包括已存在的和新添加的）
    const allCartIds = productSpecs.value
      .filter((item) => item.cartId)
      .map((item) => item.cartId)
      .join(",");

    console.log("所有商品的cartIds:", allCartIds);

    // 保存拼接后的cartIds到全局变量，方便后续使用
    if (allCartIds) {
      orderInfo.cartIds = allCartIds;
    }

    uni.hideLoading();

    // 根据结果提示用户
    if (failCount === 0) {
      console.log("所有商品已成功添加到购物车");
    } else if (successCount > 0) {
      uni.showToast({
        title: `${successCount}个商品已添加，${failCount}个失败`,
        icon: "none",
        duration: 2000,
      });
    } else {
      uni.showToast({
        title: "添加购物车失败",
        icon: "none",
        duration: 2000,
      });
    }
  } catch (error) {
    console.error("批量添加购物车异常:", error);
    uni.hideLoading();
    uni.showToast({
      title: "处理异常: " + (error.message || "未知错误"),
      icon: "none",
      duration: 2000,
    });
  } finally {
    // 重置状态标记
    pageState.batchAddInProgress = false;
    console.log("batchAddToCart 执行完成，重置状态标记");
  }
};

// 确认订单API
const confirmOrderApi = async (cartId, addressId) => {
  // 优先从购物车数据中收集cartId
  let finalCartId = "";

  // 如果productSpecs中有数据且包含cartId，使用这些cartId
  if (productSpecs.value && productSpecs.value.length > 0) {
    const cartIds = productSpecs.value
      .filter((item) => item.cartId) // 过滤有cartId的商品
      .map((item) => item.cartId) // 提取cartId
      .join(","); // 拼接成字符串

    if (cartIds) {
      finalCartId = cartIds;
      console.log("从购物车数据中收集的cartIds:", finalCartId);
    }
  }

  // 如果没有从购物车数据中获取到cartId，使用传入的参数或orderInfo.cartIds
  if (!finalCartId) {
    finalCartId = orderInfo.cartIds || cartId;
    console.log("使用备用cartId:", finalCartId);
  }

  console.log(finalCartId, addressId, "111111111111111111111111");
  console.log("confirmOrderApi被调用，开始处理订单确认");

  try {
    uni.showLoading({
      title: "确认订单...",
      mask: true,
    });

    console.log("调用订单确认API，参数:", { cartId: finalCartId, addressId });
    console.log("开始调用orderConfirm API...");
    console.log("当前API基础URL:", "https://hnapi.booseng.com/app-api");
    console.log(
      "完整API地址:",
      "https://hnapi.booseng.com/app-api/order/confirm"
    );

    // 检查token
    const token = uni.getStorageSync("accessToken");
    console.log("当前token:", token);
    let isApp = 0;
    if (pageTag.value == '1') {
      isApp = 1;
    }
    // 调用订单确认API
    let confirmRes;
    try {
      const confirmParams = {
        orderType: 1,
        useIntegral: 0,
        cartId: finalCartId,
        addressId: addressId,
        shippingType: 1,
        isApp: isApp
      };

      // 如果选择了优惠券，添加优惠券ID
      if (selectedCoupon.value && selectedCoupon.value.detailId) {
        confirmParams.couponId = selectedCoupon.value.detailId;
        console.log("订单确认使用优惠券ID:", selectedCoupon.value.detailId);
      }

      console.log("即将调用orderConfirm，参数:", confirmParams);

      confirmRes = await orderConfirm(confirmParams);
      console.log("订单确认API调用成功，返回原始数据:", confirmRes);
    } catch (apiError) {
      console.error("订单确认API调用失败，错误详情:", apiError);
      console.error("错误类型:", typeof apiError);
      console.error(
        "错误消息:",
        apiError.message || apiError.msg || "未知错误"
      );
      console.error("错误代码:", apiError.code);
      console.error("完整错误对象:", JSON.stringify(apiError, null, 2));

      // 如果是后端业务错误，显示具体错误信息
      if (apiError.msg) {
        uni.showToast({
          title: apiError.msg,
          icon: "none",
        });
      }
      throw apiError;
    }

    // 根据request.js的afterResponse方法，成功时直接返回data.data，所以confirmRes就是实际数据
    if (confirmRes) {
      console.log("订单确认返回数据:", confirmRes);

      // 更新订单信息
      orderInfo.orderId = confirmRes.orderId || confirmRes.orderKey;
      orderInfo.orderKey = confirmRes.orderKey;
      orderInfo.priceGroup = confirmRes.priceGroup;

      // 更新价格信息
      if (confirmRes.priceGroup) {
        orderInfo.totalAmount = confirmRes.priceGroup.totalPrice || 0;
        orderInfo.discountAmount = confirmRes.priceGroup.couponPrice || 0;
        orderInfo.shippingFee = confirmRes.priceGroup.storePostage || 0;
        orderInfo.finalAmount = confirmRes.priceGroup.totalPrice || 0;
        orderInfo.couponId = confirmRes.priceGroup.couponId; //优惠券id
      }

      // 更新购物车信息和商品列表
      if (confirmRes.cartInfo && confirmRes.cartInfo.length > 0) {
        syncProductSpecsWithCartInfo(confirmRes.cartInfo);
      }

      // 更新赠品信息
      if (confirmRes.pmapList && Array.isArray(confirmRes.pmapList)) {
        // 保存原始数据
        originalGiftList.value = confirmRes.pmapList;
        // 转换数据用于显示，并自动选择第一个赠品（仅在首次加载且没有已选赠品时）
        const autoSelect = selectedGifts.value.length === 0;
        giftProductList.value = transformGiftData(confirmRes.pmapList, true);
        console.log("获取赠品列表:", confirmRes.pmapList);
        if (autoSelect && confirmRes.pmapList.length > 0) {
          console.log('已自动选择第一个赠品');
        }
      }
      // 不需要再调用 updateTotalAmount，因为价格已经在上面更新了
      // updateTotalAmount()

      // uni.showToast({
      //   title: "订单确认成功",
      //   icon: "success",
      // });

      return confirmRes;
    } else {
      console.error("订单确认API返回数据为空:", confirmRes);
      throw new Error("订单确认失败：返回数据为空");
    }
  } catch (error) {
    console.error("confirmOrderApi最终捕获的错误:", error);
    console.error("错误堆栈:", error.stack);

    // 不重复显示toast，因为API错误已经在上面处理了
    if (!error.msg) {
      uni.showToast({
        title: error.message || "订单确认失败",
        icon: "none",
      });
    }
    return null;
  }
};

// 创建订单
const createOrder = async (orderKey) => {
  try {
    if (!orderKey) {
      throw new Error("订单密钥不能为空");
    }
    if (!shippingAddress.id) {
      throw new Error("收货地址不能为空");
    }

    console.log("创建订单参数:", { orderKey, addressId: shippingAddress.id });

    console.log(
      "============selectedCoupon==========" + JSON.stringify(orderInfo)
    );
    let couponId = 0;
    if (selectedCoupon.value == null) {
      couponId = orderInfo.couponId;
    } else {
      couponId =
        selectedCoupon.value && selectedCoupon.value.detailId
          ? selectedCoupon.value.detailId
          : 0;
    }
    console.log("============couponId==========" + couponId);
    let isApp = 0;
    if (pageTag.value == '1') {
      isApp = 1;
    }
    console.log(orderInfo,'orderInfo++++++');
    const campaign = {
      cid: orderInfo.priceGroup.cid,
      rid: orderInfo.priceGroup.rid,
      pid: orderInfo.priceGroup.pid,
      isCoupon: orderInfo.priceGroup.isCoupon,
      randomInst: orderInfo.priceGroup.randomInst
    }
    const campaignStr = JSON.stringify(campaign);
    // 调用创建订单API - 参考orderPay.vue的参数格式
    const createParams = {
      key: orderKey,
      addressId: shippingAddress.id || 0,
      bargainId: 0,
      combinationId: 0,
      couponId: couponId,
      from: "",
      mark: "",
      pinkId: 0,
      seckillId: 0,
      shippingType: 1,
      useIntegral: 0,
      isChannel: 1,
      rpid: rpid.value,
      orderType: 'senddk',
      isApp: isApp,
      giftProductList: selectedOriginalGifts.value,  // 提交原始赠品数据结构
      cid: orderInfo.priceGroup.cid,
      zhyhPrice: orderInfo.priceGroup.randomInst,
      zhyhlist: campaignStr,
    };

    console.log("创建订单使用优惠券ID:", createParams.couponId);
    const createRes = await orderCreate(createParams);

    console.log("创建订单成功:", createRes);

    if (!createRes || !createRes.result) {
      throw new Error("订单创建返回数据异常");
    }

    return createRes;
  } catch (error) {
    console.error("创建订单失败:", error);
    throw error; // 重新抛出错误，让上层处理
  }
};

const handleGetDetail = async (id, quantity = 1) => {
  try {
    console.log(`[handleGetDetail] 商品ID: ${id}, 数量: ${quantity}`);
    let data = { productId: id };
    const detail = await getProductDetail(data);
    console.log(detail, "ddddd");
    orignData.value = JSON.stringify(detail);
    console.log(orignData.value, "orignData.value");

    // 从商品详情API返回的productValue中获取uniqueId
    let uniqueId = "";
    let selectedSku = null;

    if (detail.productValue && Object.keys(detail.productValue).length > 0) {
      console.log("detail.productValue:", detail.productValue);

      // 获取所有SKU的key
      const skuKeys = Object.keys(detail.productValue);
      console.log("可用的SKU keys:", skuKeys);

      // 选择第一个有库存的SKU作为默认SKU
      for (const skuKey of skuKeys) {
        const sku = detail.productValue[skuKey];
        const trueStock =
          sku.campaignState === 1 ? sku.campaignStock : sku.stock;
        if (trueStock > 0) {
          selectedSku = sku;
          uniqueId = sku.unique;
          console.log("选中的SKU:", selectedSku);
          console.log("从productValue获取的uniqueId:", uniqueId);
          break;
        }
      }

      // 如果没有找到有库存的SKU，使用第一个SKU
      if (!selectedSku && skuKeys.length > 0) {
        selectedSku = detail.productValue[skuKeys[0]];
        uniqueId = selectedSku.unique;
        console.log("使用第一个SKU作为默认:", selectedSku);
        console.log("默认uniqueId:", uniqueId);
      }

      // 存储商品的uniqueId信息，供后续使用
      if (uniqueId) {
        productUniqueIds.value.set(id, uniqueId);
        console.log("存储商品uniqueId映射:", id, "->", uniqueId);
      }
    }

    // 转换数据格式为productSpecs所需的结构
    const transformedData = [];

    // 处理主商品信息
    if (detail.storeInfo) {
      // 获取起售数量（最小购买数量）
      let onSale = detail.storeInfo.onSale || 1;
      if (isFromHealthPage.value) {
        // 健康页跳转过来有限取健康起售数
        onSale = detail.storeInfo.lzNum || onSale;
      }
      console.log(`商品${detail.storeInfo.id}的起售数量:`, onSale);

      const mainProduct = {
        id: detail.storeInfo.id,
        name: detail.storeInfo.storeName || detail.storeInfo.productName,
        // specification: zhuanhuang(detail.storeInfo.priceType),
        quantity: quantity,
        unitPrice: selectedSku
          ? parseFloat(selectedSku.price || 0)
          : parseFloat(detail.storeInfo.price || 0),
        monthlyPrice: selectedSku
          ? parseFloat(selectedSku.price || 0)
          : parseFloat(detail.storeInfo.price || 0),
        color: "#7a7a7a",
        priceColor: "#000000",
        image: detail.storeInfo.image
          ? detail.storeInfo.image.replace(/[`']/g, "")
          : PRODUCT_IMG_PATH + "465a3d2aca2d64946d747b820c12df53.png",
        uniqueId: uniqueId, // 从productValue中获取的uniqueId
        cartId: pageParams.value?.cartId || "", // 如果有cartId也一并设置
        onSale: onSale, // 存储起售数量
        specUnit: detail.storeInfo.specUnit || "",
      };
      console.log(
        "设置主商品uniqueId:",
        uniqueId,
        "数量:",
        quantity,
        "起售量:",
        onSale
      );
      transformedData.push(mainProduct);
    }
    productSpecs.value.push(...transformedData);
    console.log("最终的productSpecs:", productSpecs.value);
  } catch (error) {
    console.dir(error);
  }
};
// 获取购物车列表
const fetchCartList = async () => {
  try {
    const params = { cartType: 1 };
    const cartList = await getCartList(params);
    console.log("购物车列表:", cartList);

    // 将购物车数据转换为productSpecs格式
    if (cartList && cartList.valid && Array.isArray(cartList.valid)) {
      productSpecs.value = cartList.valid.map((item) => {
        console.log("处理购物车商品项:", item);
        console.log("商品数量字段 - cartNum:", item.cartNum, "num:", item.num);

        // 获取商品基本信息
        const productInfo = item.productInfo || {};
        const attrInfo = productInfo.attrInfo || {};

        // 存储uniqueId映射关系
        const productId = item.productId || productInfo.id;
        const uniqueId = item.productAttrUnique || attrInfo.unique || "";
        if (productId && uniqueId) {
          productUniqueIds.value.set(productId, uniqueId);
          console.log("存储购物车商品uniqueId映射:", productId, "->", uniqueId);
        }

        // 获取购物车数量
        let cartQuantity = parseInt(item.cartNum || item.num || 1);
        // 确保数量不小于1
        if (cartQuantity < 1) {
          cartQuantity = 1;
          console.log(
            `购物车商品${productId}的数量${item.cartNum}小于1，已调整为1`
          );
        }

        // 获取起售数量
        let onSale =
          item.onSale ||
          productInfo.onSale ||
          attrInfo.onSale ||
          productInfo.storeInfo?.onSale ||
          1;

        if (isFromHealthPage.value) {
          onSale = productInfo.lzNum || onSale;
        }
        console.log(`商品${productId}的起售数量:`, onSale);

        return {
          id: productId,
          name: productInfo.storeName || productInfo.productName || "商品",
          // specification: zhuanhuang(productInfo.priceType || attrInfo.priceType) || "",
          quantity: cartQuantity, // 确保数量为整数且不小于1
          unitPrice: parseFloat(
            item.truePrice || productInfo.price || attrInfo.price || 0
          ),
          monthlyPrice: parseFloat(
            item.truePrice || productInfo.price || attrInfo.price || 0
          ),
          color: "#7a7a7a",
          priceColor: "#000000",
          image:
            productInfo.image ||
            productInfo.sliderImage ||
            PRODUCT_IMG_PATH + "465a3d2aca2d64946d747b820c12df53.png",
          uniqueId: uniqueId,
          cartId: item.id || item.cartId || "", // 确保cartId正确设置
          onSale: onSale, // 存储起售数量
          specUnit: productInfo.specUnit || "",
          // 保留原始数据，用于获取起售数量(onSale)
          originalData: {
            storeInfo: {
              id: productId,
              onSale: onSale,
            },
          },
        };
      });

      console.log("从购物车更新后的productSpecs:", productSpecs.value);

      // 收集并保存cartIds到orderInfo，供其他函数使用
      const cartIds = productSpecs.value
        .filter((item) => item.cartId)
        .map((item) => item.cartId)
        .join(",");

      if (cartIds) {
        orderInfo.cartIds = cartIds;
        console.log("从购物车数据收集的cartIds已保存到orderInfo:", cartIds);
      }

      // 从接口获取最新价格
      await updateTotalAmount();
    }
  } catch (error) {
    console.error("获取购物车列表失败:", error);
  }
};
// UniApp 生命周期钩子
onLoad(async (options) => {
  console.log("onLoad options:", options);

  // 处理分享参数
  if (options.t === "co") {
    console.log("检测到确认订单分享参数:", options);
    // 标记为分享链接进入，禁用数量控制
    isFromShare.value = true;
    console.log("[分享] 已禁用数量增减功能");

	if(options.code){
		checkTheUserInit(options.code,Number(options.channelId))
	}
    // 解析分享参数中的商品列表
    let shareProducts = [];
    if (options.products) {
      try {
        // products 参数已经是编码后的字符串，直接解码即可
        shareProducts = JSON.parse(decodeURIComponent(options.products));
        console.log("解析到的分享商品列表:", shareProducts);
      } catch (error) {
        console.error("解析分享商品列表失败:", error);
      }
    }

    // 如果有商品列表，加载所有商品
    if (shareProducts && shareProducts.length > 0) {
      try {
        // 清空现有商品列表
        productSpecs.value = [];

        // 逐个加载商品详情
        for (const product of shareProducts) {
          if (product.id && product.quantity) {
            console.log(
              `加载分享商品: ID=${product.id}, 数量=${product.quantity}`
            );
            await handleGetDetail(product.id, product.quantity);
          }
        }

        pageState.isInitialized = true;
        console.log("分享参数处理完成，已加载所有商品详情");
      } catch (error) {
        console.error("处理分享参数失败:", error);
        pageState.isInitialized = true;
      }
      return;
    }

    // 兼容旧版本的单商品分享
    if (options.productId) {
      try {
        await handleGetDetail(options.productId);
        pageState.isInitialized = true;
        console.log("分享参数处理完成，已加载商品详情");
      } catch (error) {
        console.error("处理分享参数失败:", error);
        pageState.isInitialized = true;
      }
      return;
    }
  }

  // 设置页面初始化状态
  pageState.isInitialized = false;
  try {
    // 尝试解析data参数
    let data;
    if (options.data) {
      // 如果data是字符串且不是JSON格式，直接作为productId使用
      if (typeof options.data === "string" && !options.data.startsWith("{")) {
        data = { productId: options.data };
      } else {
        // 尝试JSON解析
        data = JSON.parse(decodeURIComponent(options.data));
      }
    } else {
      // 检查其他可能的参数
      data = {
        productId: options.productId || options.id,
        uniqueId: options.uniqueId
          ? JSON.parse(decodeURIComponent(options.uniqueId))
          : null,
        cartId: options.cartId,
      };
    }

    console.log("解析后的data:", data);

    // 存储页面参数，包含productValue信息
    pageParams.value = data;
    let tag = options.tag;
    isPlan.value = options.isPlan == 1;
    rpid.value = options.rpid || 0;
    console.log("解析后的rpid:", rpid);
    pageTag.value = tag || ""; // 存储tag值
    // 解析新老用户标识和调整方案显示标识
    isNew.value = options.isNew || "0"; // 默认为新用户
    isup.value = options.isup || "1"; // 默认不显示调整方案
    console.log(
      "页面参数 - tag:",
      tag,
      "isNew:",
      isNew.value,
      "isup:",
      isup.value,
      options.nickname
    );
    if (tag == "1") {
      //问卷那边跳转过来
      let pidStr = options.data;
      let pids = pidStr.split(",");
      healthPlan.title = options.nickname || '个性化'
      for (let pid of pids) {
        let ps = pid.split("-");
        let gid = ps[0]; //商品id
        let gnum = ps[1]; //商品下单数量
        console.log(`当前商品ID:`, gid, `数量:`, gnum);
        await handleGetDetail(gid, parseInt(gnum));
      }
      pageState.isInitialized = true;
    } else {
      // 判断页面来源：购物车跳转 vs 商品详情跳转
      const isFromCart =
        data &&
        (Array.isArray(data) ||
          (typeof data === "string" && data.includes(",")));

      if (isFromCart) {
        // 购物车跳转场景：直接使用传入的cartId数据
        console.log("检测到购物车跳转，直接使用cartId数据:", data);
        pageState.isInitialized = true;
      } else if (data && data.productId) {
        // 商品详情跳转场景：需要获取商品详情
        console.log(
          "检测到商品详情跳转，开始获取商品详情，productId:",
          data.productId
        );
        await handleGetDetail(data.productId);

        // 商品详情加载完成后，标记页面已初始化
        pageState.isInitialized = true;
        console.log("商品详情加载完成，页面初始化完成");
      } else {
        // 没有商品ID，直接标记为已初始化
        pageState.isInitialized = true;
      }
    }
  } catch (error) {
    console.error("解析页面参数失败:", error);
    // 如果解析失败，尝试直接使用options.data作为productId
    if (options.data) {
      pageParams.value = { productId: options.data };
      try {
        await handleGetDetail(options.data);
        pageState.isInitialized = true;
      } catch (detailError) {
        console.error("获取商品详情失败:", detailError);
        pageState.isInitialized = true; // 即使失败也标记为已初始化，避免阻塞
      }
    } else {
      pageState.isInitialized = true;
    }
  }
});

onShow(async () => {
  console.log("onShow: 页面显示，检查初始化状态:", pageState.isInitialized);

  // 重置支付状态，确保用户可以正常支付
  isPaymentStarted.value = false;
  frozenPaymentAmount.value = 0.0;
  console.log("onShow: 重置支付状态");

  // 等待页面初始化完成
  if (!pageState.isInitialized) {
    console.log("onShow: 等待页面初始化完成...");
    // 使用轮询等待初始化完成，最多等待5秒
    let waitCount = 0;
    const maxWaitCount = isFromHealthPage.value ? 100 : 50;
    while (!pageState.isInitialized && waitCount < maxWaitCount) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      waitCount++;
    }

    if (!pageState.isInitialized) {
      console.warn("onShow: 页面初始化超时，强制继续执行");
      pageState.isInitialized = true;
    } else {
      console.log("onShow: 页面初始化完成，继续执行");
    }
  }

  console.log(
    "onShow: 使用购物车数据，商品数量:",
    productSpecs.value?.length || 0
  );

  // 执行批量添加到购物车（只有在页面初始化完成后才执行）
  console.log("onShow: 执行批量添加到购物车");
  await batchAddToCart();
  // 从购物车获取最新数据
  console.log("onShow: 开始获取购物车数据");
  await fetchCartList();

  // 从地址选择页面返回时，更新地址信息
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage.options && currentPage.options.addressUpdated) {
    loadSelectedAddress();
  }
});

// 加载选中的地址
const loadSelectedAddress = async () => {
  try {
    console.log("开始加载选中的地址");
    // 重新获取地址列表，确保数据是最新的
    await fetchAddressList();
  } catch (error) {
    console.error("加载地址失败:", error);
    uni.showToast({
      title: "加载地址失败",
      icon: "none",
    });
  }
};

// 页面挂载时初始化地址列表
onMounted(async () => {
  console.log("页面挂载，开始初始化地址列表");
  await fetchAddressList();
});

// 页面卸载时清空数据（处理左滑返回和其他返回方式）
onUnload(async () => {
  console.log("页面卸载，清空确认订单数据");
  await getCartClear();
  store.setConfirmList([]);
});

// 处理分享按钮点击
const handleShare = () => {
  // 设置最新的分享内容
  setupCustomShare();

  // #ifdef H5
  shareH5();
  // #endif

  // #ifdef MP-WEIXIN
  uni.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"],
  });
  uni.showToast({
    title: "请点击右上角分享",
    icon: "none",
  });
  // #endif
};



async function checkTheUserInit(invitationCode,channelId) {
	//进行注册绑定关系操作
	wx.login({
		async success(res) {
			if (res.code) {
				console.log('微信code===========----' + res.code)
				let data = {};
				data.phoneCode = '888821';
				data.loginCode = res.code;
				data.invitationCode = invitationCode;
				data.channelId = channelId
				const loginRes = await checkTheUser(data);
				await mainStore.setAccessToken(loginRes)
			}
		}
	});
}
</script>
<style lang="scss" scoped>
/* 页面容器 */
.confirm-order-page {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;

  .icon-home {
    width: 48rpx;
    height: 48rpx;
  }
}

.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #121212;
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  cursor: pointer;

  &:active {
    opacity: 0.7;
  }
}

/* 头部导航 */
.header-nav {
  width: 100%;
  height: 88rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

  .nav-back-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-back-icon {
      width: 24rpx;
      height: 24rpx;
    }
  }

  .nav-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333333;
  }

  .nav-home-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .nav-home-icon {
      width: 24rpx;
      height: 24rpx;
    }
  }
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: 24rpx 32rpx;
  padding-bottom: 300rpx; // 留出底部支付区域的空间
}

// 地址选择区域
.address-selector {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 30rpx 24rpx 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .address-content {
    display: flex;
    align-items: flex-start;
    gap: 16rpx;
    flex: 1;

    .location-icon {
      width: 32rpx;
      height: 32rpx;
      margin-top: 4rpx;
    }

    .address-placeholder {
      .address-text {
        font-size: 28rpx;
        color: #999999;
      }
    }

    .address-info {
      display: flex;
      flex-direction: column;
      gap: 8rpx;

      .address-header {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .recipient-name {
          font-size: 30rpx;
          font-weight: 600;
          color: #333333;
        }

        .recipient-phone {
          font-size: 28rpx;
          color: #666666;
        }

        .default-tag {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #00cbcc;
          border-radius: 4rpx;
          padding: 2rpx 8rpx;

          .default-text {
            font-size: 20rpx;
            color: #ffffff;
          }
        }
      }

      .address-detail {
        font-size: 26rpx;
        color: #666666;
        line-height: 1.4;
      }
    }
  }

  .arrow-right {
    width: 12rpx;
    height: 12rpx;
    border-right: 2rpx solid #979797;
    border-bottom: 2rpx solid #979797;
    transform: rotate(-45deg);
    margin-left: 16rpx;
  }
}

/* 收货地址卡片 */
.address-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .address-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;

    .address-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333333;
    }

    .address-select-btn {
      font-size: 28rpx;
      color: #007aff;
    }
  }

  .address-info {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .address-contact {
      font-size: 30rpx;
      color: #333333;
      font-weight: 500;
    }

    .address-detail {
      font-size: 28rpx;
      color: #666666;
      line-height: 1.4;
    }
  }
}

/* 产品列表 */
.product-list {
  background-color: #ffffff;
  border-radius: 16rpx;
  // padding: 32rpx;
  margin-bottom: 24rpx;

  .product-item {
    display: flex;
    align-items: center;
    padding: 10rpx 0;
    overflow: hidden;

    &:last-child {
      border-bottom: none;
    }

    .product-image {
      width: 100rpx;
      height: 100rpx;
      border-radius: 12rpx;
      margin-right: 10rpx;
    }

    .product-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8rpx;
      overflow: hidden;

      .product-name {
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
        width: 100%;
        // 超出部分省略号
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .spec-text {
        display: flex;
        gap: 16rpx;
        font-size: 24rpx;
        color: #666666;
        // 不换行
        white-space: nowrap;
      }

      .product-price {
        font-size: 24rpx;
        color: #00cbcc;
        font-weight: 600;
      }
    }

    // 第一行：图片 + 名称 + 价格 + 数量控制
    .product-main-info {
      display: flex;
      align-items: center;
      gap: 12rpx;
      width: 100%;

      .product-image {
        width: 100rpx;
        height: 100rpx;
        border-radius: 12rpx;
        object-fit: cover;
        flex-shrink: 0;
      }

      .product-name {
        font-size: 24rpx;
        color: #333333;
        font-weight: 500;
        flex: 0 0 auto;
        max-width: 200rpx;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .price-text {
        font-size: 24rpx;
        color: #000000;
        font-weight: 500;
        flex: 0 0 auto;
        white-space: nowrap;
        margin-right: 40rpx;
      }
    }

    // 第二行：规格 + 起售
    .product-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .spec-text {
        font-size: 22rpx;
        color: #666666;
        font-weight: 400;
      }

      .onsale-text {
        font-size: 22rpx;
        color: #00cbcc;
        font-weight: 500;
        text-align: center;
        margin: 0 auto;
      }
    }

    .product-details {
      display: flex;
      align-items: center;
      gap: 8rpx;
    }

    .product-spec {
      font-size: 24rpx;
      color: #666666;
    }

    .product-quantity {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .quantity-btn {
        width: 60rpx;
        height: 60rpx;
        border: 1rpx solid #e0e0e0;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        transition: opacity 0.3s;

        &.disabled {
          // opacity: 0.5;
          pointer-events: none;
        }

        &.disabled-s {
          // opacity: 0.5;
          pointer-events: none;
          color: #ccc;
        }
      }

      .quantity-value {
        font-size: 24rpx;
        color: #333333;
        min-width: 40rpx;
        text-align: center;
      }
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 0;
      border: 2rpx solid #b9b9b9;
      /* iOS 兼容性：使用 2rpx 确保边框可见 */
      border-radius: 7rpx;
      height: 48rpx;
      /* iOS 兼容性：增加高度确保边框显示完整 */
      overflow: visible;
      /* iOS 兼容性：允许边框正常显示 */

      .quantity-btn {
        width: 46rpx;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #b9b9b9;
        border-right: 2rpx solid #b9b9b9;
        /* iOS 兼容性：使用 2rpx */
        box-sizing: border-box;
        /* iOS 兼容性：确保盒模型一致 */

        &:last-child {
          border-right: none;
          border-left: 2rpx solid #b9b9b9;
          /* iOS 兼容性：使用 2rpx */
          color: #000000;
        }
      }

      .quantity {
        width: 68rpx;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        color: #000000;
        box-sizing: border-box;
        /* iOS 兼容性：确保盒模型一致 */
      }
    }

    // 只显示数量的样式
    .quantity-display {
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .quantity {
        width: auto;
        height: auto;
        font-size: 24rpx;
        color: #000000;
        font-weight: 500;
      }
    }
  }
}

/* 健康方案部分 */
.health-plan-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin: 24rpx 24rpx 0 24rpx;

  .plan-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 20rpx;
  }

  .service-tags {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    gap: 16rpx;
    margin-bottom: 24rpx;

    /* iOS 兼容性：修复按钮顶部边框显示不全 */
    :deep(.uv-button) {
      border-width: 2rpx !important;
      /* 确保边框宽度为 2rpx */
      border-style: solid !important;
      position: relative;
      overflow: visible;

      /* 修复按钮内部样式 */
      &::after {
        content: '';
        position: absolute;
        top: -2rpx;
        left: -2rpx;
        right: -2rpx;
        height: 2rpx;
        background-color: currentColor;
        z-index: 1;
      }
    }

    .tag-item {
      flex: 0 0 auto;
      display: inline-block;
    }
  }

  .daily-supplements {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16rpx;
    margin-bottom: 32rpx;

    .supplements-label {
      font-size: 28rpx;
      color: #333333;
    }

    .supplement-badges {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12rpx;
    }

    .supplement-badge {
      .badge-content {
        position: relative;

        .badge-text {
          position: absolute;
          right: -20rpx;
          top: -10rpx;
          z-index: 1;
          display: inline-block;
          background-color: #00c8c8;
          color: white;
          font-weight: bold;
          font-size: 18rpx;
          border-radius: 20rpx;
          padding: 4rpx 10rpx;
          font-family: Arial, sans-serif;
        }

        .badge-img {
          width: 54rpx;
          height: 54rpx;
        }
      }
    }

    .supplement-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx;
      margin-left: 10rpx;
      cursor: pointer;

      .supplement-icon {
        width: 17rpx;
        height: 10rpx;
      }
    }
  }

  .product-list {
    margin-bottom: 32rpx;

    .products-container {
      display: flex;
      flex-direction: column;
      gap: 24rpx;
    }
  }

  // 调整方案按钮样式
  .adjust-plan {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    background: #fff;
    border-radius: 12rpx;
    padding: 20rpx 32rpx;
    margin: 24rpx 0;
    border: 1rpx dashed #00cbcc;
    position: relative;
    overflow: visible;
    transition: all 0.3s ease;
    cursor: pointer;

    /* iOS 兼容性：修复顶部边框显示不全 */
    &::after {
      content: '';
      position: absolute;
      top: -1rpx;
      left: 0;
      right: 0;
      height: 1rpx;
      border-top: 1rpx dashed #00cbcc;
      border-radius: 12rpx;
      z-index: 1;
    }

    &:hover {
      transform: translateY(-2rpx);
      box-shadow: 0 6rpx 20rpx rgba(0, 203, 204, 0.35);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2rpx 8rpx rgba(0, 203, 204, 0.2);
    }

    .adjust-icon {
      width: 30rpx;
      height: 30rpx;
    }

    .adjust-text {
      font-size: 28rpx;
      font-weight: 600;
      color: #00cbcc;
      line-height: 1;
    }
  }
}

/* 订单汇总 */
.order-summary {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin: 24rpx 24rpx 330rpx 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);

  .summary-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    margin-bottom: 24rpx;
  }

  .summary-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12rpx 0;

    .summary-label {
      font-size: 28rpx;
      color: #666666;
    }

    .summary-value {
      font-size: 28rpx;
      color: #333333;
    }
  }

  .summary-total {
    border-top: 1rpx solid #f0f0f0;
    padding-top: 16rpx;
    margin-top: 16rpx;

    .summary-label {
      font-weight: 600;
      color: #333333;
    }

    .summary-value {
      font-size: 28rpx;
      font-weight: 400;
      color: #00cbcc;
    }
  }

  /* 活动优惠明细 */
  .discount-detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 20rpx;
    margin: 8rpx 0;
    background: #f0f5f9;
    border-radius: 12rpx;
    // border-left: 4rpx solid #00cbcc;

    .discount-info {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4rpx;

      .discount-title {
        font-size: 26rpx;
        font-weight: 500;
        color: #333333;
      }

      .discount-desc {
        font-size: 22rpx;
        color: #999999;
      }
    }

    .discount-detail-text {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .discount-amount {
      font-size: 22rpx;
      font-weight: 400;
      color: #515151;
    }
  }

  /* 优惠券区域 */
  .coupon-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;
    position: relative;

    .coupon-label {
      font-size: 28rpx;
      color: #666666;
    }

    .coupon-info {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .coupon-status {
        font-size: 28rpx;
        color: #999999;
      }

      .coupon-arrow {
        width: 12rpx;
        height: 12rpx;
        border-right: 2rpx solid #cccccc;
        border-bottom: 2rpx solid #cccccc;
        transform: rotate(-45deg);
        margin-left: 16rpx;
      }
    }
  }

  /* 关税服务 */
  .service-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;

    .service-info {
      display: flex;
      align-items: center;
      gap: 8rpx;
      cursor: pointer;

      .service-label {
        font-size: 28rpx;
        color: #666666;
      }

      .service-icon {
        width: 32rpx;
        height: 32rpx;
      }
    }

    .service-value {
      font-size: 28rpx;
      color: #333333;
    }
  }

  /* 说明保障区域 */
  .guarantee-section {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    gap: 12rpx;

    .guarantee-label {
      font-size: 28rpx;
      color: #666666;
    }

    .guarantee-desc {
      flex: 1;
      font-size: 28rpx;
      color: #333333;
      text-align: right;
    }

    .guarantee-badge-container {
      display: flex;
      align-items: center;
      background: #3e3e3e;
      border-radius: 6rpx;
      gap: 4rpx;
      padding: 4rpx 8rpx;

      .guarantee-badge {
        width: 30rpx;
        height: 24rpx;
      }

      .privilege-text {
        font-size: 22rpx;
        color: #f8e5c2;
      }
    }
  }

  .guarantee-desc-2 {
    text-align: justify;
    line-height: 1.6;
  }

  .guarantee-desc-item {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #363636;
    gap: 4rpx;
  }

  /* 消费者权益保障 */
  .protection-section {
    padding: 20rpx 0;

    .protection-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8rpx;
      // margin-bottom: 8rpx;

      .protection-icon {
        width: 32rpx;
        height: 32rpx;
      }

      .protection-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #02c655;
      }
    }

    .protection-desc {
      font-size: 26rpx;
      color: #363636;
      line-height: 1.4;
      padding-left: 40rpx;
    }
  }

  /* 合计金额区域 */
  .total-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 0 16rpx;
    border-top: 2rpx solid #f0f0f0;
    margin-top: 16rpx;

    .total-label {
      font-size: 30rpx;
      font-weight: 600;
      color: #333333;
    }

    .total-amount {
      display: flex;
      align-items: baseline;
      gap: 4rpx;

      .currency-symbol {
        font-size: 28rpx;
        font-weight: 400;
        color: #00cbcc;
      }

      .total-price {
        font-size: 36rpx;
        font-weight: 400;
        color: #00cbcc;
      }
    }
  }

  /* 折扣样式 */
  .discount {
    color: #00cbcc !important;
    font-weight: 400;
  }

  /* 支付协议弹窗样式 */
  .hc-agree-popup__content {
    font-size: 28rpx;
    line-height: 42rpx;
    color: #333;
  }

  .hc-agree-popup__link {
    color: #00cbcc;
  }

  /* 自定义弹窗底部按钮 */
  .hc-agree-popup__footer {
    display: flex;
    gap: 20rpx;
  }

  .hc-agree-popup__btn {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
  }

  .hc-agree-popup__btn--cancel {
    background-color: #f5f5f5;
    color: #666;
    border: 2rpx solid #eaeaea;
  }

  .hc-agree-popup__btn--confirm {
    background-color: #00cbcc;
    color: #fff;
  }
}

/* 支付区域 */
.payment-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 32rpx 46rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  box-shadow: 0px -12rpx 24rpx 0px rgba(0, 0, 0, 0.04);
  z-index: 100;

  /* 协议区域 */
  .agreement-section {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 40rpx;
    cursor: pointer;

    .checkbox {
      width: 28rpx;
      height: 28rpx;
      border: 2rpx solid #575757;
      border-radius: 4rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background-color: #ffffff;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;

      &.checked {
        background-color: #00cbcc;
        border-color: #00cbcc;
        color: #ffffff;
        font-size: 16rpx;
      }
    }

    .agreement-text {
      font-family: MiSans, MiSans;
      font-weight: 400;
      font-size: 24rpx;
      color: #575757;
      line-height: 36rpx;
      text-align: center;
      font-style: normal;
      text-transform: none;
      cursor: pointer;
    }
  }

  .agree-text {
    font-size: 26rpx;
    color: #666666;
  }

  /* 支付信息区域 */
  .payment-info {
    .payment-method {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24rpx;
      position: relative;
      overflow: hidden;

      .payment-desc {
        flex: 1;
        font-size: 26rpx;
        color: #333333;
        line-height: 1.4;
        display: flex;
        align-items: center;
        gap: 8rpx;
      }

      .wechat-icon {
        width: 38rpx;
        height: 38rpx;
        margin: 0 8rpx;
      }

      .price-range {
        font-size: 24rpx;
        font-weight: 600;
        color: #363636;
        padding: 6rpx 12rpx;
      }
    }

    .payment-actions {
      position: relative;

      .pay-button {
        width: 100%;
        height: 88rpx;
        background: #00cbcc;
        border-radius: 48rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        color: #ffffff;
        font-size: 32rpx;
        font-weight: 700;
        box-shadow: 0px 8rpx 24rpx 0px rgba(0, 203, 204, 0.25);
        transition: opacity 0.3s, background 0.3s;

        &.disabled {
          // opacity: 0.6;
          background: #00cbcc;
          box-shadow: none;
          pointer-events: none;
        }

        .pay-text {
          font-size: 32rpx;
          font-weight: 700;
          color: #ffffff;
          text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
        }
      }

      .delivery-info {
        position: absolute;
        top: -40rpx;
        right: 9rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 30rpx;
        padding: 10rpx 12rpx;
        background: #d2ffff;
        border-radius: 30rpx 30rpx 30rpx 16rpx;

        .delivery-text {
          font-size: 20rpx;
          color: #006f70;
        }
      }
    }
  }

  .payment-methods {
    margin-bottom: 32rpx;

    .payment-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #333333;
      margin-bottom: 16rpx;
    }

    .payment-method {
      display: flex;
      align-items: center;
      padding: 16rpx 0;

      .payment-icon {
        width: 48rpx;
        height: 48rpx;
        margin-right: 16rpx;
      }

      .payment-name {
        flex: 1;
        font-size: 28rpx;
        color: #333333;
      }

      .payment-radio {
        width: 40rpx;
        height: 40rpx;
      }
    }
  }
}

// 赠品区域样式
.gift-section {
  margin-top: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  padding-top: 30rpx;

  .gift-header {
    display: flex;
    align-items: center;
    gap: 20rpx;
    cursor: pointer;
    padding: 20rpx 0;

    .gift-title-text {
      font-size: 28rpx;
      font-weight: 600;
      color: #333333;
      flex-shrink: 0;
    }

    .gift-preview {
      flex: 1;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;

      .gift-preview-wrapper {
        display: flex;
        align-items: center;
        gap: 10rpx;
        padding: 2rpx 0;
      }

      .gift-preview-item {
        width: 88rpx;
        height: 88rpx;
        border-radius: 12rpx;
        overflow: hidden;
        border: 3rpx solid transparent;
        background-color: #EDEDED;
        transition: border-color 0.3s ease;
        flex-shrink: 0;

        &.selected {
          border-color: #00CBCC;
        }

        image {
          width: 100%;
          height: 100%;
        }
      }
    }

    .gift-count {
      display: flex;
      align-items: center;
      gap: 8rpx;
      flex-shrink: 0;

      text {
        font-size: 24rpx;
        color: #999999;
      }

      .arrow-right {
        width: 12rpx;
        height: 12rpx;
        border-right: 2rpx solid #979797;
        border-bottom: 2rpx solid #979797;
        transform: rotate(-45deg);
      }
    }
  }
}

/* 底部导航 */
.bottom-nav {
  width: 100%;
  height: 120rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16rpx 0;

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .nav-icon {
      width: 48rpx;
      height: 48rpx;
    }

    .nav-label {
      font-size: 24rpx;
      color: #666666;
    }

    &.active .nav-label {
      color: #007aff;
    }
  }
}

/* 响应式设计 */
@media screen and (max-width: 750rpx) {
  .main-content {
    padding: 16rpx 24rpx;
  }

  .address-card,
  .product-list,
  .health-plan-card,
  .order-summary {
    padding: 24rpx;
    margin-bottom: 16rpx;
  }

  .product-list .product-item .product-image {
    width: 100rpx;
    height: 100rpx;
  }
}

@media screen and (max-width: 600rpx) {

  .address-card,
  .product-list,
  .health-plan-card,
  .order-summary {
    padding: 20rpx;
  }

  .payment-section {
    padding: 20rpx;
  }

  .product-list .product-item .product-image {
    width: 80rpx;
    height: 80rpx;
  }

  .header-nav .nav-title {
    font-size: 32rpx;
  }
}

@media screen and (max-width: 480rpx) {

  .address-card,
  .product-list,
  .health-plan-card,
  .order-summary {
    padding: 16rpx;
    margin-bottom: 12rpx;
  }

  .payment-section {
    padding: 16rpx;
  }

  .product-list .product-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16rpx;
  }

  .product-list .product-item .product-image {
    width: 60rpx;
    height: 60rpx;
  }

  .header-nav {
    padding: 0 16rpx;
  }

  .header-nav .nav-title {
    font-size: 28rpx;
  }

  .bottom-nav {
    padding: 12rpx 0;
  }
}

// 关税服务弹窗样式
// 关税服务弹窗样式
.tariff-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  width: 100%;
  overflow-x: hidden;
  word-break: break-all;
  box-sizing: border-box;
  font-size: 28rpx;
  color: #333333;

  ::v-deep {

    img,
    p,
    span,
    div,
    table {
      max-width: 100% !important;
      word-break: break-all !important;
      box-sizing: border-box !important;
      height: auto !important;
      white-space: normal !important;
      text-wrap: wrap !important;
    }
  }

  .tariff-text {
    font-size: 28rpx;
    color: #333333;
    line-height: 42rpx;
    text-align: left;
  }
}
//优惠图片弹窗样式
.assurance-card {
	position: relative;
	width: 90%;
	max-width: 600rpx;
}
.campaign-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.8);
	z-index: 9999;
	display: flex;
	justify-content: center;
	align-items: center;
}

.campaign-close-btn {
	position: absolute;
	bottom: -80rpx;
	left: 50%;
	transform: translateX(-50%);
	width: 60rpx;
	height: 60rpx;
	z-index: 10000;
	cursor: pointer;
}
.showtip-box{
	position: fixed;
	bottom: 50%;
	left: 50%;
	transform: translate(-50%,-50%);
	width: 70vw;
	padding: 32rpx 48rpx;
	box-sizing: border-box;
	font-size: 28rpx;
	color:#fff;
	border-radius: 16rpx;
	background-color: rgba(0, 0, 0, .9);
	z-index: 10000;
}
</style>
