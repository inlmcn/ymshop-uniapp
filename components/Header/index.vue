<!--
    @name: index
    @author: kahu4
    @date: 2023-11-09 10:56
    @description：index
    @update: 2023-11-09 10:56
-->
<script setup>
import { computed, defineProps, ref, toRefs, unref, watch, onMounted, nextTick } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { createAnimation } from "@/utils/utils";
import { useScroll } from "@/hooks/useScroll";

const HEADER_HEIGHT = 60 // header高度

const {goBack} = useRouter()
/**
 * @property {String} systemBarAreaBg 系统导航条区域背景颜色
 * @property {String} headerAreaBg header区域背景颜色
 * @property {String} headerAreaTextColor header区域字体
 * @property {Boolean} showReturn 是否展示返回按钮
 * @property {String} returnColor 返回按钮的颜色
 * @property {Number} returnSize 返回按钮的大小
 * @property {Boolean||String} textShadow 字体阴影
 * @property {Boolean} bgChangeByScroll 是否随着页面滚动增加header背景（包括system-bar-area）
 * @property {String} bgChangeColor 滚动时候变换的颜色
 * @property {Number} scrollTop 当前页面高度
 * @property {Boolean} showRight 是否需要右边
 * @property {number} leftWidth 左侧（返回）宽度（设置了此属性title将不再居中）
 *
 */
const props = defineProps({
  scrollTop: {
    type: Number,
    default: () => 0
  },
  systemBarAreaBg: {
    type: String,
    default: () => '#FFFFFF00' // 透明 #FFFFFF00
  },
  headerAreaBg: {
    type: String,
    default: () => '#FFFFFF00' // 透明 #FFFFFF00
  },
  headerAreaTextColor: {
    type: String,
    default: () => '#000000'
  },
  showReturn: {
    type: Boolean,
    default: () => true
  },
  returnColor: {
    type: String,
    default: () => '#000'
  },
  returnSize: {
    type: Number,
    default: () => 16
  },
  textShadow: {
    type: [Boolean, String],
    default: () => false
  },
  bgChangeByScroll: {
    type: Boolean,
    default: () => true
  },
  bgChangeColor: {
    type: String,
    default: () => '#fff'
  },
  propUp: {
    type: Boolean,
    default: () => true
  },
  showRight: {
    type: Boolean,
    default: () => true
  },
  leftWidth: {
    type: Number,
    default: () => 0
  },
  circleBack: {
    type: Boolean,
    default: false
  }
})

const {
  systemBarAreaBg,
  headerAreaBg,
  headerAreaTextColor,
  showReturn,
  returnColor,
  returnSize,
  textShadow,
  bgChangeByScroll,
  bgChangeColor,
  propUp,
  showRight,
  leftWidth,
  scrollTop,
  circleBack
} = toRefs(props)

const emits = defineEmits(['getSystemInfo', 'animation'])


// 高度信息 单位px
const heightInfo = ref({
  safeAreaInsets: {bottom: 0, top: 0, left: 0, right: 0}, // 安全区信息
  statusBarHeight: 0, // 状态栏高度
  screenWidth: 0, // 屏幕内部宽度
  screenHeight: 0, // 屏幕内部高度
})

// 用于缓存系统信息的全局变量
let cachedSystemInfo = null

/**
 * 获取系统信息，设置导航条
 */
function getSystemInfo(retryCount = 0) {
  try {
    // 如果有缓存且缓存的状态栏高度大于0，直接使用缓存
    if (cachedSystemInfo && cachedSystemInfo.statusBarHeight > 0) {
      const heightObj = unref(heightInfo)
      heightObj.safeAreaInsets = cachedSystemInfo.safeAreaInsets
      heightObj.statusBarHeight = cachedSystemInfo.statusBarHeight
      heightObj.screenWidth = cachedSystemInfo.screenWidth
      heightObj.screenHeight = cachedSystemInfo.screenHeight
      console.log('使用缓存的系统信息:', cachedSystemInfo)
      return
    }
    
    const res = uni.getSystemInfoSync();
    const heightObj = unref(heightInfo)
    console.log('系统信息:', res)
    
    // 确保 safeAreaInsets 有默认值
    const safeAreaInsets = res.safeAreaInsets || {
      top: res.statusBarHeight || 0,
      bottom: 0,
      left: 0,
      right: 0
    }
    const statusBarHeight = res.statusBarHeight || 0
    
    heightObj.safeAreaInsets = safeAreaInsets
    heightObj.statusBarHeight = statusBarHeight
    heightObj.screenWidth = res.screenWidth || res.windowWidth
    heightObj.screenHeight = res.screenHeight || res.windowHeight
    
    // 如果获取到有效高度，缓存起来
    if (statusBarHeight > 0 || safeAreaInsets.top > 0) {
      cachedSystemInfo = {
        safeAreaInsets,
        statusBarHeight,
        screenWidth: heightObj.screenWidth,
        screenHeight: heightObj.screenHeight
      }
      console.log('缓存系统信息:', cachedSystemInfo)
    } else if (retryCount < 3) {
      // 如果状态栏高度为0且重试次数小于3，延迟后重试
      console.warn(`状态栏高度为0，${100 * (retryCount + 1)}ms后重试 (${retryCount + 1}/3)`)
      setTimeout(() => {
        getSystemInfo(retryCount + 1)
      }, 100 * (retryCount + 1))
    }
    
    console.log('处理后的高度信息:', heightObj)
  } catch (error) {
    console.error('获取系统信息失败:', error)
  }
}

