<!--
    @name: 登录页
    @author: kahu4
    @date: 2023-11-08 16:52
    @description：index
    @update: 2023-11-08 16:52
-->
<script setup>
import { loginCodeIcon, loginLogoIcon, loginPhoneIcon } from "@/utils/images";
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { nextTick, onBeforeUnmount, ref, unref } from "vue";
import { checkPhone } from "@/utils/utils";
import { useInterface } from "@/hooks/useInterface";
import { privacyAgreementUrl, sendSmsCode as sendSmsCodeRequest, smsLogin, userAgreementUrl } from '@/api/auth'
import { useMainStore } from "@/store/modules/useMainStore";
import { afterLogin } from "@/utils";
import { wxLogin } from "@/utils/wechatUtils";
import { TENCENT_ADS_ACCESS_TOKEN } from '@/config'

const {getParams, goBack, push, pushToTab} = useRouter()
const {toast} = useInterface();
const mainStore = useMainStore()


const routeParams = ref({label: '账号登录'})

const mobileFocus = ref(false)
const codeFocus = ref(false)


const form = ref({
  mobile: '',
  code: '',
  loginCode: undefined,// 微信环境的CODE
  invitationCode: undefined
})

/**
 * 清空手机号数据
 */
function clearPhone() {
  unref(form).mobile = ''
}

const isSendSms = ref(false) // 是否已经发送短信
const countDown = ref(60) // 倒计时
let countDownObj

/**
 * 发送验证码
 * @returns {Promise<*>}
 */
async function sendSmsCode() {
  if (!checkPhone(unref(form).mobile)) {
    mobileFocus.value = true
    codeFocus.value = false
    return toast({title: '请输入正确的手机号'})
  } else {
    mobileFocus.value = false
    codeFocus.value = true
  }
  if (isSendSms.value) return
  isSendSms.value = true
  await doSendSmsCode()
  countDownObj = setInterval(() => {
    countDown.value -= 1
    if (countDown.value <= 0) {
      clearInterval(countDownObj)
      isSendSms.value = false
      countDownObj = undefined
      countDown.value = 60
    }
  }, 1000)
}

/**
 * 验证码请求
 */
async function doSendSmsCode() {
  try {
    await sendSmsCodeRequest({mobile: unref(form).mobile, scene: 1})
    toast({
      title: '发送成功',
      icon: 'success'
    })
  } catch (e) {
    toast({
      title: '发送失败',
      icon: 'error'
    })
    clearInterval(countDownObj)
    isSendSms.value = false
    countDownObj = undefined
    countDown.value = 60
  }
}

const showPrivacy = ref(true)

const privacyPolicy = ref([]) // 协议双向绑定

const isPrivacyError = ref(false) // 未勾选协议

/**
 * 检查是否勾选协议
 * @returns {boolean}
 */
