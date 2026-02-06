<template>
  <view class="evaluation-page">
    <Navbar title="问卷信息" />
    <view class="evaluation-back">
      <image :src="detail.imgs1" mode="widthFix" />
    </view>

    <!-- 开始答题按钮 -->
    <view class="start-button">
      <button v-if="user && user.mobile" class="btn-start" @click="startEvaluation">
        <image :src="COMMON_IMG_PATH + 'answer_btn.gif'" mode="widthFix" />
      </button>
      <button v-else class="btn-start animation-button" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" @click="getCode">
        <image :src="COMMON_IMG_PATH + 'answer_btn.gif'" mode="widthFix" />
      </button>
    </view>

    <view class="evaluation-checkbox">
      <view class="evaluation-checkbox-total">
        已有<text>{{ userReportCount || "--" }}</text
        >人参与*
      </view>
      <view class="evaluation-checkbox-tip">为了达到更好的改善效果，我们将采用国际营养学界主流的【膳食频率问卷法-FFQS】对您进行一次深度调研，全程<text class="color">3-5分钟</text>。</view>
      <view class="evaluation-checkbox-tip-bottom">＊数据来源于HealthCoast2024年8月至今问卷信息用户访问数量</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onShow,onLoad } from "@dcloudio/uni-app";
import Navbar from "./components/Navbar.vue";
import { COMMON_IMG_PATH } from "@/utils/imgpath.js";
import { getQuestionnaireDetail, getUserReportCount } from "@/api/evaluation";
import { useMainStore } from "@/store/modules/useMainStore";
import { useInterface } from "@/hooks/useInterface";
import { storeToRefs } from "pinia";
import { weixinLogin, checkTheUser } from "@/api/auth";
import cookie from "@/utils/cookie";
const mainStore = useMainStore();
const { toast, loading, hideLoading } = useInterface();
const { user } = storeToRefs(mainStore);
import { wxLogin } from "@/utils/wechatUtils";
import TencentAdSDK from "@/utils/tencentAd";
import BindingHelper from "@/utils/tencentAdBindingHelper.js";

const privacyPolicy = ref([]); // 协议双向绑定
const userReportCount = ref(0);

const checkedPrivacyPolicy = () => {
  if (privacyPolicy.value.length > 0) {
    privacyPolicy.value = [];
  } else {
    privacyPolicy.value = [1];
  }
};

const detail = ref({
  imgs1: "",
});

const code = ref("");

async function getCode() {
  loading({
    title: "登陆中...",
  });
  try {
    code.value = await wxLogin();
  } catch (e) {
    console.error(e);
    toast("获取code失败");
    hideLoading();
  }
}

// 开始答题
const startEvaluation = () => {
  // const flag = privacyPolicy.value.length > 0;
  // if (!flag) {
  //   toast({ title: "请先阅读并同意《HealthCoast 隐私协议》" });
  //   return;
  // }

  if (!user.value) {
    toast({ title: "请先登录" });
    uni.navigateTo({
      url: "/pages/login/guid",
    });
    return;
  }
  // tag =  0 正常问卷， 1 投放（腾讯AD-加粉再下单）， 2 投放（腾讯AD-加粉）
  uni.redirectTo({
    url: `/views/evaluation/questionnaire/index?tag=1&id=${detail.value.id}&pageUrl=${'/root/review/friendAndOrder'}`,
  });
};

async function getPhoneNumber(e) {
  if (e.detail.errMsg !== "getPhoneNumber:ok") {
    console.error(e);
    hideLoading();
    toast({ title: "登录失败" });
  }
  try {
    const phoneCode = e.detail.code;
    const res = await weixinLogin({
      phoneCode,
      loginCode: code.value,
    });
    if (res) {
      await mainStore.setAccessToken(res);
      await mainStore.getUserInfo();
      startEvaluation();
    }
  } catch (e) {
    console.error(e);
    toast({ title: "登录失败" });
  } finally {
    hideLoading();
  }
}

async function checkTheUserInit(invitationCode,channelId) {
  //进行注册绑定关系操作
  wx.login({
    async success(res) {
      if (res.code) {
        let data = {};
        data.phoneCode = "888806";
        data.loginCode = res.code;
        data.invitationCode = invitationCode;
		data.channelId = channelId
        const loginRes = await checkTheUser(data);
        await mainStore.setAccessToken(loginRes);
        uni.hideLoading();
      }
    },
  });
}

onShow(() => {
  uni.showLoading({
    title: "加载中...",
  });
  // 使用绑定辅助工具智能绑定
  const clickId = TencentAdSDK.getClickId();
  if (clickId) {
    console.log("[问卷页] 检测到 clickId，触发智能绑定");
    // 延迟500ms执行，确保页面加载完成
    BindingHelper.smartBind({
      from: "问卷页",
      delay: 500,
    }).then((result) => {
      if (result.success) {
        console.log("[问卷页] ✅ 绑定成功");
      } else {
        console.log("[问卷页] ⚠️ 绑定跳过或失败:", result.reason);
      }
    });
  } else {
    console.log("[问卷页] 无 clickId，跳过绑定");
  }
  getUserReportCount().then((res) => {
    console.log("res", res);
    userReportCount.value = res;
  });
  getQuestionnaireDetail({ pageUrl: '/root/review/friendAndOrder' })
    .then((res) => {
      detail.value = res;
    })
    .catch((err) => {
      console.error(err);
    });

  var token = cookie.get("accessToken");
  if (!token) {
   if(isExe.value==0){
   		  checkTheUserInit("");
   }
  } else {
    setTimeout(() => {
      uni.hideLoading();
    }, 500);
  }
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

//是否执行
const isExe = ref(0);
onLoad(async (options) => {
  console.log("onLoad options=================================:", options);
 let code='';
 if (options.scene) {
 	//表示扫二维码 或者 小程序链接 过来的
 	let sc = options.scene;
 	if (sc.startsWith('code_')) {
 		code = sc.substring(5);
 	}
 }
 isExe.value=1;
 checkTheUserInit(code,Number(options.channelId))
});
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
  width: 470rpx;
  padding: 0;
  line-height: 1;
  border-radius: 45rpx;
  box-shadow: 0 8rpx 20rpx rgba(46, 203, 140, 0.3);
  background-color: transparent;

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

.evaluation-checkbox-total{
  font-size: 24rpx;
  text-align: center;
  margin: 15rpx 0;
  text{
    color: #00cbcc;
  }
}

.evaluation-checkbox-tip-bottom{
  padding: 0 50rpx;
  margin-top: 15rpx;
  font-size: 20rpx;
  text-align: center;
}
</style>
