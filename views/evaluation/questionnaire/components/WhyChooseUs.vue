<!-- components/WhyChooseUs.vue -->
<template>
  <view class="why-choose-us">
    <!-- <view class="why-choose-title">为什么选择我们?</view> -->

    <view class="why-choose-content">
      <rich-text :nodes="content" />
    </view>
    <!-- <view class="why-choose-users">
      <view class="why-choose-users-title">
        <image :src="EVALUATION_IMG_PATH + 'advantage_tip1_icon.png'" mode="widthFix" class="icon" />
        <text>科学营养测评问卷×专业顾问团队</text>
      </view>
      <view class="why-choose-users-desc"> 基于最新版《中国营养膳食指南(2022)》研发，采用国际营养学界 主流的远程信息收集法——膳食频率问卷法(FFQs)</view>
      <view v-for="(item, index) in items" :key="index" class="why-choose-users-item">
        <image :src="item.icon" mode="widthFix" class="icon" />
        <view class="why-choose-users-info">
          <view class="why-choose-users-name">{{ item.name }}</view>
          <view class="why-choose-users-labels">
            <view class="why-choose-users-label" v-for="(text, textI) in item.labels" :key="textI">{{ text }}</view>
          </view>
        </view>
      </view>
    </view> -->
  </view>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import { getNewsDetail } from "@/api/evaluation";

const items = ref([{ icon: `${EVALUATION_IMG_PATH}user1.png`, text: "专业团队研发，科学配方" }, { text: "天然成分，温和不刺激" }, { text: "临床验证，效果显著" }, { text: "个性化定制方案" }]);

const content = ref("");

onMounted(() => {
  getNewsDetail(18)
    .then((res) => {
      const html = res.content;
      content.value = html.replace(/<img /g, "<img style='width:100%;' ");
    })
    .catch((err) => {
      console.error(err);
    });
});
</script>

<style scoped lang="scss">
.why-choose-us {
  background: #fff;
}

.why-choose-title {
  width: 370rpx;
  line-height: 70rpx;
  background: #00cbcc;
  border-radius: 0rpx 42rpx 42rpx 0rpx;
  font-weight: 600;
  font-size: 38rpx;
  color: #ffffff;
  text-align: left;
  font-style: normal;
  text-transform: none;
  padding: 0 0 0 30rpx;
  box-sizing: border-box;
  margin-top: 70rpx;
}

.why-choose-content {
  padding: 30rpx 0;
}
</style>
