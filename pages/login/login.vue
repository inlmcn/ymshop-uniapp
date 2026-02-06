<template>
  <layout class="login">
    <uv-navbar
        :fixed="false"
        title="登录"
        left-arrow
        @leftClick="goBack"
    />
    <blank size="30"></blank>
    <container>
      <view class="card paddingH-10">
        <uv-form
            labelPosition="left"
            @submit="handleLogin"
        >
          <uv-form-item borderBottom>
            <uv-input
                v-model="mobile"
                border="none"
                placeholder="请输入用户名"
            >
            </uv-input>
          </uv-form-item>
          <uv-form-item borderBottom>
            <uv-input
                v-model="code"
                border="none"
                placeholder="请输入验证码"
            >
            </uv-input>
            <template #right>
              <verification
                  :mobile="mobile"
                  scene="1"
              />
            </template>
          </uv-form-item>
        </uv-form>
      </view>
      <view class="form-buttons">
        <uv-button
            round
            block
            type="primary"
            @tap="handleLogin"
        >
          登录
        </uv-button>
      </view>
      <!-- #ifdef MP -->
      <view class="form-buttons">
        <uv-button
            open-type="getPhoneNumber"
            @getphonenumber="getPhoneNumber"
        >微信登录
        </uv-button>
      </view>
      <!-- #endif -->
    </container>
    <blank size="15"></blank>
    <view class="protocol">
      登录代表同意<span class="protocol-main">《用户协议》</span>、<span
        class="protocol-main"
    >《隐私政策》</span>，并授权使用您的账号信息（如昵称、头像、收获地址）以便您统一管理
    </view>

  </layout>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { smsLogin, weixinLogin } from '@/api/auth'
import { useMainStore } from '@/store/modules/useMainStore'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from "@/hooks/useRouter";
// import { ensureUserActionSetOnce } from '@/api/tencentAds'
import { TENCENT_ADS_ACCESS_TOKEN } from '@/config'


const {goBack} = useRouter()
const mobile = ref('')
const code = ref('')
const loginCode = ref('')

const store = useMainStore()

const {user} = storeToRefs(store)


onLoad(async () => {
  // #ifdef MP
  uni.login({
    provider: 'weixin'
  }).then(res => {
    loginCode.value = res.code
  });
  // #endif
})


const handleLogin = async () => {

  if (!mobile.value) {
    uni.showToast({
      title: '手机号不能为空',
      duration: 2000
    });
    return
  }
  if (!mobile.value) {
    uni.showToast({
      title: '验证码不能为空',
      duration: 2000
    });
    return
  }

  uni.showLoading({
    title: '登录中'
  });


  let loginInfo = await smsLogin({
    "mobile": mobile.value,
    "code": code.value,
  })


  if (loginInfo) {
    await store.setAccessToken(loginInfo)
    // 登录成功后，静默保证腾讯广告 user_action_set 只创建一次（不阻塞跳转）
    // ensureUserActionSetOnce({ accessToken: TENCENT_ADS_ACCESS_TOKEN })
    uni.hideLoading();
    uni.switchTab({
      url: '/root/index/index'
    })
  }

}


const getPhoneNumber = async ({code}) => {

  if (code) {
    const loginInfo = await weixinLogin({
      phoneCode: code,
      loginCode: loginCode.value
    })
    await store.setAccessToken(loginInfo)
    // 登录成功后，静默保证腾讯广告 user_action_set 只创建一次（不阻塞跳转）
    // ensureUserActionSetOnce({ accessToken: TENCENT_ADS_ACCESS_TOKEN })
    uni.switchTab({
      url: '/root/index/index'
    })
  }

}

</script>

<style lang="scss">
.user-card {
  padding: 50rpx 0;
}

.avatar-box {
  display: flex;
  align-items: center;

  .avatar {
    width: 120rpx;
    height: 120rpx;
    background: #FFFFFF;
    border-radius: 50%;
    opacity: 1;
    margin-right: 30rpx;
  }

  .avatar-name {
    font-size: 34rpx;
    color: #333333;
  }
}

.protocol {
  padding: 0 34rpx;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  color: #999999;
  font-size: 24rpx;
  line-height: 40rpx;
  margin-bottom: constant(safe-area-inset-bottom);
  margin-bottom: env(safe-area-inset-bottom);

  &-main {
    color: #00CBCC;
  }
}
</style>
