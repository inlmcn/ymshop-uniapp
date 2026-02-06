<template>
  <div class="spike" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div
        class="spike-card"
        v-if="productList?.length>0">
      <div class="spike-card-top">
        <h2 class="spike-card-top-title">
          限时折扣
        </h2>
        <div
            class="spike-card-top-time"
            v-if="activityData?.state===2">
          <div class="session">活动已结束</div>
        </div>
        <div
            class="spike-card-top-time"
            v-else-if="count?.length > 0">
          <div class="session">距活动{{ count[0] }}还有</div>
          <div class="time">{{ count[1] }}:{{ count[2] }}:{{ count[3] }}</div>
        </div>
        <a
            v-show="componentContent.showMore"
            class="btn-more"
            @click="jumpDiscount(componentContent.id)">查看更多</a>
      </div>
      <div class="spike-card-list" v-if="componentContent.arrangeType == '横向滑动'" :style="{ backgroundColor: componentContent.comBgColor }">
       <div class="product-list-box" v-if="productList.length <=3">
          <div
              v-for="(item, index) in productList"
              :key="index"
              class="spike-card-item"
              @click="jumpProductDetail(item)"
          >
            <div class="spike-card-item-img">
              <image class="img" :src="item.image" alt="" mode="aspectFit" />
            </div>
            <div class="spike-card-item-info">
              <h3 class="name">
                {{item.storeName}}
              </h3>
              <div class="price-warp">
                <div class="price">¥{{item.price}}</div>
                <div class="stock">
                  限量{{item.stock}}件
                </div>
              </div>
            </div>
          </div>
       </div>
        <swiper
            v-else
            ref="mySwiper"
            class="swiper product-list-box"
            :circular="true"
            :indicator-dots="false"
            :autoplay="true"
            :display-multiple-items="3"
            @change="swiperChange"
        >
          <swiper-item
              v-for="(item, index) in productList"
              :key="index"
              class="spike-card-item"
              @click="jumpProductDetail(item)"
          >
            <div class="spike-card-item-img">
              <image class="img" :src="item.image" alt="" mode="aspectFit" />
            </div>
            <div class="spike-card-item-info">
              <h3 class="name">
                {{item.storeName}}
              </h3>
              <div class="price-warp">
                <div class="price">¥{{item.price}}</div>
                <div class="stock">
                  限量{{item.stock}}件
                </div>
              </div>
            </div>
          </swiper-item>
        </swiper>
        <view
            class="swiper-dots"
            v-if="productList && productList.length > 3"
        >
          <text
              class="dot"
              :class="index === swiperCurrent  && 'dot-active'"
              v-for="(dot, index) in productList.length"
              :key="index"
          ></text>
        </view>
      </div>
      <div class="product-list" v-if="componentContent.arrangeType == '多行多列'">
        <div class="product-list-box">
          <div
              v-for="(item, index) in productList"
              :key="index"
              class="product-list-item"
              @click="jumpProductDetail(item)"
          >
            <div class="product-list-img">
              <img
                  class="img pic-img default-img"
                  :src="item.image"
              />
            </div>
            <div class="product-list-info">
              <label class="product-name">{{ item.storeName }}</label>
              <div class="box-spike">
                <div class="price">¥{{item.price}}</div>
                <view class="quantity-warp">
                  <view class="quantity">
                    限量{{ item.total }}件
                  </view>
                  <uv-line-progress
                      activeColor="#00CBCC"
                      inactiveColor="#E6E6E6"
                      height="14rpx"
                      :percentage="getPercentageNum(item)"
                      :showText="false"
                  />
                </view>
                <div class="btn">立即抢购</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import commonMixin from '../mixin'
import {ref, toRefs} from 'vue';

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
    }
  }
})
const {typeId, shopId, componentContent} = toRefs(props)
const {
  activityData,
  productList,
  count,
  jumpProductDetail,
  jumpDiscount,
  getPercentageNum
} = commonMixin(componentContent, typeId, shopId)

const swiperCurrent = ref(0)
function swiperChange(e) {
  swiperCurrent.value = e.detail.current;
}
</script>

<style
    lang="scss"
    scoped>
