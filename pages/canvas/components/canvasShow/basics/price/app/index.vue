<template>
  <div class="group-list" v-if="productData&&productData.composeProducts&&productData.composeProducts.length>0">
    <div class="group-warp">
      <div class="title">
        <label>
          <!-- #ifdef MP-WEIXIN -->
          <image class="title-img" src="https://hnapi.booseng.com/static/canvas-images/price/img-title.png" alt="组合优惠" mode="widthFix"/>
          <!-- #endif -->
          <!-- #ifdef H5 || APP-PLUS -->
          <image class="title-img" src="https://hnapi.booseng.com/static/canvas-images/price/img-title.png" alt="组合优惠" mode="widthFix"/>
          <!-- #endif -->
        </label>
        <div class="price-text">
          <swiper class="swiper" :autoplay="true" :vertical="true">
            <swiper-item v-for="(item,index) in productData.rules" :key="index">
              {{item.price}}元任选{{item.number}}件
            </swiper-item>
          </swiper>
        </div>
        <a v-show="componentContent.showMore" class="btn-all a-link" @click="jumpCombination(productData)">更多<i class="iconfont icon-arrow-right"></i></a>
      </div>
      <div>
      <swiper class="swiper pro-box" :indicator-dots="false" :autoplay="true" :display-multiple-items="2" @change="swiperChange">
        <swiper-item class="pro-item-warp" v-for="(item,index) in productData.composeProducts" :key="index" @click="jumpProductDetail(item)">
          <div class="pro-item-inner">
          <div class="pro-item">
          <div class="pro-item-img">
            <image class="img default-img" :src="item.image"/>
          </div>
          <div class="pro-item-info">
            <h3 class="name">
              {{item.productName}}
            </h3>
            <div class="stock">
              还剩{{item.stockNumber}}件
            </div>
            <div class="price-warp">
              <div class="price">
                ¥ {{item.price}}
              </div>
              <div class="original-price">
                ¥ {{item.originalPrice}}
              </div>
            </div>
          </div>
          </div>
          </div>
        </swiper-item>
      </swiper>
        <view class="swiper-dots" v-if="productData.composeProducts && productData.composeProducts.length > 2">
          <text class="dot" :class="index - swiperCurrent <= 1 && index - swiperCurrent >=0  && 'dot-active'" v-for="(dot, index) in productData.composeProducts.length"
                :key="index"></text>
        </view>
      </div>
    </div>
  </div>

</template>

<script setup>
import {ref, toRefs} from 'vue';
import commonMixin from '../mixin';
const props = defineProps({
  shopId: {
    type: Number,
    default: 0,
  },
  componentContent: {
    type: Object,
    default () {
      return {};
    },
  },
});
const { shopId, componentContent } = toRefs(props);
const { productData, jumpProductDetail, jumpCombination} = commonMixin(componentContent, shopId);
const swiperCurrent = ref(0)

function swiperChange(e) {
  swiperCurrent.value = e.detail.current;
}

</script>

<style lang="scss" scoped>
.group-list{
  padding: 30upx 20upx 60upx;
  .group-warp{
    height: 544upx;
    padding: 0 10upx;
    background: #333333;
    box-shadow: 0 20upx 30upx rgba(0, 0, 0, 0.3);
    opacity: 1;
    border-radius: 20upx;
    position: relative;
  }
  .title{
    display: flex;
    align-items:center;
    position: relative;
    padding: 32upx 0 20upx 20upx;
    .title-img{
      width: 203upx;
    }
    .price-text{
      width: 300upx;
      height: 50upx;
      background: linear-gradient(90deg, #C83732 0%, #E25C44 100%);
      box-shadow: 0 6upx 12upx rgba(233, 0, 0, 0.3);
      border-radius: 26upx;
      font-size: 24upx;
      color: #fff;
      text-align: center;
      line-height: 50upx;
      margin-left: 20upx;
      .swiper{
        height: 50upx;
      }
    }
    .btn-all{
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
  .pro-box{
    padding-bottom: 20upx;
    height: 450upx;
    .pro-item-inner{
      padding: 0 10upx;
    }
    .pro-item{
      width: 100%;
      height: 412upx;
      background: #FFFFFF;
      .pro-item-img{
        .img{
          width: 100%;
          height: 236upx;
        }
      }
      .pro-item-info{
        padding: 0 20upx;
        .name{
          font-size: 24upx;
          line-height: 40upx;
          color: #333333;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
        .stock{
          padding: 0 8upx;
          height: 40upx;
          border: 2upx solid #E4E5E6;
          line-height: 40upx;
          margin: 10upx 0;
          display: inline-block;
          font-size: 20upx;
          color: #C5AA7B;
        }
        .price{
          font-size: 32upx;
          font-weight: bold;
          line-height: 44upx;
          color: #C83732;
          padding-right: 10upx;
          display: inline-block;
        }
        .original-price{
          font-size: 20upx;
          line-height: 28upx;
          color: #CCCCCC;
          display: inline-block;
        }
      }
    }
  }
  //.pagination{
  //  display: flex;
  //  justify-content: center;
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
  .swiper-dots {
    display: flex;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 15rpx;
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
}
</style>
