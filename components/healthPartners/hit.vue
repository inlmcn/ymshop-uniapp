<template>
  <view class="health-partners-box">
    <image :src="EVALUATION_IMG_PATH + 'jkhb_back.png'" mode="widthFix" style="display: none" />
    <uv-popup mode="center" :closeOnClickOverlay="false" bgColor="rgba(0,0,0,0)" :closeable="false" :safe-area-inset-bottom="true" round="30rpx" padding="40rpx" ref="healthPartnersRef">
      <view class="health-partners-inner" :class="{xmax:mode === 'tip2'}">
        <image :src="EVALUATION_IMG_PATH + 'jkhb_back.png'" mode="widthFix" />
        <view class="health-partners-content">
          <view class="health-partners-title" v-if="mode !== 'detail' && mode !== 'tip' && mode !== 'tip2' && mode !== 'homePage'">
            <view>不想做问卷？</view>
            <view>添加健康伙伴，1v1快速咨询</view>
          </view>
          <view class="health-partners-title" v-if="mode === 'tip'" style="width: 75%; margin: 0 auto; text-align: center">
            <view style="font-size: 32rpx">孕产相关营养补剂的定制服务，请咨询营养管家或您的医生</view>
          </view>
           <view class="health-partners-title" v-if="mode === 'detail' || mode === 'homePage'">
            <view>添加专属健康伙伴</view>
            <view></view>
          </view>
          <view class="health-partners-title" v-if="mode === 'tip2'">
            <view style="font-size: 40rpx;">如需调整方案</view>
            <view style="font-size: 40rpx; font-weight: 600; margin-top: 0;">我们为您提供1v1营养咨询服务</view>
          </view>
          <view class="health-partners-icons" v-if="mode === 'detail'">
            <view class="health-partners-icon">
              <image :src="EVALUATION_IMG_PATH + 'jkhb_icon1.png'" mode="widthFix" />
              <view>保存报告</view>
            </view>
			<view class="health-partners-icon">
			  <image :src="EVALUATION_IMG_PATH + 'jkhb_icon4.png'" mode="widthFix" />
			  <view>查看方案</view>
			</view>
            <view class="health-partners-icon">
              <image :src="EVALUATION_IMG_PATH + 'jkhb_icon2.png'" mode="widthFix" />
              <view>深度解读</view>
            </view>
          </view>
          <view class="health-partners-icons xsmall" style="width: 85%" v-if="mode === 'tip2' || mode === 'homePage'">
            <view class="health-partners-icon">
              <image :src="EVALUATION_IMG_PATH + 'jkhb_icon2_1.png'" mode="widthFix" />
              <view>解析报告</view>
            </view>
            <view class="health-partners-icon">
              <image :src="EVALUATION_IMG_PATH + 'jkhb_icon2_2.png'" mode="widthFix" />
              <view>物流售后</view>
            </view>
            <view class="health-partners-icon">
              <image :src="EVALUATION_IMG_PATH + 'jkhb_icon2_3.png'" mode="widthFix" />
              <view>调整方案</view>
            </view>
          </view>
          <view class="health-partners-code" :class="{ xsmall: mode === 'tip2' }">
            <image :src="EVALUATION_IMG_PATH + 'jkhb_code_back.png'" mode="widthFix" />
            <image :src="aiQrCode" mode="widthFix" :show-menu-by-longpress="true" />
          </view>
          <view class="health-partners-tip">长按识别，获取专属「健康伙伴」</view>
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

const props = defineProps({
  mode: {
    type: String,
    default: "",
  },
  code:{
	  type: String,
	  default: ""
  }
});

// 研究报告ref
const healthPartnersRef = ref(null);

const emit = defineEmits(["close"]);

const close = () => {
  healthPartnersRef.value.close();
  emit("close");
};

const open = () => {
  healthPartnersRef.value.open();
};

const aiQrCode = ref("");

onMounted(() => {
  getDictValue({
    dictType: "mall_config_dict_type",
    label: props.code?props.code:"customer_qrcode",
  }).then((res) => {
	  if(res.indexOf('[')==-1){
		  aiQrCode.value = res
	  }else{
		  const qrCodes = JSON.parse(res || "[]");
		  aiQrCode.value = qrCodes.length > 0 ? qrCodes[Math.floor(Math.random() * qrCodes.length)] : qrCodes;
	  }
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

  &.xmax{
    width: 620rpx;
  }

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

.health-partners-content {
  position: absolute;
  left: 0;
  top: 185rpx;
  width: 100%;
}

.health-partners-code {
  width: 260rpx;
  height: 260rpx;
  margin: 30rpx auto 15rpx;
  position: relative;

  &.xsmall{
    margin: 20rpx auto 15rpx;
    image:last-child {
      width: 245rpx;
      height: 245rpx;
    }
  }

  image:first-child {
    width: 100%;
    display: block;
  }
  image:last-child {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 240rpx;
    height: 240rpx;
    display: block;
  }
}

.health-partners-title {
  width: 100%;
  color: #000000;
  text-align: center;
  view:first-child {
    font-size: 48rpx;
    font-weight: 600;
  }
  view:last-child {
    font-size: 28rpx;
    margin-top: 10rpx;
  }
}

.health-partners-tip {
  color: #717171;
  font-size: 24rpx;
  text-align: center;
}

.health-partners-icons {
  display: flex;
  justify-content: space-around;
  width: 70%;
  margin: 20rpx auto 0;

  // &.xsmall {
  //   .health-partners-icon view {
  //     font-size: 24rpx;
  //   }
  // }

  .health-partners-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    image {
      width: 58rpx;
      height: 40rpx;
    }
    view {
      margin-top: 10rpx;
      font-size: 28rpx;
      color: #333333;
    }
  }
}
</style>
