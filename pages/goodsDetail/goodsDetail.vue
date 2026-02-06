<template>
  <view class="goodsDetail">
    <!--    <view :style="computedHeightStyle"></view>-->
    <Header
        circle-back
        ref="headerRef"
        :propUp="false"
        :scroll-top="scrollTop">
      <template #right>
        <view
            class="share-icon"
            @click="doShare(detailData.storeInfo)"
            :style="computedShareIconStyle">
          <uv-icon
              color="#000"
              name="share-square"
              size="16"
          />
        </view>
      </template>
    </Header>
    <view v-if="!showEmpty">
      <view v-if="detailData">
        <swiper
            :autoplay="autoplay"
            circular
            class="swiper detail"
            indicator-dots>
          <swiper-item
              v-for="(item, index) in sliderImageData"
              :key="index">
            <view class="swiper-item">
              <image
                  v-if="isImage(item)"
                  :src="item"
                  class="image"
                  mode="aspectFill" />
              <video class="video" v-else :src="item" controls autoplay @play="videoPlay" @pause="videoPause"></video>
            </view>
          </swiper-item>
        </swiper>
        <!-- 商品信息展示 -->
        <DetailInfoExhibition
            :goods-detail="detailData"
            :sku="storeAttr"
            @time-over="handleTimeOver" />

        <view class="row-context">
          <view class="label-row">
            <view class="left">
              <view class="label">服务：</view>
            </view>
            <view class="value" @click="showAssure">
              <view
                  v-for="(item, index) in detailData.assureList"
                  :key="index"
                  class="service-item"
              >
                <text v-if="index!==0" class="separator">|</text>{{ item.name }}
              </view>
              <uv-icon name="arrow-right" />
            </view>
          </view>
          <view class="label-row">
            <view class="left">
              <view class="label">运费：</view>
            </view>
            <view class="value">
              {{
                detailData.tempName !== "规定运费"
                    ? detailData.tempName
                    : storeInfo.postage + "元"
              }}
            </view>
          </view>
          <view
              v-if="detailData.couponSplicing"
              class="label-row"
              @click="discountCouponSelect('select')">
            <view class="label">
              <view class="text"> 促销：{{ detailData.couponSplicing }}</view>
            </view>
            <view class="value">
              领券
              <uv-icon name="arrow-right" />
            </view>
          </view>
          <view
              class="label-row"
              @click="handleOpenSelect('select')">
            <view class="label">
              <view class="text">
                选择： {{ !storeAttr ? "请选择商品规格" : storeAttr.sku }}
              </view>
            </view>
            <view class="value">
              <uv-icon name="arrow-right" />
            </view>
          </view>
        </view>

        <!-- 拼团成团展示 -->
        <GroupByOrderList
            :list="canGroupByList"
            @active-list-item-time-over="handleActiveListItemTimeOver"
            @do-group-by="handleDoGroupBy" />

        <!-- 商品评价 -->
        <view class="card full">
          <view
              :style="{
              borderBottom:
                detailData.replyCount <= 0 ? 'none' : '1rpx solid #e6e6e6',
            }"
              class="card-head"
          >
            <view
                class="card-title"
            >商品评价({{ detailData.replyCount }})
            </view
            >
            <view
                class="card-more"
                @click="
                push(
                  { url: '/pages/goodsReply/goodsReply' },
                  { data: { id: detailData.storeInfo.id } }
                )
              "
            ><span> 查看更多 </span>
              <uv-icon
                  color="rgb(187, 187, 187)"
                  name="arrow-right"
                  size="10"
              />
            </view>
          </view>
          <view
              v-if="detailData.reply"
              class="card-content">
            <detail-reply :data="detailData.reply"></detail-reply>
          </view>
        </view>

        <blank size="15" />
        <view class="card full">
          <view class="card-head">
            <view class="card-title"> 商品详情</view>
          </view>
          <view class="goods-detail-content">
            <rich-text
                :nodes="storeInfo.description"
                bindtap="onOpenLink" />
          </view>
        </view>

        <view class="coupon-select">
          <good-coupon-select
              :id="storeInfo.id"
              ref="selectCouponPanel"
              @select="handleSelectCoupon"
          />
        </view>


      </view>
      <view
          v-if="detailData"
          :class="detailData.storeInfo.isShow === 0 && 'off'"
          class="action-bar"
      >
        <view class="off-tip">商品已经下架了啦～要不要瞧瞧别的～</view>
        <view class="action-cont flex flex-ai__center flex-jc__sb">
          <view class="action-icons">
            <view class="action-icons-item">
              <view
                  class="action-icon"
                  @click="goToService">
                <img
                    :src="productCustomerIcon"
                    class="action-icon-img" />
                <text class="action-icon-label">客服</text>
              </view>
            </view>
            <view class="action-icons-item">
              <view
                  class="action-icon"
                  @click="goToShopCart">
                <view class="action-icon-badge">
                  <uv-badge
                      :value="cardCount"
                      max="99"
                      type="error"></uv-badge>
                </view>

                <image
                    :src="productCartIcon"
                    class="action-icon-img" />
                <text class="action-icon-label">购物车</text>
              </view>
            </view>
            <view class="action-icons-item">
              <view
                  class="action-icon"
                  @click="handleCollect">
                <image
                    v-if="!storeInfo?.userCollect"
                    :src="productCollectIcon"
                    class="action-icon-img"
                />
                <image
                    v-if="storeInfo?.userCollect"
                    :src="productAffirmCollectIcon"
                    class="action-icon-img"
                />
                <text class="action-icon-label">收藏</text>
              </view>
            </view>
          </view>
          <view class="action-btns">
            <!-- 普通商品 -->
            <template v-if="!skuIsActivity">
              <uv-button
                  :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                  plain
                  text="加入购物车"
                  type="info"
                  @click="handleOpenSelect('cart')"
              ></uv-button>
              <uv-button
                  :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                  text="立即购买"
                  type="primary"
                  @click="handleOpenSelect('buy')"
              ></uv-button>
            </template>
            <!-- 活动商品 -->
            <template v-else>
              <!-- 拼团 -->
              <template v-if="activityType===1">
                <uv-button
                    :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                    plain
                    text="单独购买"
                    type="info"
                    @click="handleOpenSelect('singleBuy')"
                ></uv-button>
                <uv-button
                    v-if="storeAttr&&storeAttr.campaignState===1"
                    :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                    text="立即开团"
                    type="primary"
                    @click="handleOpenSelect('activeBuy')"
                ></uv-button>
              </template>
              <!-- 秒杀 -->
              <template v-if="activityType===2">
                <uv-button
                    :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                    plain
                    text="单独购买"
                    type="info"
                    @click="handleOpenSelect('singleBuy')"
                ></uv-button>
                <uv-button
                    v-if="storeAttr&&storeAttr.campaignState===1 || isSoldOut"
                    :disabled="detailData.storeInfo.isShow === 0"
                    text="立即秒杀"
                    type="primary"
                    @click="handleOpenSelect('activeBuy')"
                ></uv-button>
              </template>
              <!-- 限时折扣 -->
              <template v-if="activityType===3">
                <uv-button
                    :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                    plain
                    text="单独购买"
                    type="info"
                    @click="handleOpenSelect('singleBuy')"
                ></uv-button>
                <uv-button
                    v-if="storeAttr&&storeAttr.campaignState===1 || isSoldOut"
                    :disabled="detailData.storeInfo.isShow === 0"
                    text="立享优惠"
                    type="primary"
                    @click="handleOpenSelect('activeBuy')"
                ></uv-button>
              </template>
              <template v-if="activityType===4">
                <uv-button
                    :disabled="detailData.storeInfo.isShow === 0 || isSoldOut"
                    text="立即兑换"
                    type="primary"
                    @click="handleOpenSelect('buy')"
                ></uv-button>
              </template>
            </template>
          </view>
        </view>
      </view>
      <ReturnTop :scroll-top="scrollTop" />
    </view>
    <GoodEmpty v-else />
    <Recommend />
    <view style="height: 100rpx;"></view>
    <GoodAttrSelect
        v-if="detailData && storeAttr"
        ref="selectAttrPanel"
        :goods-detail="detailData"
        :sku-id="storeAttr.id"
        :isIntegral="paramsObj.type === 4"
        @select="handleSelectAttr"
    />
    <GoodsSharePopup
        ref="goodsShare"
        @share="shareConfirm" />

    <GoodsPoster ref="goodsPoster" />
    <AssurePopup ref="AssurePopupRef" />

  </view>
