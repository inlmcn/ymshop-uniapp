<template>
  <view class="evaluation-page">
    <page-container :duration="0" :show="isShow" :overlay="false" @beforeleave="beforeleave"></page-container>
    <Navbar title="问卷信息" :isAutoBack="false" @goBack="goPrevPage" />
    <scroll-view :style="getScrollStyle()" scroll-y>
      <view class="evaluation-back">
        <image :src="detail.imgs1" mode="widthFix" />
      </view>

      <!-- 开始答题按钮 -->
      <view class="start-button">
        <button class="btn-start" @click="startEvaluation(false)">
          <image :src="COMMON_IMG_PATH + 'answer_btn.gif'" mode="widthFix"></image>
        </button>
      </view>

      <view class="evaluation-checkbox">
        <view class="evaluation-checkbox-inner">
          <uv-checkbox-group v-model="privacyPolicy" shape="circle" activeColor="#00CBCC">
            <uv-checkbox :name="1" iconSize="15">
              <view class="agreement-text">
                <text @click="checkedPrivacyPolicy">同意</text>
                <text class="color" @click="toAgreement(0)"> 《HealthCoast 隐私协议》 </text>
              </view>
            </uv-checkbox>
          </uv-checkbox-group>
        </view>
        <view class="evaluation-checkbox-total">
          已有<text>{{ userReportCount || '--' }}</text>人参与
        </view>
        <view class="evaluation-checkbox-tip">为了达到更好的改善效果，我们将采用国际营养学界主流的【膳食频率问卷法-FFQS】对您进行一次深度调研，全程<text class="color">3-5分钟</text>。</view>
      </view>
    </scroll-view>

    <uv-popup type="center" :closeOnClickOverlay="false" :closeable="true" :safe-area-inset-bottom="true" bgColor="rgba(0,0,0,0)" border-radius="20rpx" padding="40rpx" ref="popupRef">
      <view class="agreement-modal-content">
        <image :src="EVALUATION_IMG_PATH + 'fyxy_icon.png'" mode="widthFix" class="icon" />
        <view class="agreement-modal-title">服务协议和隐私</view>
        <view class="agreement-modal-text"> 您可阅读<text class="color" @click="toAgreement(0)"> 《HealthCoast 隐私协议》 </text> 了解详细信息。如您同意，请点击下方按钮开始接受我们的服务。 </view>
        <button class="agreement-modal-btn" @click="startEvaluation(true)">同意</button>
      </view>
    </uv-popup>

    <healthPartnersHit ref="healthPartnersHitRef" @close="healthPartnersHitClose" />
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { onShow,onLoad } from "@dcloudio/uni-app";
import Navbar from "../components/Navbar.vue";
import { EVALUATION_IMG_PATH, COMMON_IMG_PATH } from "@/utils/imgpath.js";
import { useMainStore } from "@/store/modules/useMainStore";
import { useInterface } from "@/hooks/useInterface";
import { storeToRefs } from "pinia";
import { getQuestionnaireDetail, getUserReportCount } from "@/api/evaluation";

import healthPartnersHit from "@/components/healthPartners/hit.vue";
import { initHealthPartnersHit, getScrollStyle, beforeleave, goPrevPage, healthPartnersHitClose, changeShow } from "../utils/backUtils";
import TencentAdSDK from "@/utils/tencentAd.js";
import { checkTheUser } from "@/api/auth";

const healthPartnersHitRef = ref(null);
const isShow = ref(true);
changeShow((val) => {
  isShow.value = val;
});

const mainStore = useMainStore();
const { toast } = useInterface();
const { user } = storeToRefs(mainStore);

const privacyPolicy = ref([]); // 协议双向绑定
const userReportCount = ref(0);

const checkedPrivacyPolicy = () => {
  if (privacyPolicy.value.length > 0) {
    privacyPolicy.value = [];
  } else {
    privacyPolicy.value = [1];
  }
};

const popupRef = ref(null);

// import icon from '@/static/images/evaluation/icon_back.png'

// // 药丸数据
// const pillList = ref([
//     { name: '高活复合维B', icon: icon },
//     { name: '姬松茸', icon: icon },
//     { name: '藤黄辛酸', icon: icon },
//     { name: '小分子玻尿酸', icon: icon },
//     { name: '益生菌', icon: icon },
//     { name: '南非醉茄', icon: icon },
//     { name: '藻油DHA', icon: icon },
//     { name: '更多', icon: icon }
// ])

// // 点击药丸事件
// const handlePillClick = (item) => {

// }

const detail = ref({
  imgs1: "",
});

