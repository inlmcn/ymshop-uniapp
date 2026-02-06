<template>
  <div class="vip" v-if="productData.length >0">
    <div class="vip-card">
      <div class="vip-title">
        <!-- #ifdef MP-WEIXIN -->
        <image class="title-img" src="https://hnapi.booseng.com/static/canvas-images/vip/img-title.png" alt="会员专区" mode="widthFix"/>
        <!-- #endif -->
        <!-- #ifdef H5 || APP-PLUS -->
        <image class="title-img" src="https://hnapi.booseng.com/static/canvas-images/vip/img-title.png" alt="会员专区" mode="widthFix"/>
        <!-- #endif -->
        <a v-show="componentContent.showMore" class="btn-more a-link" @click="jumpVip">更多<i class="iconfont icon-arrow-right"></i></a>
      </div>
      <div>
        <div v-if="productData.length > 2">
          <swiper class="swiper vip-list" :circular="true" :indicator-dots="false" :autoplay="true" @change="swiperChange">
            <swiper-item class="vip-item-warp" v-for="(itemJ,indexJ) in listTemp" :key="indexJ">
              <div class="vip-item"  v-for="(item,index) in itemJ" :key="index"  @click="jumpProductDetail(item)">
                <div class="vip-item-img">
                  <image class="img default-img" :src="item.image"></image>
                </div>
                <div class="vip-item-info">
                  <h3 class="name">
                    {{item.productName}}
                  </h3>
                  <div class="stock">
                    还剩{{item.stockNumber}}件
                  </div>
                  <div class="original-price">
                    ¥ {{item.originalPrice}}
                  </div>
                  <div class="price-warp">
                    <div class="flag">
                      <!-- #ifdef MP-WEIXIN -->
                      <image src="https://hnapi.booseng.com/static/canvas-images/vip/flag-vip.png" alt="会员价" class="flagImg"/>
                      <!-- #endif -->
                      <!-- #ifdef H5 || APP-PLUS -->
                      <image class="flagImg" src="https://hnapi.booseng.com/static/canvas-images/vip/flag-vip.png" alt="会员专区" mode="widthFix"/>
                      <!-- #endif -->
                    </div>
                    <div class="price">
                      ¥ {{item.price}}
                    </div>
                  </div>
                  <div class="btn-buy">
                    <span>去购买</span>
                    <div class="progress">
                      <i></i>
                    </div>
                  </div>
                </div>
              </div>
            </swiper-item>
          </swiper>
          <view class="swiper-dots" v-if="listTemp && listTemp.length > 1">
            <text class="dot" :class="swiperCurrent === index && 'dot-active'" v-for="(dot, index) in listTemp.length"
                  :key="index"></text>
          </view>
        </div>
        <div class="swiper vip-list" v-else>
          {{ productData.length }}

          <div class="vip-item-warp" v-for="(itemJ,indexJ) in listTemp" :key="indexJ">
            <div class="vip-item"  v-for="(item,index) in itemJ" :key="index" @click="jumpProductDetail(item)">
              <div class="vip-item-img">
                <image class="img default-img" :src="item.image" />
              </div>
              <div class="vip-item-info">
                <h3 class="name">
                  {{item.productName}}
                </h3>
                <div class="stock">
                  还剩{{item.stockNumber}}件
                </div>
                <div class="original-price">
                  ¥ {{item.originalPrice}}
                </div>
                <div class="price-warp">
                  <div class="flag">
                    <!-- #ifdef MP-WEIXIN -->
                    <image src="https://hnapi.booseng.com/static/canvas-images/vip/flag-vip.png" alt="会员价" class="flagImg"/>
                    <!-- #endif -->
                    <!-- #ifdef H5 || APP-PLUS -->
                    <image class="flagImg" src="https://hnapi.booseng.com/static/canvas-images/vip/flag-vip.png" alt="会员专区" mode="widthFix"/>
                    <!-- #endif -->
                  </div>
                  <div class="price">
                    ¥ {{item.price}}
                  </div>
                </div>
                <div class="btn-buy">
                  <span>去购买</span>
                  <div class="progress">
                    <i></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
<!--      <div class="pagination vip-pagination"></div>-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue';
import vipMixin from '../mixin'
const { productData, jumpVip, jumpProductDetail } = vipMixin()
const props = defineProps({
  componentContent: {
    type: Object,
    default () {
      return {};
    }
  }
})
const { componentContent } = toRefs(props)
const swiperCurrent = ref(0)