</template>

<script setup>
import Recommend from '@/components/Recommend/index.vue'
import { productAffirmCollectIcon, productCartIcon, productCollectIcon, productCustomerIcon } from "@/utils/images";
import { computed, ref, unref } from 'vue'
import { collectSingle, getProductDetail, unCollectSingle } from '@/api/product'
import { getCartAdd, getCartCount } from '@/api/cart'
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";
import Header from "@/components/Header/index.vue";
import GoodCouponSelect from "@/components/good-coupon-select/good-coupon-select.vue";
import UvIcon from "@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue";
import { useScroll } from "@/hooks/useScroll";
import ReturnTop from "@/components/ReturnTop/index.vue"
import GoodEmpty from "@/pages/goodsDetail/components/GoodEmpty.vue";
import { SharePathKey, useShare } from "@/hooks/useShare";
import GoodAttrSelect from "@/components/good-attr-select/good-attr-select.vue";
import DetailInfoExhibition from "@/pages/goodsDetail/components/DetailInfoExhibition.vue";
import Blank from "@/components/blank/blank.vue";
import GroupByOrderList from "@/pages/goodsDetail/components/GroupByOrderList.vue";
import { getCanGroupByList } from "@/api/goods";
import { useService } from "@/hooks/useService";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { useGlobalRequestStore } from "@/store/modules/useGlobalRequestStore";
import GoodsPoster from "@/components/Poster/Goods.vue";
import GoodsSharePopup from "@/components/Share/Goods.vue";
import AssurePopup from "@/pages/goodsDetail/components/AssurePopup.vue";
import { isImage } from "@/utils/index";
import { IS_DEMO } from "@/config";

