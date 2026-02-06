<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 11:12
    @description：申请分销商
    @update: 2024-01-17 11:12
-->
<script setup>
import Header from '@/components/Header/index.vue'
import AddressSelect from '@/components/AddressSelect/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onPageScroll, onShow } from "@dcloudio/uni-app";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { nextTick, ref } from "vue";
import { distributionAudit, distributionError } from "@/utils/images";
import { useJump } from "@/hooks/useJump";
import { useInterface } from "@/hooks/useInterface";
import { applyDistribution, checkIsDistribution, updateApply } from "@/api/distribution";
import { useRouter } from "@/hooks/useRouter";
import { getDictByType } from "@/api/global";
import { distributionAgreementUrl } from "@/api/auth";

const {scrollTop} = useScroll()
onPageScroll(() => {
})
const {goDistribution} = useJump()
const {getParams} = useRouter()
const mainStore = useMainStore();
const {user, areaList} = storeToRefs(mainStore);
const {goWebview, goHome} = useJump();
const {push} = useRouter();
const {toast} = useInterface()
// ======================== 表单 ===================================
const showPrivacy = ref(true)

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

const userCheckData = ref({
  status: null,
  refuse: '',
  realName: '',
  levelName: '',
  superiorName: '',
  addUpWages: 0,
  refuseAmount: 0,
  amount: 0
})
const subLoading = ref(false)
const form = ref({
  realName: '',
  address: '',
  reason: '',
  superiorIdP1: undefined
})

function verify() {
  // 校验表单
  if (agreementFlag.value.length <= 0) {
    toast({title: '请先阅读并勾选协议'})
    return false
  }
  if (!form.value.realName) {
    toast({title: '请输入真实姓名'})
    return false
  }
  if (!form.value.address) {
    toast({title: '请选择真实地址'})
    return false
  }
  return true

}

async function handleSubmit() {
  if (subLoading.value) return
  if (!verify()) return
  try {
    subLoading.value = true
    if (!isUpdate.value) {
      await applyDistribution(form.value)
    } else {
      await updateApply(form.value)
      isUpdate.value = false
    }
    await doCheckIsDistribution()
  } finally {
    subLoading.value = false
  }
}

/**
 * 检查当前用户是否是分销商
 * @returns {Promise<void>}
 */
async function doCheckIsDistribution() {
  userCheckData.value = await checkIsDistribution();
  if (userCheckData.value.status === 1 && !isUpdate.value) {
    goDistribution({}, true)
  }
  return userCheckData.value
}


/**
 * 再次申请
 */
function applyForAgain() {
  form.value = {
    ...form.value,
    ...{
      realName: '',
      address: '',
      reason: ''
    }
  }
  userCheckData.value = {
    status: null,
    refuse: '',
    realName: '',
    levelName: '',
    superiorName: '',
    addUpWages: 0,
    refuseAmount: 0,
    amount: 0
  }
}

// ======================== 地址相关 ================================
const addressPickerRef = ref()
const defaultSelect = ref([0, 0, 0])

function handleChooseAddress() {
  addressPickerRef.value.open(isUpdate.value ? form.value.address : '')
}

function handleConfirmAddress(values) {
  form.value.address = values.reduce((pre, now, index) => {
    if (index === 0) {
      pre = now.name
    } else {
      pre = pre + '-' + now.name
    }
    return pre
  }, '');
}

const agreementFlag = ref([]) // length > 0就是勾选了

/**
 * 阅读分销协议
 */
async function readAgreement() {
  push({url: '/pages/webview/index'}, {data: {src: distributionAgreementUrl}})
}

const showFlag = ref(false)

onShow(async () => {
  showFlag.value = false
  if (isUpdate.value) {
    const data = await doCheckIsDistribution()
    form.value.realName = data.realName
    form.value.address = data.address
    // form.value.address =
    form.value.reason = data.reason
  } else {
    await doCheckIsDistribution()
  }
  showFlag.value = true
})
const isUpdate = ref(false)



const bottomHight = ref(0)
onLoad(async (options) => {
  const params = getParams(options);
  // 是否是更新
  isUpdate.value = (params && params.update) || false
  // 有上级ID处理上级ID
  form.value.superiorIdP1 = (params && params.id) || undefined;
  const app = uni.getSystemInfoSync();
  const environment = uni.getSystemInfoSync().platform
  bottomHight.value = app.safeAreaInsets.bottom === 0 ? 25 : app.safeAreaInsets.bottom
})
</script>

