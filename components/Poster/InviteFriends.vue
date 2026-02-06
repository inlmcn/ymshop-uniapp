<!--
    @name: DistributionPoster
    @author: kahu4
    @date: 2024-01-17 17:38
    @description：分销海报
    @update: 2024-01-17 17:38
-->
<script setup>
import { ref } from "vue";
import { useMainStore } from "@/store/modules/useMainStore";
import { distributionShareBg } from '@/utils/images'
import { useImage } from "@/hooks/useImage";
import { generateMiniProgramQrCode } from "@/api/global";
import { useInterface } from "@/hooks/useInterface";
// =================================== hooks ============================================
const mainStore = useMainStore();
const {toast, loading, hideLoading} = useInterface()
const {getImageInfo, saveImageToPhotosAlbum, base64ToUrl} = useImage()

const show = ref(false)

const qrCodeValue = ref('')

/**
 *  打开弹窗
 * @param shareInfo 通过useShare生成的shareInfo
 * @param distributorInformation 分销商详情
 * @return {Promise<void>}
 */
async function open(shareInfo, distributorInformation) {
  try {
    loading({title: '生成中...'})
    qrCodeValue.value = await generateMiniProgramQrCode({path: `pages/share/index`, name: shareInfo.query})
    show.value = true
  } finally {
    hideLoading()
  }
}

/**
 * 关闭分享弹窗
 */
function close() {
  show.value = false
}


defineExpose({open, close})


/**
 * 保存到相册
 * @returns {Promise<void>}
 */
async function save() {
  uni.showLoading({title: '保存中'})
  try {
    const path = await base64ToUrl(qrCodeValue.value);
    await saveImageToPhotosAlbum(path)
    toast({title: '保存成功', type: 'success'})
    close()
  } finally {
    uni.hideLoading()
  }
}
</script>

<template>
  <uv-overlay
      :show="show"
      @click="close">
    <view
        class="poster">
      <!-- 海报 -->
      <view
          class="poster__inner"
          :style="{backgroundImage:`url(${distributionShareBg})`}"
          @click.stop>
        <view class="user-inner">
          <image
              class="header"
              :src="mainStore.user.avatar" />
          <view class="username">{{ mainStore.user.nickname }}</view>
          <view class="subtitle">时不待我，快来加入吧!</view>
        </view>
        <view class="qr-inner">
          <image
              class="qr-code"
              :src="qrCodeValue" />
          <view class="subtitle">长按识别图中二维码</view>
        </view>

      </view>
      <!-- 按钮组合 -->
      <view class="button-group">
        <view
            class="button line-button"
            @click.stop="close">
          取消
        </view>
        <view
            class="button animation-button"
            @click.stop="save">
          保存
        </view>
      </view>
    </view>
  </uv-overlay>
</template>

<style
    scoped
    lang="scss">
.poster {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .poster__inner {
    width: 90%;
    aspect-ratio: 654 / 872;
    border-radius: 20rpx;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    position: relative;

    .user-inner {
      width: 80%;
      margin: 60rpx auto 0 auto;
      @include useFlex(center, center, column);
      font-size: 24rpx;

      .header {
        width: 120rpx;
        height: 120rpx;
        border-radius: 50%;
        border: 2rpx solid #fff;
        background: #fff;
        box-shadow: 0 0 5rpx rgba(202, 202, 202, 0.6);
      }

      .username {
        font-size: 36rpx;
        padding-bottom: 5rpx;
        padding-top: 25rpx;
      }
    }

    .qr-inner {
      width: 80%;
      margin: 0 auto;
      @include useFlex(center, center, column);
      font-size: 24rpx;
      color: $tips-color;
      padding-top: 80rpx;

      .qr-code {
        width: 342rpx;
        height: 342rpx;
        box-sizing: border-box;
        border-radius: 10rpx;
        border: 2rpx solid #F8F8FA;
        margin-bottom: 24rpx;
        background: #fbfbfb;
      }
    }
  }

  .button-group {
    width: 90%;
    margin-top: 40rpx;
    @include useFlex(center, center, row, nowrap, 20rpx);

    .button {
      flex-grow: 1;
      @include useFlex(center, center);
      height: 80rpx;
      background: $primary-color;
      color: $white-color;
      border-radius: 10rpx;
      box-sizing: border-box;
    }

    .line-button {
      border: 4rpx solid $white-color;
      background: #fff;
      color: #000;
    }
  }
}
</style>
