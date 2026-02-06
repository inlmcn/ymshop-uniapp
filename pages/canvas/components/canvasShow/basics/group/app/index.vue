<template>
  <div
      class="group-list"
      :style="{ backgroundColor: componentContent.pageBgColor }"
      v-if="productList.length > 0">
    <div class="group-warp">
      <div class="header">
        <div class="header-warp">
          <div class="title">超值拼团</div>
          <text class="sub-title">拼着买更划算</text>
        </div>
        <a
            v-show="componentContent.showMore"
            class="btn-all a-link"
            @click="jumpGroupWorks(componentContent.id)">查看更多</a>
      </div>
      <div>
        <swiper
            class="swiper pro-box"
            :disable-touch="productList.length < 3"
            :circular="false"
            :indicator-dots="false"
            :display-multiple-items="productList.length >= 2?2:1"
            :autoplay="productList.length > 2"
            :previous-margin="swiperCurrent === productList.length - 2 && productList.length.length > 2?'60rpx':'0rpx'"
            :next-margin="swiperCurrent === productList.length - 2 && productList.length.length > 2?'0rpx':'60rpx'"
            @change="swiperChange">
          <swiper-item
              class="swiper-slide pro-item-warp"
              v-for="(item,index) in productList"
              :key="index"
              @click="jumpProductDetail(item)">
            <div class="pro-item-inner">
              <div class="pro-item">
                <div class="pro-item-img">
                  <image
                      class="img default-img"
                      :src="item.image" />
                </div>
                <div class="pro-item-info">
                  <div class="name">{{ item.storeName }}</div>
                  <div class="price">¥{{ item.price }}</div>
                  <div class="group-num">{{ item.person || 0 }}人团</div>
                  <div class="btn-buy">立刻拼团</div>
                </div>
              </div>
            </div>
          </swiper-item>
        </swiper>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, toRefs } from 'vue';
import commonMixin from '../mixin'

const props = defineProps({
  typeId: {
    type: Number,
    default: 1,
  },
  shopId: {
    type: Number,
    default: 0,
  },
  componentContent: {
    type: Object,
    default() {
      return {};
    },
  }
})
const {typeId, shopId, componentContent} = toRefs(props)
const {productList, jumpProductDetail, jumpGroupWorks} = commonMixin(componentContent, typeId, shopId)
const swiperCurrent = ref(0)

function swiperChange(e) {
  swiperCurrent.value = e.detail.current;
}
</script>

<style
    lang="scss"
    scoped>
.group-list {
  padding: 0 34rpx;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 20rpx;

    .header-warp {
      display: flex;
      align-items: flex-end;

      .title {
        font-size: 32rpx;
        color: #333333;
        margin-right: 10rpx;
      }

      .sub-title {
        font-size: 24rpx;
        color: #00CBCC;
      }
    }

    .btn-all {
      font-size: 24rpx;
      color: #999999;
      padding-right: 30rpx;
      background: url("https://hnapi.booseng.com/static/images/icon-arrow.png") no-repeat right center / 20upx 20upx;
    }
  }

  .pro-box {
    height: 462upx;
    display: flex;

    &.swiper-disabled {
      .uni-swiper-wrapper {
        position: static;
      }
    }

    .pro-item {
      border-radius: 15rpx;
      overflow: hidden;
      width: 290upx;
      background: #FFFFFF;

      .pro-item-img {
        height: 290upx;

        .img {
          width: 100%;
          height: 290upx;
        }
      }

      .pro-item-info {
        padding: 14rpx 20rpx 30rpx;
        position: relative;

        .name {
          font-size: 28rpx;
          line-height: 40rpx;
          color: #333333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          margin-bottom: 5upx;
        }

        .price {
          color: #00CBCC;
          font-size: 30upx;
          line-height: 42upx;
        }

        .group-num {
          font-size: 24rpx;
          line-height: 33rpx;
          color: #999999;
          display: block;
        }

        .btn-buy {
          width: 140rpx;
          height: 50rpx;
          background: #00CBCC;
          position: absolute;
          right: 20rpx;
          bottom: 30rpx;
          font-size: 24rpx;
          color: #FFFFFF;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }

  ::v-deep .uni-swiper-dots {
    display: flex;
    justify-content: center;
    bottom: 27px;

    .uni-swiper-dot {
      width: 24upx;
      height: 4upx;
      background: #fff;
      opacity: 0.5;
      border-radius: 2upx;
      margin: 0 5upx;

      &-active {
        opacity: 1;
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
