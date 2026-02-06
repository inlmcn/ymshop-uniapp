<!--
    @name: 登录引导页
    @author: kahu4
    @date: 2023-11-08 16:20
    @description：index
    @update: 2023-11-08 16:20
-->
<script setup>
import { loginLogoIcon, wechat } from "@/utils/images";
import { useRouter } from "@/hooks/useRouter";
import { loginMethods } from "@/pages/login/index.data";
import { wxLogin } from "@/utils/wechatUtils";
import { ref } from "vue";
import { useInterface } from "@/hooks/useInterface";
import { privacyAgreementUrl, userAgreementUrl, weixinLogin } from "@/api/auth";
import { useMainStore } from "@/store/modules/useMainStore";
import { afterLogin,h5InWeChat } from "@/utils";
import {storeToRefs} from "pinia";
import { VUE_H5_DOMAIN_NAME,APP_ID, TENCENT_ADS_ACCESS_TOKEN } from "@/config";

const {toast, loading, hideLoading} = useInterface()
const {goBack, push,pushToTab} = useRouter()
const mainStore = useMainStore()
const {logoSrc} = storeToRefs(mainStore);

async function toLogin(loginMethod) {
	pushToTab({url: '/root/index/index'})
  //push({url: '/pages/index/index', animationType: 'slide-in-right'}, {data: {...loginMethod}})
}

// ============================= 微信登录相关
const code = ref('') // logingCode必须比getPhoneNumber的code先获取

async function getCode() {
  loading({
    title: '登陆中...'
  })
  try {
    code.value = await wxLogin();
  } catch (e) {
    console.error(e)
    toast('获取code失败')
    hideLoading()
  }
}

async function getPhoneNumber(e) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    console.error(e)
    hideLoading()
    toast({title: '登录失败'})
  }
  try {
    const phoneCode = e.detail.code
    const res = await weixinLogin({
      phoneCode,
      loginCode: code.value
    });
    if (res) {
      await mainStore.setAccessToken(res)
      await mainStore.getUserInfo()
      // 登录成功后，静默保证腾讯广告 user_action_set 只创建一次
      // 显式传入 access_token（如未配置则回退到本地缓存/默认配置）
      afterLogin()
    }
  } catch (e) {
    console.error(e)
    toast({title: '登录失败'})
  } finally {
    hideLoading()
  }
}


const privacyPolicy = ref([]) // 协议双向绑定

const isPrivacyError = ref(false) // 未勾选协议

/**
 * 检查是否勾选协议
 * @returns {boolean}
 */
function checkPrivacy() {
  const flag = privacyPolicy.value.length > 0
  if (!flag) {
    toast({title: '请先阅读并同意用户协议和隐私政策'})
    isPrivacyError.value = true
    setTimeout(() => {
      isPrivacyError.value = false
    }, 1000)
  }
  return flag
}

/**
 * 跳转协议
 * @param type
 */
function toAgreement(type) {
  if (type === 0) {
    push({url: '/pages/login/user-agreement'})
  } else if (type === 1) {
    push({url: '/pages/login/privacy-policy'})
  }
}

//微信公众号登录
const isPrivacyShow = ref(false)
const wechatLogin = () => {
	if (!h5InWeChat()) {
	    toast({title: '请微信中打开'})
		return
	}
	if (!checkPrivacy()) {
		isPrivacyShow.value = true
		return 
	}
	console.log('hu001')
	isPrivacyShow.value = false
	
	//公众号登录
	const url = `${VUE_H5_DOMAIN_NAME}/root/index/index`
	//cookie.set('index_url',url)
	let redirect_uri = encodeURIComponent(url)
		
	const state = 'STATE'
	location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${APP_ID}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
	
}

</script>

