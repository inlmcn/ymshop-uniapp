<!--
    @name: GroupByOrderList
    @author: kahu4
    @date: 2024-01-16 15:47
    @description：GroupByOrderList
    @update: 2024-01-16 15:47
-->
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, unref, watch } from "vue";
import { getTimeAfterNow } from "@/utils/utils";
import { useMainStore } from "@/store/modules/useMainStore";
import { useInterface } from "@/hooks/useInterface";
import { handleLoginFailure } from "@/utils";

const emits = defineEmits(["activeListItemTimeOver", "doGroupBy"])

const props = defineProps({
  list: Array,
  required: true
})

const {list} = toRefs(props)
const emptyList = computed(() => unref(list).filter(i => i.closeTime >= Date.now()).length <= 0)

const timerList = []
const timerStrList = ref([])

function playCountDown() {
  list.value.forEach((order, index) => {
    timerStrList.value[index] = getTimeAfterNow(order.closeTime)
    timerList[index] = setInterval(() => {
      if (order.closeTime > 1000) {
        timerStrList.value[index] = getTimeAfterNow(order.closeTime)
      } else {
        stopCountDown(index)
        emits('activeListItemTimeOver', order)
      }
    }, 1000)
  })
}

function stopCountDown(index) {
  timerList[index] && clearInterval(timerList[index])
}

function stopAllCountDown() {
  timerList.forEach(timer => {
    timer && clearInterval(timer)
  })
  timerList.length = 0
}

const {toast} = useInterface();
const mainStore = useMainStore()

function handleGoGroupBy(order) {
  if (!mainStore.user) {
    handleLoginFailure()
    return
  }
  const orderUserId = order.user.uid
  if (mainStore.user.id === orderUserId) return toast({title: '不能参与自己的拼单'})
  emits('doGroupBy', order)
}

function handleCheckPay(closeTime) {
  return closeTime >= Date.now()
}

onBeforeUnmount(() => {
  stopAllCountDown()
})

watch(list, (val) => {
  if (!val || val.length <= 0) return
  stopAllCountDown()
  playCountDown()
}, {
  immediate: true
})


</script>

<template>
  <view
      class="group-order-list"
      v-if="!emptyList">
    <view class="title">
      这些人正在拼单
    </view>
    <view class="content">
      <template
          v-for="(order,index) in list"
          :key="order.id">
        <view
            class="order-row"
            v-if="handleCheckPay(order.closeTime)">
          <view class="userinfo-col">
            <image
                :src="order.user.avatar"
                class="user-header" />
            <span class="user-name">{{ order.user.nickname }}</span>
          </view>
          <view class="order-col">
            <view class="info">
              <view>还差
                <text class="primary-color">{{ order.total - order.current }}人</text>
                    拼成
              </view>
              <view v-if="timerStrList[index]">
                剩余
                {{ timerStrList[index].hours }}
                :
                {{ timerStrList[index].minutes }}
                :
                {{ timerStrList[index].seconds }}
              </view>
            </view>
            <view
                class="btn"
                @click="handleGoGroupBy(order)">
              去拼团
            </view>
          </view>
        </view>
      </template>
    </view>
  </view>
</template>

<style
    lang="scss"
    scoped>
.group-order-list {
  background: $white-color;
  margin-bottom: 15rpx;

  .title {
    @include usePadding(30, 30);
    border-bottom: 1rpx solid #f0f2f5;
    font-size: 32rpx;
    font-weight: 500;
    color: #333;
  }

  .content {
    @include usePadding(30, 0);

    .order-row {
      @include useFlex(space-between, center);
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f2f5;

      &:last-child {
        border-bottom: none;
      }

      .userinfo-col {
        @include useFlex(flex-start, center);

        .user-header {
          width: 80rpx;
          height: 80rpx;
          //background: #e1e1e1;
          border-radius: 50%;
        }

        .user-name {
          margin-left: 15rpx;
        }
      }

      .order-col {
        @include useFlex(flex-end, center);

        .info {
          font-size: 24rpx;
          margin-right: 15rpx;
        }

        .btn {
          @include useFlex(center, center);
          @include usePadding(24, 10);
          color: $primary-color;
          border: 1rpx solid $primary-color;
        }
      }
    }
  }
}

.primary-color {
  color: $primary-color;
}
</style>
