<!--
    @name: index
    @author: kahu4
    @date: 2024-01-18 17:35
    @description：index
    @update: 2024-01-18 17:35
-->
<script setup>
import Header from "@/components/Header/index.vue"
import { useScroll } from "@/hooks/useScroll";
import { onMounted, ref, toRefs, unref } from "vue";
import { getMemberEquityList, getMemberLevelList, getMemberTaskList, getUserMemberLevel } from "@/api/member";
import { EnumTaskButton, taskButtonLabel } from "@/views/member/index/index.data";
import { memberCart, memberShare } from "@/utils/images";
import { useJump } from "@/hooks/useJump";
import InviteFriends from "@/components/Share/InviteFriends.vue";
import InviteFriendsPoster from "@/components/Poster/InviteFriends.vue";

import { useShare } from "@/hooks/useShare";
import { useMainStore } from "@/store/modules/useMainStore";
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";

const {scrollTop} = useScroll();
const loading = ref(false)
const {goHome} = useJump()
// ================================ swiper  ================================
const swiperCurrent = ref(0) // 当前swiper选中

/**
 *
 * @param e
 */
function swiperChange(e) {
  swiperCurrent.value = e.detail.current
  // 刷新会员权益
  doGetMemberEquityList()
}

// ================================ 会员等级列表  ================================
// 当前用户会员信息
const memberLeverInfo = ref({
  currentGrowthValue: 0,
  currentLevel: null,
  needGrowthValue: 0,
  nextLevel: null
})

/**
 * 获取当前用户会员信息
 * @return {Promise<void>}
 */
async function doGetUserMemberLevel() {
  try {
    loading.value = true
    memberLeverInfo.value = await getUserMemberLevel()
  } finally {
    loading.value = false
  }
}

const memberLevelList = ref([])

/**
 * 获取会员等级列表
 * @return {Promise<void>}
 */
async function doGetMemberLevelList() {
  try {
    loading.value = true
    const data = await getMemberLevelList()
    // 获取当前用户的等级id
    let index = 0
    if (memberLeverInfo.value.currentLevel) {
      // 没有会员等级
      index = data.findIndex(item => item.id === memberLeverInfo.value.currentLevel.id);
    }
    swiperCurrent.value = index
    memberLevelList.value = data
  } finally {
    loading.value = false
  }
}

// ================================== 会员任务 ==============================================
const memberTaskList = ref([])
const memberTaskGrowthConfig = ref({})
/**
 * 获取会员任务列表
 * @return {Promise<void>}
 */
async function doGetMemberTaskList() {
  try {
    loading.value = true
    memberTaskGrowthConfig.value = await getMemberTaskList()
  } finally {
    loading.value = false
  }
}

function handleTaskButtonClick(type) {
  const tabFunc = {
    [EnumTaskButton.CONSUME]: goToConsumption,
    [EnumTaskButton.INVITE]: goToInvite
  }
  tabFunc[type]()
}

/**
 * 去消费
 */
function goToConsumption() {
  goHome()
}

/**
 * 去邀请
 */
function goToInvite() {
  openShare()
}

// ================================= 会员权益 ====================================================
const memberEquityList = ref([])

/**
 * 获取会员权益
 * @return {Promise<void>}
 */
async function doGetMemberEquityList() {
  try {
    loading.value = true
    const currentLevelId = memberLevelList.value[swiperCurrent.value].id
    memberEquityList.value = await getMemberEquityList({levelId: currentLevelId});
  } finally {
    loading.value = false
  }
}

// ================================ 邀请 =====================================================
const mainStore = useMainStore()
const {user} = toRefs(mainStore)
const {userInvitationShare, shareH5, shareAppMessage, shareTimeline} = useShare()
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)
const inviteFriendsRef = ref()
const inviteFriendsPosterRef = ref()

function openShare() {
  inviteFriendsRef.value.open()
}

function handleShareConfirm(shareItem) {
  const share = userInvitationShare(unref(user).invitationCode || '');
  if (shareItem.value === 'wechat') {
    shareH5()
  } else {
    inviteFriendsPosterRef.value.open(share)
  }
}

