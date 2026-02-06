<template>
  <layout>
    <uv-sticky customNavHeight="0">
      <uv-navbar
          :fixed="false"
          :safeAreaInsetTop="true"
          autoBack
          title="积分商城"
      />
    </uv-sticky>
    <view class="swiper">
      <image
          class="image"
          :src="integralBg"
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
            class="product-item">
          <goods
              link
              :data="item"
              :price="item.price"
              :original="true"
              :integral="true"
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
import { useActivity } from '@/hooks/useActivity'
import ListLoadOver from "@/components/ListLoadOver/index.vue";
import ListLoadLoading from "@/components/ListLoadLoading/index.vue";
import { integralBg, emptyCollectIcon } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";

const {refresh, dataList, loading, loadend, listEmpty, otherQuery} = useActivity(getActivityProList)

onLoad(async (option) => {
  otherQuery.value = {
    type: 4
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
  width: 100%;
  padding: 30rpx;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  .product-item {
    background: #FFFFFF;
    width: calc((100% - 20rpx) / 2);
    margin-bottom: 20rpx;
    border-radius: 30rpx;
    overflow: hidden;
  }
}
</style>
