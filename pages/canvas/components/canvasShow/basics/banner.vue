<template>
  <div class="banner" :class="'terminal' + terminal"  :style="{ backgroundColor: componentContent.pageBgColor }">
    <swiper class="swiper" :circular="true" :indicator-dots="false" :autoplay="true" :style="{'height':bannerHeight + 'rpx',backgroundColor: componentContent.comBgColor}" @change="swiperChange">
      <swiper-item class="banner-item" v-for="(item,index) in bannerList" :key="index" :style="{backgroundImage: 'url('+ item.bannerUrl +')'}"  @click="jumpLink(item.linkObj)">
<!--        <div class="a-link" @click="jumpLink(item.linkObj)"><img class="img" :src="item.bannerUrl" v-show="item.bannerUrl" mode="widthFix"></div>-->
      </swiper-item>
    </swiper>
    <view class="swiper-dots" v-if="bannerList && bannerList.length > 1">
      <text class="dot" :class="index === swiperCurrent  && 'dot-active'" v-for="(dot, index) in bannerList.length"
            :key="index"></text>
    </view>
  </div>
</template>


<script setup>
import { ref, toRefs, onMounted, computed } from 'vue';
import funMixin from '../config/mixin/funMixin'
const { jumpLink } = funMixin()
const props = defineProps({
  terminal: {
    type: Number,
    default: 4,
  },
  componentContent: {
    type: Object,
    default () {
      return {};
    }
  },
})
const { terminal, componentContent } = toRefs(props)
const swiperCurrent = ref(0)
const bannerHeight = ref(0)
onMounted(() => {
  bannerHeight.value = componentContent.value.height
  // this.$forceUpdate() // 刷新轮播图
})

function swiperChange(e) {
  swiperCurrent.value = e.detail.current;
}

const bannerList = computed(() => {
  return componentContent.value?.bannerData.filter(function (item) {
    return item.bannerUrl
  })
})

</script>

<style lang="scss" scoped>
.banner{
  position: relative;
  padding:  0 34rpx;
  .swiper{
    border-radius: 15rpx;
  }
  .banner-item{
    border-radius: 15rpx;
    width: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: auto 100%;
    img{
      display: none;
    }
  }
  &.terminal4{
    ::v-deep .el-carousel{
      height: 100%;
      .el-carousel__container{
        height: 100%;
      }
    }
    .banner-item{
      background-repeat: no-repeat;
      background-position: center;
      background-size: auto 100%;
      img{
        display: none;
      }
    }
  }

  .swiper-dots {
    display: flex;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 20upx;
    z-index: 200;
    .dot {
      width: 12upx;
      height: 12upx;
      background: #FFFFFF;
      border-radius: 6upx;
      opacity: 0.2;
      margin: 0 10upx;
    }

    .dot-active {
      opacity: 1;
      width: 24upx;
    }
  }

}
</style>
