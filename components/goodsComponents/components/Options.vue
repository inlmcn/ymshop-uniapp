<!--
    @name: Options
    @author: kahu4
    @date: 2023-11-03 15:30
    @description：Options
    @update: 2023-11-03 15:30
-->
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  row: {
    type: Boolean,
    default: false
  },
  showBtn: {
    type: Boolean,
    default: false
  },
  btnText: {
    type: String,
    default: '立即抢购'
  },
  oldPrice: {
    type: Boolean,
    default: false
  },
  tips: {
    type: Boolean,
    default: false
  },
  schedule: {
    type: Boolean,
    default: false
  },
  goods: {
    type: Object,
    default: () => ({})
  }
})
const {row, showBtn, oldPrice, btnText} = toRefs(props)
</script>

<template>
  <view
      class="options flex flex-jc__sb flex-ai__center"
      :class="{row,'flex-ai__center':row,'flex-ai__end':!row}"
  >
    <view class="price-box ">
      <view class="price-row flex flex-jc__sb flex-ai__end">
        <view class="price">
          ￥{{ goods.price }}
        </view>
        <view
            class="old-price"
            v-if="oldPrice"
        >
          ￥{{ goods.otPrice }}
        </view>
      </view>
      <view
          class="tips-row"
          v-if="tips"
      >
        限量100件
      </view>
      <view
          class="process-row"
          v-if="schedule"
      >
        <view class="schedule"></view>
      </view>
    </view>
    <view
        class="btn-box"
        :class="{'no-btn':!showBtn}"
    >
      <slot
          :goods="goods"
          name="right-tip"
      >
        {{ showBtn ? btnText : `仅剩${ goods.stock }${ goods.unit || '' }` }}
      </slot>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.options {
  width: 100%;

  .price-box {

    .price-row {
      font-size: 28rpx;
      color: $primary-color;

      .old-price {
        color: $tips-color;
        font-size: 20rpx;
        text-decoration: line-through;
      }
    }

    .tips-row {
      color: $tips-color;
      font-size: 24rpx;
      margin: 6rpx 0;
    }

    .process-row {
      width: 100%;
      height: 15rpx;
      background: #f5f5f5;
      position: relative;

      .schedule {
        background: $primary-color;
        width: 50%;
        height: 100%;
      }
    }
  }

  .btn-box {
    @include usePadding(15, 10);
    flex-shrink: 0;
    background: $primary-color;
    color: $white-color;
    font-size: 18rpx;
  }

  .no-btn {
    padding: 0 0;
    background: none;
    color: $tips-color;

  }
}
</style>