const {push, getParams, pushToTab, goBack} = useRouter();
const {toast} = useInterface();
const mainStore = useMainStore();
const globalRequestStore = useGlobalRequestStore();
const {user} = storeToRefs(mainStore)
const autoplay = ref(false)
// =========================== 分享 =================================
const {shareAppMessage, shareTimeline, goodsDetailShare, shareH5} = useShare()
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)
const goodsShare = ref()
const goodsPoster = ref()
const isSoldOut = ref(false)

function doShare(goods) {
  console.log(goods)
  goodsShare.value.open('分享商品', goods)
}

async function shareConfirm(shareItem, goods) {
  if (shareItem.value === 'photo') {
    if (!user.value) {
      toast({title: '请先登录'})
      uni.navigateTo({
        url: '/pages/login/guid'
      })
      return
    } else {
      await globalRequestStore.doShareToAddIntegral()
      goodsDetailShare(goods)
      goodsPoster.value.open(goods)
    }
    return
  }
  if (shareItem.value === 'wechat') {
    goodsDetailShare(goods)
    shareH5()
  }
}

// =========================== hooks 生命周期 =================================
const {scrollTop} = useScroll()
onPageScroll(() => {
})
const paramsObj = ref({})
onLoad((options) => {
  const params = getParams(options)
  // teamworkId id skuId
  paramsObj.value = params
  // 从拼团参团跳入
  handleJumpFromGroupByInvite(params)
  // 处理从分销商商品分享进入
  handleJumpFromDistributionInvite(params)
  let data = {productId: params.id, skuId: params.skuId ? params.skuId : ''}
  if(params.type){
    data.type = params.type
  }
  handleGetDetail(data)
  if (user.value) {
    handleGetCartCount(params.id)
  }
})

