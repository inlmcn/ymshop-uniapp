<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 17:00
    @description：分销商品
    @update: 2024-01-17 17:00
-->
<script setup>
import Header from '@/components/Header/index.vue'
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { onMounted, ref } from "vue";
import GoodsCom from "@/components/goodsComponents/Goods.vue";
import { usePage } from "@/hooks";
import {getDistributorProductList} from "@/api/product";
import { useRouter } from "@/hooks/useRouter";
import { useMainStore } from "@/store/modules/useMainStore";
import { useShare } from "@/hooks/useShare";
import GoodsSharePopup from '@/components/Share/Goods.vue'
import GoodsPoster from '@/components/Poster/Goods.vue'
import { useGlobalRequestStore } from "@/store/modules/useGlobalRequestStore";

const mainStore = useMainStore();
const {scrollTop} = useScroll()
onPageScroll(() => {
})
const {refresh, dataList, loadend, loading, listEmpty} = usePage(getDistributorProductList)
const {shareAppMessage, shareTimeline, distributionGoodsDetailShare, shareH5} = useShare();
const globalRequestStore = useGlobalRequestStore();
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)
const {push, getParams} = useRouter()

const distributorId = ref()
onLoad((options) => {
  const params = getParams(options);
  distributorId.value = params.distributionId
  otherQuery.value = {
    isDistribution: 1
  }
})

// ======================= 分享相关 ================================
const goodsShare = ref()
const goodsPoster = ref()

function doShare(goods) {
  goodsShare.value.open('分享赚', goods)
}

async function shareConfirm(shareItem, goods) {
  await globalRequestStore.doShareToAddIntegral()
  distributionGoodsDetailShare(goods, distributorId.value)
  if (shareItem.value === 'photo') {
    goodsPoster.value.open(goods,distributorId.value)
    return
  }
  if (shareItem.value === 'wechat') {
    shareH5()
  }
}

onMounted(() => {
  refresh()
})
</script>

<template>

  <view class="goods-list">
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 分销商品
    </Header>
    <view class="goods-list__inner">
      <template
          v-for="item in dataList"
          :key="item.id"
      >
        <view class="product">
          <GoodsCom
              row
              img-width="160rpx"
              :ratio="true"
              :goods="item"
              infoPadding="10rpx 10rpx"
          >
            <template #options>
              <view class="good-bottom">
                <view class="price">
                  ￥{{ item.price }}
                </view>
                <view class="sale flex flex-jc__sb flex-ai__end">
                  <view class="left">
                    <text class="gray-color">预计佣金：</text>
                    ￥{{ item.expectPrice }}
                  </view>
                  <view
                      class="btn"
                      @click.stop="doShare(item)">
                    分享赚
                  </view>
                </view>
              </view>
            </template>
          </GoodsCom>
        </view>
      </template>
    </view>

    <GoodsSharePopup
        ref="goodsShare"
        @share="shareConfirm" />

    <GoodsPoster ref="goodsPoster" />
  </view>
</template>

<style
    scoped
    lang="scss">
.goods-list {
  &__inner {
    width: 100%;
    @include usePadding(34, 34);

    .product {
      background: #fff;
      border-radius: 15rpx;
      margin-bottom: 20rpx;

      .good-bottom {
        width: 100%;

        .price {
          color: $primary-color;
          font-size: 30rpx;
        }

        .sale {
          width: 100%;
          font-size: 24rpx;

          .btn {
            @include usePadding(24, 11);
            color: #fff;
            background: #333;
            border-radius: 15rpx;
            margin-right: 20rpx;
          }
        }
      }
    }
  }
}

.gray-color {
  color: $tips-color;
}
</style>
