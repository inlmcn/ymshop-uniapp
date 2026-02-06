<template>
  <div class="hom-pro-list" :class="'terminal'+terminal" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div class="title">
      <h2 class="h2" :style="{textAlign:componentContent.textAlign}">{{componentContent.title}}</h2>
    </div>
    <div class="ul clearfix" :class="{imgTextNum4: componentContent.imgTextData.length === 4, imgTextNum5: componentContent.imgTextData.length === 5, imgTextStyle: componentContent.imgTextData.length >= 6 || componentContent.imgTextData.length === 3}">
      <div class="li" v-for="(item,index) in componentContent.imgTextData" :key="index">
        <a class="item a-link" @click="jumpLink(item.linkObj)">
          <div class="itemImgBox" v-show="item.isShow">
            <div class="imgBox">
              <image class="img" ref="getHeight" :src="item.imgData" v-show="item.imgData" :alt="item.title" mode="aspectFit"/>
            </div>
          </div>
          <div class="text">
            <h4 class="h4">{{item.title}}</h4>
            <p class="p">{{item.describe}}</p>
          </div>
        </a>
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
  .hom-pro-list{
    min-height: 450rpx;
    padding: 0 34rpx;
    .title {
      margin-bottom: 17rpx;
      position: relative;
      .h2 {
        font-size: 32rpx;
        color: #333;
        line-height: 48rpx;
        font-weight: normal;
      }
    }
    .ul{
      margin: -15rpx 0 0 -15rpx;
      display: flex;
      flex-wrap: wrap;
      .li{
        width: 0;
        flex: 0 0 50%;
        padding: 15rpx 0 0 15rpx;
        box-sizing: border-box;
        .item{
          .itemImgBox {
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            .imgBox {
              padding-bottom: 80%;
              background-color: #cacaca;
              position: relative;
              .img {
                max-width: 100%;
                height: 100%;
                max-height: 100%;
                position: absolute;
                margin: auto;
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
              }
            }
          }
          .text{
            padding:16rpx 20rpx;
            text-align: center;
            .h4{
              //line-height: 25upx;
              font-size: 28rpx;
              overflow: hidden;
              color: #333333;
              font-weight: normal;
            }
            .p{
              font-size: 20rpx;
              color: #666666;
              padding: 5rpx 0 10rpx;
            }
          }
        }
      }
    }
    .imgTextNum4 {
      .li {
        flex: 0 0 50%;
      }
    }
    .imgTextNum5 {
      .li {
        flex: 0 0 33.33%;
      }
      .li:nth-child(1) {
        flex: 0 0 50%;
      }
      .li:nth-child(2) {
        flex: 0 0 50%;
      }
    }
    .imgTextStyle {
      .li {
        flex: 0 0 33.33%;
      }
    }
  }
  @media screen and (max-width: 768px) {
    .hom-pro-list .ul .li{
      flex: 0 0 50%;
    }
  }
  .terminal1,.terminal2,.terminal3{
    width: 710upx;
    margin: 0 auto;
    &.hom-pro-list .ul .li{
      flex: 0 0 50%;
    }
  }
</style>
