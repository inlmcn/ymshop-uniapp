<template>
  <div class="coupon-warp" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div
        class="coupon-box"
        v-if="couponsData?.length > 0">
      <div class="coupon-top">
        <div class="title">
          <image class="img" src="https://hnapi.booseng.com/static/home/title-coupon.png" />
          <div class="text">好券天天领不停</div>
        </div>
        <div class="btn-more" @click="jumpCoupon">查看更多</div>
      </div>
      <div
          class="coupon-list coupon-flex coupon-swiper"
          v-if="componentContent.arrangeType == '横向滑动'">
        <swiper
            class="swiper"
            :disable-touch="couponsData.length < 3"
            :circular="false"
            :indicator-dots="false"
            :autoplay="couponsData.length > 2"
            :display-multiple-items="couponsData.length>=2?2:1">
          <swiper-item
              class="swiper-slide"
              v-for="(item, index) in couponsData"
              :key="index">
            <couponItem
                :item="item"
                :componentContent="componentContent"
                @jumpProduct="jumpCouponProduct"
                @receive="receiveCoupon"
            />
          </swiper-item>
        </swiper>
      </div>
      <div
          class="coupon-list"
          v-else
          :class="componentContent.arrangeType === '多行多列' && 'coupon-flex'">
        <couponItem
            class="item"
            v-for="(item, index) in couponsData"
            :key="index"
            :item="item"
            :componentContent="componentContent"
            @jumpProduct="jumpCouponProduct"
            @receive="receiveCoupon" />
      </div>
    </div>
  </div>
</template>
<script setup>
import commonMixin from './mixin';
import couponItem from './item.vue';
import { toRefs } from 'vue';

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
      return {}
    },
  },
});
const {typeId, shopId, componentContent} = toRefs(props);
const {couponsData, receiveCoupon, jumpCoupon, jumpCouponProduct} = commonMixin(componentContent, typeId, shopId);
</script>

<script>
export default {
  options: {
    styleIsolation: 'shared'
  },
}
</script>


<style
    lang="scss"
    scoped>
.coupon-warp{
  padding: 0 34rpx;
}
.coupon-box {
  padding: 24rpx;
  background: linear-gradient( 180deg, #FBECDB 0%, #FFFFFF 100%);
  border-radius: 15rpx;
  .coupon-top{
  display: flex;
  justify-content: space-between;
    margin-bottom: 20rpx;
  .title{
    flex: 1;
    display: flex;
    font-size: 24rpx;
    color: #988E83;
    align-items: center;
    .img{
      width: 121rpx;
      height: 28rpx;
      margin-right: 10rpx;
    }
  }
  .btn-more{
    font-size: 24rpx;
    color: #999;
    padding-right: 30rpx;
    background: url("https://hnapi.booseng.com/static/images/icon-arrow.png") no-repeat right center / 20rpx 20rpx;
  }
}

  ::v-deep .coupon-list {
    .item {
      margin-top: 24rpx;
      display: block;

      &:first-child {
        margin-top: 0;
      }
    }

    .coupon-item {
      width: 100%;
      height: 160rpx;
      background: url('https://hnapi.booseng.com/static/images/canvas/bg-coupon-l.png') no-repeat;
      background-size: 100% 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .discount {
        display: flex;
        align-items: baseline;
        font-size: 68rpx;
        line-height: 64rpx;
        font-weight: bold;

        .unit {
          font-size: 32rpx;
        }
      }

      .info {
        font-size: 38rpx;

        .type {
          font-size: 32rpx;
          font-weight: bold;
          color: #333333;
          line-height: 45rpx;
        }

        .tip {
          font-size: 24rpx;
          white-space: nowrap;
        }
      }

      .button {
        width: 144rpx;
        height: 64rpx;
        border-radius: 8rpx;
        background: #00CBCC;
        font-size: 24rpx;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .disable {
        background: #666666;
      }

      .expired {
        background: #999999;
      }

      .coupon-left {
        width: 206rpx;
        display: flex;
        justify-content: center;
      }

      .coupon-right {
        flex: 1;
        display: flex;
        padding: 0 32rpx;
        justify-content: space-between;
        align-items: center;
      }
    }

    &.coupon-flex {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;

      .item:nth-child(2) {
        margin-top: 0;
      }

      .coupon-item {
        width: 309rpx;
        height: 120rpx;
        background-image: url('https://hnapi.booseng.com/static/images/canvas/bg-coupon-m.png');

        .coupon-left {
          width: 138rpx;
          flex-direction: column;
          align-items: center;

          .type {
            font-size: 20rpx;
            font-weight: bold;
            line-height: 28rpx;
          }
        }

        .coupon-right {
          flex-direction: column;
          padding: 0;
        }

        .discount {
          font-size: 32rpx;
          line-height: 45rpx;

          .unit {
            font-size: 24rpx;
          }
        }

        .info {
          .tip {
            font-size: 20rpx;
            line-height: 36rpx;
            margin-bottom: 9rpx;
          }
        }

        .button {
          width: 100rpx;
          height: 32rpx;
          border-radius: 16rpx;
          font-size: 20rpx;
        }
      }
    }

    &.coupon-swiper {
      .swiper {
        height: 140rpx;
      }

      .swiper-slide {
        width: 309rpx;

        .coupon-item {
          width: 309rpx;
          background-image: url('https://hnapi.booseng.com/static/images/canvas/bg-coupon-s.png');
          margin-bottom: 0;

          .coupon-left {
            width: 130rpx;
          }
        }
      }

      ::v-deep .uni-swiper-dots {
        display: flex;
        justify-content: center;
        bottom: 27rpx;

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
    }
  }
}

</style>
