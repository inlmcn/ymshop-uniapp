<template>
  <view
      :class="{
    reply: true,
    noPic: !data?.pics
  }"
  >
    <view class="reply-content">
      <view class="reply-warp">
        <view class="reply-user">
          <view class="reply-user-pic">
            <image
                class="img"
                :src="data.avatar"
                @click="doPreviewImage(0,[data.avatar])"
            />
          </view>
          <view class="reply-user-name">
            <view class="name">
              {{ data.nickname }}
            </view>
            <view class="productScore">
              <uv-rate
                  count="5"
                  :value="data.productScore"
                  readonly
                  size="26rpx"
                  gutter="1"
                  active-color="#00CBCC"
                  inactive-color="#999999"
              ></uv-rate>
            </view>
          </view>
        </view>
        <view class="reply-time">{{ data.createTime }}</view>
      </view>
      <view class="reply-text">
        {{ data.comment }}
      </view>
      <view
          class="reply-pic flex flex-ai__center"
          v-if="data.pics && data.pics.filter(item=>!!item).length>0"
      >
        <template
            v-for="(pic,index) in data.pics.filter(item=>!!item)"
            :key="index"
        >
          <image
              class="image"
              :src="pic"
              @click="doPreviewImage(index, data.pics)"
          />
        </template>
      </view>
      <view class="reply-sku">规格：{{data.sku}}</view>
      <view class="reply-merchant" v-if="data.merchantReplyContent"><b>商家回复：</b>{{data.merchantReplyContent}}</view>
    </view>

  </view>
</template>

<script setup>
import { toRefs } from 'vue';
import { useImage } from "@/hooks/useImage";

const props = defineProps(['data'])

const {data} = toRefs(props);

const {preview} = useImage()

function doPreviewImage(current, urls) {
  preview({
    current,
    urls,
  })
}
</script>

<style lang="scss">
.reply {
  border-top: 1rpx solid #E6E6E6;
  padding-bottom: 10rpx;
  &-content {
    padding: 32rpx 34rpx;
    border-right: 0;
    flex: 1;
    font-size: 30rpx;
    color: #333333;

    .reply-warp {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .reply-time {
        font-size: 24rpx;
        line-height: 1em;
        color: #999999;
      }
    }
  }

  &.noPic {
    .reply-content {
    }
  }

  &-pic {
    //width: 180rpx;
    //height: 180rpx;
    //background: #FFFFFF;
    //border-radius: 15rpx;
    padding: 0 24rpx;
  }

  &-user {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;

    &-pic {
      border-radius: 50%;
      margin-right: 20rpx;

      .img {
        width: 70rpx;
        height: 70rpx;
        display: block;
        border-radius: 50%;

      }
    }

    &-name {
      line-height: 40rpx;
      font-size: 28rpx;
      color: #333333;
    }
  }

  &-text {
    margin-top: 30rpx;
    font-size: 28rpx;
    line-height: 40rpx;
    color: #333333;
  }
  &-sku{
    font-size: 24rpx;
    line-height: 33rpx;
    color: #999999;
    margin-top: 20rpx;
  }
  &-merchant {
    padding: 15rpx 20rpx;
    background: #F5F5F5;
    margin-top: 15rpx;
  }
}

.reply-pic {
  gap: 20rpx;
  margin: 20rpx 0;
  flex-wrap: wrap;
  padding: 0;
  .image {
    width: 212rpx;
    height: 212rpx;
  }
}
</style>
