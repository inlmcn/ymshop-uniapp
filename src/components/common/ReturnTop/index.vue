<!--
    @name: ReturnTop
    @author: kahu
    @date: 2023-11-16 14:05
    @description：返回顶部
    @update: 2023-11-16 14:05
-->
<script setup>
import { useScroll } from "@/hooks/useScroll";
import { computed, onMounted, ref, toRefs, unref } from "vue";
import { useSystem } from "@/hooks/useSystem";
import { CacheKey } from "@/utils/config";
import { toTop } from "@/utils/images";
const {scrollTop, scrollToTop} = useScroll()
const {getSystemInfo} = useSystem();

/**
 * @property {number} top 距离top多少显示
 * @property {number[]} location 按钮位置（距离右下角）（[x,y]）
 * @property {number} size 按钮大小
 * @property {string} round 圆角大小
 * @property {string} color 字体颜色
 * @property {string} background 背景颜色
 */
const props = defineProps({
  top: {
    type: Number,
    default:300
  },
  location: {
    type: Array,
    default: () => ([20, 400])
  },
  size: {
    type: Number,
    default: 80
  },
  round: {
    type: String,
    default: '50%'
  },
  background: {
    type: String,
    default: "#fff"
  },
  color: {
    type: String,
    default: "#333"
  },
  scrollTop:{
    type:Number,
    default:0
  }
})
const {
  top,
  location,
  size,
  round,
  background,
  color
} = toRefs(props)

const computedStyle = computed(() => {
  const width = `${ unref(size) }rpx`;
  const height = `${ unref(size) }rpx`;
  const scale = unref(scrollTop) >= unref(top) ? 1 : 0;
  const y = unref(touchLocation)[1]>0?`${unref(touchLocation)[1]}px`:`calc(100vh - ${ unref(location)[1] || 200 }rpx - ${ unref(size) }rpx)`
  const x = unref(touchLocation)[0]>0?`${unref(touchLocation)[0]}px`:`calc(100vw - ${ unref(location)[0] || 20 }rpx - ${ unref(size) }rpx)`
  return {
    width,
    height,
    scale,
    top:y,
    left:x,
    background: unref(background),
    color: unref(color),
    borderRadius: unref(round),
  }
})

const systemInfo = ref({
  windowWidth:0,
  windowHeight:0
}) // 系统信息
const touchLocation = ref([0, 0]) // 移动的位置 x y
let timeout // 浮动的时间
const isTouch = ref(false) // 是否正在浮动

function handleTouchstart(e) {
  // 一秒以后设置正在浮动
  timeout = setTimeout(()=>{
    isTouch.value = true
  },1000);
}

function handleTouchmove(e){
  if(!unref(isTouch))return
  if(e.changedTouches.length<1)return;
  const {clientX,clientY} = e.changedTouches[0] // 手指的x y

  let top = clientY - unref(size) / 2
  let left = clientX - unref(size) / 2

  // 判断边界
  top<=0?top = 1:void 0
  left<=0?left = 1:void 0
  top>=(unref(systemInfo).safeArea.height || unref(systemInfo).windowHeight) - unref(size)/2?top=(unref(systemInfo).safeArea.height || unref(systemInfo).windowHeight)-unref(size)/2 :void 0
  left>=unref(systemInfo).windowWidth?left=unref(systemInfo).windowWidth - unref(size) / 2:void 0
  touchLocation.value = [left,top]
}

function handleTouchend(e){
  timeout&&clearTimeout(timeout)
  if(!isTouch.value) return handleClick()
  isTouch.value = false
  // 判断是否移动数据
  if(unref(touchLocation)[0]>0 || unref(touchLocation)[1]>0){
    uni.setStorageSync(CacheKey.TOP_TOUCH_KEY,JSON.stringify(unref(touchLocation)))
  }
}

const animation = ref(false)
function handleClick(){
  if(unref(isTouch))return
  animation.value = true
  setTimeout(()=>{
    scrollToTop()
  },500)
  setTimeout(()=>{
    animation.value = false
  },1200)
}

onMounted(async ()=>{
  systemInfo.value = await getSystemInfo();
  // 有默认touch设置默认touch
  const touchStorageStr = uni.getStorageSync(CacheKey.TOP_TOUCH_KEY);
  if(!!touchStorageStr){
    touchLocation.value = JSON.parse(touchStorageStr)
  }
})

</script>

<template>

  <view
      class="return-top"
      :class="{touch:isTouch,click:animation}"
      :style="computedStyle"
      @touchstart.prevent="handleTouchstart"
      @touchmove.stop="handleTouchmove"
      @touchend="handleTouchend"
      @click="handleClick"
  >
    <slot>
        <view class="top-icon" :style="{backgroundImage:`url(${toTop})`}" />
    </slot>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.return-top {
  position: fixed;
  z-index: 9999;
  background: #fff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10rpx #cccccc;
  transition: scale .3s,box-shadow .3s;
  //transform-origin: top right;

  &:active {
  }

  .top-icon{
    user-select: none;
    width: 60%;
    height: 60%;
    border-radius: 50%;
    position: relative;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}

.touch{
  animation: breathe 1s ease-in-out infinite alternate,bounce 700ms ease-in-out infinite alternate  !important;
}

.click{
  animation: bounce 400ms ease-in-out 1,track 800ms 400ms cubic-bezier(1,-0.1,.85,1.37) 1;
}


// 呼吸动画
@keyframes breathe {
  from{
    scale: .8!important;
    box-shadow: 0 0 10rpx rgba(238, 109, 70, 0.8);
  }
  to{
    scale: 1!important;
    box-shadow: 0 0 50rpx 30px rgba(238, 109, 70, 0.3);
  }
}

// 发射动画-抖动
@keyframes bounce {
  0%,20%,40%,60%,80%,100%{
    rotate: (-20deg);
  }
  5%,25%,45%,65%,85%{
    rotate: (20deg);
  }
}

// 发射动画-轨迹
@keyframes track {
  from{
    transform: translateY(0);
    box-shadow: 0 100rpx 60rpx #00CBCC;

  }
  to{
    transform: translateY(-1000px);
    opacity: .2;
  }
}

.shadow{
}
</style>
