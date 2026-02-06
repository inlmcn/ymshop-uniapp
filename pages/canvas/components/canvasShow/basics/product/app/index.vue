<template>
  <global-loading />
  <div
      class="hom-pro-list"
      :style="{ backgroundColor: componentContent.pageBgColor }"
      v-if="productData.length > 0">
    <div class="header">
      <div class="header-warp">
        <div class="title">商品推荐</div>
        <!--        <text class="sub-title">拼着买更划算</text>-->
      </div>
      <a
          v-show="componentContent.showMore"
          class="btn-all a-link"
          @click="jumpProList(productData)">查看更多<i class="iconfont icon-arrow-right"></i></a>
    </div>
    <div
        v-if="componentContent.arrangeType === '横向滑动' && productData.length > 2"
        class="product-list"
    >
      <swiper
          ref="mySwiper"
          class="swiper product-list-box"
          :circular="true"
          :indicator-dots="false"
          :autoplay="true"
          :display-multiple-items="productData.length>=2?2:1"
          @change="swiperChange"
      >
        <swiper-item
            class="product-list-item-warp"
            v-for="(item,index) in productData"
            :key="index"
        >
          <div
              class="product-list-item full-height"
              v-if="JSON.stringify(item)!=='{}'"
              @click="jumpProductDetail(item)">
            <div class="product-list-img">
              <image
                  class="img pic-img default-img"
                  :src="item.image"
              />
            </div>
            <div class="product-list-info">
              <div class="product-name-box">
                <productTag :data="item.tag" />
                <label class="product-name">{{ item.storeName }}</label>
              </div>
              <div
                  v-if="item.campaignType === 1"
                  class="box-group">
                <div class="price">¥{{ item.price }}</div>
                <label class="group-num">{{ item.person || 0 }}人团</label>
                <div class="btn">立刻拼团</div>
              </div>
              <div
                  v-else-if="[2,3].includes(item.campaignType)"
                  class="box-spike">
                <div class="price">¥{{ item.campaignPrice }}</div>
                <view class="quantity-warp">
                  <view class="quantity">
                    限量{{ item.campaignTotal }}件
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
              <div
                  v-else
                  class="box-default">
                <div class="price">¥{{ item.price }}</div>
                <div class="quantity">限量{{ item.stock }}件</div>
              </div>
            </div>
          </div>
          <!-- 自定义骨架屏 -->
          <div
              class="product-list-item ske-loading"
              v-else
          >
            <div class="product-list-img child-loading">

            </div>
            <div class="product-list-info">
              <label class="product-name child-loading"></label>
              <div
                  class="price-warp child-loading"
                  style="padding: 5px 0">
              </div>
              <div
                  class="price-warp child-loading"
                  style="padding: 5px 0">
              </div>
            </div>
          </div>
        </swiper-item>
      </swiper>
      <view
          class="swiper-dots"
          v-if="productData && productData.length > 2"
      >
        <text
            class="dot"
            :class="index - swiperCurrent <= 1 && index - swiperCurrent >=0  && 'dot-active'"
            v-for="(dot, index) in productData.length"
            :key="index"
        ></text>
      </view>
    </div>
    <div
        v-else
        class="product-list"
    >

      <div
          class="product-list-box"
          v-if="!loading">
        <div
            class="product-list-item-warp"
            v-for="(col,i) in colList"
            :key="i"
        >
          <div
              v-for="(item,index) in col.data"
              :key="index"
              @click="jumpProductDetail(item)"
              class="product-list-item"
          >
            <div class="product-list-img">
              <image
                  class="img pic-img default-img"
                  :src="item.image"
              />
            </div>
            <div class="product-list-info">
              <div class="product-name-box">
                <productTag :data="item.tag" />
                <label class="product-name">{{ item.storeName }}</label>
              </div>
              <div
                  v-if="item.campaignType === 1"
                  class="box-group">
                <div class="price">¥{{ item.campaignPrice }}</div>
                <label class="group-num">{{ item.person || 0 }}人团</label>
                <div class="btn">立刻拼团</div>
              </div>
              <div
                  v-else-if="[2,3].includes(item.campaignType)"
                  class="box-spike">
                <div class="price">¥{{ item.campaignPrice }}</div>
                <view class="quantity-warp">
                  <view class="quantity">
                    限量{{ item.campaignTotal }}件
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
              <div
                  v-else
                  class="box-default">
                <div class="price">¥{{ item.price }}</div>
                <div class="quantity">限量{{ item.stock }}件</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 自定义骨架屏 -->
      <div
          class="product-list-box"
          v-else>
        <div
            class="product-list-item-warp"
            v-for="(item,i) in loadNum"
            :key="i"
        >
          <div
              class="product-list-item ske-loading"
          >
            <div class="product-list-img child-loading"></div>
            <div class="product-list-info">
              <label class="product-name child-loading"></label>
              <div
                  class="price-warp child-loading"
                  style="padding: 5px 0"></div>
              <div
                  class="price-warp child-loading"
                  style="padding: 5px 0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, toRefs } from 'vue';
