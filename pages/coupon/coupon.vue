<template>
	<Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
		<template #left>
			<view class="header-left">
				<uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
				<image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
			</view>
		</template>
		<text class="header-title">领券中心</text>
	</Header>
  <layout>

	  
    <!--  <uv-sticky customNavHeight="0">
		
    <uv-navbar
          :fixed="false"
          :safeAreaInsetTop="true"
          autoBack
          title="领券中心"
      /> 
    </uv-sticky>-->
    <view class="swiper">
      <image
          class="image"
          :src="couponBg"
          mode="widthFix" />
    </view>
    <view
        class="coupon-box"
        v-if="!listEmpty"
    >
      <template
          v-for="(item,index) in dataList"
          :key="item.id"
      >
        <view class="coupon-item">
          <view class="discount">
            <view class="unit pre-unit" v-if="item.couponType === 1">
              ￥
            </view>
            {{item.couponType === 1 ? item.couponValue : item.discount}}
            <view class="unit" v-if="item.couponType === 2">
              折
            </view>
          </view>
          <view class="center">
            <view class="tip">
              {{item.threshold!==0?`满${item.threshold}元使用`:'无门槛使用'}}
            </view>
            <view class="time">
              <view class="label">有效期</view>
              <view class="value" v-if="item.expirationType === 1">{{ $timeFormat(item.takingEffectTime, 'yyyy.mm.dd') }} - {{ $timeFormat(item.expirationTime, 'yyyy.mm.dd') }}</view>
              <view class="value" v-if="item.expirationType === 2">领取后{{item.expirationDay}}天内可用</view>
			  <view class="value" v-if="item.expirationType === 3">无限制时间</view>
            </view>
          </view>
          <view class="right">
            <view class="progress">
              <zui-progress-circle :position="getPosition(item)" :range="[130, 50]" :size="90" :texture="[ '#E85A2B', '#F8CFC2' ]"/>
              <div class="text-box">
                <view class="text">已领</view>
                <view class="text">{{parseInt(getPosition(item)*100)}}%</view>
              </div>
            </view>
            <view class="btn" v-if="!item.obtainable" @click="goToProduct(item.id)">去使用</view>
            <view class="btn btn-primary" v-else @click="receiveCoupon(item.id)">立即领取</view>
          </view>
        </view>
      </template>
    </view>
    <Empty
        v-else
        :iconSrc="emptyCollectIcon"
    >
      这里空空如也~
    </Empty>
  </layout>
</template>


<script setup>
import { ref } from 'vue'
import { getCouponListByClId } from '@/api/coupon'
import { onLoad } from '@dcloudio/uni-app'
import { emptyCollectIcon, couponBg } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";
import { useCoupon } from '@/hooks/useCoupon'
import { useGlobalProperties } from "@/hooks";
import { checkTheUser } from "@/api/auth";
import { useMainStore } from "@/store/modules/useMainStore";
import Header from '@/components/Header/index.vue'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath.js'
import { useRouter } from '@/hooks/useRouter'
const { getParams, goBack,toHome } = useRouter()


const {$timeFormat} = useGlobalProperties()
const {refresh, dataList, listEmpty, receiveCoupon, goToProduct,otherQuery} = useCoupon(getCouponListByClId)

const getPosition = (item)=>{
  return ((item.totalNumber - item.number) / item.totalNumber).toFixed(2)
}
const clId = ref('')
onLoad(async (option) => {
	if(option.scene){
		clId.value = option.scene
	}
	if(option.id){
		clId.value = option.id
	}
	console.log("============options==============="+JSON.stringify(option))
	checkTheUserInit();
})

async function checkTheUserInit() {
		//进行注册绑定关系操作
		wx.login({
		  async success(res) {
		    if (res.code) {
		    console.log('微信code===========----'+res.code)
		     let data={};
		     data.phoneCode='888803';
		     data.loginCode = res.code;
		     data.invitationCode='';
			 const mainStore = useMainStore()
			 const loginRes = await checkTheUser(data);
			 await mainStore.setAccessToken(loginRes)
			  if (clId.value) {
				   otherQuery.value = { clId: clId.value }
				 }
			   await refresh()
		    }
		  }
		});
	}
</script>

<style lang="scss" scoped>
	
	
	// Header Section
	.header-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #121212;
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
	
	.header-right {
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.6);
		border-radius: 50px;
		padding: 16rpx 26rpx;
		border: 1px solid rgba(151, 151, 151, 0.2);
	
		.icon-more {
			width: 37rpx;
			height: 13rpx;
			background-color: #000;
			border-radius: 2rpx;
		}
	
		.divider {
			width: 1rpx;
			height: 37rpx;
			background-color: rgba(0, 0, 0, 0.2);
			margin: 0 23rpx;
		}
	
		.icon-search {
			width: 34rpx;
			height: 34rpx;
		}
	}
	
	
	
.swiper {
  width: 100%;

  .image {
    width: 100%;
    display: block;
  }
}

.coupon-box {
  width: 100%;
  padding: 34rpx;
  box-sizing: border-box;
  .coupon-item {
    display: flex;
    height: 180rpx;
    margin-bottom: 24rpx;
    background: url("https://hnapi.booseng.com/static/activity/coupon/bg-coupon.png") no-repeat bottom center / 100% 100%;
    .discount{
      width: 200rpx;
      color: #E85A2B;
      font-size: 64rpx;
      display: flex;
      justify-content: center;
      align-items: baseline;
      padding-top: 45rpx;
      font-weight: bold;
      .unit{
        font-size: 32rpx;
        margin-left: 10rpx;
        &.pre-unit{
          margin-left: 0;
        }
      }
    }
    .center{
      flex:1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .tip{
        font-size: 28rpx;
        color: #262626;
        line-height: 39rpx;
        margin-bottom: 25rpx;
      }
      .time{
        font-size: 20rpx;
        line-height: 32rpx;
        .label{
          color: #999999;
          margin-bottom: 4px;
        }
        .value{
          color: #262626;
        }
      }
    }
    .right{
      width: 192rpx;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .progress{
        position: relative;
        .text-box{
          position: absolute;
          top: 50%;
          left: 50%;
          margin: -24rpx 0 0 -22rpx;
          .text{
            font-size: 20rpx;
            color: #E85A2B;
            line-height: 24rpx;
          }
        }
      }
      .btn{
        width: 112rpx;
        height: 44rpx;
        border-radius: 22rpx;
        border: 1px solid #E85A2B;
        font-size: 20rpx;
        color: #E85A2B;
        display: flex;
        justify-content: center;
        align-items: center;
        &.btn-primary{
          background-color: #E85A2B;
          color: #fff;
        }
      }
    }
  }
}
</style>
