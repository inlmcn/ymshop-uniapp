<template>
  <layout>
    <uv-sticky customNavHeight="0">
      <uv-navbar
          :fixed="false"
          :safeAreaInsetTop="true"
          autoBack
          title="秒杀专区"
      />
    </uv-sticky>
    <view class="swiper">
      <image
          class="image"
          :src="seckillBg"
          mode="widthFix" />
    </view>
    <view class="time-bar">
      <div
          class="time-bar-item"
          v-for="(item,index) in timesList"
          :key="index"
          :class="activeIndex === index && 'on'"
          @tap="timeChange(item,index)">
        <div class="time">{{ item.time }}</div>
        <div class="status">
          <text v-if="item.status === 0">已结束</text>
          <text v-if="item.status === 1">抢购中</text>
          <text v-if="item.status === 2">未开始</text>
        </div>
        <div
            class="countdown"
            v-if="item.status === 1"
        >
          <text>已结束</text>
          <uv-count-down
              :time="item.countdown"
              format="HH:mm:ss"
              @finish="countDownFinish"></uv-count-down>
        </div>
      </div>
    </view>

    <view
        class="product-box"
        v-if="!listEmpty"
    >
      <template
          v-for="(item,index) in dataList"
          :key="item.id"
      >
        <view class="product-item">
          <goods
              link
              :data="item"
              :price="item.price"
              :buyProgress="true"
              :total="true"
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
import { emptyCollectIcon, seckillBg } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";

const {
  refresh,
  dataList,
  loading,
  loadend,
  listEmpty,
  otherQuery,
  activeIndex,
  timesList,
  timeChange,
  countDownFinish,
  handleGetTimeList
} = useActivity(getActivityProList)

onLoad(async (option) => {
  otherQuery.value = {
    type: 2
  }
  await handleGetTimeList()
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
    border-radius: 30rpx;
    overflow: hidden;
    background: #FFFFFF;
    width: calc((100% - 20rpx) / 2);
    margin-bottom: 20rpx;

    &.isFirst {
      width: 100%;
    }
  }
}
</style>
