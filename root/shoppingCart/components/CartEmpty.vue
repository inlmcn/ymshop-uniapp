<!--
    @name: 空购物车
    @author: kahu4
    @date: 2023-11-06 15:59
    @description：CartEmpty
    @update: 2023-11-06 15:59
-->
<script setup>
import Empty from '@/components/Empty/index.vue'
import { emptyCartIcon } from "@/utils/images";
import { useRouter } from "@/hooks/useRouter";

const {pushToTab} = useRouter()

</script>

<template>
  <Empty
      :iconSrc="emptyCartIcon"
      :padding="'220rpx 0 0 0'"
  >
    <template #default>
      购物车里空空如也～
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
