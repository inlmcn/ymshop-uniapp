<!--
    @name: detail
    @author: kahu4
    @date: 2024-01-16 16:35
    @description：拼团详情
    @update: 2024-01-16 16:35
-->
<script setup>
import Header from "@/components/Header/index.vue";
import { useScroll } from "@/hooks/useScroll";
import Goods from "@/components/goodsComponents/Goods.vue";
import { onLoad, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { computed, onBeforeUnmount, ref } from "vue";
import InviteFriends from "@/components/Share/InviteFriends.vue";
import GroupByPoster from "@/components/Poster/GroupBy.vue";
import { SharePathKey, useShare } from "@/hooks/useShare";
import { useRouter } from "@/hooks/useRouter";
import { getGroupByDetailTeamworkId } from "@/api/goods";
import { getTimeAfterNow } from "@/utils/utils";
import { useMainStore } from "@/store/modules/useMainStore";
import GoodAttrSelect from "@/components/good-attr-select/good-attr-select.vue";
import { getProductDetail } from "@/api/product";
import { useInterface } from "@/hooks/useInterface";
import { getCartAdd } from "@/api/cart";

const {getParams, push} = useRouter();
const {scrollTop} = useScroll()
const mainStore = useMainStore();

const teamworkId = ref()
const {toast} = useInterface();

onLoad((option) => {
  const params = getParams(option);
  // 邀请进来的
  if (params.t && params.t === SharePathKey.GROUP_BY) {
    teamworkId.value = params.id
  } else {
    teamworkId.value = params.teamworkId
  }
  doGetGroupByDetailTeamworkId()
})

onBeforeUnmount(() => {
  stopTimePlay()
})

// 拼团详情
const groupDetail = ref()
// 拼团状态 0 进行中 1 成功 2 失败
const groupState = ref(0)
// 拼团title
const groupTitle = computed(() => {
  if (!groupDetail.value) return
  if (groupState.value === 0) {
    return `再邀${ residuePersonNum.value }位即可拼团成功`
  }
  if (groupState.value === 1) {
    return '拼团成功，请等待商家发货'
  }
  if (groupState.value === 2) {
    return '拼团失败，可以再次开团啊~'
  }
})

/**
 * 获取拼团详情
 * @return {Promise<void>}
 */
async function doGetGroupByDetailTeamworkId() {
  const res = await getGroupByDetailTeamworkId({id: teamworkId.value});
  groupDetail.value = res
  groupDetail.value.teamworkId = teamworkId.value
  // 校验状态 state 0 进行中 1 成功 2 失败
  groupState.value = res.state
  await doGetGoodsDetail()
  if (res.state > 0) return
  // 设置倒计时
  setTimePlay(res.closeTime)
}

// ========================= sku 商品相关 ===========================================
const selectAttrPanel = ref()
const canDoOrder = ref(true) // 是否能立即下单
const goodsDetail = ref() // 商品详情
const selectSku = ref() // 选中的sku
const skuNum = ref(1) // 选中sku下单数量
/**
 *  获取商品详情
 *  请求回来给sku选择器使用
 */
async function doGetGoodsDetail() {
  goodsDetail.value = await getProductDetail({productId: groupDetail.value.id, skuId: groupDetail.value.skuId});
  canDoOrder.value = true
  groupByInvitationShare({...groupDetail.value, cartInfo: [{productInfo: {image: groupDetail.value.image}}]});
  const {productValue} = goodsDetail.value
  for (const skuName in productValue) {
    const sku = productValue[skuName]
    if (sku.id !== groupDetail.value.skuId) continue;
    selectSku.value = sku
    break;
  }
  // 没有sku
  if (!selectSku.value) {
    toast({title: '此规格下架了~看看其他商品吧~'})
    canDoOrder.value = false
    return
  }
  // sku没有库存
  if (!selectSku.value.campaignStock || selectSku.value <= 0) {
    toast({title: '此规格库存不足~看看其他商品吧~'})
    canDoOrder.value = false
    return
  }
  canDoOrder.value = true
}

/**
 * sku选择器confirm
 * @param attr
 */
function handleSelectAttr(attr) {
  const {store, num} = attr
  // 与拼团商品sku不一致
  if (store.id !== groupDetail.value.skuId) {
    toast({title: '检测到您选择的规格和好友下单拼团规格不一致~请重新选择', time: 3000})
    return
  }
  // 下单逻辑
  selectSku.value = store
  skuNum.value = num
  handleBuy()
}

/**
 * 下单
 * @param orderType 1、普通下单，2、商品活动下单
 * @return {Promise<void>}
 */
const handleBuy = async (orderType = 2) => {
  uni.showLoading({
    title: "加载中",
  });
  let res = await getCartAdd({
    orderType,
    cartNum: skuNum.value,
    productId: selectSku.value.productId,
    uniqueId: selectSku.value.unique,
    new: 1,
    teamworkId: groupDetail.value.teamworkId,
  });
  uni.hideLoading();
  const data = handleSubmitParams(orderType, res)
  push(
      {url: "/pages/submitOrder/submitOrder"},
      {data}
  );
};

/**
 * 处理跳转参数
 * @param orderType
 * @param cardRes 下单购物车返回信息
 * @return {{orderType, campaignDetailId: any, campaignType: any, cartId, teamworkType: number}|{orderType, cartId}}
 */
const handleSubmitParams = (orderType, cardRes) => {
  let data = {
    cartId: cardRes.cartId,
    orderType
  }
  // 活动
  if (orderType === 2) {
    data.campaignType = selectSku.value.campaignType
    data.campaignDetailId = selectSku.value.campaignDetailId
    data.teamworkType = 2 // 1开团 2拼团
    data.teamworkId = groupDetail.value.teamworkId
  }
  return data
}


// ========================= 倒计时相关 ===========================================
let timeObj = ref({}), time
const timestamp = ref(0)

/**
 * 开始倒计时
 * @param closeTime
 */
function setTimePlay(closeTime) {
  const nowTime = Date.now()
  timestamp.value = closeTime
  if (timestamp.value === 0 || closeTime - nowTime <= 0) return
  const setTime = () => {
    timeObj.value = getTimeAfterNow(timestamp.value)
    if (closeTime - nowTime <= 0) {
      // 倒计时结束
      stopTimePlay()
      timeOver()
    }
  }
  setTime()
  time = setInterval(() => setTime(), 1000)
}

/**
 * 停止倒计时
 */
function stopTimePlay() {
  time && clearInterval(time)
  time = undefined
  timestamp.value = 0
}

/**
 * 倒计时结束
 */
function timeOver() {
  doGetGroupByDetailTeamworkId()
}

/**
 * 还差多少人成团
 * @type {ComputedRef<number|*>}
 */
const residuePersonNum = computed(() => {
  if (!groupDetail.value) return 1
  return groupDetail.value.person - groupDetail.value.users.length
})

/**
 * 当前用户是否已经购买
 * @type {ComputedRef<unknown>}
 */
const isBuy = computed(() => {
  if (!groupDetail.value) return false
  return groupDetail.value.users.findIndex(item => item.uid === mainStore.user.id) > -1
})

const groupRules = [
  {
    index: 1,
    info: '开团或成团享团购价'
  },
  {
    index: 2,
    info: '邀请好友参与优惠多'
  },
  {
    index: 3,
    info: '人满发货不满退款'
  }
]


/**
 * 立即拼团
 */
function takePartInAGroup() {
  if (!canDoOrder.value) return toast({title: "此规格不能下单，可以看看其他上哦~"})
  selectAttrPanel.value.open()
}


// ============================ 邀请 ==================================================
const {shareInfo, groupByInvitationShare, shareH5, shareAppMessage, shareTimeline} = useShare()
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)

