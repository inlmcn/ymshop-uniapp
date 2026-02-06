<template>
  <view
      class="goods"
      :class="[list && 'goods-list',hasFirst && 'goods-first']"
      @tap="toDetail"
  >
    <view
        class="goods-header"
    >
      <view class="goods-thumb-wrap">
        <LazyImage
            :unique="data.id"
            :src="data.image"
            class="goods-thumb-img"
            mode="aspectFit"
        />
      </view>
    </view>
    <view class="goods-content">
      <view>

          <view
              class="goods-storeName"
          >
            <productTag :data="data.tag" /> {{ integral?data.campaignName:data.storeName }}
          </view>

        <view
            class="buy-progress-first"
            v-if="hasFirst && buyProgress">
          <uv-line-progress
              activeColor="#00CBCC"
              inactiveColor="#E6E6E6"
              height="14rpx"
              :percentage="percentageNum"
              :showText="false"
          />
          <text class="text">已售{{ percentage }}</text>
        </view>
      </view>
      <view
          class="goods-list-model"
          v-if="selectModel"
      >
        <div
            class="goods-list-model-border"
            @tap.stop="handleOpenSelect"
        >
          <view class="goods-list-model-label">{{ data.attrInfo.sku }}</view>
          <view class="goods-list-model-action icon">
            <image :src="goodsArrowsIcon" />
          </view>
        </div>
      </view>
      <view
          class="goods-list-model-info"
          v-if="model"
      >
        <view class="goods-list-model-label">{{ data.attrInfo.sku }}</view>
      </view>
      <view>
        <view class="goods-info">
          <view class="goods-info-left">
            <view
                class="goods-desc"
                v-if="groupBuy"
            >{{ data.person }}人团
            </view>
            <view class="integral-price" v-if="integral">
              <view class="integral">
                <image
                    class="icon"
                    :src="integralIcon"
                    mode="widthFix" />
                <text class="text">{{data.integral}}</text>
              </view>
              <view class="price" v-if="data.price && data.price !== 0">
                <text class="text">¥{{data.price}}</text>
              </view>
            </view>
            <view
                class="goods-price-row"
            >
              <view class="goods-price" v-if="!integral">
                ¥{{price || data.campaignPrice || data.price }}
              </view>
              <view
                  class="goods-price goods-price-original"
                  v-if="original"
              >
                ¥{{ data.otPrice || data.originalPrice }}
              </view>
            </view>
          </view>
          <view class="goods-info-action">
            <view class="goods-info-action-btn">
              <slot name="action"></slot>
            </view>
            <view
                v-if="stock"
                class="goods-info-action-desc"
            >
              <text v-if="data.stock">仅剩{{ data.stock }}件</text>
              <text v-else>库存不足</text>
            </view>
            <view v-if="integral" class="goods-info-action-desc">
              <text >已兑{{ data.total - data.stock || 0 }}件</text>
            </view>
            <view
                class="buy-num"
                v-if="purchase"
            >
              <view class="buy-num-info-desc">
                x{{ purchase }}
              </view>
            </view>
            <view
                class="button-box"
                v-if="groupBuy"
            >
              立刻拼团
            </view>
          </view>
        </view>
        <view
            class="buy-progress"
            v-if="!hasFirst && buyProgress">
          <view class="buy-progress-info">
            <view
                class="buy-progress-info-desc"
                v-if="total"
            >
              限量{{ data.campaignTotal || data.total }}件
            </view>
            <uv-line-progress
                activeColor="#00CBCC"
                inactiveColor="#E6E6E6"
                height="14rpx"
                :percentage="percentageNum"
                :showText="false"
            />
          </view>
          <view class="buy-progress-action">
            <view
                class="button-box"
            >
              立即抢购
            </view>
          </view>
        </view>
      </view>
    </view>
    <good-attr-select
        v-if="selectModel"
        ref="selectAttrPanel"
        :id="data.id"
        @select="handleSelectAttr"
    />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from "@/hooks/useRouter";
import {goodsArrowsIcon, integralIcon} from "@/utils/images";
import LazyImage from '@/components/LazyImage/index.vue'

const props = defineProps(['data', 'groupBuy', 'original', 'stock', 'list', 'buyProgress', 'total', 'selectModel', 'model', 'purchase', 'link', 'price', 'hasFirst', 'integral', 'isCollectFoot','isOld'])

// 列表模式
const list = ref(props.list !== undefined)
// 是否团购
const groupBuy = ref(props.groupBuy)
// 剩余数量
const stock = ref(props.stock)
// 限量多少件
const total = ref(props.total)
// 显示购买进度
const buyProgress = ref(props.buyProgress)
// 选择规格
const selectModel = ref(props.selectModel !== undefined)
// 显示规格
const model = ref(props.model !== undefined)
// 购买数量
const purchase = ref(props.purchase)
// 购买价格
const price = ref(props.price)
// 原价
const original = ref(props.original)
// 小尺寸
const selectAttrPanel = ref(null)
// 链接
const link = ref(props.link !== undefined)
// 是否有首条
const hasFirst = ref(props.hasFirst)
// 是否积分
const integral = ref(props.integral)
const {push} = useRouter()
const toDetail = () => {
  if (!link.value) {
    return
  }
  let data = {id: props.isCollectFoot ? props.data.productId : props.data.id, skuId: props.data.skuId}

  if(integral.value){
    data.type = 4
  }
   console.log("====老订单=22222222222222========"+props.isOld)
  if(props.isOld==1){
	  console.log("====老订单=========")
  }else{
	  push({url: '/pages/product/detail'}, {data})
  }
}




const handleOpenSelect = () => {
  selectAttrPanel.value.open()
}

