<template>
  <div class="brand-list" :class="'terminal' + terminal" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div class="brand-top">
      <div class="hom-title">
        {{ componentContent.title }}
      </div>
      <div v-show="componentContent.showMore" class="btn-more" @click="jumpLink(componentContent.linkObj)">查看更多</div>
    </div>
    <div class="content-warp">
      <div class="ul clearfix">
        <div class="li" :class="componentContent.imgList.length<4 && `li-${componentContent.imgList.length}`" v-for="(item, index) in componentContent.imgList" :key="index">
          <a class="item a-link" @click="jumpLink(item.linkObj)">
            <div class="imgBox">
              <image
                  class="img"
                  v-show="item.imgData"
                  :src="item.imgData"
                  :alt="item.title"
                  mode="aspectFit"
              />
            </div>
            <h4 class="h4">{{ item.title }}</h4>
          </a>
        </div>
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
.brand-list {
  color: #fff;
  padding: 0 34rpx;
  .brand-top{
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .hom-title {
      font-size: 32rpx;
      color: #333;
      line-height: 48rpx;
      font-weight: normal;
    }
    .btn-more{
      font-size: 24rpx;
      color: #999999;
      padding-right: 30rpx;
      background: url("https://hnapi.booseng.com/static/images/icon-arrow.png") no-repeat right center / 20rpx 20rpx;
    }
  }
  .content-warp {
    display: flex;
  }
  .ul {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    .li {
      flex: 0 0 25%;
      padding: 10rpx 0 0 10rpx;
      box-sizing: border-box;
      .item {
        height: auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .imgBox {
          padding-bottom: 60%;
          background-color: #e8e8e8;
          position: relative;
          .img{
            max-width: 100%;
            height: 100%;
            max-height: 100%;
            position: absolute;
            margin: auto;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            object-fit: contain;
          }
        }
        .h4 {
          font-size: 18rpx;
          color: #333333;
          text-align: center;
          height: 40rpx;
          line-height: 40rpx;
          font-weight: normal;
        }
        .p {
          font-size: 12rpx;
          margin: 7rpx 0 12rpx;
        }
      }
      &.li-1{
        flex: 0 0 100%;
      }
      &.li-2{
        flex: 0 0 50%;
      }
      &.li-3{
        flex: 0 0 33.3%;
      }
    }
  }
}
.terminal1,
.terminal2,
.terminal3 {
  &.brand-list {
    .content-warp {
      display: block;
    }
    .ul {
      width: auto;
      margin-left: -15rpx;
      .li {
        padding: 15rpx 0 0 15rpx;
        width: 50%;
        .item {
          padding-left: 0;
        }
      }
    }
  }
}
</style>
