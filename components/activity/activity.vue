<template>
  <container>
    <view class="activity">
      <view class="activity-header">
        <view class="activity-header-info">
          <view class="activity-header-title">
            {{ title }}
          </view>
          <view class="activity-header-subtitle">
            <slot name="subTitle">
              {{ subtitle }}
            </slot>
          </view>
        </view>
        <view
            class="activity-header-more"
            @tap="handleMoreClick"
        >
          <view class="activity-header-more-info">{{ more }}</view>
          <img
              class="image"
              :src="nextIcon"
              alt=""
          >
        </view>
      </view>
      <view class="activity-body">
        <slot></slot>
      </view>
    </view>
  </container>
</template>

<script setup>
import { ref } from 'vue';
import { nextIcon } from "@/utils/images";
const props = defineProps(["title", "subtitle", 'more'])

const title = ref(props.title)
const subtitle = ref(props.subtitle)
const more = ref(props.more)

const emit = defineEmits(['moreClick'])

const handleMoreClick = () => {
  emit('moreClick')
}


</script>

<style lang="scss">
.activity {

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    &-info {
      flex: 1;
      display: flex;
      align-items: flex-end;
    }

    &-title {
      line-height: 45rpx;
      font-size: 32rpx;
      color: #333333;
    }

    &-subtitle {
      margin-left: 10rpx;

      line-height: 33rpx;
      font-size: 24rpx;
      color: #00CBCC;
    }

    &-more {
      display: flex;
      align-items: center;


      &-info {
        line-height: 33rpx;
        font-size: 24rpx;
        color: #999999;
      }

      .image {
        margin-left: 10rpx;
        display: block;
        width: 20rpx;
        height: 20rpx;
      }
    }

  }
}
</style>