const groupByPosterRef = ref()
const inviteFriendShareRef = ref()

function inviteFriend() {
  if (groupState.value === 2) return
  inviteFriendShareRef.value.open()
}

function againGroup() {
  push({
    url: '/pages/goodsDetail/goodsDetail',
  }, {
    data: {id: groupDetail.value.id, "skuId": groupDetail.value.skuId},
    type: 'redirectTo'
  })
}

function handleShareConfirm(shareItem) {
  if (shareItem.value === 'wechat') {
    shareH5()
  } else {
    groupByPosterRef.value.open(groupDetail.value, shareInfo.value)
  }
}


</script>

<template>
  <view
      class="group-by-detail"
  >
    <Header :scroll-top="scrollTop"> 拼团详情</Header>
    <view
        class="main"
        v-if="groupDetail">
      <!-- 商品信息 -->
      <view
          class="goods-row row">
        <Goods
            :goods="groupDetail"
            :ratio="true"
            imgWidth="200rpx"
            infoPadding="20rpx 20rpx"
            row
        >
          <template #options="{goods}">
         <span class="price">
         ￥{{ goods.price }}
         </span>
          </template>
        </Goods>
      </view>

      <!-- 拼团信息 -->
      <view class="row group-info">
        <view class="title">
          {{ groupTitle }}
        </view>
        <view
            class="time"
            v-if="timeObj && groupState===0">
          剩余
          <view class="time-group">
            <text class="time-item">{{ timeObj.hours }}</text>
            <text class="primary-color">:</text>
            <text class="time-item">{{ timeObj.minutes }}</text>
            <text class="primary-color">:</text>
            <text class="time-item">{{ timeObj.seconds }}</text>
          </view>
          结束
        </view>
        <view class="users">
          <view
              v-for="user in groupDetail.users"
              :key="user.id"
              class="user-item">
            <image :src="user.avatar" />
            <view
                class="first-group"
                v-if="user.isHead === '1'">
              团长
            </view>
          </view>
          <!-- 该团还需要几个人 -->
          <view
              class="user-item plus"
              v-for="item in residuePersonNum"
              :key="item"
              @click="inviteFriend">
            <uv-icon name="plus" />
          </view>
        </view>
        <!-- 如果自己已经在团内 -->
        <template v-if="isBuy">
          <view
              v-if="groupState === 0"
              class="btn animation-button"
              @click="inviteFriend">
            邀请好友拼团
          </view>
          <view
              v-if="[1,2].includes(groupState)"
              class="btn animation-button"
              @click="againGroup">
            再次拼团
          </view>
        </template>
        <!-- 如果自己不在团内 -->
        <template v-else>
          <view
              v-if="[1,2].includes(groupState)"
              class="btn animation-button"
              @click="againGroup">
            再次拼团
          </view>
          <view
              v-else
              class="btn animation-button"
              @click="takePartInAGroup">
            立即参团
          </view>
        </template>
      </view>

      <!-- 拼团玩法 -->
      <view class="group-rule group-info row">
        <view class="title">
          拼团玩法
        </view>
        <view class="rule-box">
          <view
              v-for="item in groupRules"
              :key="item.index"
              class="rule-item">
            <view class="circle-number">
              {{ item.index }}
            </view>
            <view class="info">
              {{ item.info }}
            </view>
            <view class="line"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- SKU选择器 -->
    <GoodAttrSelect
        v-if="goodsDetail && selectSku"
        ref="selectAttrPanel"
        :goods-detail="goodsDetail"
        :sku-id="selectSku.id"
        @select="handleSelectAttr" />

    <!-- 邀请好友 -->
    <InviteFriends
        ref="inviteFriendShareRef"
        @share="handleShareConfirm" />
    <GroupByPoster ref="groupByPosterRef" />
  </view>
