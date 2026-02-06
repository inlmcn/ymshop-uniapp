<template>
  <div class="hom-pro-list" v-if="productData.length>0">
    <div class="product-swiper">
      <div class="product-swiper-box">
        <div class="product-swiper-warp" v-for="(item,index) in productData.slice(0, 3)" :key="index">
          <div class=" product-swiper-item" @click="jumpProductDetail(item)">
            <div class="product-swiper-img">
              <image class="img pic-img default-img" :src="item.image"/>
            </div>
            <div class="product-swiper-info">
              <label class="product-name">{{item.productName}}</label>
              <div class="price-warp">
                <!-- #ifdef MP-WEIXIN -->
                <image class="iconImg" v-if="item.activityType == 1" src="https://hnapi.booseng.com/static/canvas-images/groupBuyIcon.png"/>
                <image class="iconImg" v-if="item.activityType == 2" src="https://hnapi.booseng.com/static/canvas-images/spikeIcon.png"/>
                <image class="iconImg" v-if="item.activityType == 4" src="https://hnapi.booseng.com/static/canvas-images/spikeIcon.png"/>
                <image class="iconImg" v-if="item.activityType == 3" src="https://hnapi.booseng.com/static/canvas-images/discountListIcon.png"/>
                <image class="iconImg" v-if="item.activityType == 5" src="https://hnapi.booseng.com/static/canvas-images/discountListIcon.png"/>
                <image class="iconImg" v-if="item.activityType == 9" src="https://hnapi.booseng.com/static/canvas-images/memberCenterIcon.png"/>
				<image class="iconImg" v-if="item.activityType == 8" src="https://hnapi.booseng.com/static/canvas-images/d0d8d96f28904167b271de4ae924d1a8_sceneMarketing.png"/>
                <!-- #endif -->
                <!-- #ifdef H5 || APP-PLUS -->
                <image class="iconImg" v-if="item.activityType == 1" src="https://hnapi.booseng.com/static/canvas-images/groupBuyIcon.png"></image>
                <image class="iconImg" v-if="item.activityType == 2" src="https://hnapi.booseng.com/static/canvas-images/spikeIcon.png"></image>
                <image class="iconImg" v-if="item.activityType == 4" src="https://hnapi.booseng.com/static/canvas-images/spikeIcon.png"></image>
                <image class="iconImg" v-if="item.activityType == 3" src="https://hnapi.booseng.com/static/canvas-images/discountListIcon.png"></image>
                <image class="iconImg" v-if="item.activityType == 5" src="https://hnapi.booseng.com/static/canvas-images/discountListIcon.png"></image>
                <image class="iconImg" v-if="item.activityType == 9" src="https://hnapi.booseng.com/static/canvas-images/memberCenterIcon.png"></image>
				<image class="iconImg" v-if="item.activityType == 8" src="https://hnapi.booseng.com/static/canvas-images/d0d8d96f28904167b271de4ae924d1a8_sceneMarketing.png"></image>
                <!-- #endif -->
                <div class="price">
                  ¥ {{item.price}}
                </div>
<!--                <div class="original-price">-->
<!--                  ¥ {{item.originalPrice}}-->
<!--                </div>-->
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="pagination new-pagination"></div>
    </div>
    <button v-show="componentContent.showMore" class="btn-more" @click="jumpProList(componentContent.productData)">查看全部 <span class="icon iconfont icon-arrow-right"></span></button>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import commonMixin from '../mixin';
const props = defineProps({
  componentContent: {
    type: Object,
    default () {
      return {};
    },
  },
});
const { componentContent } = toRefs(props);
const { productData, jumpProductDetail, jumpProList } = commonMixin(componentContent);
</script>

<style lang="scss" scoped>
.hom-pro-list{
  ::v-deep .swiper-wrapper{
    position: static;
  }
  /**横向滑动**/
  .product-swiper{
    width: 100%;
    height: 454upx;
    padding: 90upx 34upx 0;
    background: url("https://hnapi.booseng.com/static/canvas-images/newProduct/bg-product-card.png") no-repeat center;
    background-size: 710upx 454upx;
    box-sizing: border-box;
    position: relative;
    &+.btn-more{
      margin-top: 20upx;
    }
    .title{
      padding: 22upx 0upx 0 0;
      label{
        background-image: none;
        color: #A56C4C;
        font-style: italic;
        padding: 0;
      }
    }
    &-box {
      padding-bottom: 20upx;
      display: flex;
    }
    &-warp{
      padding: 0 5upx;
    }
    &-item {
      width: 220upx;
      position: relative;
      background-color: #FFFFFF;
    }
    &-img {
      width: 220upx;
      height: 220upx;
      position: relative;
      &:after{
        content: '';
        display: block;
        width: 54upx;
        height: 54upx;
        background: url("https://hnapi.booseng.com/static/canvas-images/newProduct/flag-new.png") no-repeat;
        background-size: 100% 100%;
        position: absolute;
        top: 0;
        left: 0;
      }
      .img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
    &-info {
      background-color: #FFFFFF;
      padding: 10upx;
      text-align: center;
      .product-name{
        font-size: 20upx;
        color: #333;
        display: block;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
        margin-bottom: 6upx;
        line-height: 28upx;
      }
      .price-warp{
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 28upx;
        .iconImg {
          width: 58rpx;
          height: 36rpx;
          margin-right: 10rpx;
        }
        .price{
          color: #C83732;
          font-size: 20upx;
          margin-right: 10upx;
        }
        .original-price{
          font-size: 16upx;
          color: #ccc;
          text-decoration: line-through;
        }
      }
    }
  }
}

.pagination{
  display: flex;
  justify-content: center;
  width: 100%;
  bottom: 0;
  ::v-deep .swiper-pagination-bullet{
    width: 24upx;
    height: 4upx;
    background: #FFFFFF;
    opacity: 0.5;
    border-radius: 2upx;
    margin: 0 10upx;
  }
  ::v-deep .swiper-pagination-bullet-active{
    opacity: 1;
  }
}
.btn-more {
  width: 170upx;
  height: 54upx;
  border: 2upx solid #C5AA7B;
  color: #C5AA7B;
  font-size: 24upx;
  background-color: transparent;
  margin: 20upx auto 0;
  display: flex;
  align-items: center;
}

</style>