<template>
  <view class="login-guid">
    <!-- <uv-navbar
        :fixed="false"
        title="登录"
        left-arrow
        @leftClick="goBack"
    />
    <view class="main-box flex flex-jc__center">
      <image
          class="logo"
          mode="widthFix"
          :src="logoSrc"
      />
    </view>

    <view class="button-group">-->
      <!-- #ifdef MP-WEIXIN -->
     <!-- <view
          v-if="privacyPolicy.length<=0"
          class="button animation-button disabled"
          @click="checkPrivacy"
      >
        一键登录
      </view>
      <button
          v-else
          class="button animation-button"
          open-type="getPhoneNumber"
          @getphonenumber="getPhoneNumber"
          @click="getCode"
      >
        一键登录
      </button>-->
      <!-- #endif -->
     <!-- <template
          v-for="(loginMethod) in loginMethods"
          :key="loginMethod.type"
      >
        <view
            :class="`button animation-button ${loginMethod.classNames.join(' ')}`"
            @click="toLogin(loginMethod)"
        >

          {{ loginMethod.label }}
        </view>
      </template>-->
	  <!-- #ifdef H5 -->
	 <!--  <uv-button text="微信登录" type="success" @click="wechatLogin()"></uv-button>-->
	   <!-- #endif -->

    <!-- </view>-->
    <!-- #ifdef MP-WEIXIN -->
    <!-- <view
        class="agreement-box"
        :class="{'error-animation':isPrivacyError}"
    >
      <uv-checkbox-group
          v-model="privacyPolicy"
          shape="circle"
          activeColor="#00CBCC"
      >
        <uv-checkbox :name="1">
          <view class="agreement-text">
            阅读并同意
            <span
                class="color"
                @click="toAgreement(0)"
            >
              《HealthCoast商城用户协议》
            </span>
            和
            <span
                class="color"
                @click="toAgreement(1)"
            >
              《HealthCoast商城隐私协议》
            </span>
          </view>
        </uv-checkbox>
      </uv-checkbox-group>
    </view> -->
    <!-- #endif -->
	 <!--
	<view
		v-if="isPrivacyShow"
	    class="agreement-box"
	    :class="{'error-animation':isPrivacyError}"
	>
	  <uv-checkbox-group
	      v-model="privacyPolicy"
	      shape="circle"
	      activeColor="#00CBCC"
	  >
	    <uv-checkbox :name="1">
	      <view class="agreement-text">
	        阅读并同意
	        <span
	            class="color"
	            @click="toAgreement(0)"
	        >
	          《HealthCoast商城用户协议》
	        </span>
	        和
	        <span
	            class="color"
	            @click="toAgreement(1)"
	        >
	          《HealthCoast商城隐私协议》
	        </span>
	      </view>
	    </uv-checkbox>
	  </uv-checkbox-group>
	</view> -->

  </view>

</template>

<style
    scoped
    lang="scss"
>
.login-guid {
  width: 100%;
  height: 100vh;
  background: $white-color;

  .main-box {
    width: 100%;
    top: 300rpx;
    position: absolute;

    .logo {
      width: 255rpx;
      /* 使用 widthFix 保持比例，移除固定高度避免变形 */
      height: auto;
    }
  }

  .button-group {
    @include usePadding(50, 0);
    width: 100%;
    font-size: 28rpx;
    position: absolute;
    bottom: 20%;

    .button {
      width: 100%;
      margin-bottom: 30rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 88rpx;
      font-size: 28rpx;
      border-radius: 0;

      .icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 20rpx;

      }
    }

    .white-button {
      background: $white-color;
      border: 1rpx solid #333;
      color: #333;
    }
  }

}

.agreement-box {
  @include usePadding(30, 0);
  position: fixed;
  bottom: 5%;
  width: 100%;
  font-size: 24rpx;
  color: $tips-color;
  transition: all .3s;


  .agreement-text {
    text-align: center;

    .color {
      color: $primary-color;
    }
  }

  :deep(.uv-checkbox ) {
    width: 100%;
    align-items: flex-start;

    .uv-checkbox__icon-wrap {
    }
  }
}

.error-animation {
  animation: error-text 0.8s 1;
}

@keyframes error-text {
  0% {
    transform: translateX(0);
  }
  5%, 25%, 45%, 65%, 85% {
    transform: translateX(-10rpx);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(10rpx);
  }
  15%, 35%, 55%, 75%, 95% {
    transform: translateX(20rpx);
  }
  20%, 40%, 60%, 80%, 100% {
    transform: translateX(-20rpx);
  }
}
</style>