/**
 * 处理从拼团跳转进入
 * @param params
 */
function handleJumpFromGroupByInvite(params) {
  if (!params.teamworkId) return
  groupByOrderInfo.value = {
    id: params.teamworkId,
    skuId: params.skuId
  }
}

// 分销商ID
const distributorId = ref()

/**
 * 处理分销商品
 * @param params
 */
function handleJumpFromDistributionInvite(params) {
  if (!(params.t && params.t === SharePathKey.DISTRIBUTION_GOODS)) return
  distributorId.value = params.uid
}

// =========================== 计算属性 =================================
const headerRef = ref();
/** 获取头部高度 */
const computedHeightStyle = computed(() => {
  const style = {width: '100 %', height: 0, background: '#f5f5f5'}
  if (!headerRef.value || !headerRef.value.heightInfo) return style
  return {...style, height: `${ headerRef.value.heightInfo.statusBarHeight }px`}
})

const computedShareIconStyle = computed(() => {
  const style = {width: '32px', height: '32px'}
  if (!headerRef.value || headerRef.value?.menuInfo.height === 0) return style
  return {
    width: headerRef.value.menuInfo.height + 'px',
    height: headerRef.value.menuInfo.height + 'px',
  }
})
/** 选中的sku是否是活动sku */
const skuIsActivity = computed(() => {
  if (!storeAttr.value) return false
  return [1, 2, 3, 4].includes(Number(storeAttr.value.campaignType))
})

/** 活动类型 1、拼团，2、秒杀，3、限时折扣， 4、积分商品 */
const activityType = computed(() => Number(storeAttr.value && storeAttr.value.campaignType))


// ======================== 数据相关 ===================================
const detailData = ref(null); // 商品详情（包括详细信息、sku信息、满减信息等）
const sliderImageData = ref([]); // 商品轮播图信息
const storeInfo = ref(null); // 当前商品的详细信息
const cardCount = ref(null);
const showEmpty = ref(false)

/**
 * 获取商品详情
 * @param data
 * @param data.skuId skuId
 * @param data.productId productId
 * @return {Promise<void>}
 */
const handleGetDetail = async (data) => {
  try {
    const detail = await getProductDetail(data);
    if (!detail) return showEmpty.value = true
    console.log(detail)
    // 设置商品分享
    goodsDetailShare(detail.storeInfo)
    setGoodsDetail(detail)
    setDefaultAttr(detail)
    await handleGetCanGroupByList()
  } catch (error) {
    console.dir(error)
  }
};

/**
 * 处理商品详情逻辑
 * @param detail
 */
const setGoodsDetail = (detail) => {
  detailData.value = detail;
  sliderImageData.value = detail.storeInfo.sliderImage.split(",");
  storeInfo.value = detail.storeInfo
  storeInfo.value.description = detail.storeInfo.description.replace(
      /<img /g,
      "<img style='width:100%;' "
  );
}

/**
 * 处理sku逻辑
 * @param detail
 */