import productMixin from '../mixin.js';

const props = defineProps({
  typeId: {
    type: Number,
    default: 1,
  },
  componentContent: {
    type: Object,
    default() {
      return {};
    },
  },
});
const {typeId, componentContent} = toRefs(props);
const {
  productData,
  jumpProductDetail,
  jumpProList,
  loadNext,
  getPercentageNum,
  loading
} = productMixin(componentContent);
const swiperCurrent = ref(0)

const colList = computed(() => [
  {
    data: productData.value.filter((item, index) => index % 2 === 0)
  },
  {
    data: productData.value.filter((item, index) => index % 2 !== 0)
  }
])

const loadNum = computed(() => {
  if (componentContent.value.productData.productIdList && componentContent.value.productData.productIdList.length > 0) {
    return componentContent.value.productData.productIdList.length
  } else {
    return 8
  }
})

function swiperChange(e) {
  swiperCurrent.value = e.detail.current;
}

// 跳转到店铺主页
function jumpStore(item) {
  uni.navigateTo({
    url: `/pages_category_page1/store/index?storeId=${ item.shopId }`
  })
}

defineExpose({loadNext})
</script>

<style
    lang="scss"
    scoped
>
.hom-pro-list {
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

  .product-list {
    position: relative;

    &-box {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      flex-direction: row;

      &.swiper {
        height: 500rpx;
      }
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
      background-color: #fff;
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
      //.product-name-box{
      //  display: flex;
      //}
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

      .box-group {
        position: relative;

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

        .btn {
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

      .box-spike {
        position: relative;

        .price {
          font-size: 30rpx;
          color: #00CBCC;
        }

        .quantity-warp {
          width: 130rpx;

          .quantity {
            font-size: 24rpx;
            color: #999999;
          }

          ::v-deep .uv-line-progress {
            border-radius: 0;

            &__background {
              border-radius: 0;
            }

            &__line {
              border-radius: 0;
            }
          }
        }

        .btn {
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

      .box-default {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .price {
          font-size: 34rpx;
          color: #00CBCC;
        }

        .quantity {
          font-size: 24rpx;
          color: #999999;
        }
      }
    }

  }
}


.swiper-dots {
  display: flex;
  justify-content: center;
  padding: 20rpx 0;

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

.btn-more {
  width: 170rpx;
  height: 54rpx;
  line-height: 54rpx;
  border: 2rpx solid #C5AA7B;
  color: #C5AA7B;
  font-size: 24rpx;
  background-color: transparent;
  margin: 20rpx auto 0;
  display: flex;
  align-items: center;
}

.child-loading {
  background: linear-gradient(90deg, #f0f2f5 25%, #e6e8eb 37%, #f0f2f5 63%);
  background-size: 400% 100%;
  animation: el-skeleton-loading 1.4s ease infinite;
}

@keyframes el-skeleton-loading {
  0% {
    background-position: 100% 50%
  }

  to {
    background-position: 0 50%
  }
}

.full-height {
  height: 100%
}
</style>
