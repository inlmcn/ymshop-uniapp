<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 11:12
    @description：我的资料
    @update: 2024-01-17 11:12
-->
<script setup>
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onPageScroll } from "@dcloudio/uni-app";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { checkIsDistribution } from "@/api/distribution";
import { ref } from "vue";
import { useJump } from "@/hooks/useJump";

const { goDistributionApplyFor } = useJump();

const { scrollTop } = useScroll()
onPageScroll(() => {
})
const mainStore = useMainStore();
const { user, areaList } = storeToRefs(mainStore);

const distributionDetailsInfo = ref({})

async function doGetDistributionDetails() {
  distributionDetailsInfo.value = await checkIsDistribution();
}

function doUpdate() {
  goDistributionApplyFor({ update: true })
}

doGetDistributionDetails()
</script>

<template>
  <view class="apply-for" v-if="user">
    <Header :scroll-top="scrollTop" system-bar-area-bg="#fff" header-area-bg="#fff">我的资料
    </Header>
    <view class="inner" v-if="distributionDetailsInfo.realName">
      <view class="bg"></view>
      <!-- userinfo -->
      <view class="userinfo flex flex-column flex-ai__center flex-jc__center">
        <image :src="user.avatar" />
        <text class="username">{{ user.nickname }}</text>
      </view>
      <!-- card -->
      <view class="apply-card">
        <!-- form -->
        <view class="form">
          <view class="row">
            <text class="label">
              真实姓名
            </text>
            <div class="right">
              <input type="text" disabled v-model="distributionDetailsInfo.realName" placeholder="请输入真实姓名" />
            </div>
          </view>
          <view class="row">
            <text class="label">
              现居城市
            </text>
            <div class="right flex flex-jc__sb flex-ai__center">
              <text class="placeholder">{{ distributionDetailsInfo.address || '-' }}</text>
            </div>
          </view>
          <view class="row">
            <text class="label">
              申请原因
            </text>
            <div class="right">
              <input disabled v-model="distributionDetailsInfo.reason" type="text" placeholder="请输入申请原因" />
            </div>
          </view>
          <view class="submit">
            <view class="button animation-button" @click="doUpdate">修改信息
            </view>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<style scoped lang="scss">
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
      width: 0;
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
          bottom: 50rpx;
          /* #ifdef MP-WEIXIN */
          bottom: env(safe-area-inset-bottom);
          /* #endif */
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
          margin-bottom: 32rpx;
        }

        .btn {
          width: 230rpx;
          height: 80rpx;
          background: #333333;
          color: #fff;
          @include useFlex(center, center, column);
          border-radius: 15rpx;
          margin: 0 15rpx;
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
</style>