const setDefaultAttr = (detail) => {
  // 是否有skuId，有skuId就选择skuId对应属性，没有就默认选择第一个
  const defaultSkuId = paramsObj.value.skuId || undefined
  console.log(paramsObj.value.skuId)
  // 带SKU属性
  let defaultSku
  if (!!defaultSkuId) {
    for (const skuName in detail.productValue) {
      const sku = detail.productValue[skuName]
      if (sku.id === defaultSkuId) {
        defaultSku = sku
        break;
      }
    }
    // 找到了sku
    const defaultSkuStock = defaultSku.campaignState === 1 ? defaultSku.campaignStock : defaultSku.stock
    if (defaultSku && defaultSkuStock > 0) {
      return handleSelectAttr({
        store: defaultSku,
        num: 1
      })
    } else {
      toast({title: '当前活动规格售罄拉~看看其他的规格吧'})
    }
  }
  // 没找到走普通sku逻辑
  // 获取到所有sku key 直接选择有库存的第一个
  const skuNameList = Reflect.ownKeys(detail.productValue)
  if (skuNameList.length > 0) {
    for (const skuName of skuNameList) {
      const sku = detail.productValue[skuName];
      const trueStock = sku.campaignState === 1 ? sku.campaignStock : sku.stock // 真实库存 （区分活动和普通）
      let ifJudge = paramsObj.type === 4? trueStock > 0 && sku.campaignType === 4 : trueStock > 0
      console.log(ifJudge, trueStock)
      if (ifJudge) {
        defaultSku = sku
        break;
      }
    }
    if (!defaultSku){
      isSoldOut.value = true
      return toast({title: '当前商品售罄拉~看看其他的商品吧'})
    }
    handleSelectAttr({
      store: defaultSku,
      num: 1
    })
  }
}

/**
 * 获取购物车数量
 * @return {Promise<void>}
 */
const handleGetCartCount = async () => {
  const count = await getCartCount();
  cardCount.value = count.count;
};

// =========================== 优惠券相关 ==================================
const selectCouponPanel = ref(false); // 优惠券选择器
const selectCoupon = ref(false); // 选中的优惠券
const discountCouponSelect = () => {
  selectCouponPanel.value.open();
};
const handleSelectCoupon = (coupon) => {
  selectCoupon.value = coupon;
};

// =========================== Sku相关 ==================================
const actionType = ref(''); // 打开sku选择器的类型
const storeAttr = ref(); // 选中的sku
const storeNum = ref(0); // sku的库存数量
const selectAttrPanel = ref(); // sku选择器
const groupByOrderInfo = ref(); // 去拼团信息，没有就是开团
/**
 * 打开sku选择器
 * @param action select:普通选择 cart:购物车选择 buy:普通下单 activeBuy:活动下单 singleBuy:单独购买
 */
const handleOpenSelect = (action) => {
  if (unref(detailData).storeInfo.isShow !== 1) return
  actionType.value = action;
  console.log(selectAttrPanel.value,'selectAttrPanel.value')
  selectAttrPanel.value.open(storeNum.value, action);
}

/**
 * sku选择器确认
 * @param attr sku
 */
const handleSelectAttr = (attr) => {
  storeAttr.value = attr.store;
  storeNum.value = attr.num;
  switch (actionType.value) {
    case "select":
      handleGetCanGroupByList();
      break;
    case "cart":
      handleCardAdd();
      handleGetCanGroupByList()
      break;
    case "singleBuy": // 单独购买
      // 点击了普通下单但是规格是活动
      handleBuy(1);
      break;
    case "buy": // 普通下单
      // 点击了普通下单但是规格是活动
      if (attr.store.campaignType) {
        handleBuy(2)
        break;
      }
      handleBuy(1);
      break;
    case "activeBuy": // 活动下单
      // 限制拼团切换sku
      if (!!groupByOrderInfo.value && attr.store.id !== groupByOrderInfo.value.skuId) {
        toast({title: '检测到您正在和他人拼团，请勿选择其他规格'})
        break;
      }
      // 活动下单但是切换了sku
      if (!attr.store.campaignType) {
        toast({title: '检测切换了其他规格，可能不享受活动优惠'})
        setTimeout(() => {
          handleBuy(1)
        }, 1500)
        break;
      }
      handleBuy(2)
      break;
    default:
      handleGetCanGroupByList();
      break;
  }
  actionType.value = "";
  selectAttrPanel.value?.close();
};

/**
 * 添加进购物车
 * @return {Promise<void>}
 */
