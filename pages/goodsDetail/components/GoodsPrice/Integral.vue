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
  integral: {
    type: [String, Number],
  },
})

const {price, oldPrice} = toRefs(props)
</script>

<template>
  <!-- 普通商品 -->
  <view class="price-row">
    <span class="integral">
      {{integral}}
    </span>
    <span class="unit">
      积分
    </span>
    <span class="price" v-if="price !== 0">
        + ¥{{ price }}
    </span>
    <span v-if="oldPrice" class="old-price">
         ¥{{ oldPrice }}
      </span>
  </view>
</template>

<style lang="scss"
       scoped>
.price-row {
  width: 100%;
  @include usePadding(30, 30);
  @include useFlex(flex-start, center);
  background: $white-color;
  color: $primary-color;
  .integral {
    font-size: 50rpx;
  }
  .unit{
    margin: 0 10rpx;
  }
  .old-price {
    color: $tips-color;
    font-size: 28rpx;
    text-decoration: line-through;
    margin-left: 15rpx;
  }
}

</style>