// 胶囊信息 单位px
const menuInfo = ref({
  bottom: 0,
  height: 0,
  left: 0,
  right: 0,
  top: 0,
  width: 0
})

/**
 * 获取小程序右上角信息
 */
function getMenuInfo() {
  const menuButtonBoundingClientRect = uni.getMenuButtonBoundingClientRect();
  if (menuButtonBoundingClientRect) {
    menuInfo.value = {...menuButtonBoundingClientRect}
    console.log(menuInfo.value)
  }
}

// scss全局变量
const scssVarStyle = computed(() => {
  return {
    '--header-height': `${ HEADER_HEIGHT }px`
  }
})

// 系统导航条区域样式
const systemBarAreaStyle = computed(() => {
  // 使用 safeAreaInsets.top 来确保在刘海屏设备上正确显示
  const safeTop = unref(heightInfo).safeAreaInsets?.top || 0
  const statusBar = unref(heightInfo).statusBarHeight || 0
  // 取两者中较大的值，确保在刘海屏上有足够的顶部空间
  let topHeight = Math.max(safeTop, statusBar)
  
  // 如果获取不到高度（H5环境），使用CSS env()变量和默认值
  if (topHeight === 0) {
    console.log('无法获取状态栏高度，使用CSS env()和默认值')
    return {
      width: '100%',
      height: 'calc(env(safe-area-inset-top, 44px))',
      background: unref(systemBarAreaBg)
    }
  }
  
  console.log('systemBarArea高度:', topHeight, 'safeTop:', safeTop, 'statusBar:', statusBar)
  return {
    width: '100%',
    height: `${ topHeight }px`,
    background: unref(systemBarAreaBg)
  }
})

// header区域样式
const headerAreaStyle = computed(() => {
  // 计算margin top
  // margin-top (导航条高度 - 胶囊高度) / 2 永远确保胶囊在header中央
  let marginTop = 0
  if (unref(menuInfo).height > 0) {
    // buttonMarginTopDiff 此处 胶囊和statusBar是由一个距离的
    const safeTop = unref(heightInfo).safeAreaInsets?.top || 0
    const statusBar = unref(heightInfo).statusBarHeight || 0
    const topHeight = Math.max(safeTop, statusBar)
    const buttonMarginTopDiff = unref(menuInfo).top - topHeight
    marginTop = `${ (-1 * ((HEADER_HEIGHT - unref(menuInfo).height) / 2)) + buttonMarginTopDiff }px`
  }
  return {
    width: '100%',
    background: unref(headerAreaBg),
    color: unref(headerAreaTextColor),
    marginTop
  }
})

const circleBackStyle = computed(() => {
  return {
    height: menuInfo.value.height > 0 ? menuInfo.value.height + 'px' : '32px'
  }
})

// 文本样式
const textShadowStyle = computed(() => {
  return {
    textShadow: unref(textShadow) ? unref(textShadow) : 'none',
  }
})

const titleStyle = computed(() => {
  let width = unref(leftWidth) <= 0 ? '' : `calc( 100vw - var(--side-distance) - var(--side-distance) - ${ leftWidth.value }rpx )`
  // #ifdef MP-WEIXIN
  width = unref(leftWidth) <= 0 ? '' : `calc( 100vw - var(--side-distance) - var(--side-distance) - ${ leftWidth.value }rpx - ${ menuInfo.value.width }px )`
  // #endif
  return {
    width,
    left: unref(leftWidth) <= 0 ? '50%' : `calc( var(--side-distance) + ${ leftWidth.value }rpx )`,
    textShadow: unref(textShadow) ? unref(textShadow) : 'none',
    transform: unref(leftWidth) <= 0 ? 'translateX(-50%) translateY(-50%)' : 'translateX(0) translateY(-50%)',
    // 当设置了 leftWidth 时，标题区域用于承载自定义内容（如 logo），应左对齐
    textAlign: unref(leftWidth) <= 0 ? 'center' : 'left',
    justifyContent: unref(leftWidth) <= 0 ? 'center' : 'flex-start'
  }
})

