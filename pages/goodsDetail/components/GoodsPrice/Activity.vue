<!--
    @name: Activity
    @author: kahu4
    @date: 2024-01-16 14:48
    @description：Activity 活动
    @update: 2024-01-16 14:48
-->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref, toRefs, watch } from "vue";
import { getTimeAfterNow } from "@/utils/utils";

const emits = defineEmits(['timeOver'])
/**
 * @property {String|Number} price 售卖价格
 * @property {String|Number} oldPrice 划线价格
 * @property {Number} type 组件类型 1、拼团，2、秒杀，3、限时折扣
 * @property {Number} state 活动状态 0-未开始 1-进行中 2-已结束 3-预热
 * @property {Number} time 活动剩余时间
 */
const props = defineProps({
  price: {
    type: [String, Number],
  },
  oldPrice: {
    type: [String, Number],
  },
  type: {
    type: Number,
    default: 1
  },
  state: {
    type: Number,
    default: 3
  },
  time: {
    type: Number,
    default: 0
  }
})

const {price, oldPrice, type, state, time} = toRefs(props)

// 组件的title
const componentTitle = computed(() => ['拼团', '秒杀', '限时折扣'][type.value - 1])

let interval
const countDownTime = ref(time.value)
watch(time, () => {
  countDownTime.value = time.value
})

const countDownStrData = ref({
  hours: '00',
  minutes: '00',
  seconds: '00'
})

/**
 * 开始倒计时
 */
function playCountDown() {
  if (countDownTime.value - Date.now() <= 0) return;
  interval = setInterval(() => {
    if (countDownTime.value > 1000) {
      countDownStrData.value = getTimeAfterNow(countDownTime.value)
    } else {
      stopCountDown()
      // 判断状态，活动开始和活动结束
      emits('timeOver')
    }
  }, 1000)
}

/**
 * 停止倒计时
 */
function stopCountDown() {
  countDownTime.value = 0
  interval && clearInterval(interval)
  interval = undefined
}

const countDownStr = computed(() => {
  const timeStr = ` ${ countDownStrData.value.hours } : ${ countDownStrData.value.minutes } : ${ countDownStrData.value.seconds }`
  if ([0, 3].includes(state.value)) {
    // 未开始、预热
    return `距开始 ${ timeStr }`
  } else if ([1].includes(state.value)) {
    // 已经开始
    return `距结束 ${ timeStr }`
  }
})


onMounted(() => {
  playCountDown()
})

onBeforeUnmount(() => {
  stopCountDown()
})

</script>

<template>
  <!-- 活动商品 -->
  <view class="price-row">
    <view class="left-col">
      <view class="title">
        {{ componentTitle }}
      </view>
      <view class="price-box">
        <span class="price">
         ¥{{ price }}
        </span>
        <span
            v-if="oldPrice"
            class="old-price">
         ¥{{ oldPrice }}
      </span>
      </view>
    </view>
    <view class="right-col">
      {{ countDownStr }}
    </view>
  </view>
</template>

<style
    lang="scss"
    scoped>
.price-row {
  width: 100%;
  @include usePadding(30, 30);
  @include useFlex(space-between, flex-end);
  background: $primary-color;
  color: $white-color;

  .left-col {
    .title {
      font-size: 34rpx;
    }

    .price-box {
      .price {
        font-size: 50rpx;
      }

      .old-price {
        font-size: 28rpx;
        text-decoration: line-through;
        margin-left: 15rpx;
      }
    }

  }

}
</style>
