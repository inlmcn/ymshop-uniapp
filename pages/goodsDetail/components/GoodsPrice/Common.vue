<!--
    @name: Common
    @author: kahu4
    @date: 2024-01-16 14:42
    @description：普通商品
    @update: 2024-01-16 14:42
-->
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  price: {
    type: [String, Number],
  },
  oldPrice: {
    type: [String, Number],
  },
  sales: {
    type: [String, Number],
  },
})

const {price, oldPrice, sales} = toRefs(props)
</script>

<template>
  <!-- 普通商品 -->
  <view class="price-row">
    <view>
          <span class="price">
         ¥{{ price }}
    </span>
      <span v-if="oldPrice" class="old-price">
         ¥{{ oldPrice }}
      </span>
    </view>
    <view>
      <span class="sales">
        已售{{sales}}
      </span>
    </view>
  </view>
</template>

<style lang="scss"
       scoped>
.price-row {
  width: 100%;
  @include usePadding(30, 30);
  @include useFlex(flex-start, center);
  background: $white-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .price {
    color: $primary-color;
    font-size: 50rpx;
  }
  .sales {
    font-size: 26rpx;
    color: #999999;
  }
  .old-price {
    color: $tips-color;
    font-size: 28rpx;
    text-decoration: line-through;
    margin-left: 15rpx;
  }
}

</style>
