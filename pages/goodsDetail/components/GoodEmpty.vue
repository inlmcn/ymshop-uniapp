<!--
    @name: 空购物车
    @author: kahu4
    @date: 2023-11-06 15:59
    @description：CartEmpty
    @update: 2023-11-06 15:59
-->
<script setup>
import Empty from '@/components/Empty/index.vue'
import { nextTick, onMounted, ref } from 'vue'
import { emptyGoodIcon } from "@/utils/images";
import { useRouter } from "@/hooks/useRouter";
import Recommend from "@/components/Recommend/index.vue";

const {pushToTab} = useRouter()
const recommendRef = ref()
onMounted(() => {
  nextTick(() => {
    recommendRef.value.executeRefresh()
  })
})
</script>

<template>
  <Empty
      :iconSrc="emptyGoodIcon"
  >
    <template #default>
      商品不存在～
    </template>
    <template #bottom>
      <view
          class="go-on-btn"
          @click="pushToTab({url:'/root/index/index'})"
      >
        继续逛逛
      </view>
    </template>
  </Empty>
  <!-- 商品推荐 -->
  <Recommend ref="recommendRef" />
</template>

<style
    scoped
    lang="scss"
>
.go-on-btn {
  padding: 15rpx 50rpx;
  margin-top: 20rpx;
  background: #333333;
  color: #fff;
}

</style>