const handleCardAdd = async () => {
  await getCartAdd({
    cartNum: storeNum.value,
    productId: storeAttr.value.productId,
    uniqueId: storeAttr.value.unique,
    new: 0,
  });
  await handleGetCartCount();
  toast({title: '加入成功', icon: 'success'})
};

/**
 * 下单
 * @param orderType 1、普通下单，2、商品活动下单
 * @return {Promise<void>}
 */
const handleBuy = async (orderType = 1) => {
  uni.showLoading({
    title: "加载中",
  });
  let res = await getCartAdd({
    orderType,
    cartNum: storeNum.value,
    productId: storeAttr.value.productId,
    uniqueId: storeAttr.value.unique,
    new: 1,
    teamworkId: groupByOrderInfo.value?.id || '',
  });
  uni.hideLoading();
  const data = handleSubmitParams(orderType, groupByOrderInfo.value, res)
  push(
      {url: "/pages/submitOrder/submitOrder"},
      {data}
  );
};

/**
 * 处理跳转参数
 * @param orderType
 * @param groupByOrderInfo
 * @param cardRes 下单购物车返回信息
 * @return {{orderType, campaignDetailId: any, campaignType: any, cartId, teamworkType: number}|{orderType, cartId}}
 */
const handleSubmitParams = (orderType, groupByOrderInfo, cardRes) => {
  let data = {
    cartId: cardRes.cartId,
    orderType
  }
  // 判断有没有经销商
  if (distributorId.value) {
    data.distributorId = distributorId.value
  }
  // 活动
  if (orderType === 2) {
    data.campaignType = storeAttr.value.campaignType
    data.campaignDetailId = storeAttr.value.campaignDetailId
    data.teamworkType = 1 // 1开团
    // 和他人拼团
    if (!!groupByOrderInfo) {
      data.teamworkType = 2
      data.teamworkId = groupByOrderInfo.id
    }
  }
  return data
}

/**
 * 收藏
 * @return {Promise<void>}
 */
const handleCollect = async () => {
  const goodInfo = unref(storeInfo);
  const isCollect = goodInfo.userCollect;
  const data = {
    productId: goodInfo.id,
    type: "collect",
    category: "common",
  };
  if (isCollect) {
    // 取消
    await unCollectSingle(data);
  } else {
    // 收藏
    await collectSingle(data);
  }
  goodInfo.userCollect = !goodInfo.userCollect;
  isCollect ? toast({title: "已取消收藏"}) : toast({title: "已收藏"});
};

// =========================== 活动相关 =======================================
/**
 * 活动倒计时结束
 */
const handleTimeOver = () => {
  handleGetDetail({productId: paramsObj.value.id, skuId: paramsObj.value.skuId ? paramsObj.value.skuId : ''})
  handleGetCartCount(paramsObj.value.id)
}

// 可拼团订单
const canGroupByList = ref([]);
/**
 * 获取可拼团列表
 * @return {Promise<void>}
 */
const handleGetCanGroupByList = async () => {
  canGroupByList.value = []
  const data = await getCanGroupByList({skuId: storeAttr.value.id});
  canGroupByList.value = data || []
}

/**
 * 拼团项倒计时结束
 */
const handleActiveListItemTimeOver = () => {
  handleGetCanGroupByList()
}

/**
 * 和他人拼团
 * @param orderInfo
 */
const handleDoGroupBy = (orderInfo) => {
  handleOpenSelect('activeBuy')
  groupByOrderInfo.value = orderInfo
}

// =========================== 跳转相关 ========================================
/**
 * 去客服
 */
const goToService = async () => {
  const {getServiceData, openService} = useService();
  await getServiceData()
  await openService()
};

/**
 * 去购物车
 */
const goToShopCart = () => {
  push({
    url: "/pages/shoppingCartJump/shoppingCart",
  });
};


/**
 * 视频播放
 */
