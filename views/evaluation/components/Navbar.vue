<template>
  <Header :scrollTop="scrollTop" :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <uv-icon name="arrow-left" size="20" color="#000" @click="goPrevPage(1)" />
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="goPrevPage(2)" />
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

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  scrollTop: {
    type: Number,
    default: 0,
  },
  isAutoBack: {
    type: Boolean,
    default: true,
  }
});

const emit = defineEmits(["goBack"]);

const goHome = () => {
  uni.switchTab({
    url: '/root/index/index'
  })
};

const goPrevPage = (type) => {
  if (props.isAutoBack) {
    if (type === 1) {
      goBack();
    } else if (type === 2) {
      goHome();
    }
  } else {
    emit('goBack', type, () => {
      if (type === 1) {
        goBack();
      } else if (type === 2) {
        goHome();
      }
    })
  }
};
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
