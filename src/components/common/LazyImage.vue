<template>
  <image
    :src="currentSrc"
    :mode="mode"
    :lazy-load="false"
    :show-menu-by-longpress="showMenuByLongpress"
    @load="onLoad"
    @error="onError"
    :style="[imageStyle, { opacity: imageOpacity }]"
    :class="imageClass"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';

interface Props {
  src: string;
  placeholder?: string; // 占位图
  errorImage?: string;  // 错误图
  mode?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  showMenuByLongpress?: boolean;
  animation?: boolean; // 是否启用淡入动画
  animationDuration?: number; // 动画持续时间
  intersectionObserverOptions?: IntersectionObserverInit; // 相交观察器选项
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'aspectFill',
  placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU1ZTUiIC8+PC9zdmc+',
  errorImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmZjYiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==',
  width: '100%',
  height: '100%',
  radius: 0,
  showMenuByLongpress: false,
  animation: true,
  animationDuration: 300,
  intersectionObserverOptions: () => ({ threshold: [0.1] })
});

const currentSrc = ref(props.placeholder);
const imageOpacity = ref(0);
const imageLoaded = ref(false);
const imageError = ref(false);

// 图片样式
const imageStyle = computed(() => ({
  width: typeof props.width === 'number' ? props.width + 'px' : props.width,
  height: typeof props.height === 'number' ? props.height + 'px' : props.height,
  borderRadius: typeof props.radius === 'number' ? props.radius + 'px' : props.radius,
  transition: props.animation ? `opacity ${props.animationDuration}ms ease-in-out` : 'none'
}));

const imageClass = computed(() => ({
  'lazy-image': true,
  'loaded': imageLoaded.value,
  'error': imageError.value
}));

// 检查图片是否在视口中
const isInViewport = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// 加载图片
const loadImage = async () => {
  if (!props.src) return;
  
  try {
    // 使用 uni.getImageInfo 验证图片是否存在
    await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = reject;
      image.src = props.src;
    });
    
    currentSrc.value = props.src;
    imageLoaded.value = true;
    imageOpacity.value = 1;
  } catch (error) {
    console.error('LazyImage load error:', error);
    currentSrc.value = props.errorImage;
    imageError.value = true;
    imageOpacity.value = 1;
  }
};

// 图片加载成功
const onLoad = (e: any) => {
  if (!imageLoaded.value) {
    imageLoaded.value = true;
    imageOpacity.value = 1;
    // 触发自定义事件
    emits('load', e);
  }
};

// 图片加载失败
const onError = (e: any) => {
  if (!imageError.value) {
    currentSrc.value = props.errorImage;
    imageError.value = true;
    imageOpacity.value = 1;
    // 触发自定义事件
    emits('error', e);
  }
};

// 事件发射器
interface Emits {
  (e: 'load', event: any): void;
  (e: 'error', event: any): void;
}

const emits = defineEmits<Emits>();

// 监听src变化
watch(() => props.src, (newSrc) => {
  if (newSrc) {
    currentSrc.value = props.placeholder;
    imageLoaded.value = false;
    imageError.value = false;
    imageOpacity.value = 0;
    loadImage();
  }
});

onMounted(() => {
  // 立即尝试加载图片
  if (props.src) {
    loadImage();
  }
});
</script>

<style scoped>
.lazy-image {
  background-color: #f5f5f5;
  transition: opacity 0.3s ease-in-out;
}

.lazy-image.loaded {
  opacity: 1;
}

.lazy-image.error {
  opacity: 1;
}
</style>