<template>
  <view class="qrcode-page">
    <Navbar title="您的健康问卷分析" />
    <image :src="EVALUATION_IMG_PATH + 'qrcode_back2.png'" mode="widthFix" :show-menu-by-longpress="true" />
    <!-- <image :src="`${EVALUATION_IMG_PATH}qrcode-page-header.png`" mode="widthFix" />
    <view class="qrcode-title">
      <view>您的健康问卷分析</view>
      <view>健康伙伴帮您解读细节</view>
    </view>
    <view class="qrcode-inner">
      <image :src="`${EVALUATION_IMG_PATH}qrcode-inner-back.png`" mode="widthFix" />
      <view class="qrcode-inner-title">
        <view>长按扫码添加健康伙伴</view>
        <view>为您在线答疑</view>
      </view>
      <view class="qrcode-image">
        <image :src="aiQrCode" mode="widthFix" :show-menu-by-longpress="true" />
      </view>
    </view> -->
    <!-- <view class="qrcode-image">
      <image :src="aiQrCode" mode="widthFix" :show-menu-by-longpress="true" />
    </view>
    <image style="position: absolute; top: 0; left: 0; z-index: 8;width: 100vw; height: 100vh; opacity: 0;" :src="aiQrCode"
      mode="scaleToFill" :show-menu-by-longpress="true" /> -->
    <view class="qrcode-bottom-button" v-if="sex === '2'">
      <view class="btn-start" @click="goReport">{{ wecomName ? "查看报告详情" : "暂不添加，先看结果" }}</view>
    </view>

    <!-- <view class="qrcode-bottom-icon">
      <uv-icon name="arrow-down-fill" color="#00cbcc" size="24rpx" />
    </view>
    <view class="qrcode-bottom-tip"> 添加后可随时咨询健康问题，结果同步发送至微信，方便留存！ 免费提供个性化建议，不推销不打扰！ </view> -->
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { REVIEW_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import { getDictValue } from "@/api/evaluation";
import Navbar from "../components/Navbar.vue";
import { useMainStore } from "@/store/modules/useMainStore";
import { onLoad, onUnload } from "@dcloudio/uni-app";
const mainStore = useMainStore();

const aiQrCode = ref("");
const wecomName = ref("");
const pid = ref("");
const qid = ref("");

let getUserInfoTimeout = null;

const getUserInfo = async () => {
  const userInfo = await mainStore.getUserInfo();
  wecomName.value = userInfo.wecomName || "";

  if (!wecomName.value) {
    // 用户未绑定客服，刷新用户信息
    getUserInfoTimeout = setTimeout(() => {
      getUserInfo();
    }, 2000);
  } else {
    goReport();
  }
};

function onLongTap(e) {
  uni.showActionSheet({
    itemList: ["识别图中二维码"],
    success: function (res) {
      if (res.tapIndex == 0) {
        uni.scanCode({
          success: function (res) {
            console.log(res.result);
          },
          fail: function (res) {
            console.log(res);
          },
        });
      }
    },
  });
}

const goReport = () => {
  uni.redirectTo({
    url: `/views/evaluation/questionnaire/detail?id=${pid.value}&qid=${qid.value}`,
  });
};

const sex = ref("1");
onLoad(async (o) => {
  pid.value = o.id;
  qid.value = o.qid;
  if (o.tag !== "0") {
    sex.value = o.sex;
  } else {
    sex.value = "2";
  }
  getUserInfoTimeout = setTimeout(() => {
    getUserInfo();
  }, 2000);

  getDictValue({
    dictType: "mall_config_dict_type",
    label: "customer_qrcode",
  }).then((res) => {
    const qrCodes = JSON.parse(res || "[]");
    aiQrCode.value = qrCodes.length > 0 ? qrCodes[Math.floor(Math.random() * qrCodes.length)] : "";
  });
});

onUnload(() => {
  clearTimeout(getUserInfoTimeout);
});
</script>

<style lang="scss">
.qrcode-page {
  background-color: #eafffa;
  padding-bottom: 80rpx;
  min-height: 100vh;
  box-sizing: border-box;

  &>image {
    width: 100%;
    display: block;
  }
}

.qrcode-title {
  text-align: center;
  font-weight: 600;
  color: #00cbcc;
  margin-top: -30rpx;
  letter-spacing: 10rpx;

  view:first-child {
    font-size: 72rpx;
  }

  view:last-child {
    font-size: 48rpx;
  }
}

.qrcode-inner {
  width: 90vw;
  margin: 50rpx auto 0;
  position: relative;

  &>image {
    width: 100%;
    display: block;
  }
}

.qrcode-inner-title {
  padding: 30rpx 50rpx;
  position: absolute;
  left: 0;
  top: 0;
  color: white;
  z-index: 9;

  view:first-child {
    font-size: 32rpx;
    font-weight: 600;
  }

  view:last-child {
    font-size: 30rpx;
  }
}

.qrcode-image {
  position: absolute;
  z-index: 9;
  top: 122vw;
  left: 11vw;

  image {
    width: 270rpx;
    height: 270rpx;
    display: block;
  }
}

.qrcode-bottom-icon {
  display: flex;
  justify-content: center;
  opacity: 0.6;
}

.qrcode-bottom-tip {
  text-align: center;
  margin-top: 30rpx;
  font-size: 28rpx;
  color: #999999;
  padding: 0 5vw;
}

.qrcode-bottom-button {
  margin: 50rpx auto;
  position: absolute;
  z-index: 9;
  top: 157vw;
  left: 0;
  width: 100%;
}

.btn-start {
  width: 360rpx;
  height: 75rpx;
  background-color: #00cbcc;
  color: white;
  font-size: 28rpx;
  font-weight: bold;
  border-radius: 45rpx;
  line-height: 75rpx;
  border: none;
  box-shadow: 0 8rpx 20rpx rgba(46, 203, 140, 0.3);
  text-align: center;
  margin: 0 auto;
}
</style>
