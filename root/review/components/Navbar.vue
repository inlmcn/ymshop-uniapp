<template>
  <Header :scrollTop="scrollTop" :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <!-- <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" /> -->
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="goHome" />
      </view>
    </template>
    <text class="header-title">{{ title }}</text>
  </Header>
</template>
<script setup>
import Header from "@/components/Header/index.vue";
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from "@/utils/imgpath";
import { useRouter } from "@/hooks/useRouter"
const { getParams, goBack, toHome } = useRouter();

const goHome = () => {
   uni.switchTab({
      url: '/root/index/index'
    })
};

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  scrollTop: {
    type: Number,
    default: 0,
  },
});
</script>

<style lang="scss">
.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;

  .icon-home {
    width: 48rpx;
    height: 48rpx;
  }
}

</style>
