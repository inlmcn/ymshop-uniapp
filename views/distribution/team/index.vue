<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 14:52
    @description：我的团队
    @update: 2024-01-17 14:52
-->
<script setup>
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import { ref } from "vue";
import DistributorInfoItem from "@/views/distribution/team/component/DistributorInfoItem.vue";
import { usePaging } from "@/hooks/usePaging";
import { getUserAddCount, getUserAllCount, pageMyUserTeam } from "@/api/distribution";
import Empty from "@/components/Empty/index.vue"
import { emptyOrderIcon } from "@/utils/images";
// ======================= hooks =====================
const {scrollTop} = useScroll()
onPageScroll(() => {
})

// ======================== level tab ====================
const leverTabs = [{label: '一级', filed: 'p1Count', value: 1}, {label: '二级', filed: 'p2Count', value: 2}]
const leverCurrent = ref(1)

async function leverSelect(value) {
  leverCurrent.value = value
  otherParams.value.type = value
  await refreshPage()
  await doGetUserAddCount()
}

const {loading, otherParams, list, refreshPage} = usePaging({
  request: pageMyUserTeam,
});

const addUserCount = ref(0)

async function doGetUserAddCount() {
  addUserCount.value = await getUserAddCount({
    type: otherParams.value.type
  })
}

const allUserCount = ref({
  p1Count: 0,
  p2Count: 0
})

async function doGetUserAllCount() {
  allUserCount.value = await getUserAllCount()
}

onLoad(async () => {
  otherParams.value.type = 1
  await refreshPage()
  await doGetUserAddCount()
  await doGetUserAllCount()
})
</script>

<template>
  <view class="team">
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 我的团队
    </Header>
    <!-- tabs -->
    <view class="tab-content">
      <view class="tab-inner">
        <view
            class="tab-item"
            :class="{current:leverCurrent===lever.value}"
            v-for="lever in leverTabs"
            :key="lever.value"
            @click="leverSelect(lever.value)"
        >
          {{ lever.label }}（{{ allUserCount[lever.filed] }}）
        </view>
      </view>
    </view>
    <!-- main -->
    <view class="main">
      <!-- user num -->
      <view class="user-num-box">
        <view class="title">今日新增：
          <text class="num primary-color">{{ addUserCount }}人</text>
        </view>
      </view>
      <!-- user list -->
      <view
          class="user-list-box"
          v-if="list.length>0">
        <template
            v-for="item in list"
            :key="item.id">
          <DistributorInfoItem :data="item" />
        </template>
      </view>
      <view
          class="user-list-box"
          v-else>
        <Empty :icon-src="emptyOrderIcon" />
      </view>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss">
.team {
  width: 100%;

  .tab-content {
    width: 100%;
    background: #fff;
    @include usePadding(34, 34);

    .tab-inner {
      @include useFlex(space-between, center, row, nowrap, 30rpx);
      border-radius: 50rpx;
      width: 100%;
      background: #f5f5f5;
      border: 5rpx solid #f5f5f5;
      overflow: hidden;

      .tab-item {
        border-radius: 50rpx;

        @include usePadding(0, 16);
        text-align: center;
        flex: 1 0 auto;
        background: #f6f8f8;
        color: #333333;
        transition: all .3s;

        &.current {
          background: $white-color;
          font-weight: bold;
        }
      }
    }


  }

  .main {
    width: 100%;
    @include usePadding(34, 34);
  }

  .user-num-box {
    margin-bottom: 24rpx;
    width: 100%;
    @include useFlex(flex-start, center);
    font-size: 28rpx;

    .title {
      color: $tips-color;
      font-size: 24rpx;
    }
  }

  .user-list-box {
  }
}
</style>
