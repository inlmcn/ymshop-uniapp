<!--
    @name: index
    @author: kahu4
    @date: 2024-01-21 15:38
    @description：订单核销
    @update: 2024-01-21 15:38
-->
<script setup>
import Header from "@/components/Header/index.vue"
import { useScroll } from "@/hooks/useScroll";
import { afterVerificationQrScan } from "@/utils/images";
import { ref } from 'vue'
import { cancelAfterVerification } from "@/api/activity/afterVerification";
import { useInterface } from "@/hooks/useInterface";
import Modal from "@/components/Modal/index.vue";
import { useQrCodeScan } from "@/hooks/useQrCodeScan";

// ========================= hooks ==========================
const {toast, loading, hideLoading} = useInterface();
const {scrollTop} = useScroll();
const {qrCodeScan, cancelScan} = useQrCodeScan()

// ========================= 核销 ==========================
const checkOffCode = ref('') // 核销码

/**
 * 核销
 */
async function doCancelAfterVerification() {
  if (!checkOffCode.value) return toast({title: '核销码有误'})
  try {
    loading()
    await cancelAfterVerification({writeOffCode: checkOffCode.value})
    checkOffCode.value = ''
    hideLoading()
    toast({title: '核销成功'})
  } catch (e) {
    hideLoading()
  }
}

const modalRef = ref()

function openModal() {
  if (checkOffCode.value.length <= 0) return
  modalRef.value.show()
}

function cancelModal() {
  checkOffCode.value = ''
}

// ====================== 扫码相关 ==============================
const showH5QrScan = ref(false)

async function doQrScan() {
  try {
    showH5QrScan.value = true
    uni.showLoading({
      title: '加载中...'
    })
    checkOffCode.value = await qrCodeScan();
    openModal()
  } finally {
    showH5QrScan.value = false
    uni.hideLoading()
  }
}

function h5CancelQrScan() {
  cancelScan()
  showH5QrScan.value = false
}

</script>

<template>
  <view>
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 订单核销
    </Header>
    <view class="verification">
      <view class="ver-card">
        <view class="title">核销券码</view>
        <view class="input row">
          <input
              v-model="checkOffCode"
              type="text"
              placeholder="请输入核销券码" />
        </view>
        <view
            class="btn-row row animation-button"
            :class="{disabled:checkOffCode.length<=0}"
            @click="openModal">
          确认核销
        </view>
      </view>

      <view class="ver-card">
        <view class="title">二维码核销</view>
        <view class="qr-scan row">
          <image
              :src="afterVerificationQrScan"
              @click="doQrScan" />
        </view>
      </view>
    </view>
  </view>
  <Modal
      ref="modalRef"
      content="确认要核销此订单吗？"
      @confirm="doCancelAfterVerification"
      @cancel="cancelModal" />
  <!-- #ifdef H5 -->
  <!-- h5 qr-scan UI -->
  <div
      class="qr-h5"
      :style="{
        scale:showH5QrScan?1:0
      }">
    <div
        id="reader">
    </div>
    <div
        class="cancel"
        @click="h5CancelQrScan">
      <uv-icon
          name="close"
          color="#fff"
          size="28" />
    </div>
  </div>
  <!-- #endif -->
</template>

<style
    scoped
    lang="scss">
.qr-h5 {
  scale: 0;
  overflow: hidden;
  position: fixed;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  background: #fff;
  transition: all .3s;

  .cancel {
    width: 120rpx;
    height: 120rpx;
    background: red;
    box-shadow: 0 0 20rpx rgba(236, 236, 236, 0.47);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: absolute;
    z-index: 99;
    right: 50%;
    bottom: 10px;
    transform-origin: center center;
    transform: translateX(50%) translateY(-100%);
    transition: all .3s;

    &:active {
      scale: 0.9;
    }
  }
}

.verification {
  @include usePadding(34, 34);

  .ver-card {
    @include usePadding(32, 32);
    margin-bottom: 24rpx;
    border-radius: 15rpx;
    background: #fff;

    .title {
      text-align: center;
      font-size: 38rpx;
      font-weight: bold;
    }

    .row {
      margin-top: 24rpx;
    }

    .btn-row {
      @include useFlex(center, center);
      height: 80rpx;
      border-radius: 15rpx;
    }

    .disabled {
      background: #f3997d;

      &:active {
        scale: 1;
        animation: disabledAnimation 200ms 15;
      }
    }

    .input {
      @include usePadding(21, 24);
      width: 100%;
      background: #F6F8F8;
      border-radius: 8rpx;

      input {
        width: 100%;
      }
    }

    .qr-scan {
      @include useFlex(center, center);
      margin-top: 40rpx !important;

      image {
        width: 120rpx;
        height: 120rpx;
        transition: all .3s;

        &:active {
          scale: 1.1;
        }
      }
    }
  }


  @keyframes disabledAnimation {
    0%, 90% {
      transform: translateX(0);
    }
    30% {
      transform: translateX(-20rpx);
    }
    60% {
      transform: translateX(20rpx);
    }
  }
}
</style>