onShow(() => {
  uni.showLoading({
    title: "加载中...",
  });
  getQuestionnaireDetail({ pageUrl: '/views/evaluation/startup/index' })
    .then((res) => {
      uni.hideLoading();
      detail.value = res;
    })
    .catch((err) => {
      console.error(err);
      uni.hideLoading();
    });
});

/**
 * 跳转协议
 * @param type
 */
function toAgreement(type) {
  uni.navigateTo({
    url: "/views/evaluation/startup/agreement",
  });
}

// 开始答题
const startEvaluation = (isCheck) => {
  const flag = privacyPolicy.value.length > 0;
  if (!flag && !isCheck) {
    popupRef.value.open();
    return;
  }

  if (isCheck) {
    privacyPolicy.value = [1];
  }

  if (!user.value) {
    toast({ title: "请先登录" });
    uni.navigateTo({
      url: "/pages/login/guid",
    });
    return;
  }
  uni.redirectTo({
    url: `/views/evaluation/questionnaire/index?tag=0&id=${detail.value.id}&pageUrl=${'/views/evaluation/startup/index'}`,
  });
};

onMounted(() => {
  getUserReportCount().then((res) => {
    console.log("res", res);
    userReportCount.value = res;
  });
  initHealthPartnersHit(healthPartnersHitRef);
});



onLoad(async (options) => {
  console.log("onLoad options=================================:", options);
  if (options.scene) {
  	//表示扫二维码 或者 小程序链接 过来的
  	let sc = options.scene;
  	if (sc.startsWith('code_')) {
  		let code = sc.substring(5);
  		checkTheUserInit(code,Number(options.channelId))
  	}
  }
});


async function checkTheUserInit(invitationCode,channelId) {
	//进行注册绑定关系操作
	wx.login({
		async success(res) {
			if (res.code) {
				console.log('微信code===========----' + res.code)
				let data = {};
				data.phoneCode = '888811';
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

<style scoped lang="scss">
.evaluation-page {
  background-color: #fff;
  min-height: 100vh;
  // padding: 0 30rpx;
}

.recommend-card {
  position: relative;
  height: 360rpx;
  margin-bottom: 40rpx;
  border-radius: 20rpx;
  overflow: hidden;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.main-title {
  font-size: 55rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.sub-title {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 60rpx;
  line-height: 60rpx;
}

.pill-list {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 60rpx;
  justify-content: center;
}

.pill-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% / 4);
  margin-bottom: 30rpx;
  box-sizing: border-box;
  padding: 0 10rpx;
}

.pill-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 15rpx;
  background-color: #f5f5f5;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  border-radius: 50%;
}

.pill-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  // 单行溢出省略号
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.start-button {
  display: flex;
  justify-content: center;
  // padding: 20rpx 0 0;
}

.btn-start {
  padding: 0;
  width: 470rpx;
  line-height: 1;
  background-color: transparent;
  border-radius: 45rpx;
  box-shadow: 0 8rpx 20rpx rgba(46, 203, 140, 0.3);

  &::after {
    border: none;
  }

  image {
    display: block;
    width: 100%;
    height: auto;
  }
}

.evaluation-back {
  min-height: 60vh;

  image {
    width: 100%;
    display: block;
  }
}

.evaluation-checkbox {
  font-size: 24rpx;
  margin-top: 20rpx;
  padding: 0 0 100rpx;

  .color {
    color: #00cbcc;
  }
}

.evaluation-checkbox-tip {
  margin-top: 10rpx;
  font-size: 24rpx;
  display: block;
  padding: 0 50rpx;
}

.evaluation-checkbox-inner {
  padding-left: 170rpx;
}

.agreement-text {
  font-size: 24rpx;
}

.agreement-modal-content {
  width: 60vw;
  padding: 22px 30px 30px;
  background-color: white;
  border-radius: 24rpx;
  & > image {
    width: 106rpx;
    height: 106rpx;
    display: block;
    margin: 0 auto;
  }
}

.agreement-modal-title {
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
  margin-top: 40rpx;
}

.agreement-modal-text {
  text-align: center;
  margin-top: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #666666;
  text {
    color: #00cbcc;
  }
}

.agreement-modal-btn {
  width: 360rpx;
  height: 80rpx;
  background-color: #00cbcc;
  color: white;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 45rpx;
  line-height: 80rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(46, 203, 140, 0.3);
  margin: 40rpx auto 0;
}

.evaluation-checkbox-total{
  font-size: 24rpx;
  text-align: center;
  margin: 15rpx 0;
  text{
    color: #00cbcc;
  }
}
</style>
