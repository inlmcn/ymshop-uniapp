<!--
    @name: index
    @author: kahu4
    @date: 2024-01-24 15:17
    @description：index
    @update: 2024-01-24 15:17
-->
<script setup>
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { useJump } from "@/hooks/useJump";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { usePaging } from "@/hooks/usePaging";
import { pageUserBill } from "@/api/account/balance";
import { onLoad, onShow } from "@dcloudio/uni-app";
import { emptyOrderIcon } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";
import dayjs from "dayjs";

const {scrollTop} = useScroll();

const {goRecharge} = useJump();

const mainStore = useMainStore();
const {user} = storeToRefs(mainStore)

const {otherParams, list, refreshPage} = usePaging({
  request: pageUserBill,
  load: false
});

onLoad(() => {
  otherParams.value.category = 'now_money'
})

onShow(() => {
  mainStore.getUserInfo()
  refreshPage()
})
</script>

<template>
  <view>
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 我的余额
    </Header>
    <view class="balance">
      <view class="balance-detail flex flex-jc__sb flex-ai__center">
        <view class="left">
          <view class="title">账户余额</view>
          <view class="money">{{ user.nowMoney.toFixed(2) }}</view>
        </view>
        <view class="right">
          <view
              class="button"
              @click="goRecharge">充值
          </view>
        </view>
      </view>

      <view class="list-card">
        <view class="title">
          收支明细
        </view>
        <template v-if="list.length>0">
          <view
              class="row flex flex-ai__center flex-jc__sb"
              v-for="order in list"
              :key="order.id">
            <view class="left flex flex-ai__center">
              <image
                  class="icon"
                  v-if="false" />
              <view class="info">
                <view class="type-name">{{ order.title }}</view>
                <view class="time">{{ dayjs(order.createTime).format("YYYY-MM-DD HH:mm:ss") }}</view>
              </view>
            </view>
            <!-- error-->
            <view
                class="right success"
                :class="{error:order.pm === 0}">
              {{ order.pm === 0 ? '-' : '+' }}{{ order.number }}
            </view>
          </view>
        </template>
        <Empty
            v-else
            :iconSrc="emptyOrderIcon"
        />
      </view>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss">
.balance {
  @include usePadding(32, 32);
  width: 100%;

  .balance-detail {
    @include usePadding(32, 32);
    background: #333333;
    color: #fff;
    width: 100%;
    border-radius: 15rpx;

    .title {
      color: #999;
      font-size: 28rpx;
      margin-bottom: 20rpx;
    }

    .money {
      font-size: 48rpx;
    }

    .button {
      @include usePadding(38, 12);
      background: #fff;
      border-radius: 15rpx;
      color: #333;
    }
  }

  .list-card {
    width: 100%;
    @include usePadding(32, 32);
    background: #fff;
    border-radius: 15rpx;
    margin-top: 30rpx;

    .title {
      font-size: 32rpx;
      font-weight: 600;
    }

    .row {
      margin: 24rpx 0;

      .left {
        .icon {
          width: 80rpx;
          height: 80rpx;
          border-radius: 10rpx;
          background: #b9b9b9;
          margin-right: 20rpx;
        }

        .type-name {
          font-size: 28rpx;
        }

        .time {
          color: #999;
          font-size: 24rpx;
        }

      }

      .right {
        @include usePadding(38, 7);
        border-radius: 10rpx;
      }

      .success {
        color: #28C445;
        background: rgba(40, 196, 69, 0.1);
      }

      .error {
        color: #00CBCC;
        background: #FFF7F5;
      }
    }
  }

}
</style>
