<!--
    @name: index
    @author: kahu4
    @date: 2024-01-18 19:37
    @description：index
    @update: 2024-01-18 19:37
-->
<script setup>
import './index.scss'
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onPageScroll } from "@dcloudio/uni-app";
import { accountSignInBg, accountSignOk, accountSignStar, accountSignSuccessBg } from "@/utils/images";
import { onMounted, ref } from "vue";
import { getIntegralRule, getSignInInfo, signIn } from "@/api/account/signIn";
import { useInterface } from "@/hooks/useInterface";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import Popup from "@/components/Popup.vue";
import dayjs from 'dayjs'

const {scrollTop} = useScroll();
onPageScroll(() => {
})

const mainStore = useMainStore()
const {user, integralName} = storeToRefs(mainStore);
const {toast} = useInterface()

// 签到信息
const signInInfo = ref({
  signInDays: 0,
  todaySignIn: false,
  signInRecordList: []
})

const loading = ref(false)

/**
 * 获取签到信息
 * @return {Promise<void>}
 */
async function doGetSignInInfo() {
  try {
    loading.value = true
    signInInfo.value = await getSignInInfo();
    await doGetIntegralRule()
    // 处理签到日历
  } finally {
    loading.value = false
  }
}


const successIntegral = ref(0)
const successPopupRef = ref()

function openSuccessPopup() {
  successPopupRef.value.show()
}

async function closeSuccessPopup() {
  await doGetSignInInfo()
  successIntegral.value = 0
  successPopupRef.value.close()
}

/**
 * 签到
 * @return {Promise<void>}
 */
async function doSignIn() {
  if (loading.value) return
  if (signInInfo.value.todaySignIn) return toast({title: '今日已签到'})
  try {
    loading.value = true
    successIntegral.value = await signIn();
    await mainStore.getUserInfo()
    openSuccessPopup()
  } finally {
    loading.value = false
  }
}


const taskList = ref([])

/**
 * 获取每日任务
 * @return {Promise<void>}
 */
async function doGetIntegralRule() {
  taskList.value = await getIntegralRule();
}

onMounted(() => {
  doGetSignInInfo()
})
</script>

<template>
  <Header
      :scroll-top="scrollTop"
      system-bar-area-bg="#fff"
      header-area-bg="#fff"> 签到
  </Header>
  <view class="sign-in">
    <!-- 背景 -->
    <view
        class="bg"
        :style="{backgroundImage:`url(${accountSignInBg})`}"></view>
    <!--  内容 -->
    <view class="sign-in__inner">
      <view class="bg-mask">
        <!-- 积分显示 -->
        <view class="header-row flex flex-ai__end">
          {{ user.integral || '0.00' }}
          <text class="sub">{{ integralName }}</text>
        </view>
        <!-- 签到显示 -->
        <view class="sign-btn-row">
          <view class="title">
            您已经连续签到
            <text class="primary-color"> {{ signInInfo.signInDays }}</text>
            天
          </view>
          <view
              @click="doSignIn"
              :class="{'disable':signInInfo.todaySignIn}"
              class="btn">
            {{ signInInfo.todaySignIn ? '已签到' : '立即签到' }}
          </view>
        </view>
        <!-- 签到日历 -->
        <view class="sign-calendar">
          <view class="sign-calendar__inner">
            <template
                v-for="date in signInInfo.signInRecordList"
                :key="date.timestamp">
              <view class="item">
                <view
                    class="item-inner flex flex-column flex-ai__center flex-jc__center "
                    :class="{'disable-bg':!date.isSign}">
                  <view class="item-box flex flex-column flex-ai__center flex-jc__center">
                    <text>+{{ date.integral || 0 }}</text>
                    <image :src="date.isSign?accountSignOk:accountSignStar" />
                  </view>
                </view>
                <text
                    class="date"
                    :class="{'disable-date':!date.isSign}">
                  {{ dayjs(date.createTime).format("MM-DD") }}
                </text>
              </view>
            </template>
          </view>
        </view>
      </view>

      <!-- 每日任务Card -->
      <view class="sign-card">
        <view class="title"> 每日任务</view>
        <view class="sign-list">
          <template
              v-for="task in taskList"
              :key="task.id">
            <view class="row flex flex-ai__center">
              <image
                  class="row-icon"
                  :src="task.iconUrl" />

              <view class="row-info flex flex-ai__center flex-jc__sb">
                <view class="left">
                  <view class="name">{{ task.typeName }}{{ task.attribute1 ? `${ task.attribute1 }天` : '' }}</view>
                  <view class="sub flex flex-ai__center">

                  </view>
                </view>
                <view class="btn  flex flex-ai__center">
                  <image :src="accountSignStar" />
                  <view class="task-integral">
                    +{{ task.integral }}
                  </view>
                </view>
              </view>
            </view>
          </template>
        </view>
      </view>
    </view>
  </view>
  <Popup
      ref="successPopupRef"
      mode="center"
      :show-closeable="false">
    <view
        class="success-card"
        :style="{backgroundImage:`url(${accountSignSuccessBg})`}">
      <view class="inner">
        <view
            class="count-row flex">
          <view class="count">{{ successIntegral }}</view>
          {{ integralName }}
        </view>
        <view class="info">
          签到成功，恭喜您获得
        </view>
        <view
            class="button animation-button"
            @click="closeSuccessPopup">
          我知道了
        </view>
        <view class="tips">
          连续签到奖励更丰富
        </view>
      </view>
    </view>
  </Popup>
</template>


<style
    scope
    lang="scss">
:deep(.uni-popup__wrapper) {
  background: transparent !important;
}

</style>
