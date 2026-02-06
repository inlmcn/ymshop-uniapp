<!--
    @name: CheckOffCode
    @author: kahu4
    @date: 2024-01-22 10:37
    @description：核销码弹窗
    @update: 2024-01-22 10:37
-->
<script setup>
import Popup from "@/components/Popup.vue";
import { ref } from "vue";
import { useShearPlate } from "@/hooks/useShearPlate";
import { useInterface } from "@/hooks/useInterface";
import { generateQrCode } from "@/api/global";

const {setData} = useShearPlate()
const {toast, loading, hideLoading} = useInterface();
// ====================== qr code ================================
const orderId = ref(null) // 订单id
const writeOffCode = ref(null) // 核销码
const writeOffCodeQr = ref('') // 核销二维码
/**
 * 生成二维码
 * @return {Promise<void>}
 */
async function doGetQrCode() {
  try {
    loading()
    writeOffCodeQr.value = await generateQrCode({content: writeOffCode.value});
  } finally {
    hideLoading()
  }
}

async function handleCopyCode() {
  await setData(writeOffCode.value)
  toast({title: '复制成功', icon: 'success'})
}

// ========================= 弹窗 ==================================
const popupRef = ref()

async function open(code) {
  popupRef.value.show()
  writeOffCode.value = code
  await doGetQrCode()
}

function close() {
  writeOffCode.value = null
  writeOffCodeQr.value = ''
}

defineExpose({open})
</script>

<template>
  <Popup
      ref="popupRef"
      mode="center"
      @close="close">
    <template #title>
      <view class="title">
        核销码
      </view>
    </template>
    <view class="check-off-code">
      <view class="code-row">
        {{ writeOffCode }}
        <view
            class="copy"
            @click="handleCopyCode">复制
        </view>
      </view>
      <view class="qr-code">
        <image :src="writeOffCodeQr" />
      </view>
      <view class="tips-row">
        <p class="tip">为保障您的权益</p>
        <p class="tip"> 未到店前请不要将核销码提供给商家</p>
      </view>
    </view>
  </Popup>
</template>
<style
    scoped
    lang="scss">
.title {
  font-size: 34rpx !important;
  font-weight: 500;
}

.check-off-code {
  @include useFlex(center, center, column);
  @include usePadding(30, 10);
  width: 80vw;

  .code-row {
    @include useFlex(center, center);
    font-size: 32rpx;
    margin-bottom: 40rpx;

    .copy {
      @include usePadding(16, 4);
      margin-left: 20rpx;
      background: #F7F7F7;
      font-size: 24rpx;
      border-radius: 5rpx;
    }
  }

  .qr-code {
    border: 4rpx solid #F8F8FA;
    border-radius: 16rpx;
    width: 90%;
    aspect-ratio: 1/1;
    margin-bottom: 24rpx;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .tips-row {
    color: #999999;
    font-size: 24rpx;
    padding-bottom: 40rpx;

    .tip {
      text-align: center;
    }
  }
}
</style>