onMounted(async () => {
  // 1.获取当前用户等级 2.获取会员等级列表（寻找默认选中） 3.获取会员任务列表 4.获取会员权益
  await doGetUserMemberLevel()
  await doGetMemberLevelList()
  await doGetMemberTaskList()
  await doGetMemberEquityList()
})
</script>

<template>
  <view>
    <Header
        :header-area-bg="'#fff'"
        system-bar-area-bg="#fff"
        :scroll-top="scrollTop"
        prop-up
    >
      会员中心
    </Header>
    <view
        class="member"
        v-if="memberLevelList.length>0">
      <!-- 背景 -->
      <view
          class="bg"
          :style="{
             background: `linear-gradient(to bottom, ${memberLevelList[swiperCurrent].colorNum}, #F6F6F6)`
          }"
          :class="`bg-${swiperCurrent}`"></view>
      <!-- swiper -->
      <swiper
          class="swiper"
          previous-margin="24rpx"
          next-margin="24rpx"
          circular
          :current="swiperCurrent"
          @change="swiperChange">
        <swiper-item
            v-for="item in memberLevelList"
            :key="item.id"
        >
          <view
              class="swiper-item"
              :style="{backgroundImage:`url(${item.backgroundUrl})`,color:item.colorNum}">
            <view class="name">
              {{ item.levelName }}
            </view>
            <view class="level">
              <template v-if="memberLeverInfo.currentLevel">
                当前等级 {{ memberLeverInfo.currentLevel.levelName }}
              </template>
              <template v-else>
                当前不是会员
              </template>
            </view>
            <view class="bottom flex flex-ai__center flex-jc__sb">
              <!-- 会员 -->
              <template v-if="memberLeverInfo.currentLevel">
                <view class="left">
                  <view class="process">
                    <view
                        class="schedule"
                        :style="{width:`${memberLeverInfo.currentGrowthValue>=item.growthValue?100:memberLeverInfo.currentGrowthValue/item.growthValue}%`,background:item.colorNum}"></view>
                  </view>
                  <view
                      class="tips"
                      v-if="item.growthValue > memberLeverInfo.currentGrowthValue">
                    再获取{{ item.growthValue - memberLeverInfo.currentGrowthValue }}经验，可升级为{{ item.levelName }}会员
                  </view>
                </view>
                <view
                    class="right"
                    v-if="memberEquityList.length>0">
                  尊享以下{{ memberEquityList.length }}项特权
                </view>
              </template>
              <!-- 非会员 -->
              <template v-else>
                <view class="left">
                  <view class="process">
                    <view
                        class="schedule"
                        :style="{width:`${memberLeverInfo.currentGrowthValue/item.growthValue}%`,background:item.colorNum}"></view>
                  </view>
                  <view
                      class="tips"
                      v-if="item.growthValue > memberLeverInfo.currentGrowthValue">
                    再获取{{ item.growthValue - memberLeverInfo.currentGrowthValue }}经验，可升级为{{ item.levelName }}会员
                  </view>
                </view>
                <view
                    class="right"
                    v-if="memberEquityList.length>0">
                  尊享以下{{ memberEquityList.length }}项特权
                </view>
              </template>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- card 特权-->
      <view
          class="card"
          v-if="memberEquityList.length>0">
        <view class="card__inner">
          <view class="title">
            会员特权
          </view>
          <view class="grid-box">
            <view
                class="grid-item flex flex-ai__center flex-jc__center flex-column"
                v-for="equity in memberEquityList"
                :key="equity.id">
              <image :src="equity.iconUrl" />
              <view class="name">
                {{ equity.typeName }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- card 成长任务-->
      <view class="card">
        <view class="card__inner">
          <view class="title">
            成长任务
          </view>
          <view class="list-box">
<!--            <view-->
<!--                class="list-item flex flex-ai__center"-->
<!--                v-for="task in memberTaskList"-->
<!--                :key="task.id">-->
<!--              <image :src="task.iconUrl" />-->
<!--              <view class="info flex flex-jc__sb flex-ai__center">-->
<!--                <view class="left">-->
<!--                  <view class="name">{{ task.typeName }}</view>-->
<!--                  <view class="tips">每次{{ task.typeName }}可获{{ task.growthValue }}成长值</view>-->
<!--                </view>-->
<!--                <view-->
<!--                    class="button animation-button"-->
<!--                    @click="handleTaskButtonClick(task.type)">-->
<!--                  去{{ taskButtonLabel[task.type] }}-->
<!--                </view>-->
<!--              </view>-->
<!--            </view>-->
            <view
                class="list-item flex flex-ai__center">
              <image :src="memberCart" />
              <view class="info flex flex-jc__sb flex-ai__center">
                <view class="left">
                  <view class="name">消费</view>
                  <view class="tips">每消费1元可获得{{memberTaskGrowthConfig.consumeGrowthValue}}成长值</view>
                </view>
                <view
                    class="button animation-button"
                    @click="handleTaskButtonClick('consume')">
                  去消费
                </view>
              </view>
            </view>
            <view
                class="list-item flex flex-ai__center">
              <image :src="memberShare" />
              <view class="info flex flex-jc__sb flex-ai__center">
                <view class="left">
                  <view class="name">邀请</view>
                  <view class="tips">每邀请一名用户可获得{{memberTaskGrowthConfig.inviteGrowthValue}}成长值</view>
                </view>
                <view
                    class="button animation-button"
                    @click="handleTaskButtonClick('invite')">
                  去邀请
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 邀请好友 -->
    <InviteFriends
        ref="inviteFriendsRef"
        @share="handleShareConfirm" />
    <InviteFriendsPoster ref="inviteFriendsPosterRef" />
  </view>

</template>

<style
    scoped
    lang="scss">
.member {
  width: 100%;
  position: relative;
  @include usePadding(0, 24);

  .swiper {
    width: 100%;
    height: 338rpx;

    .swiper-item {
      padding: 92rpx 40rpx 20rpx 40rpx;
      box-sizing: border-box;
      height: 100%;
      margin: 0 10rpx;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      position: relative;
      transition: all .3s;

      .name {
        position: relative;
        font-size: 48rpx;
        font-weight: 600;
      }

      .level {
        font-size: 24rpx;
        margin-top: 17rpx;
      }

      .bottom {
        font-size: 20rpx;
        position: absolute;
        bottom: 20rpx;
        width: calc(100% - 80rpx);

        .left {
          flex-grow: 1;
          padding-right: 30rpx;

          .process {
            width: 100%;
            height: 10rpx;
            border-radius: 10rpx;
            background: #664B301A;
            position: relative;

            .schedule {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              border-radius: 10rpx;
            }
          }

          .tips {
            margin-top: 12rpx;

          }
        }

        .right {
          font-weight: bold;
        }
      }
    }
  }


  .bg {
    width: 100%;
    height: 386rpx;
    position: absolute;
    top: 0;
    left: 0;
    background: linear-gradient(to bottom, #402E0A, #F6F6F6);
  }

  .card {
    width: 100%;
    margin: 24rpx 0;
    background: none;
    @include usePadding(34, 0);

    .card__inner {
      width: 100%;
      background: #fff;
      @include usePadding(32, 32);
      border-radius: 15rpx;

      .title {
        font-size: 32rpx;
        font-weight: 600;
      }

      .grid-box {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        row-gap: 20rpx;
        @include usePadding(0, 16);

        .grid-item {
          image {
            width: 80rpx;
            height: 80rpx;
            background: #fbfbfb;
            border-radius: 10rpx;
            margin-bottom: 10rpx;

          }

          .name {

            color: #2B2B2B;
            font-size: 24rpx;
          }
        }
      }

      .list-box {
        .list-item {
          margin: 28rpx 0;

          image {
            width: 80rpx;
            height: 80rpx;
            background: #fbfbfb;
            border-radius: 10rpx;
            margin-right: 16rpx;
          }

          .info {
            flex-grow: 1;

            .name {
              font-size: 32rpx;
            }

            .tips {
              color: $tips-color;
              font-size: 24rpx;
            }

            .button {
              @include usePadding(32, 14);
              border-radius: 10rpx;
            }
          }

        }
      }
    }
  }

}

</style>
