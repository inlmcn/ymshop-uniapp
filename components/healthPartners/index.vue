<template>
  <view class="health-partners-box">
    <image :src="EVALUATION_IMG_PATH + 'wecode_bg.png'" mode="widthFix" style="display: none;" />
    <uv-popup mode="center" bgColor="rgba(0,0,0,0)" :closeable="false" :safe-area-inset-bottom="true" round="30rpx" padding="40rpx" ref="healthPartnersRef">
      <view class="health-partners-inner">
        <image :src="EVALUATION_IMG_PATH + 'wecode_bg.png'" mode="widthFix" />

        <view class="health-partners-code">
          <image :src="aiQrCode" mode="widthFix" :show-menu-by-longpress="true" />
        </view>
        <view class="health-partners-close" @click="close">
          <uv-icon name="close" color="#ffffff" size="20" bold></uv-icon>
        </view>
      </view>
    </uv-popup>
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { REVIEW_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import { getDictValue } from "@/api/evaluation";

// 研究报告ref
const healthPartnersRef = ref(null);

const emit = defineEmits(["close"]);

const close = () => {
  healthPartnersRef.value.close();
  emit('close')
};

const open = () => {
  healthPartnersRef.value.open();
};

const aiQrCode = ref("");

onMounted(() => {
  getDictValue({
    dictType: "mall_config_dict_type",
    label: "customer_qrcode",
  }).then((res) => {
    const qrCodes = JSON.parse(res || "[]")
    aiQrCode.value = qrCodes.length > 0 ? qrCodes[Math.floor(Math.random() * qrCodes.length)] : "";
  });
});

defineExpose({
  close,
  open,
});
</script>

<style lang="scss">
.health-partners-inner {
  width: 80vw;
  min-height: 700rpx;
  position: relative;

  & > image {
    width: 100%;
  }
}

.health-partners-close {
  position: absolute;
  bottom: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-partners-code {
  position: absolute;
  top: 375rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 260rpx;
  image {
    width: 100%;
    display: block;
  }
}
</style>
