<template>
  <view
      class="canvas-container"
      :style="{ 'margin-top': `${statusBarHeight}px` }">
    <view
        class="home-header"
        :class="{shadow:scrollTop>=10}">
      <com-header
          v-if="headerComponent"
          :componentContent="headerComponent.componentContent"
          :terminal="terminal"
          @tabs-change="handleHeaderTabsChange" />
    </view>
    <!-- 首页 -->
    <view
        v-if="currentTab.category?.id === 'index'"
        class="layout hom-layout">
      <view
          class="list-group-item"
          v-for="(item,index) in componentsData"
          :key="index">
        <!--        <component :is="componentMap[terminal-1].get(item.type)" :componentContent="item.componentContent" :terminal="terminal" :typeId="typeId" :shopId="shopId"></component>-->
        <com-banner
            v-if="item.type==='banner'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-banner>
        <com-text
            v-if="item.type==='text'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-text>
        <com-image-text
            v-if="item.type==='imageText'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-image-text>
        <com-brand-list
            v-if="item.type==='brandList'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-brand-list>
        <com-category-list
            v-if="item.type==='categoryList'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-category-list>
        <com-image-text-list
            v-if="item.type==='imageTextList'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-image-text-list>
        <com-assist-div
            v-if="item.type==='assistDiv'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-assist-div>
        <com-image-text-nav
            v-if="item.type==='imageTextNav'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-image-text-nav>
        <com-product
            v-if="item.type==='productList'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-product>
        <com-video-box
            v-if="item.type==='videoBox'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-video-box>
        <com-coupon
            v-if="item.type==='coupon'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-coupon>
        <com-custom
            v-if="item.type==='custom'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-custom>
        <com-notice
            v-if="item.type==='notice'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-notice>
        <com-vip
            v-if="item.type==='vip'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-vip>
        <com-group
            v-if="item.type==='groupList'"
            :terminal="terminal"
            :componentContent="item.componentContent"></com-group>
        <com-discount
            v-if="item.type==='discountList'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-discount>
        <com-spike
            v-if="item.type==='spikeList'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-spike>
        <com-price
            v-if="item.type==='priceList'"
            :terminal="terminal"></com-price>
        <com-new-product
            v-if="item.type==='newProduct'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-new-product>
        <com-shop
            v-if="item.type==='shop'"
            :componentContent="item.componentContent"
            :terminal="terminal"></com-shop>
      </view>
    </view>
    <!-- 分类 -->
    <view v-else>
      <ClassifiedGoods :classify-id="currentTab.category.id" />
    </view>
  </view>

</template>

<script setup>
import { onLoad,onShow } from '@dcloudio/uni-app'
import ClassifiedGoods from '../ClassifiedGoods/index.vue'
import comHeader from './basics/header/app/index.vue'
import comBanner from './basics/banner.vue'
import comText from './basics/text.vue'
import comImageText from './basics/imageText.vue'
import comBrandList from './basics/brandList.vue'
import comCategoryList from './basics/categoryList.vue'
import comImageTextList from './basics/imageTextList.vue'
import comAssistDiv from './basics/assistDiv.vue'
import comImageTextNav from './basics/imageTextNav.vue'
import comProduct from './basics/product/app/index.vue'
import comVideoBox from './basics/video.vue'
import comCoupon from './basics/coupon/index.vue'
import comCustom from './basics/custom.vue'
import comNotice from './basics/notice.vue'
import comVip from './basics/vip/app/index.vue'
import comGroup from './basics/group/app/index.vue'
import comDiscount from './basics/discount/app/index.vue'
import comSpike from './basics/spike/app/index.vue'
import comPrice from './basics/price/app/index.vue'
import comNewProduct from './basics/newProduct/app/index.vue'
import comShop from './basics/shop.vue'
import config from './config/config'
import sendReqMixin from './config/mixin/sendReqMixin'
import { computed, ref, toRefs,defineProps } from 'vue';
import api from "./config/api";


const HEADER_TYPE = 'header'
const props = defineProps({
  canvasId: {
    type: Number,
    required: false
  },
  scrollTop: {
    type: Number,
    required: true
  }
})
const {scrollTop, canvasId} = toRefs(props)
const emits = defineEmits(['updateName'])

const terminal = ref(config.terminal)
const {sendReq} = sendReqMixin()
const componentsData = ref([])

/**
 * 获取canvas数据
 */
const getCanvasData = () => {
  let url = `${ api.getCanvas }?terminal=${ terminal.value }`
  console.log('scrollTop.value2:',scrollTop.value)
  console.log('canvasId.value:',canvasId.value)
  if(canvasId.value){
    url += `&id=${canvasId.value}`
  }
  const params = {
    method: 'GET',
    url,
  }
  sendReq(params, (res) => {
    if (res.data.json) {
      componentsData.value = JSON.parse(res.data.json)
      emits('updateName', res.data.name)
    }
  })
}

// 头部组件
const headerComponent = computed(() => componentsData.value.find(item => item.type === HEADER_TYPE))

// 状态栏高度
const statusBarHeight = ref(0)

// 当前选中的tab页面  和  comHeader 的 tabCurrentItem 保持一直
const currentTab = ref({name: '首页', category: {id: 'index'}})

/**
 * tab页面发生改变
 * @param data
 */
function handleHeaderTabsChange(data) {
  currentTab.value = data
}

onLoad(() => {
	//console.log('canvasId.value23:',props.canvasId)
  // 导航栏距顶距离
  uni.getSystemInfo({
    //获取系统信息
    success: res => {
      statusBarHeight.value = res.statusBarHeight;
    }
  });
  getCanvasData()
})

// onShow(() => {
// 	console.log('canvasId.value23:',props.canvasId)
//   // 导航栏距顶距离
//   // uni.getSystemInfo({
//   //   //获取系统信息
//   //   success: res => {
//   //     statusBarHeight.value = res.statusBarHeight;
//   //   }
//   // });
//   //getCanvasData()
// })


</script>

<style
    lang="scss"
    scoped>
.canvas-container {
  .home-header {
    position: sticky;
    top: 0;
    z-index: 999;
    background: $page-bg-color;
    transition: all .3s;
  }

  .shadow {
    //box-shadow: 0 5rpx 5rpx #f8f8f8;
  }

  .hom-layout {
    width: 100%;
    overflow: hidden;
    position: relative;
  }
}
</style>