<template>
  <view
      class="apply-for"
      v-if="user">
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff">申请分销商
    </Header>
    <view class="inner">
      <view class="bg"></view>
      <!-- userinfo -->
      <view class="userinfo flex flex-column flex-ai__center flex-jc__center">
        <image :src="user.avatar" />
        <text class="username">{{ userCheckData.realName || user.nickname }}</text>
      </view>
      <!-- card -->
      <view
          class="apply-card"
          v-if="showFlag">
        <!-- form -->
        <view
            v-if="userCheckData.status === null || isUpdate"
            class="form">
          <view class="row">
            <text class="label">
              真实姓名
            </text>
            <div class="right">
              <input
                  :adjust-position="false"
                  v-model="form.realName"
                  type="text"
                  placeholder="请输入真实姓名"
                  @focus="setShowPrivacy(false)"
                  @blur="setShowPrivacy(true)" />
            </div>
          </view>
          <view class="row">
            <text class="label">
              现居城市
            </text>
            <div
                class="right flex flex-jc__sb flex-ai__center"
                @click="handleChooseAddress">
              <text
                  class="placeholder"
                  v-if="!form.address">
                请选择省、市、区
              </text>
              <text
                  class="placeholder"
                  v-else>
                {{ form.address }}
              </text>
              <uv-icon name="arrow-right" />
            </div>
          </view>
          <view class="row">
            <text class="label">
              申请原因
            </text>
            <div class="right">
              <input
                  :adjust-position="false"
                  @focus="setShowPrivacy(false)"
                  @blur="setShowPrivacy(true)"
                  v-model="form.reason"
                  type="text"
                  placeholder="请输入申请原因" />
            </div>
          </view>
          <view
              class="submit"
              :style="{bottom: bottomHight + 'px'}"
              :class="{'hide-box':!showPrivacy}">
            <view class="tips">提交成功后，我们将会在1-3个工作日内给您回复</view>
            <view
                class="button animation-button"
                @click="handleSubmit">提交审核
            </view>
            <view class="agreement tips flex flex-ai__center">
              <uv-checkbox-group
                  activeColor="#ed6d47"
                  shape="circle"
                  v-model="agreementFlag"
              >
                <uv-checkbox
                    name=""
                />
              </uv-checkbox-group>
              勾选代表同意
              <text
                  class="primary-color"
                  @click="readAgreement">《分销协议》
              </text>
            </view>
          </view>
        </view>
        <!-- state success -->
        <view
            class="state"
            v-if="userCheckData.status === 0 && !isUpdate">
          <image :src="distributionAudit" />
          <view class="title">申请提交成功，请耐心等待...</view>
          <view
              class="btn"
              @click="goHome">继续逛逛
          </view>
        </view>
        <!-- state error -->
        <view
            class="state"
            v-if="userCheckData.status === 2  && !isUpdate">
          <image :src="distributionError" />
          <view class="title">不好意思，商家拒绝了您的申请...</view>
          <view class="sub-title">拒绝理由：{{ userCheckData.refuse }}</view>
          <view class="flex flex-jc__center flex-ai__center">
            <view
                class="btn line-btn"
                @click="applyForAgain">
              再次申请
            </view>
            <view
                class="btn"
                @click="goHome">
              继续逛逛
            </view>
          </view>
        </view>
        <!-- state 清退 -->
        <view
            class="state"
            v-if="userCheckData.status === -1  && !isUpdate">
          <image :src="distributionError" />
          <view class="title">您已被清退，请重新申请</view>
          <view class="sub-title">{{ userCheckData.refuse }}</view>
          <view class="flex flex-jc__center flex-ai__center">
            <view
                class="btn line-btn"
                @click="applyForAgain">
              再次申请
            </view>
            <view
                class="btn"
                @click="goHome">
              继续逛逛
            </view>
          </view>
        </view>
      </view>
    </view>
    <AddressSelect
        ref="addressPickerRef"
        v-model:default-value="defaultSelect"
        @confirm="handleConfirmAddress" />
  </view>
</template>

<style
    scoped
    lang="scss">
.apply-for {
  width: 100%;
  position: relative;

  .header {
    position: relative;
  }

  .inner {
    position: relative;

    .bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      aspect-ratio: 750/460;
      background: #333333;
      z-index: 0;
    }

    .userinfo {
      position: relative;
      z-index: 1;
      width: 100%;
      @include usePadding(0, 72);

      image {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 4rpx solid #fff;
      }

      .username {
        color: #fff;
        font-size: 34rpx;
        margin-top: 30rpx;
        font-weight: bold;
      }

    }

    .apply-card {
      position: relative;
      z-index: 1;
      background: #f6f6f6;
      border-radius: 30rpx;
      @include usePadding(34, 34);

      .form {
        width: 100%;
        background: #fff;
        @include usePadding(32, 0);
        border-radius: 30rpx;

        .row {
          @include useFlex(flex-start, center);


          .label {
            font-size: 28rpx;
            margin-right: 24rpx;
          }

          .right {
            @include usePadding(0, 32);
            border-bottom: 1rpx solid #f6f6f6;
            flex-grow: 1;

            .placeholder {
              color: #808080;
            }
          }
        }

        .submit {
          width: 80%;
          position: fixed;
          @include useFlex(center, center, column);


          .tips {
            color: $tips-color;
            font-size: 24rpx;
          }

          .button {
            width: 100%;
            margin-top: 30rpx;
            height: 80rpx;
            @include useFlex(center, center);
            border-radius: 15rpx;
          }

          .agreement {
            margin-top: 30rpx;
          }
        }
      }

      .state {
        width: 100%;
        @include useFlex(center, center, column);
        @include usePadding(0, 50);

        image {
          width: 170rpx;
          height: 170rpx;
        }

        .title {
          font-size: 28rpx;
          margin-bottom: 12rpx;

        }

        .sub-title {
          font-size: 24rpx;
          margin-bottom: 32rpx;

          color: $tips-color
        }

        .btn {
          width: 230rpx;
          height: 80rpx;
          background: #333333;
          color: #fff;
          @include useFlex(center, center, column);
          border-radius: 15rpx;
          margin: 30rpx 15rpx;
        }

        .line-btn {
          background: #fff;
          border: 1rpx solid #00CBCC;
          color: #00CBCC; 
          box-sizing: border-box;
        }
      }
    }
  }

}

.hide-box {
  bottom: -500rpx !important;
}

</style>