const rightStyle = computed(() => {
  if (menuInfo.value.left > 0) {
    return {
      right: `${ (heightInfo.value.screenWidth - menuInfo.value.right) + menuInfo.value.width + 5 }px`
    }
  }
  return {}
})

// 滚动后背景样式
const scrollMaskStyle = computed(() => {
  return {
    background: unref(bgChangeColor),
    opacity: unref(scrollTransparency)
  }
})

// 总高度
const containerHeight = computed(() => {
  const marginTop = unref(menuInfo).height > 0 ? `${ ((HEADER_HEIGHT - unref(menuInfo).height)) / 2 }` : 0
  const safeTop = unref(heightInfo).safeAreaInsets?.top || 0
  const statusBar = unref(heightInfo).statusBarHeight || 0
  let topHeight = Math.max(safeTop, statusBar)
  
  // 如果获取不到高度，使用默认值44px（iPhone刘海屏的典型高度）
  if (topHeight === 0) {
    topHeight = 44
  }
  
  return (topHeight + HEADER_HEIGHT - marginTop)
})

let animation
const scrollTransparency = ref(0) // 滚动透明度
function doCreateAnimation() {
  const scrollEnd = heightInfo.value.safeAreaInsets.bottom + HEADER_HEIGHT + 100
  animation = createAnimation(0, scrollEnd, 0, 1)
}

watch(scrollTop, () => {
  if (!bgChangeByScroll.value) return
  if (!animation) doCreateAnimation()
  scrollTransparency.value = animation(unref(scrollTop));
  emits('animation', scrollTransparency.value)
})


defineExpose({containerHeight, heightInfo, menuInfo})

onMounted(() => {
  nextTick(() => {
    getSystemInfo()
    doCreateAnimation()
    // #ifdef MP-WEIXIN
    getMenuInfo()
    // #endif
  })
})

onLoad(() => {
  // 在onLoad时也尝试获取一次
  getSystemInfo()
})
</script>

<template>
  <view
      class="container"
      :style="scssVarStyle"
  >
    <view class="header-container">
      <!-- 头部系统导航条区域 -->
      <view
          class="system-bar-area"
          :style="systemBarAreaStyle"
      >

      </view>
      <!-- header -->
      <view
          class="header-row"
          :style="headerAreaStyle"
      >
        <view
            class="left"
            :style="textShadowStyle"
            v-if="showReturn"
        >
          <slot name="left">
            <view
                v-if="circleBack"
                class="circle-back"
                :style="circleBackStyle">
              <uv-icon
                  name="arrow-left"
                  :color="returnColor"
                  :size="returnSize"
                  @click="goBack"
              />
            </view>
            <uv-icon
                v-else
                name="arrow-left"
                :color="returnColor"
                :size="returnSize"
                @click="goBack"
            />
          </slot>
        </view>
        <view
            class="title"
            :style="titleStyle"
        >
          <slot>
          </slot>
        </view>
        <view
            class="right"
            :style="rightStyle"
            v-if="showRight"
        >
          <slot name="right">
          </slot>
        </view>
      </view>

      <!-- 背景 mask -->
      <view
          class="bg-mask"
          :style="scrollMaskStyle"
      ></view>

    </view>
    <!-- 撑起 -->
    <view
        class="prop-up"
        :style="{height:`${containerHeight}px`}"
        v-if="propUp"
    ></view>
  </view>
</template>

<style
    scoped
    lang="scss"
>

.container {
  --header-height: 0rpx;
  --side-distance: 30rpx;
  $side-distance: var(--side-distance); // 侧边距
  $header-height: var(--header-height); // header高度
  .header-container {
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;

    .system-bar-area {
      width: 100%;
      z-index: 1;
    }

    .header-row {
      z-index: 1;
      width: 100%;
      height: $header-height;
      position: relative;

      .left, .right, .title {
        position: absolute;
        top: 50%;
        height: 100%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
      }

      .left {
        left: $side-distance;
      }

      .right {
        right: $side-distance;
      }

      .title {
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        color: #333;
      }
    }

    .bg-mask {
      z-index: 0;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      box-shadow: 0 0 15rpx rgba(162, 162, 162, 0.5);
    }
  }

  .prop-up {
    width: 100%;
    height: $header-height;
  }
}

.circle-back {
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  box-shadow: 0 0 10rpx rgba(225, 225, 225, 0.48);
  border: 1rpx solid rgba(225, 225, 225, 0.8);
}

</style>
