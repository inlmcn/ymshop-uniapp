<template>
  <layout>
    <uv-sticky bgColor="#fff" customNavHeight="0">
      <uv-navbar :fixed="false" title="售后订单" @leftClick="goBack" />
      <!-- 使用标准v-model绑定，并简化事件处理 -->
      <uv-tabs v-if="navList && navList.length" :scrollable="false" :list="navList" v-model="currentTabId" @change="onTabChange" lineColor="#00CBCC"></uv-tabs>
    </uv-sticky>
    <view class="orderList" v-if="!listEmpty && dataList && dataList.length && !loading">
      <refund-order :data="item" v-for="(item) in dataList" :key="`${type}_${item.id}`" @refresh="refresh" />
    </view>
    <Empty v-else-if="!loading" :iconSrc="emptyOrderIcon"></Empty>
    <!-- 加载中 -->
    <ListLoadLoading v-if="loading" />
    <!-- 加载完毕-->
    <ListLoadOver v-if="loadend" />
  </layout>

  <ReturnTop :scroll-top="scrollTop" />

</template>

<script setup>
import { ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeAfterSalesList } from '@/api/order'
import { useRouter } from "@/hooks/useRouter";
import { emptyOrderIcon } from "@/utils/images";
import Empty from "@/components/Empty/index.vue"
import { usePage } from "@/hooks";
import ReturnTop from "@/components/ReturnTop/index.vue";
import ListLoadOver from "@/components/ListLoadOver/index.vue"
import ListLoadLoading from "@/components/ListLoadLoading/index.vue"
import { useScroll } from "@/hooks/useScroll";

const { scrollTop } = useScroll()

const { type, refresh, dataList, loadend, loading, listEmpty, debounceRefresh } = usePage(storeAfterSalesList)

// 监听type变化，调试用
watch(() => type.value, (newVal, oldVal) => {
  console.log('Type值变化:', oldVal, '->', newVal)
})

const { goBack, getUrlParams } = useRouter();


// 定义tab列表，确保id和value保持一致
const navList = ref([
  { name: "全部", id: -1, value: -1 },
  { name: "售后中", id: 1, value: 1 },
  { name: "已完成", id: 2, value: 2 }
])

// 注释：navList中的value值已正确配置，"已完成"标签对应type=2

// 当前选中的tab ID，用于v-model绑定
const currentTabId = ref(-1)

// 处理tab变更事件 - 适配uv-tabs组件实际参数格式
const onTabChange = (params) => {
  console.log('Tab变更事件参数:', params);
  
  // 从params中获取item对象
  const item = params;
  if (!item) {
    console.error('Tab变更事件参数为空');
    return;
  }
  
  // 直接使用item.value更新type
  type.value = item.value;
  console.log('Tab变更后type值:', type.value);
  
  // 刷新数据
  debounceRefresh(200);
}

onShow(() => {
  const params = getUrlParams()
  console.log('页面显示，URL参数:', params)
  
  // 如果有URL参数，则使用URL参数，否则保持当前状态
  if (params.type && params.type !== undefined && params.type !== null) {
    const paramType = Number(params.type)
    // 确保参数值有效（-1, 1, 2）
    if ([ -1, 1, 2 ].includes(paramType)) {
      // 只有当URL参数与当前状态不同时才更新
      if (type.value !== paramType) {
        type.value = paramType
        currentTabId.value = paramType
        console.log('根据URL参数更新状态 - type:', type.value, 'currentTabId:', currentTabId.value)
      }
    }
  } else {
    // 没有URL参数时，保持当前状态不变
    console.log('保持当前状态 - type:', type.value, 'currentTabId:', currentTabId.value)
  }
  
  // 延迟刷新，确保状态已更新
  setTimeout(() => {
    refresh()
  }, 100)
})


</script>

<style lang="scss">
.orderList {
  padding: 20rpx 0;
}
</style>
