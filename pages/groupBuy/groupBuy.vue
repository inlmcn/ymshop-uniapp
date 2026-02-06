<template>
  <layout>
    <uv-sticky customNavHeight="0">
      <uv-navbar
          :fixed="false"
          :safeAreaInsetTop="true"
          autoBack
          title="拼团专区"
      />
    </uv-sticky>
    <view class="swiper">
      <image
          class="image"
          :src="groupBuyBg"
          mode="widthFix" />
    </view>

    <view
        class="product-box"
        v-if="!listEmpty"
    >
      <template
          v-for="(item,index) in dataList"
          :key="item.id"
      >
        <view
            class="product-item"
            :class="index === 0 && 'isFirst'">
          <goods
              link
              :hasFirst="index === 0"
              :data="item"
              :price="item.price"
              :original="true"
              :groupBuy="true"
          >
          </goods>
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
import { getActivityProList } from '@/api/product'
import { onLoad } from '@dcloudio/uni-app'
import ListLoadOver from "@/components/ListLoadOver/index.vue";
import ListLoadLoading from "@/components/ListLoadLoading/index.vue";
import { emptyCollectIcon, groupBuyBg } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";
import { useActivity } from '@/hooks/useActivity'
import Goods from "@/components/goods/goods.vue";

const {refresh, dataList, loading, loadend, listEmpty, otherQuery} = useActivity(getActivityProList)

onLoad(async (option) => {
  otherQuery.value = {
    type: 1
  }
  await refresh()
})

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
  margin-top: -210rpx;
  width: 100%;
  padding: 30rpx;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;

  .product-item {
    background: #FFFFFF;
    border-radius: 30rpx;
    overflow: hidden;
    width: calc((100% - 20rpx) / 2);
    margin-bottom: 20rpx;

    &.isFirst {
      width: 100%;
    }
  }
}
</style>