function swiperChange(e) {
  swiperCurrent.value = e.detail.current;
}

const listTemp = computed(() => {
  var list = productData.value
  var arrTemp = []
  var index = -1
  var count = 2 // 每组多少条
  for (var i = 0; i < list.length; i++) {
    if (i % count === 0) {
      arrTemp.push([])
      index++
    }
    arrTemp[index].push(list[i])
  }
  return arrTemp
})
</script>

<style lang="scss" scoped>
.vip{
  &-card{
    background: #333333;
    padding: 0 20upx 20upx;
    position: relative;
  }
  &-title{
    padding: 42upx 0 28upx 30upx;
    position: relative;
    .title-img{
      display: block;
      width: 197upx;
    }
    .btn-more{
      position: absolute;
      right: 8upx;
      top: 40upx;
      line-height: 33upx;
      padding-right: 25upx;
      font-size: 24upx;
      color: #FFEBC4;
      .iconfont{
        content: '';
        font-size: 26upx;
        position: absolute;
        right: 0;
        top: 0;
      }
    }
  }
  &-list{
    height: 562upx;
  }
  &-item{
    display: flex;
    background-color: #fff;
    margin-top: 20upx;
    &:first-child{
      margin-top: 0upx;
    }
    &-img{
      width: 260upx;
      height: 260upx;
      margin-right: 20upx;
      background-color: #ececec;
      .img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
      }
    }
    &-info{
      flex: 1;
      position: relative;
      .name{
        font-size: 28upx;
        //height: 75rpx;
        line-height: 40upx;
        color: #333333;
        margin: 30upx 0 10upx;
        overflow:hidden;
        text-overflow:ellipsis;
        display:-webkit-box;
        -webkit-box-orient:vertical;
        -webkit-line-clamp:1;
      }
      // #ifdef H5 || APP-PLUS
      .name{
        height: 40rpx;
      }
      // #endif
      .stock{
        color: #C5AA7B;
        font-size: 20upx;
        border: 2upx solid #E4E5E6;
        line-height: 40upx;
        padding: 0 5upx;
        display: inline-block;
        margin-bottom: 30upx;
      }
      .original-price{
        font-size: 24upx;
        line-height: 34upx;
        color: #CCCCCC;
        text-decoration: line-through;
      }
      .flag{
        float: left;
        padding: 12upx 10upx 0 0;
        .flagImg {
          width: 58upx;
          height: 36upx;
          display: block;
        }
      }
      .price{
        font-size: 40upx;
        font-weight: bold;
        line-height: 56upx;
        color: #C83732;
      }
      .btn-buy{
        position: absolute;
        right: 20upx;
        bottom: 20upx;
        width: 160upx;
        height: 84upx;
        background: linear-gradient(90deg, #C83732 0%, #E25C44 100%);
        box-shadow: 0px 6upx 12upx rgba(233, 0, 0, 0.3);
        border-radius: 10upx;
        text-align: center;
        padding: 16upx 20upx 0;
        span{
          font-size: 24upx;
          line-height: 34upx;
          color: #FFFFFF;
          margin-bottom: 10upx;
          display: block;
        }
        .progress{
          height: 8upx;
          background: rgba(255,255,255,0.5);
          border-radius: 4upx;
          position: relative;
          i{
            position: absolute;
            left: 0;
            top: 0;
            width: 50%;
            height: 8upx;
            background-color: #fff;
            border-radius: 4upx;
          }
        }
      }
    }
  }
.vip-item-info {
  .price-warp {
    display: flex;
    align-items: center;
  }
}
  .swiper-dots {
    display: flex;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 15upx;
    z-index: 66;
    .dot {
      width: 24upx;
      height: 4upx;
      background: #fff;
      opacity: 0.5;
      border-radius: 2upx;
      margin: 0 10upx;
    }

    .dot-active {
      opacity: 1;
    }
  }
  //.pagination{
  //  display: flex;
  //  justify-content: center;
  //  padding-top:20upx;
  //  ::v-deep .swiper-pagination-bullet{
  //    width: 24upx;
  //    height: 4upx;
  //    background: #fff;
  //    opacity: 0.5;
  //    border-radius: 2upx;
  //    margin: 0 5upx;
  //  }
  //  ::v-deep .swiper-pagination-bullet-active{
  //    opacity: 1;
  //  }
  //}
}
</style>
