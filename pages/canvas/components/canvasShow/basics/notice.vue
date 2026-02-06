<template>
  <div class="notice-warp" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div class="notice-box" :style="{ backgroundColor: componentContent.comBgColor }">
      <div class="notice-list" :class="'terminal'+terminal" :style="{backgroundColor:componentContent.bgColor}">
        <swiper class="swiper-wrapper" :circular="true" :indicator-dots="false" :autoplay="true" :vertical="true">
          <swiper-item class="swiper-slide" v-for="(item,index) in componentContent.list" :key="index">
            <div class="a-link" @click="jumpLink(item.link)"><span class="text">{{item.title}}</span></div>
          </swiper-item>
        </swiper>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import funMixin from '../config/mixin/funMixin.js'
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
  }
})
const { terminal, componentContent } = toRefs(props)
</script>

<style lang="scss" scoped>
.notice-warp{
  padding: 0 34rpx;
  background-color: #f5f5f5;
}
.notice-box{
  background-color: #fff;
  border-radius: 15rpx;
  padding: 0 24rpx;
}
.notice-list{
  height: 72upx;
  line-height: 72upx;
  overflow: hidden;
  background: url("https://hnapi.booseng.com/static/images/icon-notice.png") no-repeat 20rpx center / 30upx 30upx;
  .swiper-wrapper{
    height: 100%;
  }
  .a-link{
    // display: block;
    cursor: pointer;
    overflow: hidden;
    text-overflow:ellipsis;
    white-space: nowrap;
    margin: 0 20upx;
    .text{
      display: inline-block;
      padding-left: 50upx;
      font-size: 24upx;
    }
  }
  &.terminal4{
    height: 50upx;
    line-height: 50upx;
    padding: 0;
    .swiper-container{
      height: 100%;
      width: 1200upx;
      max-width: 100%;
      margin: 0 auto;
    }
    .a-link{
      cursor: pointer;
      display: block;
      text-align: left;
      margin: 0 20upx;
      .text{
        display: block;
        padding-left: 25upx;
        font-size: 14upx;
      }
    }
  }
}
</style>
