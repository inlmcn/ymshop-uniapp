<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 11:12
    @description：分销中心
    @update: 2024-01-17 11:12
-->
<script setup>
import Header from "@/components/Header/index.vue";
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline, onShow } from "@dcloudio/uni-app";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { distributionCenterCardList, distributionCenterInfoList } from "@/views/distribution/center/index.data";
import DistributionShare from '@/components/Share/Distribution.vue'
import DistributionPoster from '@/components/Poster/Distribution.vue'
import { checkIsDistribution } from "@/api/distribution";
import { useJump } from "@/hooks/useJump";
import { SharePathKey, useShare } from "@/hooks/useShare";
import { useRouter } from "@/hooks/useRouter";

// ========================= hooks =========================
const {scrollTop} = useScroll();
const {getParams} = useRouter();
const {goDistributionApplyFor} = useJump();
const {distributionShare, shareAppMessage, shareTimeline, shareH5} = useShare();
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)
onPageScroll(() => {
})

const mainStore = useMainStore();
const {user} = storeToRefs(mainStore);
const phoneEncrypt = computed(() => {
  if (!user.value || !user.value.mobile) return '-'
  const truePhone = user.value.mobile
  return `${ truePhone.slice(0, 3) }****${ truePhone.slice(-4) }`
})

const distributionShareRef = ref()
const distributionPosterRef = ref()

/**
 * 确认分享
 * @param shareItem
 */
function shareConfirm(shareItem) {
  // 调用share方法
  const shareInfo = distributionShare(userDistributionInfo.value.id);
  if (shareItem.value === 'photo') {
    distributionPosterRef.value.open(shareInfo, userDistributionInfo.value)
  } else {
    //  邀请好友 处理h5 微信的邀请逻辑已经在share组件内部做了
    shareH5()
  }
}


/**
 * 点击了卡片选项
 * @param cardItem
 */
function clickCardItem(cardItem) {
  if (cardItem.path === 'share') {
    distributionShareRef.value.open()
    return
  }
  if (typeof cardItem.path === 'function') {
    cardItem.path(userDistributionInfo.value)
  }
}


// 经销商详情
const userDistributionInfo = ref({
  id: '',
  status: -1,
  refuse: '',
  realName: '',
  levelName: '',
  superiorName: '',
  addUpWages: 0,
  refuseAmount: 0,
  amount: 0
})
// 是否展示当前页面
const showPage = ref(false)

/**
 * 检查当前用户是否是分销商
 * @returns {Promise<void>}
 */
async function doCheckIsDistribution() {
  userDistributionInfo.value = await checkIsDistribution();
  // 使用一个flag避免页面山东问题
  if (userDistributionInfo.value.status !== 1) {
    // status不等于2不是经销商，跳转申请页面
    goDistributionApplyFor({id: shareId.value}, true)
    // showPage.value = true
  } else {
    // 否则展示
    showPage.value = true
  }
}

onShow(() => {
  doCheckIsDistribution()
})

const shareId = ref(undefined)

onLoad((options) => {
  const params = getParams(options);
  // 处理是否是扫码跳转过来的，扫码跳转过来的会携带上级ID，赋值给shareId并且传递给申请页面处理
  if (Reflect.ownKeys(params).length > 0 && params.t && params.t === SharePathKey.DISTRIBUTION_USER) {
    shareId.value = params.id
  }
})
</script>

<template>
  <Header
      :scroll-top="scrollTop"
      system-bar-area-bg="#fff"
      header-area-bg="#fff">
    分销中心
  </Header>
  <view
      class="distribution-center"
      v-if="showPage">

    <!-- userinfo -->
    <view
        class="userinfo-box flex flex-jc__start"
        v-if="user">
      <image
          class="user-header"
          :src="user.avatar" />
      <view class="userinfo flex flex-column flex-jc__sb">
        <view class="phone"> {{ phoneEncrypt }}</view>
        <view class="tag-list flex flex-jc__start flex-ai__center flex-wrap">
          <view class="tag-item primary-color">
            {{ userDistributionInfo.superiorName }} 推荐
          </view>
          <view class="tag-item">
            分销等级 {{ userDistributionInfo.levelName }}
          </view>
        </view>
      </view>
    </view>
    <!-- 分销信息 -->
    <view class="distribution-card">
      <view class="info-row flex flex-ai__center flex-jc__sa">
        <view
            class="item"
            v-for="infoItem in distributionCenterInfoList"
            :key="infoItem.field">
          <span class="data"> {{ userDistributionInfo[infoItem.field] || '0.00' }} </span>
          <span class="title">{{ infoItem.label }}</span>
        </view>
      </view>
      <!-- grid -->
      <view class="grid-row">
        <view
            class="item"
            v-for="cardItem in distributionCenterCardList"
            :key="cardItem.label"
            @click="clickCardItem(cardItem)">
          <image :src="cardItem.icon" />
          <text>{{ cardItem.label }}</text>
        </view>
      </view>
    </view>
    <DistributionShare
        ref="distributionShareRef"
        @share="shareConfirm" />
    <DistributionPoster ref="distributionPosterRef" />
  </view>
</template>
<style lang="scss">
page {
  background: $page-bg-color;
}
</style>
<style
    scoped
    lang="scss">
.distribution-center {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(to bottom, #fdfdfd, $page-bg-color);
  @include usePadding(30, 30);

  .userinfo-box {
    width: 100%;

    .user-header, .userinfo {
      flex-shrink: 0
    }

    .user-header {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%
    }

    .userinfo {
      margin-left: 24rpx;
      font-size: 44rpx;
      font-weight: bold;
      max-width: 80%;

      .tag-list {
        margin-top: 5rpx;
        gap: 10rpx;

        .tag-item {
          font-size: 20rpx;
          flex-shrink: 0;
          @include usePadding(16, 5);
          border-radius: 50rpx;
          border: 1rpx solid #697591;
          color: #697591;
        }
      }
    }
  }

  .distribution-card {
    margin-top: 30rpx;
    width: 100%;
    background: #333333;
    color: #fff;
    border-radius: 15rpx;

    .info-row {
      @include usePadding(0, 30);

      .item {
        @include useFlex(center, center, column);
        font-size: 32rpx;
        position: relative;
        flex: 1 0 auto;

        .title {
          font-size: 24rpx;
          color: $tips-color;
        }

        &:after {
          content: '';
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 2rpx;
          border-radius: 2rpx;
          height: 50%;
          background: #fff;
        }

        &:last-child {
          &:after {
            width: 0;
          }
        }
      }
    }

    .grid-row {
      @include usePadding(0, 48);
      background: #fff;
      color: #2B2B2B;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      row-gap: 32rpx;
      border-radius: 15rpx;

      .item {
        @include useFlex(center, center, column);
        transition: all .3s;

        image {
          width: 60rpx;
          height: 60rpx;
          background: #fbfbfb;
        }

        text {
          margin-top: 16rpx;
          font-size: 24rpx;
        }

        &:active {
          scale: 0.9;
        }
      }
    }
  }
}

.primary-color {
  border-color: $primary-color !important;
  color: $primary-color !important;
}
</style>
