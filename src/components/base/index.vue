<!--
    @name: LazyImage
    @author: kahu4
    @date: 2023-11-16 18:38
    @description：图片懒加载
    @update: 2023-11-16 18:38
-->
<script setup>
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, toRefs } from "vue";
import { lazyLoading } from "@/utils/images";

/**
 * @property {string|number} 图片的唯一标识 必填(要求和lazy-${id})
 */
const props = defineProps({
  unique: {
    type: [String, Number],
    required: true
  },
  src: {
    type: String,
    required: true
  },
  mode: {
    type: String
  }
})
const {
  unique,
  src,
  mode
} = toRefs(props)

const showTruePic = ref(false); // 是否展示真实地址

const _this = getCurrentInstance()
let intersectionObserver = null;

function observerImage() {
  if (!_this) {
    console.warn('LazyImage: Component instance not available');
    return;
  }
  
  intersectionObserver = uni.createIntersectionObserver(_this, {
    thresholds: [0],
    observeAll: false,
    nativeMode: true // 启用 nativeMode 提高性能
  });
  
  intersectionObserver.relativeToViewport({
    bottom: 100
  })
  
  intersectionObserver.observe(`.lazy-${ unique.value }`, (res) => {
    if (res.intersectionRatio <= 0) return
    showTruePic.value = true
    // 观察到图片后，可以立即断开观察，释放资源
    if (intersectionObserver) {
      intersectionObserver.disconnect();
      intersectionObserver = null;
    }
  })
}

onMounted(() => {
  // 使用 nextTick 和 setTimeout 确保 DOM 已经完全渲染
  nextTick(() => {
    setTimeout(observerImage, 50);
  });
})

onUnmounted(() => {
  // 组件卸载时清理观察器
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }
})
</script>

<template>
  <view :class="['lazy-image']">
    <view :class="[`lazy-${unique}`,'lazy-image__inner']">
      <image
          v-if="showTruePic"
          class="image-context"
          :src="src"
          :mode="mode"
      />
      <image
          class="image-context"
          :src="lazyLoading"
          v-else
      />
    </view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.lazy-image {
  // 微信小程序不设置这个会炸裂
  width: 100%;
  height: 100%;

  &__inner {
    width: 100%;
    height: 100%;

    .image-context {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
