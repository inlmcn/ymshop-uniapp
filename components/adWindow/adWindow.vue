<template>
  <view v-if="visible && adInfo">
    <view v-if="adInfo?.type === 3"
          class="mask mask-coupon ad-coupons"
          @touchmove.stop.prevent="moveHandle">
      <view class="ad-box-warp">
        <view class="ad-boxs">
<!--          <image class="img"-->
<!--                 :src="adInfo.popupImage"-->
<!--                 ></image>-->
          <view class="coupon-list">
            <scroll-view :scroll-top="0"
                         class="scrollBox"
                         scroll-y="true">
              <div class="coupon-item" v-for="(item, index) in couponList">
                <div class="coupon-left">
                  <!-- 折扣力度 -->
                  <div class="discount">
                    <div class="unit pre-unit" v-if="item.couponType === 1">
                      ￥
                    </div>
                    {{item.couponType === 1 ? item.couponValue : item.discount}}
                    <div class="unit" v-if="item.couponType === 2">
                      折
                    </div>
                  </div>
                </div>
                <div class="coupon-right">
                  <div class="info">
                    <div class="type">
                      {{item.couponType === 1 ? '满减券' : '折扣券'}}
                    </div>
                    <div class="tip">
                      {{item.threshold!==0?`(实付${item.threshold}元使用)`:'无门槛使用'}}
                    </div>
                  </div>
                  <!-- button -->
                  <div class="button get-coupon" @click="receiveCoupon(item.id)">
                    领取
                  </div>
                </div>
              </div>
            </scroll-view>
          </view>
        </view>
        <view class="close-btn">
          <image :src="closeIcon"
                 class='btn'
                 mode="widthFix"
                 @click="close()"></image>
        </view>
      </view>
    </view>
    <view v-else class="mask mask-coupon ad-link">
      <view class="ad-box-warp">
        <view class="ad-boxs"
              @click="goRoll()">
          <image class="img"
                 :src="adInfo.popupImage"
                 mode="widthFix"></image>
        </view>
        <view class="close-btn">
          <image :src="closeIcon"
                 class='btn'
                 mode="widthFix"
                 @click="close()"></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import {onMounted, ref} from 'vue';
import { getAdPopup } from '@/api/global'
import { getCouponListById, receiveACoupon } from '@/api/coupon'
import {useRouter} from "@/hooks/useRouter";
import cookie from "@/utils/cookie";
import {closeIcon} from "@/utils/images";
const {push} = useRouter()
const visible = ref(false)
const adInfo = ref({})
const linkData = ref({})
const couponList = ref([])
const cParams = ref({})

onMounted(() => {
  getAd()
})

// 阻止滑动
const moveHandle = () => {
  return
}
// 获取广告信息
const getAd = async () => {
  adInfo.value  = await getAdPopup()
  if (adInfo.value?.link) {
    linkData.value = JSON.parse(adInfo.value.link)
  }
  visible.value = true
  if (adInfo.value?.type === 3) {
    getCoupons()
  }
}
// 查询优惠券
const getCoupons = async () => {
  const _items = linkData.value.items.map(item=>{
    return item.id
  }).join(',')
  if (_items) {
    const res = await getCouponListById({ids:_items})
    couponList.value = res.list
  }
}

// 领取优惠券
async function receiveCoupon (id) {
  var token = cookie.get('accessToken')
  if (token) {
    const res = await receiveACoupon(id)
    if(res){
      uni.showToast({
        title: '领取成功',
        icon: 'success'
      })
    }
  } else {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    uni.navigateTo({
      url: '/pages/login/guid'
    })
  }
}

// 关闭弹窗
const close = () => {
  visible.value = false
}
const goRoll = () => {
  visible.value = false
  switch (adInfo.value.type) {
    case 1:
      push({url: '/pages/goodsDetail/goodsDetail'}, {data: {id:linkData.value.id}})
      break
    case 2:
      let _id = linkData.value.id[linkData.value.id.length - 1]
      push({
        url: '/pages/goodsList/goodsList'
      }, {
        data: {sid: _id}
      })
      break
    case 4:
      uni.navigateToMiniProgram({
        appId: linkData.value.appId,
        path: linkData.value.link,
        success(res) {
          // 打开成功
        }
      })
    case 5:
      push({
        url:  linkData.value.link
      })
      break
  }
}
</script>

<style scoped
       lang="scss">
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 55;
  background-color: rgba(0, 0, 0, 0.7);
}


.mask-coupon {
  z-index: 9999;
  /*background: rgba(39, 38, 39, .15);*/
  display: flex;
  justify-content: center;
  align-items: center;

  .ad-box-warp {
    width: 100%;
    position: relative;
  }

  flex-direction: column;

  .ad-boxs {
    position: relative;
    width: 100%;
    text-align: center;

    .img {
      width: 70%;
    }
  }

  .btn-receive {
    width: 446rpx;
    height: 84rpx;
    background: #EC6F43;
    border-radius: 42rpx;
    display: block;
    text-align: center;
    font-size: 28rpx;
    line-height: 84rpx;
    color: #fff;
    position: absolute;
    bottom: 32rpx;
    left: 50%;
    margin-left: -223rpx;
  }

  .close-btn {
    position: absolute;
    bottom: -70rpx;
    left: 50%;
    margin-left: -25rpx;

    .btn {
      width: 50rpx;
      height: 50rpx;
    }
  }
}

.ad-coupons {
  .ad-box-warp {
    width: 682rpx;
    position: relative;

    .ad-boxs {
      margin-bottom: 20rpx;
      .img {
        position: absolute;
        top:0;
        left:0;
        width: 100%;
        height: 100%;
      }
    }
  }

  .coupon-list {
    width: 682rpx;
    overflow: auto;

    .scrollBox {
      max-height: 528upx;
    }

    .coupon-item {
      width: 100%;
      height: 160rpx;
      margin-top: 24rpx;
      background: url('https://hnapi.booseng.com/static/images/canvas/bg-coupon-l.png') no-repeat;
      background-size: 100% 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:first-child{
        margin-top: 0;
      }
      .discount{
        display: flex;
        align-items: baseline;
        font-size: 68rpx;
        line-height: 64rpx;
        font-weight: bold;
        .unit{
          font-size: 32rpx;
        }
      }

      .info{
        font-size: 38rpx;
        .type{
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          line-height: 45rpx;
        }
        .tip{
          font-size: 24rpx;
          white-space: nowrap;
        }
      }

      .button{
        width: 144rpx;
        height: 64rpx;
        border-radius: 8rpx;
        background: #00CBCC;
        font-size: 24rpx;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .disable{
        background: #666666;
      }
      .expired{
        background: #999999;
      }

      .coupon-left{
        width: 206rpx;
        display: flex;
        justify-content: center;
      }
      .coupon-right{
        flex: 1;
        display: flex;
        padding: 0 32rpx;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}
</style>
