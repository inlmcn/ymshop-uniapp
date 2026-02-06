<!--
    @name: addressItem
    @author: kahu4
    @date: 2024-03-04 15:58
    @description：addressItem
    @update: 2024-03-04 15:58
-->
<script setup>

import { addressEditIcon } from "@/utils/images";
import { toRefs } from "vue";
import UvTags from "@/uni_modules/uv-tags/components/uv-tags/uv-tags.vue";

const emits = defineEmits(['edit', 'click'])

const props = defineProps({
  addressItem: {
    type: Object,
    required: true
  },
  border: {
    type: Boolean,
    default: false
  }
})

const { addressItem, border } = toRefs(props)
</script>

<template>
  <view class="address-item" @tap="emits('click', addressItem)">
    <view class="address-main">
      <view class="address-header">
        <view class="address-name">{{ addressItem.realName }}</view>
        <view class="address-phone">{{ addressItem.phone }}</view>
      </view>
      <view class="address-content">
        <view class="address-default" v-if="addressItem.isDefault">
          <!-- <uv-tags text="默认" plain size="mini" color="#00CBCC" itemStyle="border: 1rpx solid #00CBCC;" /> -->
          <view class="address-default-text">默认</view>
        </view>
        <view class="address-desc">
          {{ addressItem.province }}-{{ addressItem.city }}-{{ addressItem.district }} {{ addressItem.detail }}
        </view>
      </view>
    </view>
    <view class="address-actions">
      <view class="address-actions-edit" @tap.stop="emits('edit', addressItem)">
        <image class="image" :src="addressEditIcon" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.address-default-text{
  line-height: 33rpx;
  font-size: 24rpx;
  color: #00CBCC;
  border: 1rpx solid #00CBCC;
  border-radius: 10rpx;
  padding: 0 10rpx;
}
.address-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .address-actions {
    .address-actionsedit {
      width: 33rpx;
      height: 33rpx;

      .image {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  }

  background: #fff;

  .address-header {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }

  .address-name {
    line-height: 40rpx;
    font-size: 28rpx;
    color: #333333;
    margin-right: 30rpx;

  }

  .address-phone {
    line-height: 40rpx;
    font-size: 28rpx;
    color: #333333;
  }

  .address-content {
    display: flex;
    align-items: center;
    padding-right: 10rpx;
  }

  .address-default {
    width: 80rpx;
    margin-right: 20rpx;
  }

  .address-desc {
    flex: 1;
    line-height: 33rpx;
    font-size: 24rpx;
    color: #999999;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}
</style>
