<template>
  <layout>
    <uv-sticky customNavHeight="0">
      <uv-navbar
          :fixed="false"
          title="商品列表"
          left-arrow
          @leftClick="goBack"
      />
      <view class="search-bar">
        <uv-search
            :value="keyword"
            shape="round"
            placeholder="搜索商品"
            show-action
            @custom="onSearch"
            @clear="onClear"
            @search="onSearch"
            :focus="false"
            :input-align="'left'"
            :show-action-button="true"
            @input="onInput"
        >
        </uv-search>
      </view>
    </uv-sticky>

    <blank size="15"></blank>

    <container>
      <template v-if="!listEmpty">
        <uv-grid
            :border="false"
            :col="1"
            :gutter="10"
        >
          <uv-grid-item
              v-for="(item, index) in dataList"
              :key="index"
          >
            <card class="pro-card">
              <goods
                  link
                  list
                  :data="item"
                  :storeName="item.storeName"
                  :price="item.price"
                  :stock="!item.campaignType"
                  :isCollectFoot="false"
                  :groupBuy="item.campaignType === 1"
                  :original="item.campaignType === 1"
                  :buyProgress="[2,3].includes(item.campaignType)"
                  :total="[2,3].includes(item.campaignType)"
              >
              </goods>
            </card>
          </uv-grid-item>
        </uv-grid>
      </template>
      <Empty
          v-else
          :iconSrc="emptyCollectIcon"
      >
        这里空空如也~
      </Empty>
      <!-- 加载中 -->
      <ListLoadLoading v-if="loading" />
      <!-- 加载完毕-->
      <ListLoadOver v-if="loadend" />
    </container>

  </layout>
  <ReturnTop :scrollTop="scrollTop" />

</template>

<script setup>

import { getProductList } from '@/api/product'
import { onLoad } from '@dcloudio/uni-app'
import { usePage } from '@/hooks'
import { useRouter } from "@/hooks/useRouter";
import Empty from "@/components/Empty/index.vue"
import ListLoadOver from "@/components/ListLoadOver/index.vue"
import ListLoadLoading from "@/components/ListLoadLoading/index.vue"
import { emptyCollectIcon } from "@/utils/images";
import ReturnTop from "@/components/ReturnTop/index.vue"
import { useScroll } from "@/hooks/useScroll";
import { ref } from 'vue';

const {scrollTop} = useScroll()
const {getParams, goBack} = useRouter()
const {keyword, refresh, sid, couponId, dataList, loadend, loading, listEmpty, debounceRefresh} = usePage(getProductList)

// 防抖计时器
let debounceTimer = null;

onLoad((options) => {
  const params = getParams(options)
  keyword.value = params.keyword || ''
  sid.value = params.sid || ''
  couponId.value = params.couponId || ''
  refresh()
})

const onSearch = () => {
  // 执行搜索，使用防抖刷新
  debounceRefresh(200)
}

const onInput = (value) => {
  // 输入框内容变化时更新keyword值
  keyword.value = value;
  
  // 清除之前的计时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  // 如果关键字为空，立即刷新
  if (!value) {
    debounceRefresh(100);
    return;
  }
  
  // 设置新的计时器，延迟500ms后执行搜索
  debounceTimer = setTimeout(() => {
    debounceRefresh(200);
  }, 500);
}

const onClear = () => {
  keyword.value = ''
  // 清除后立即刷新列表
  debounceRefresh(100)
}


</script>

<style lang="scss">
.pro-card {
  margin-bottom: 20rpx;
  border-radius: 15rpx;
  width: 100%;
}
</style>
