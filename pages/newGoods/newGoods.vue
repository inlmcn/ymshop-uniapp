<template>
  <layout>
    <uv-sticky customNavHeight="0">
      <uv-navbar
          :fixed="false"
          :safeAreaInsetTop="true"
          autoBack
          title="新品首发"
      />
    </uv-sticky>
    <view class="swiper">
      <swiper
          class="swiper"
          circular
          indicator-dots
          autoplay
      >
        <swiper-item>
          <view class="swiper-item">
            <image
                class="image"
                :src="defaultBanner"
                mode="widthFix"
            />
          </view>
        </swiper-item>
        <swiper-item>
          <view class="swiper-item">
            <image
                class="image"
                :src="defaultBanner"
                mode="widthFix"
            />
          </view>
        </swiper-item>
        <swiper-item>
          <view class="swiper-item">
            <image
                class="image"
                :src="defaultBanner"
                mode="widthFix"
            />
          </view>
        </swiper-item>
      </swiper>
    </view>

    <view
        class="product-box"
        v-if="!listEmpty"
    >
      <!-- 分两列 后期瀑布流 -->
      <template
          v-for="col in colList"
          :key="col.name"
      >
        <view class="col left-col">
          <template
              v-for="item in col.data"
              :key="item.id"
          >
            <view class="product-item">
              <Goods
                  :goods="item"
                  infoPadding="10rpx 10rpx"
              >
                <template #options>
                  <view class="good-bottom">
                    <view class="price">
                      ￥{{ item.price }}
                    </view>
                    <view class="sale">
                      仅剩{{ item.stock }}件
                    </view>
                  </view>
                </template>
              </Goods>
            </view>
          </template>
        </view>
      </template>
    </view>
    <Empty
        v-else
        :iconSrc="emptyCollectIcon"
    >
      这里空空如也~
    </Empty>
    <!-- 加载中 -->
    <ListLoadLoading v-if="loading" />
    <!-- 加载完毕-->
    <ListLoadOver v-if="loadend" />
  </layout>
</template>


<script setup>

import { computed } from 'vue'
import { getProductList } from '@/api/product'
import { onLoad } from '@dcloudio/uni-app'
import { usePage } from '@/hooks'
import Goods from "@/components/goodsComponents/Goods.vue"
import ListLoadOver from "@/components/ListLoadOver/index.vue";
import ListLoadLoading from "@/components/ListLoadLoading/index.vue";
import {emptyCollectIcon} from "@/utils/images";
import Empty from "@/components/Empty/index.vue";
import { defaultBanner } from "@/utils/images";

const {news, refresh, dataList, loading, loadend, listEmpty} = usePage(getProductList)

onLoad(async (option) => {
  news.value = 1
  await refresh()
})

const colList = computed(() => [
  {
    name: 'all',
    data: dataList.value
  }
])

</script>

<style lang="scss">
.swiper {
  width: 100%;

  .image {
    width: 100%;
    display: block;
  }
}

.product-box {
  width: 100%;
  padding: 30rpx;
  box-sizing: border-box;

  .col {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;

    .product-item {
      margin-bottom: 20rpx;
      background: $white-color;
      border-radius: 20rpx;
      overflow: hidden;
      margin-right: 20rpx;
      width: calc((100% - 20rpx) / 2);

      .good-bottom {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 20rpx;

        .price {
          font-size: 28rpx;
        }

        .sale {
          color: #999999;
        }
      }
    }

    .product-item:nth-of-type(2n + 0) {
      margin-right: 0;
    }
  }
}
</style>
