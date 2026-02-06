<!--
    @name: index
    @author: kahu4
    @date: 2024-01-19 14:26
    @description：index
    @update: 2024-01-19 14:26
-->
<script setup>
import './index.scss'
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onPageScroll } from "@dcloudio/uni-app";
import { accountIntegralBg, emptyOrderIcon } from "@/utils/images";
import { ref } from "vue";
import { pageIntegralBill } from "@/api/account/integral";
import { usePaging } from "@/hooks/usePaging";
import dayjs from "dayjs";
import Empty from '@/components/Empty/index.vue'
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";

const {scrollTop} = useScroll();
onPageScroll(() => {
})

const mainStore = useMainStore()
const {user, integralName} = storeToRefs(mainStore);

const filterTabs = [
  {label: '全部', value: 99},
  {label: '收入', value: 1},
  {label: '支出', value: 0}
]

const tabCurrent = ref(99)

async function tabCurrentChange(item) {
  tabCurrent.value = item.value
  if (item.value === 99) {
    delete otherParams.value.pm
  } else {
    otherParams.value.pm = item.value
  }
  await refreshPage()
}

// 账单列表
const {otherParams, list, loading, refreshPage} = usePaging({
  request: pageIntegralBill,
  load: false
})

onLoad(() => {
  otherParams.value = {}
  otherParams.value.category = "integral"
  refreshPage()
})

</script>

<template>
  <view>
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 我的{{ integralName }}
    </Header>
    <view class="integral">
      <!-- 积分展示 -->
      <view
          class="num-card"
          :style="{backgroundImage:`url(${accountIntegralBg})`}">
        <view class="title">当前{{ integralName }}</view>
        <view class="num"> {{ user.integral || '0.00' }}</view>
      </view>
      <!-- tabs -->
      <view class="tabs-row flex flex-ai__center flex-jc__sb">
        <view
            class="tab-item"
            :class="{current:tabCurrent === tab.value}"
            v-for="tab in filterTabs"
            :key="tab.value"
            @click="tabCurrentChange(tab)">
          {{ tab.label }}
        </view>
      </view>
      <!-- list -->
      <view class="integral-list">
        <template v-if="list.length>0">
          <view
              class="row flex flex-jc__sb flex-ai__center"
              v-for="item in list">
            <view class="left">
              <view class="name">{{ item.title }}</view>
              <view class="time">{{ dayjs(item.createTime).format("YYYY-MM-DD HH:mm:ss") }}</view>
            </view>
            <view
                class="right"
                :class="{error:item.pm===0,success:item.pm===1}">
              {{ item.pm === 0 ? '-' : '+' }}{{ item.number }}
            </view>
          </view>
        </template>
        <template v-if="!loading && list.length===0">
          <Empty
              :icon-src="emptyOrderIcon"
              padding="0 0" />
        </template>
      </view>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss">

</style>
