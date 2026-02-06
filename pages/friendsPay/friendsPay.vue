<template>
  <view class="order-info-container">
    <Header
        system-bar-area-bg="#fff"
        header-area-bg="#fff"
        :scroll-top="scrollTop">
      好友代付款
    </Header>
    <view
        class="main-inner"
        v-if="orderInfoData">
      <view class="main-top">
        <view class="tip" v-if="orderInfoData._status._type === '0'">代付款订单已创建成功，发给好友帮你付款吧</view>
        <view class="price">
          <text class="price-unit">¥</text>
          <text class="price-value">{{orderInfoData.totalPrice.toFixed(2)}}</text>
        </view>
        <view class="label" v-if="orderInfoData._status._type === '0'">支付剩余时间</view>
        <view class="label" v-else-if="orderInfoData._status._type === '5'">支付已超时</view>
        <view class="label" v-else>支付已完成</view>
        <view class="countdown" v-if="orderInfoData._status._type === '0'">
          <countDown :time="parseInt(orderInfoData._status._payRemainTime)"
                      @finish="countDownFinish" />
        </view>
      </view>
      <!-- goods list -->
      <OrderGoodsInfo :order-info-data="orderInfoData" />
      <!-- order info -->
      <view class="bottom-bar-bg" :class="isInvite === 0 && 'bottom-bar-tip'"></view>
      <view class="order-actions bottom-bar" v-if="orderInfoData._status._type === '0'">
        <OrderOptions
            style="width: 100%"
            :status="orderInfoData._status._type"
            :isInvite="isInvite"
            @pay="handlePay"
            @invite="inviteFriend"
        />
      </view>
    </view>
  </view>
  <!-- 支付弹窗 -->
  <PayPopup
      :isInvite="1"
      ref="payPopupRef"
      @confirm="paySuccess(uid)"
  />

  <!-- 邀请好友 -->
  <InviteFriends
      ref="inviteFriendShareRef"
      @share="handleShareConfirm" />
  <FriendsPayPoster ref="friendsPayPosterRef" />
</template>

<script setup>
import Header from "@/components/Header/index.vue"
import { ref} from 'vue'
import { onLoad, onShareAppMessage, onShareTimeline  } from '@dcloudio/uni-app'
import { orderInfo } from '@/api/order'
import { useRouter } from "@/hooks/useRouter";
import PayPopup from "@/components/PayPopup/index.vue";
import { usePay } from "@/hooks/usePay";
import { useScroll } from "@/hooks/useScroll";
import OrderGoodsInfo from "@/pages/orderInfo/component/OrderGoodsInfo.vue";
import countDown from "@/pages/friendsPay/component/count-down/count-down.vue"
import OrderOptions from "@/pages/friendsPay/component/OrderOptions.vue"
import { SharePathKey, useShare } from "@/hooks/useShare";
import FriendsPayPoster from "@/components/Poster/FriendsPay.vue";
import InviteFriends from "@/components/Share/InviteFriends.vue";

const {scrollTop} = useScroll();
const isInvite = ref(0)
const uid = ref(0)

const {payPopupRef, openPay, paySuccess} = usePay()

const {getParams} = useRouter()

const orderInfoData = ref(null)

const handleOrderInfo = async (option) => {
  orderInfoData.value = await orderInfo(option)
  friendsPayShare(orderInfoData.value);
}


const handlePay = () => {
  openPay(orderInfoData.value.orderId, orderInfoData.value.uid)
}

const countDownFinish = ()=>{
  orderInfoData.value._status._type === '1'
}


// ============================ 邀请 ==================================================
const {shareInfo, friendsPayShare, shareH5, shareAppMessage, shareTimeline} = useShare()
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)

const friendsPayPosterRef = ref()
const inviteFriendShareRef = ref()

function inviteFriend() {
  inviteFriendShareRef.value.open()
}

function handleShareConfirm(shareItem) {
  if (shareItem.value === 'wechat') {
    shareH5()
  } else {
    friendsPayPosterRef.value.open(orderInfoData.value, shareInfo.value)
  }
}


onLoad((option) => {
  const params = getParams(option);
  // 邀请进来的
  if (params.t && params.t === SharePathKey.FRIENDS_PAY) {
    isInvite.value = 1
  }
  let sendParams = {
    key: params.id
  }
  if(params.u){
    uid.value = params.u
    sendParams.uid = params.u
  }
  handleOrderInfo(sendParams)
})

</script>

<style lang="scss">
.main-top{
  background-color: #fff;
  margin-bottom: 20rpx;
  padding: 22rpx 34rpx 40rpx;
  .tip{
    border-radius: 15rpx;
    padding:19rpx 24rpx 19rpx 64rpx;
    font-size: 24rpx;
    color: #19191A;
    line-height: 34rpx;
    background:#F9EDE4 url("https://hnapi.booseng.com/static/icon/pay/icon-notice.png") no-repeat 24rpx center / 32rpx 32rpx;
  }
  .price{
    display: flex;
    justify-content: center;
    align-items: baseline;
    color: #333333;
    font-weight: bold;
    padding: 55rpx 0 20rpx;
    .price-unit{
      font-size: 32rpx;
      margin-right: 8rpx;
    }
    .price-value{
      font-size: 48rpx;
    }
  }
  .label{
    text-align: center;
    font-size: 28rpx;
    color: #A9A9B2;
    line-height: 42rpx;
    margin-bottom: 28rpx;
  }
  .countdown{
    display: flex;
  }
}

.order-actions{
  bottom: env(safe-area-inset-bottom);
  background-color: #f5f5f5;
  padding: 0;
}

.bottom-bar-tip{
  height: 224rpx;
}
</style>