const videoPlay = () =>{
  autoplay.value = false
}
/**
 * 视频暂停
 */
const videoPause = () =>{
  autoplay.value = true
}

const AssurePopupRef = ref()
const showAssure = () => {
  AssurePopupRef.value.open(detailData.value.assureList)
}
</script>

<style lang="scss">
.share-icon {
  width: 64rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10rpx rgba(225, 225, 225, 0.48);
  border: 1rpx solid rgba(225, 225, 225, 0.8);
  box-sizing: border-box;
}

.search {
  padding: 0 17px;
}

.logo {
  width: 63px;
  height: 25px;

  .image {
    width: 63px;
    height: 25px;
    display: block;
  }
}

.swiper {
  width: 100%;

  .image {
    width: 100%;
    display: block;
  }
  .video{
    width: 100%;
    height: 100%;
    display: block;
  }
}

.goodsDetail {
  width: 100%;
  overflow-x: hidden;

  &-storeName {
    line-height: 40rpx;
    font-size: 32rpx;
    color: #333333;
    margin-bottom: 20rpx;
  }

  &-price {
    &-row {
      margin-bottom: 17rpx;
      display: flex;
      align-items: center;
    }

    &-primary {
      line-height: 50rpx;
      font-size: 50rpx;
      color: #00CBCC;
    }

    &-default {
      line-height: 40rpx;
      font-size: 28rpx;
      color: #333333;
    }

    &-original {
      margin-left: 20rpx;
      line-height: 28rpx;
      font-size: 28rpx;
      color: #999999;
      text-decoration: line-through;
    }
  }

  &-info {
    background-color: #fff;
    padding: 30rpx 35rpx;
    // display: flex;
    // align-items: flex-end;
    // justify-content: space-between;

    &-action {
      display: flex;
      justify-content: space-between;

      &-tags {
        .uv-tags {
          margin-right: 10rpx;
        }
      }

      &-desc {
        line-height: 28rpx;
        font-size: 20rpx;
        color: #999999;
      }
    }
  }

  &-image {
    &-img {
    }
  }

  &-list {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 14rpx;

    .goods {
      &-thumb {
        margin-bottom: 0;
        width: 220rpx;
        height: 220rpx;

        &-img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      &-content {
        padding-right: 40rpx;
        margin-left: 30rpx;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }
}

.buy-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-info {
    flex: 1;

    &-desc {
      color: #999999;
      font-size: 24rpx;
      line-height: 32rpx;
    }
  }

  &-action {
    margin-left: 17rpx;
  }
}

.buy-num {
  &-info-desc {
    color: #999999;
    font-size: 24rpx;
    line-height: 32rpx;
  }
}

.goods-detail-content {
  padding: 34rpx;

  img {
    max-width: 100%;
  }
}

:deep(.coupon-select) .uni-popup__wrapper {
  height: auto;
  max-height: 1000rpx;
  overflow-y: auto;
}

:deep(.uv-icon) {
  flex-shrink: 0 !important;
}

// ======================= 👇 kahu ===
.row-context {
  margin: 30rpx 0;

  .label-row {
    @include useFlex(space-between, center);
    @include usePadding(30, 20);
    width: 100%;
    background: $white-color;
    border-bottom: 1rpx solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .label {
      max-width: 85%;
      @include useFlex(flex-start, center);
      color: $tips-color;
      white-space: nowrap;
      font-size: 24rpx;
      flex-grow: 0;

      .text {
        max-width: 100%;
        overflow: hidden;
        flex-grow: 0;
        text-overflow: ellipsis;
      }
    }

    .value {
      @include useFlex(flex-end, center);
      flex-shrink: 0;
      font-size: 28rpx;
      color: #333;
      .separator{
        padding: 0 5rpx;
      }
    }
  }
}

.swiper {
  .swiper-item {
    width: 100%;
    height: 100%;

    .image {
      width: inherit;
      height: inherit;
    }
  }
}
</style>
