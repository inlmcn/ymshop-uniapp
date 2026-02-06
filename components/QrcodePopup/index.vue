<template>
  <UvPopup ref="popupRef" mode="center" :round="14" :closeOnClickOverlay="true" :zIndex="9999" @close="handleClose">
    <view class="qrcode-popup"
      :style="{ background: 'url(' + INDEX_IMG_PATH + 'f01fe13c.png' + ')', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }">
      <!-- 标题 -->
      <view class="popup-header">
        <view class="title-row">
          <image class="deco-icon" :src="INDEX_IMG_PATH + 'image_6.png'" mode="aspectFit" />
          <text class="title">{{ config.title }}</text>
          <image class="deco-icon" :src="INDEX_IMG_PATH + 'image_7.png'" mode="aspectFit" />
        </view>
        <text v-if="config.title == '扫码关注小红书'" class="subtitle">{{ config.subtitle }}</text>
      </view>

      <!-- 描述 -->
      <view class="description">{{ config.description }}</view>

      <!-- 二维码 -->
      <view class="qrcode-wrapper">
        <view class="qrcode-box">
          <image class="qrcode-img" :src="config.qrcodeImage" :show-menu-by-longpress="true" mode="aspectFill"
            @longpress="handleLongPress" />
          <!-- 四个角的圆形按钮 -->
          <image class="corner-dot top-left" :src="INDEX_IMG_PATH + 'image_10.png'" mode="aspectFit" />
          <image class="corner-dot top-right" :src="INDEX_IMG_PATH + 'image_11.png'" mode="aspectFit" />
          <image class="corner-dot bottom-left" :src="INDEX_IMG_PATH + 'image_12.png'" mode="aspectFit" />
          <image class="corner-dot bottom-right" :src="INDEX_IMG_PATH + 'image_13.png'" mode="aspectFit" />
        </view>
      </view>

      <!-- 提示文字 -->
      <view class="tip-row">
        <view class="tip-line"></view>
        <text class="tip-text">{{ config.tipText }}</text>
        <view class="tip-line"></view>
      </view>

      <!-- 关闭按钮 -->
      <view class="close-btn" @click="close">
        <image :src="INDEX_IMG_PATH + 'image_15.png'" mode="aspectFit" />
      </view>
    </view>
  </UvPopup>
</template>

<script setup>
import { ref } from 'vue'
import UvPopup from "@/uni_modules/uv-popup/components/uv-popup/uv-popup.vue"
import { INDEX_IMG_PATH } from '@/utils/imgpath'

// 组件属性定义
const props = defineProps({
  // 配置对象（包含所有内容）
  config: {
    type: Object,
    default: () => ({
      title: '扫码关注小红书',
      subtitle: '@HealthCoast',
      description: '关注品牌资讯 获取最新动态',
      qrcodeImage: '/static/xiaohongshu-popup/image_9.png',
      tipText: '长按识别二维码'
    })
  },
  // 是否显示遮罩
  showOverlay: {
    type: Boolean,
    default: true
  },
  // 点击遮罩是否关闭
  closeOnClickOverlay: {
    type: Boolean,
    default: true
  }
})

// 事件定义
const emit = defineEmits(['close', 'open'])

// 弹窗引用
const popupRef = ref()

function open() {
  popupRef.value?.open?.()
}

function close() {
  popupRef.value?.close?.()
}

function handleClose() {
  emit('close')
}

// 处理长按事件
function handleLongPress() {
  // 根据tipText判断长按行为
  if (props.config.tipText.includes('保存图片')) {
    // 先下载图片再保存到相册
    uni.downloadFile({
      url: props.config.qrcodeImage,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              uni.showToast({
                title: '保存成功',
                icon: 'success'
              })
            },
            fail: (err) => {
              console.error('保存图片失败:', err)
              uni.showToast({
                title: '保存失败，请重试',
                icon: 'none'
              })
              // 如果是因为用户拒绝授权，提示用户
              if (err.errMsg && err.errMsg.indexOf('auth deny') >= 0) {
                uni.showModal({
                  title: '提示',
                  content: '需要您授权保存图片到相册',
                  showCancel: false,
                  success: (modalRes) => {
                    if (modalRes.confirm) {
                      // 打开设置页面
                      uni.openSetting()
                    }
                  }
                })
              }
            }
          })
        } else {
          uni.showToast({
            title: '图片下载失败',
            icon: 'none'
          })
        }
      },
      fail: (err) => {
        console.error('下载图片失败:', err)
        uni.showToast({
          title: '下载图片失败',
          icon: 'none'
        })
      }
    })
  }
}

// 暴露方法给父组件
defineExpose({
  open,
  close
})
</script>

<style lang="scss" scoped>
.qrcode-popup {
  width: 620rpx;
  border-radius: 28rpx;
  padding: 60rpx 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  .popup-header {
    text-align: center;

    .title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      margin-bottom: 8rpx;

      .deco-icon {
        width: 64rpx;
        height: 12rpx;
      }

      .title {
        font-size: 40rpx;
        font-weight: 600;
        color: #000;
        white-space: nowrap;
      }
    }

    .subtitle {
      font-size: 40rpx;
      font-weight: 600;
      color: #000;
      display: block;
    }
  }

  .description {
    font-size: 30rpx;
    color: #000;
    text-align: center;
    margin-top: 30rpx;
    margin-bottom: 80rpx;
  }

  .qrcode-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 32rpx;

    .qrcode-box {
      position: relative;
      width: 260rpx;
      height: 260rpx;
      border-radius: 16rpx;
      overflow: visible;
      background: #fff;
      padding: 8rpx;
      box-sizing: border-box;
      border: 2rpx dashed #B3D9E8;

      .qrcode-img {
        width: 100%;
        height: 100%;
        border-radius: 12rpx;
      }

      .corner-dot {
        position: absolute;
        width: 56rpx;
        height: 56rpx;
        z-index: 10;

        &.top-left {
          top: -28rpx;
          left: -28rpx;
        }

        &.top-right {
          top: -28rpx;
          right: -28rpx;
        }

        &.bottom-left {
          bottom: -28rpx;
          left: -28rpx;
        }

        &.bottom-right {
          bottom: -28rpx;
          right: -28rpx;
        }
      }
    }
  }

  .tip-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    margin-top: 32rpx;
    width: 100%;

    .tip-line {
      flex: 1;
      height: 1rpx;
      background: linear-gradient(90deg, transparent, #999, transparent);
      max-width: 60rpx;
    }

    .tip-text {
      font-size: 26rpx;
      color: #575757;
      font-weight: 400;
      white-space: nowrap;
    }
  }

  .close-btn {
    position: absolute;
    bottom: -90rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    image {
      width: 100%;
      height: 100%;
    }
  }
}
</style>