</template>

<style lang="scss">
page {
  background: $page-bg-color;
}
</style>
<style
    lang="scss"
    scoped>
.group-by-detail {
  width: 100%;

  .main {
    width: 100%;
    @include usePadding(30, 30);

    .row {
      width: 100%;
      background: $white-color;
      border-radius: 20rpx;
      margin-bottom: 25rpx;
    }

    .price {
      color: $primary-color;
      font-size: 30rpx;
    }

    .group-info {
      @include usePadding(30, 30);
      width: 100%;

      .title, .time {
        @include useFlex(center, center)
      }

      .title {
        font-weight: bold;
        font-size: 32rpx;
      }

      .time {
        margin-top: 15rpx;
        font-size: 24rpx;
        @include useFlex(center, center);

        .time-group {
          margin: 0 15rpx;
          @include useFlex(center, center);

          .time-item {
            @include usePadding(10, 6);
            background: #FDEFEA;
            border: 1rpx solid #E85A2B;
            color: #E85A2B;
            border-radius: 5rpx;
          }

          .primary-color {
            color: #E85A2B;
            padding: 0 5rpx;
            font-size: 32rpx;
          }
        }

      }

      .users {
        margin: 40rpx 0;
        @include useFlex(center, center, row, wrap, 20rpx);
        width: 100%;

        .user-item {
          width: 130rpx;
          height: 130rpx;
          border-radius: 50%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10rpx rgba(220, 220, 220, 0.7);

          image {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #e5e5e5;
          }

          .first-group {
            @include usePadding(16, 5);
            background: $primary-color;
            color: $white-color;
            white-space: nowrap;
            border-radius: 34rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            font-size: 24rpx;
          }
        }
      }

      .plus {
        transition: all .3s;

        &:active {
          scale: 1.1;
        }
      }

      .btn {
        margin-top: 10rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80rpx;
        border-radius: 10rpx;
      }
    }

    .group-rule {
      width: 100%;

      .rule-box {
        @include usePadding(0, 30);
        @include useFlex(space-between, center);
        font-size: 20rpx;
        color: $tips-color;

        .rule-item {
          position: relative;
          @include useFlex(center, center, column);

          .circle-number {
            @include useFlex(center, center);
            width: 50rpx;
            height: 50rpx;
            color: #000;
            border-radius: 50%;
            background: #f5f5f5;
            margin: 16rpx 0;
          }

          &:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 5rpx;
            background: #f5f5f5;
            top: 35%;
            left: 65%;
          }

          &:last-child:after {
            content: '';
            position: absolute;
            width: 100%;
            height: 0;
            background: #f5f5f5;
            top: 35%;
            left: 60%;
          }
        }
      }
    }
  }
}

.success-color {
  color: #E85A2B;
}
</style>