function checkPrivacy() {
  const flag = privacyPolicy.value.length > 0
  if (!flag) {
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
  const urls = [userAgreementUrl, privacyAgreementUrl]
  push({url: '/pages/webview/index'}, {data: {src: urls[type]}})
}

/**
 * 设置隐私协议模块是否可见
 * 解决键盘弹起fixed内容上顶问题
 * @param flag
 */
function setShowPrivacy(flag) {
  nextTick(() => {
    showPrivacy.value = flag
  })
}

const loginLoading = ref(false) // 正在登录

/**
 * 登录
 * @returns {Promise<*>}
 */
async function doLogin() {
  if (!checkPrivacy()) return toast({title: '请先阅读并同意用户协议和隐私政策'})
  if (!checkPhone(unref(form).mobile)) return toast({title: '请输入正确的手机号'})
  if (!(unref(form).code)) return toast({title: '请输入正确的验证码'})
  try {
    loginLoading.value = true
    // 如果是微信小程序环境，获取wx.login的code给后端去获取openid
    // #ifdef MP-WEIXIN
    form.value.loginCode = await wxLogin();
    // #endif
    const res = await smsLogin(form.value);
    if (res) {
      await mainStore.setAccessToken(res)
      await mainStore.getUserInfo()
      // 登录成功后，静默保证腾讯广告 user_action_set 只创建一次
      // 显式传入 access_token（如未配置则回退到本地缓存/默认配置）
      afterLogin()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loginLoading.value = false
  }
}

/**
 * 手机号验证
 */
function phoneInput(event) {
  const pattern = /[^\d]/g;
  nextTick(() => {
    form.value.mobile = event.detail.value.replace(pattern, '');
  })
}

onLoad((options) => {
  const res = getParams(options);
  if (Reflect.ownKeys(res).length > 0 && res.code) {
    form.value.invitationCode = res.code
  }
  routeParams.value = res

})
onBeforeUnmount(() => {
  countDownObj ? clearInterval(countDownObj) : void (0)
})
</script>

<template>
  <view class="login-container">
    <uv-navbar
        :fixed="false"
        :title="routeParams.label"
        left-arrow
        @leftClick="goBack"
    />

    <view class="logo-box">
      <image
          class="logo"
          :src="loginLogoIcon"
      />
    </view>

    <view class="form-box">
      <view class="form-item">
        <view class="left">
          <view class="icon">
            <image
                class="icon"
                :src="loginPhoneIcon"
            />
          </view>
          <view class="area-code">
            +86
          </view>
        </view>

        <view class="input">
          <input
              type="tel"
              placeholder="请输入手机号"
              v-model="form.mobile"
              :focus="mobileFocus"
              :adjust-position="false"
              maxlength="11"
              confirm-type="next"
              confirm-hold
              @focus="setShowPrivacy(false);codeFocus=false"
              @blur="setShowPrivacy(true)"
              @confirm="codeFocus=true"
              @input="phoneInput"

          />
          <view
              v-if="form.mobile.length>0"
              class="clear"
              @click="clearPhone"
          >
            <uv-icon
                name="close-circle-fill"
                color="#7a7a7a"
                size="24"
            />
          </view>
        </view>
      </view>

      <view class="form-item">
        <view class="left">
          <view class="icon">
            <image
                class="icon"
                :src="loginCodeIcon"
            />
          </view>
          <view class="area-code">
          </view>
        </view>

        <view class="input authCode flex flex-ai__center flex-jc__sb">
          <input
              type="number"
              placeholder="请输入验证码"
              :adjust-position="false"
              v-model="form.code"
              :focus="codeFocus"
              confirm-type="done"
              @focus="setShowPrivacy(false)"
              @blur="setShowPrivacy(true)"
              @confirm="doLogin"
          />
          <view
              class="primary-button send-button"
              :class="{disabled:isSendSms}"
              @click="sendSmsCode"
          >
            {{ isSendSms ? `${ countDown }S` : '发送' }}
          </view>
        </view>
      </view>
	  <view><uv-text type="warning" text="提醒:演示阶段验证码:9999,用户直接手机登录即可"></uv-text></view>
      <view class="button-group">
        <view
            class="primary-button button"
            :class="{disabled:loginLoading}"
            @click="doLogin"
        >
          确认
        </view>
      </view>
    </view>

    <view
        class="agreement-box"
        :class="{'error-animation':isPrivacyError,'hide-box':!showPrivacy}"
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
    </view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.login-container {
  width: 100%;
  height: 100vh;
  background: $white-color;

  .logo-box {
    @include useFlex(center, center);
    width: 100%;
    padding-top: 185rpx;

    .logo {
      width: 244rpx;
      height: 96rpx;
    }
  }

  .form-box {
    @include usePadding(48, 0);
    margin-top: 200rpx;
    width: 100%;

    .form-item {
      @include usePadding(0, 30);
      @include useFlex(space-between, center);
      color: #000000;
      font-size: 28rpx;
      border-bottom: 1rpx solid #F5F5F5;


      .left {
        @include useFlex(space-between, center);
      }

      .icon {
        width: 36rpx;
        height: 36rpx;
      }

      .area-code {
        @include usePadding(16, 0);
        margin-right: 16rpx;
        border-right: 1rpx solid #f5f5f5;
        font-weight: bold;

      }

      .input {
        position: relative;
        flex-grow: 1;

        .clear {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          transition: all .3s;

          &:active {
            scale: 1.1;
          }
        }
      }

      .authCode {
        input {
          width: 50%;
        }

        .send-button {
          @include usePadding(50, 14)
        }
      }
    }
  }

  .button-group {
    margin-top: 64rpx;

    .button {
      height: 100rpx;
      font-size: 28rpxpx;
      display: flex;
      align-items: center;
      justify-content: center;
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

  .hide-box {
    bottom: -100rpx;
  }

  .error-animation {
    animation: error-text 0.8s 1;
  }
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
