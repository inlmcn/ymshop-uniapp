<template>
  <view class="detail-reply" @tap="handleTap">
    <view class="detail-reply-main">
      <view class="detail-reply-header">
        <image
          :src="cleanUrl(data.picture || data.avatar) || COMMON_IMG_PATH + 'default-avatar.png'"
          mode="aspectFill"
          class="detail-reply-avatar"
        ></image>
        <view class="detail-reply-info">
          <view class="detail-reply-row">
            <text class="detail-reply-name">{{
              data.replyName || data.nickname
            }}</text>
            <view class="detail-reply-count">购买<text style="font-weight: bold;">{{ data.counta }}</text>次</view>
          </view>
          <view class="detail-reply-row">
            <uv-rate
              :value="data.productScore || 0"
              :count="5"
              :size="12"
              :gutter="0"
              active-color="#FF9D18"
              inactive-color="#E7E7E7"
              readonly
              active-icon="star-fill"
              allow-half
              inactive-icon="star-fill"
            />
            <text class="detail-reply-time">{{ formatDate(data.nextDay) }}</text>
          </view>
        </view>
      </view>

      <view class="detail-reply-text">{{ data.comment }}</view>
    </view>

    <image
      v-if="viewImage"
      :src="viewImage"
      mode="aspectFill"
      class="detail-reply-image"
      @tap.stop="doPreviewImage(0, [viewImage])"
    ></image>
  </view>
</template>

<script setup>
import { toRefs, computed, defineProps } from "vue";
import { useImage } from "@/hooks/useImage";
import UvRate from "@/uni_modules/uv-rate/components/uv-rate/uv-rate.vue";
import { COMMON_IMG_PATH } from '@/utils/imgpath'

const props = defineProps(["data", "productId"]);

const { data } = toRefs(props);

const { preview } = useImage();

const viewImage = computed(() => {
  let imgs = [];

  if (data.value.pics) {
    imgs = data.value.pics.split(",");
  } 

  return imgs[0] || "";
});

function doPreviewImage(current, urls) {
  preview({
    current,
    urls,
  });
}

// 清洗URL中的反引号、空格和其他无效字符
const cleanUrl = (url) => {
  if (!url) return ''

  // 转换为字符串并清理各种无效字符
  let cleanedUrl = String(url)
    .replace(/`/g, '')           // 移除反引号
    .replace(/\s+/g, '')         // 移除所有空格
    .replace(/[\r\n\t]/g, '')    // 移除换行符和制表符
    .trim()                      // 移除首尾空白

  // 如果URL不是以http开头，且不为空，则可能需要添加协议
  if (cleanedUrl && !cleanedUrl.startsWith('http') && !cleanedUrl.startsWith('//')) {
    // 这里可以根据实际情况添加默认协议或域名
    // cleanedUrl = 'https://' + cleanedUrl
  }

  return cleanedUrl
}

function formatDate(day) {
  return `使用${day == 0 ? '当天' : `${day}天后`}评价`
}

function handleTap() {
	uni.navigateTo({ 
    url: `/pages/product-review/index?id=${props.productId}&replyId=${data.value.id}`
  })
}
</script>

<style lang="scss" scoped>
.detail-reply {
  width: 100%;
  @include flex-align(space-between, flex-start);
  gap: 20rpx;

  .detail-reply-main {
    flex: 1;
    overflow: hidden;

    .detail-reply-header {
      @include flex-align(flex-start, center);
      gap: 15rpx;

      .detail-reply-avatar {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
      }

      .detail-reply-info {
        .detail-reply-row {
          @include flex-align(flex-start, center);

          &:first-child {
            margin-bottom: 3rpx;
          }

          .detail-reply-name {
            font-size: 26rpx;
            font-weight: 600;
            color: #000000;
          }

          .detail-reply-count {
            margin-left: 6rpx;
            width: 101rpx;
            height: 32rpx;
            font-size: 18rpx;
            color: #00cbcc;
            line-height: 32rpx;
            text-align: center;
            background: #e3fafa;
            border-radius: 36rpx;
          }

          .detail-reply-time {
            margin-left: 12rpx;
            font-size: 20rpx;
            color: #7B7B7B;
          }
        }
      }
    }

    .detail-reply-text {
      max-width: 100%;
      margin-top: 14rpx;
      font-size: 26rpx;
      color: #222222;
      line-height: 33rpx;
      word-break: break-all;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      text-align: justify;
    }
  }

  .detail-reply-image {
    margin-top: 12rpx;
    width: 108rpx;
    height: 108rpx;
    display: block;
    border-radius: 18rpx;
    overflow: hidden;
  }
}
</style>