const handleSelectAttr = () => {

}

const percentageNum = computed(() => {
  const total = props.data.campaignTotal || props.data.total
  const stock = props.data.campaignStock || props.data.stock
  return (total - stock) / total * 100
})

const percentage = computed(() => {
  const total = props.data.campaignTotal || props.data.total
  const stock = props.data.campaignStock || props.data.stock
  return Math.floor((total - stock) / total * 100).toFixed(0) + '%'
})
</script>

<style lang="scss" scoped>
.goods {
  position: relative;

  &-thumb-wrap {
    width: 140rpx;
    height: 140rpx;

    &-img {
      width: 100%;
    }
  }

  &-thumb {
    background: #FAFAFA;
  }

  &-content {
    padding: 20rpx;
  }
  &-storeName {
    line-height: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    margin-bottom: 7rpx;
  }

  .buy-progress-first {
    display: flex;
    align-items: center;
    margin-top: 20rpx;

    .text {
      font-size: 24rpx;
      color: #999999;
      margin-left: 20rpx;
    }
  }

  // 进度条
  ::v-deep .uv-line-progress {
    border-radius: 0;

    &__background {
      border-radius: 0;
    }

    &__line {
      border-radius: 0;
    }
  }

  &-price {
    line-height: 42rpx;
    font-size: 30rpx;
    color: #00CBCC;

    &-row {
      display: flex;
      align-items: flex-end;
    }

    //&-primary {
    //  line-height: 42rpx;
    //  font-size: 30rpx;
    //  color: #00CBCC;
    //}
    //
    //&-default {
    //  line-height: 42rpx;
    //  font-size: 30rpx;
    //  color: #00CBCC;
    //}

    &-original {
      margin-left: 9rpx;
      line-height: 28rpx;
      font-size: 20rpx;
      color: #999999;
      text-decoration: line-through;
    }
  }


  &-desc {
    line-height: 33rpx;
    font-size: 24rpx;
    color: #999999;
  }

  .integral-price{
    display: flex;
    align-items: center;
    margin: 7rpx 0 17rpx 0;
    .integral{
      font-size: 28rpx;
      color: #333333;
      line-height: 34rpx;
      display: flex;
      align-items: center;
      .icon{
        width: 32rpx;
        height: 32rpx;
        margin-right: 4rpx;
      }
    }
    .price{
      display: flex;
      align-items: center;
      font-size: 28rpx;
      line-height: 33rpx;
      &:before{
        content: '+';
        color: #333333;
        padding: 0 5rpx 5rpx;
      }
      .text{
        color: #E85A2B;
      }
    }
  }

  &-info {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 3rpx;

    &-action {
      display: flex;
      align-items: center;
      justify-content: center;

      .button {
        flex-shrink: 0;
        white-space: nowrap;
      }

      &-desc {
        line-height: 28rpx;
        font-size: 20rpx;
        color: #999999;
      }
    }
  }

  ::v-deep .uv-button {
    width: 120rpx;
    height: 50rpx;
    padding: 0;
    font-size: 20rpx;
  }

  .button-box {
    width: 100rpx;
    height: 50rpx;
    text-align: center;
    line-height: 50rpx;
    font-size: 20rpx;
    color: #ffffff;
    background: #E85A2B;
    border-radius: 8rpx;
  }

  &-list, &-first {
    display: flex;
    flex-direction: row;
    padding: 20rpx 34rpx 20rpx 20rpx;
    box-sizing: border-box;
    width: 100%;

    .goods {
      &-thumb {
        margin-bottom: 0;
        width: 270rpx;
        height: 270rpx;

        &-img {
          width: 100%;
          height: 100%;
          display: block;
        }
      }

      &-content {
        padding: 0;
        margin-left: 40rpx;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      &-storeName {
        -webkit-line-clamp: 2;
        word-break: break-all;
      }

      &-info {
        .goods-price {
          font-size: 34rpx;
        }

        .goods-price-original {
          font-size: 22rpx;
        }
      }
    }


    &-model {
      display: flex;


      margin-bottom: 28rpx;

      &-border {
        display: flex;
        align-items: center;
        height: 40rpx;
        border: 1px solid #CCCCCC;
        opacity: 1;
        border-radius: 0rpx;
        padding: 0 10rpx;
      }

      &-label {
        line-height: 38rpx;
        font-size: 24rpx;
        color: #999999;
        margin-right: 10rpx;
        //white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &-value {
        line-height: 38rpx;
        font-size: 24rpx;
        color: #333333;
        margin-right: 10rpx;
        display: -webkit-box;
      }

      &-action {
        width: 11rpx;
        height: 7rpx;
      }
    }

  }


  &-model {
    display: inline-flex;
    align-items: center;
    width: auto;
    height: 40rpx;
    border: 1px solid #CCCCCC;
    opacity: 1;
    border-radius: 0rpx;
    padding: 0 10rpx;
    margin-bottom: 28rpx;

    &-label {
      line-height: 38rpx;
      font-size: 24rpx;
      color: #999999;
    }

    &-value {
      line-height: 38rpx;
      font-size: 24rpx;
      color: #333333;
      margin-right: 10rpx;
    }

    &-action {
      width: 11rpx;
      height: 7rpx;
    }
  }
}

.buy-progress {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &-info {
    flex: 1;

    &-desc {
      color: #999999;
      font-size: 24rpx;
      line-height: 32rpx;
    }
  }

  &-action {
    margin-left: 17rpx;
  }
}

.buy-num {
  &-info-desc {
    color: #999999;
    font-size: 24rpx;
    line-height: 32rpx;
  }
}
</style>