.spike {
  &-card {
    border-radius: 20rpx;
    margin: 0 34rpx;

    &-top {
      position: relative;
      display: flex;
      margin-bottom: 17rpx;

      &-title {
        font-size: 32rpx;
        color: #333333;
        margin-right: 25rpx;
        font-weight: normal;
      }

      &-time {
        height: 40rpx;
        border-radius: 21px;
        border: 1px solid #00CBCC;
        display: flex;
        overflow: hidden;
        align-items: center;

        .session {
          height: 100%;
          line-height: 40rpx;
          background: #00CBCC;
          font-size: 20rpx;
          color: #FFFFFF;
          padding: 0 15rpx;
          border-radius: 21rpx;
        }

        .time {
          font-size: 20rpx;
          color: #00CBCC;
          padding: 0 14rpx 0 10rpx;
        }
      }

      .btn-more {
        position: absolute;
        right: 8rpx;
        top: 0rpx;
        line-height: 40rpx;
        padding-right: 30rpx;
        font-size: 24rpx;
        color: #999;
        background: url("https://hnapi.booseng.com/static/images/icon-arrow.png") no-repeat right center / 20rpx 20rpx;
      }
    }

    &-list {
      background-color: #ffffff;
      overflow: auto;
      padding: 20rpx;
      border-radius: 15rpx;
      .swiper {
        height: 312rpx;
      }
    }

    &-item {
      border-radius: 15rpx;
      overflow: hidden;
      align-items: center;
      box-sizing: border-box;
      flex: 0 0 203rpx;
      margin-right: 18rpx;

      &-img {
        width: 203rpx;
        height: 203rpx;

        .img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      &-info {
        width: 203rpx;

        .name {
          font-size: 30rpx;
          font-weight: normal;
          line-height: 40rpx;
          color: #333333;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 15rpx 0 6rpx;
        }

        .price-warp {
          display: flex;
          align-items: center;
        }

        .price {
          font-size: 32rpx;
          color: #00CBCC;
          padding-right: 10rpx;
          display: inline-block;
        }

        .original-price {
          font-size: 20rpx;
          line-height: 28rpx;
          color: #CCCCCC;
          display: inline-block;
          white-space: nowrap;
        }

        .stock {
          line-height: 1em;
          display: inline-block;
          font-size: 20rpx;
          color: #999999;
          white-space: nowrap;
        }
      }
    }
  }
}

/**多行多列**/
.product-list {
  position: relative;

  &-box {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex-direction: row;
  }

  &.product-swiper .product-list-box {
    padding-left: 0;
  }


  &-item {
    width: 331rpx;
    margin-bottom: 20rpx;
    box-sizing: content-box;
    border-radius: 15rpx;
    overflow: hidden;
    background-color: #f5f5f5;
  }

  &-img {
    width: 331rpx;
    height: 331rpx;
    background-color: #f5f5f5;


    .img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &-info {
    background-color: #FFFFFF;
    //box-shadow: 0px 0px 15px 0px rgba(52, 52, 52, 0.15);
    border-radius: 0 0 10rpx 10rpx;
    padding: 20rpx;

    label {
      font-weight: normal;
    }

    .product-name {
      font-size: 28rpx;
      color: #333;
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 7rpx;
      line-height: 40rpx;
    }

    .box-group{
      position: relative;
      .price{
        color: #00CBCC;
        font-size: 30rpx;
        line-height: 42rpx;
      }
      .group-num{
        font-size: 24rpx;
        line-height: 33rpx;
        color: #999999;
        display: block;
      }
      .btn{
        width: 140rpx;
        height: 50rpx;
        background: #00CBCC;
        position: absolute;
        right: 0rpx;
        bottom: 0rpx;
        font-size: 24rpx;
        color: #FFFFFF;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .box-spike{
      position: relative;
      .price{
        font-size: 30rpx;
        color: #00CBCC;
      }
      .quantity-warp{
        width: 130rpx;
        .quantity{
          font-size: 24rpx;
          color: #999999;
        }
        :deep(.uv-line-progress){
          border-radius: 0;
          .uv-line-progress__background{
            border-radius: 0;
          }
          .uv-line-progress__line{
            border-radius: 0;
          }
        }
      }
      .btn{
        width: 140rpx;
        height: 50rpx;
        background: #00CBCC;
        position: absolute;
        right: 0rpx;
        bottom: 0rpx;
        font-size: 24rpx;
        color: #FFFFFF;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
    .box-default{
      display: flex;
      align-items: center;
      justify-content: space-between;
      .price{
        font-size: 34rpx;
        color: #00CBCC;
      }
      .quantity{
        font-size: 24rpx;
        color: #999999;
      }
    }
  }

}

.swiper-dots {
  display: flex;
  justify-content: center;
  padding: 20rpx 0 0;

  .dot {
    width: 10rpx;
    height: 10rpx;
    background: #333333;
    opacity: 0.3;
    border-radius: 5rpx;
    margin: 0 10rpx;
  }

  .dot-active {
    width: 20rpx;
    opacity: 1;
  }
}
</style>
