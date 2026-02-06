<template>
  <view class="skin-hazard" :class="[`theme${mubiaoItem.theme}`]">
    <view class="skin-hazard-title" v-if="mubiaoItem.op">
      <view>{{ mubiaoItem.op.name }}</view>
    </view>

    <view class="skin-hazard-tags" v-if="mubiaoItem.bqtag && mubiaoItem.bqtag.value && mubiaoItem.bqtag.value.length">
      <view class="skin-hazard-tags-title">
        <image :src="EVALUATION_IMG_PATH + 'info_tip1_icon.png'" mode="widthFix" class="icon" />
        <text>{{ mubiaoItem.bqtag.name }}</text>
      </view>
      <view class="skin-hazard-tags-list">
        <view class="skin-hazard-tags-item" v-for="(item, index) in mubiaoItem.bqtag.value" :key="index"> {{ item }} </view>
      </view>
    </view>

    <view class="skin-hazard-desc" v-if="mubiaoItem.wgjx && mubiaoItem.wgjx.content">
      <view class="skin-hazard-desc-title">{{ mubiaoItem.wgjx.name }}</view>
      <view class="skin-hazard-desc-content" :class="{ xopen: isOpen }">
        <view class="skin-hazard-desc-content-back"></view>
        <!-- <view class="skin-hazard-desc-content-title">{{ mubiaoItem.wgjx.content }}</view> -->
        <view class="skin-hazard-desc-content-desc" :class="{ xmore: !isOpen }">
          <text>{{ mubiaoItem.wgjx.content }}</text>
        </view>

        <view class="skin-hazard-desc-collapse">
          <view class="skin-hazard-desc-collapse-btn" v-if="!isOpen" @click="openDrug">
            <text>展开</text>
            <uv-icon name="arrow-down" color="#333333" size="28rpx" />
          </view>
          <view class="skin-hazard-desc-collapse-btn" style="margin-top: 15rpx" v-else @click="openDrug">
            <text>收起</text>
            <uv-icon name="arrow-up" color="#333333" size="28rpx" />
          </view>
        </view>
      </view>
    </view>

    <view class="skin-hazard-pg" v-if="mubiaoItem.tag && mubiaoItem.tag.value && mubiaoItem.tag.value.length">
      <view class="skin-hazard-pg-back"></view>
      <view class="skin-hazard-pg-title">
        <image :src="EVALUATION_IMG_PATH + 'info_tip2_icon.png'" mode="widthFix" class="icon" />
        <text>{{ mubiaoItem.tag.name }}</text>
      </view>
      <view class="skin-hazard-pg-list">
        <view class="skin-hazard-pg-item" v-for="(item, index) in mubiaoItem.tag.value" :key="index">
          <view class="skin-hazard-pg-item-title"> {{ item.title }} </view>
          <view class="skin-hazard-pg-item-desc"> {{ item.content }} </view>
        </view>
      </view>
    </view>

    <view class="skin-hazard-durg">
      <view class="skin-hazard-durg-back"></view>
      <view class="skin-hazard-durg-title">
        <image :src="EVALUATION_IMG_PATH + 'info_tip3_icon.png'" mode="widthFix" class="icon" />
        <text>针对这些问题推荐的补充剂</text>
      </view>
      <view class="skin-hazard-durg-list">
        <view class="skin-hazard-durg-item" v-for="item in mubiaoItem.wxList" :key="item.id" @click="openDrugDetail(item)">
          <view class="skin-hazard-durg-item-image">
            <image :src="item.image" mode="aspectFit" class="icon" />
            <view>
              <image v-if="item.goodstag === '核心'" :src="EVALUATION_IMG_PATH + 'product_hx.png'" mode="widthFit" />
              <image v-if="item.goodstag === '巩固'" :src="EVALUATION_IMG_PATH + 'product_gg.png'" mode="widthFit" />
              <image v-if="item.goodstag === '关键'" :src="EVALUATION_IMG_PATH + 'product_tj.png'" mode="widthFit" />
            </view>
          </view>
          <view class="skin-hazard-durg-item-inner">
            <view class="skin-hazard-durg-item-title">
              <view class="uv-line-1 title">{{ item.storeName }}</view>
              <view class="skin-hazard-durg-item-title-right">
                研究报告
                <uv-icon name="arrow-right" size="14px" />
              </view>
            </view>
            <div class="skin-hazard-durg-item-desc">{{ item.content }}</div>
          </view>
        </view>
      </view>

      <view class="skin-hazard-durg-tip" v-if="mubiaoItem.isShow">
        <image :src="EVALUATION_IMG_PATH + 'tip_icon.png'" mode="widthFix" class="icon" />
        <text>已识别您服用基础维生素，推荐中已自动避开同类补剂</text>
      </view>

      <view class="skin-hazard-banner-title" v-if="kyList && kyList.length">
        <text>科研实证</text>
      </view>

      <view class="skin-hazard-banner" v-if="kyList && kyList.length">
        <!-- <view class="skin-hazard-banner-tags">
          <div class="skin-hazard-banner-tag" v-for="item in bannerTags" :key="item.id">{{ item.label }}</div>
        </view> -->
        <view class="skin-hazard-banner-tags">
          <uv-tabs
            :current="tabCurrent"
            :list="kyList"
            keyName="storeName"
            :activeStyle="{ color: '#ffffff', border: `1px solid ${mubiaoItem.currentColor}`, padding: '10rpx', borderRadius: '10rpx', background: mubiaoItem.currentColor, fontSize: '26rpx' }"
            :inactiveStyle="{ border: '1px solid #e8e8e8', padding: '10rpx', borderRadius: '10rpx', fontSize: '26rpx' }"
            :line-color="mubiaoItem.currentColor"
            lineWidth="0"
            @change="handleTabsChange"
          />
        </view>
        <view style="min-height: 600rpx">
          <view class="skin-hazard-banner-list" v-if="kyList[tabCurrent] && kyList[tabCurrent].documents && kyList[tabCurrent].documents.length">
            <!-- 轮播 -->
            <!-- 轮播区域 -->
            <swiper :indicator-dots="true" next-margin="160rpx" :autoplay="true" :interval="5000" :duration="500" :circular="false" class="skin-hazard-banner-swiper">
              <swiper-item v-for="(item, index) in kyList[tabCurrent].documents" :key="index">
                <view class="skin-hazard-banner-item">
                  <image :src="item.imgs ? item.imgs.split(',') : ''" mode="aspectFill" class="banner-image" />
                  <view class="banner-content">
                    <view class="banner-title">{{ item.title }}</view>
                    <view class="banner-desc">
                      <rich-text :nodes="item.content" />
                    </view>
                    <view class="banner-source" @click="goWebView(item.originalLink)" v-if="item.literature">
                      <!-- <view>*原文：</view> -->
                      <view class="source-link" v-for="(obj, objI) in [JSON.parse(item.literature)[0]]" :key="objI">{{ obj.content }}</view>
                    </view>
                  </view>
                </view>
              </swiper-item>
            </swiper>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { REVIEW_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";

const props = defineProps({
  mubiaoItem: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits(["openDrugDetail"]);

const isOpen = ref(true);


const kyList = computed(() => {
  const kys = props.mubiaoItem && props.mubiaoItem.kyList;
  return kys && kys.filter((o) => o.documents && o.documents.length);
});

const openDrugDetail = (item) => {
  emit('openDrugDetail',item)
};

const openDrug = () => {
  isOpen.value = !isOpen.value;
};

const tabCurrent = ref(0);

const handleTabsChange = ({ index }) => {
  console.log(index);
  tabCurrent.value = index;
};

const goWebView = (url) => {
  // if (url) {
  //   uni.setStorageSync("webviewUrl", url);
  //   uni.navigateTo({
  //     url: `/views/evaluation/questionnaire/webview`,
  //   });
  // }
};
</script>

<style scoped lang="scss">
.skin-hazard.theme2 {
  .skin-hazard-title view {
    background-color: #aa77db;
  }

  .skin-hazard-tags-item {
    border-color: #8c2edf;
    color: #8c2edf;
  }

  .skin-hazard-desc-title {
    background: linear-gradient(360deg, rgba(255, 233, 215, 0) 0%, #8c2edf 28%);
  }

  .skin-hazard-desc-content-back {
    background: linear-gradient(313deg, #d8cae4 0%, #d2b5ec 50%, #ffffff 99%);
    border: 1px solid #ffffff;
  }

  .skin-hazard-pg-back {
    background: linear-gradient(313deg, #d8cae4 0%, #d2b5ec 50%, #ffffff 99%);
    border: 1px solid #ffffff;
  }

  .skin-hazard-durg-back {
    background: linear-gradient(313deg, #d8cae4 0%, #d2b5ec 50%, #ffffff 99%);
    border: 1px solid #ffffff;
  }
}

.skin-hazard.theme3 {
  .skin-hazard-title view {
    background-color: #8ae2e2;
  }

  .skin-hazard-tags-item {
    border-color: #00cbcc;
    color: #00cbcc;
  }

  .skin-hazard-desc-title {
    background: linear-gradient(360deg, rgba(255, 233, 215, 0) 0%, #00cbcc 28%);
  }

  .skin-hazard-desc-content-back {
    background: linear-gradient(313deg, #c0e4e4 0%, #dbf3f3 50%, #ffffff 99%);
    border: 1px solid #ffffff;
  }

  .skin-hazard-pg-back {
    background: linear-gradient(313deg, #c0e4e4 0%, #dbf3f3 50%, #ffffff 99%);
    border: 1px solid #ffffff;
  }

  .skin-hazard-durg-back {
    background: linear-gradient(313deg, #c0e4e4 0%, #dbf3f3 50%, #ffffff 99%);
    border: 1px solid #ffffff;
  }
}

.skin-hazard-title {
  margin-top: 70rpx;
  display: flex;

  view {
    line-height: 70rpx;
    background: #ffc681;
    border-radius: 0rpx 42rpx 42rpx 0rpx;
    text-align: center;
    font-weight: 600;
    font-size: 38rpx;
    color: #ffffff;
    font-style: normal;
    text-transform: none;
    padding: 0 40rpx 0 30rpx;
    box-sizing: border-box;
  }
}

.skin-hazard-tags {
  margin-top: 30rpx;
  padding: 0 30rpx;
}

.skin-hazard-tags-title {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #666666;
  padding-bottom: 25rpx;
  font-weight: 600;
  font-size: 32rpx;
  color: #1d1d1d;
  text-align: left;
  font-style: normal;
  text-transform: none;

  image {
    width: 40rpx;
    height: 40rpx;
    margin-right: 35rpx;
  }
}

.skin-hazard-tags-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 55rpx 0 25rpx;
}

.skin-hazard-tags-item {
  border-radius: 44rpx;
  border: 1px solid #ffc681;
  padding: 8rpx 30rpx;
  font-weight: 500;
  font-size: 28rpx;
  color: #ffc681;
  text-align: center;
  font-style: normal;
  text-transform: none;
  margin: 10rpx;
}

.skin-hazard-desc {
  margin: 30rpx 30rpx 0;
}

.skin-hazard-desc-title {
  width: 408rpx;
  height: 100rpx;
  text-align: center;
  background: linear-gradient(360deg, rgba(255, 233, 215, 0) 0%, #dab58a 28%);
  border-radius: 22rpx 22rpx 0rpx 0rpx;
  font-weight: 600;
  font-size: 36rpx;
  line-height: 80rpx;
  color: #ffffff;
  font-style: normal;
  text-transform: none;
}

.skin-hazard-desc-content {
  position: relative;
  padding: 30rpx 34rpx;
  margin-top: -25rpx;
  font-size: 28rpx;
  color: #353535;
  text-align: left;
  font-style: normal;
  text-transform: none;

  &.xopen {
    .skin-hazard-desc-content-title {
      border-bottom: 1px dashed #666666;
      padding-bottom: 20rpx;
    }

    .skin-hazard-desc-content-desc {
    }
  }
}

.skin-hazard-desc-content-back {
  background: linear-gradient(313deg, #ffe2bf 0%, #f2f2f2 50%, #ffe3c0 99%);
  border-radius: 22rpx;
  border: 1px solid #ffe2c0;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.5;
}

.skin-hazard-desc-content-title {
  font-weight: 500;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.skin-hazard-desc-content-desc {
  font-size: 26rpx;
  position: relative;
  line-height: 1.5;
  z-index: 1;

  view {
    margin-top: 10rpx;
  }

  &.xmore {
    // 3行溢出省略号
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.skin-hazard-desc-collapse {
  position: relative;
  z-index: 9;
}

.skin-hazard-desc-collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;

  text {
    font-weight: 600;
    margin-right: 10rpx;
  }
}

.skin-hazard-pg {
  padding: 30rpx;
  position: relative;
  margin: 30rpx;
  border-radius: 22rpx;
  border: 1px solid #f5f5f5;
}

.skin-hazard-pg-back {
  background: linear-gradient(313deg, #ffe2bf 0%, #f2f2f2 50%, #ffe3c0 99%);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.2;
  border-radius: 22rpx;
}

.skin-hazard-pg-title {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #666666;
  padding-bottom: 25rpx;
  font-weight: 600;
  font-size: 32rpx;
  color: #1d1d1d;
  text-align: left;
  font-style: normal;
  text-transform: none;
  position: relative;
  z-index: 1;

  image {
    width: 40rpx;
    height: 40rpx;
    margin-right: 35rpx;
  }
}

.skin-hazard-pg-list {
  position: relative;
  z-index: 1;
}

.skin-hazard-pg-item {
  margin-top: 20rpx;
  padding-left: 15rpx;
}

.skin-hazard-pg-item-title {
  font-weight: 600;
  font-size: 28rpx;
  color: #353535;
  text-align: left;
  font-style: normal;
  text-transform: none;
  position: relative;

  &::before {
    position: absolute;
    content: "";
    display: block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #1d1d1d;
    left: -15rpx;
    top: 50%;
    transform: translateY(-50%);
  }
}

.skin-hazard-pg-item-desc {
  font-weight: 400;
  font-size: 28rpx;
  color: #353535;
  line-height: 37rpx;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 10rpx;
}

.skin-hazard-durg {
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;
  margin: 30rpx;
  border-radius: 22rpx;
  border: 1px solid #f5f5f5;
}

.skin-hazard-durg-back {
  background: linear-gradient(313deg, #ffe2bf 0%, #f2f2f2 50%, #ffe3c0 99%);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  opacity: 0.2;
  border-radius: 22rpx;
}

.skin-hazard-durg-title {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #666666;
  padding-bottom: 25rpx;
  font-weight: 600;
  font-size: 32rpx;
  color: #1d1d1d;
  text-align: left;
  font-style: normal;
  text-transform: none;
  position: relative;
  z-index: 1;

  image {
    width: 40rpx;
    height: 40rpx;
    margin-right: 35rpx;
  }
}

.skin-hazard-durg-list {
  position: relative;
  z-index: 1;
}

.skin-hazard-durg-item {
  padding: 30rpx 0;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:last-child {
    border-bottom: 0;
  }
}

.skin-hazard-durg-item-image {
  width: 140rpx;
  height: 140rpx;
  position: relative;

  & > image {
    width: 100%;
    height: 100%;
  }
  & > view {
    position: absolute;
    left: 0;
    top: 0;
    image {
      width: 48rpx;
      height: 32rpx;
    }
  }
}

.skin-hazard-durg-item-inner {
  width: calc(100% - 170rpx);
}

.skin-hazard-durg-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 28rpx;
  .title{
    display: flex;
    align-items: center;
    font-size: 24rpx;
    font-weight: 400;
    flex :0 0 270rpx;
  }
  .skin-hazard-durg-item-title-right{
    display: flex;
    align-items: center;
    font-size: 24rpx;
    font-weight: 400;
  }
}

.skin-hazard-durg-item-desc {
  font-size: 24rpx;
  color: #808080;
  margin-top: 10rpx;
}

.skin-hazard-durg-tip {
  display: flex;
  align-items: flex-start;
  font-weight: 400;
  font-size: 26rpx;
  color: #808080;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-top: 10rpx;

  & > image {
    width: 32rpx;
    height: 30rpx;
    margin-top: 3rpx;
    margin-right: 10rpx;
  }

  text {
    width: calc(100% - 40rpx);
  }
}

.skin-hazard-banner-title {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #666666;
  padding-bottom: 15rpx;
  font-weight: 600;
  font-size: 32rpx;
  color: #1d1d1d;
  text-align: left;
  font-style: normal;
  text-transform: none;
  position: relative;
  z-index: 1;
  margin-top: 50rpx;
}

.skin-hazard-banner {
  margin-top: 10rpx;
}

.skin-hazard-banner-tags {
  margin-left: -11px;
}

.skin-hazard-banner-list {
  margin-top: 30rpx;
}

.skin-hazard-banner-swiper {
  position: relative;
  z-index: 1;
  height: 600rpx;
}

.skin-hazard-banner-item {
  width: 430rpx;
  height: 550rpx;
  box-shadow: 0 0 5rpx rgba(0, 0, 0, 0.1);
  background-color: white;
  border-radius: 12rpx;
  overflow: hidden;
}

.banner-image {
  width: 100%;
  height: 240rpx;
  border-radius: 12rpx 12rpx 0 0;
}

.banner-content {
  padding: 0 15rpx;
}

.banner-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.banner-desc {
  font-size: 17rpx;
  color: #555;
  margin-bottom: 16rpx;
  line-height: 24rpx;
  height: 144rpx;
  //   3行溢出省略号
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  white-space: normal;
}

.banner-source {
  font-size: 15rpx;
  color: #999;
  line-height: 1.4;

  .source-link {
    color: #999;
    // text-decoration: underline;
    // 单行溢出省略号
    line-height: 20rpx;
    height: 60rpx;
    //   3行溢出省略号
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: normal;
  }
}

.drug-detail {
  background-color: white;
  border-radius: 30rpx 30rpx 0 0;
  position: relative;
}

.drug-detail-content {
  padding: 30rpx 30rpx 0;
}

.drug-detail-close {
  position: absolute;
  right: 50rpx;
  top: -80rpx;
  z-index: 99;
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drug-detail-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0 10rpx;

  view {
    line-height: 78rpx;
    background: #00cbcc;
    border-radius: 48rpx;
    border: 0;
    font-size: 28rpx;
    color: white;
    width: 300rpx;
    text-align: center;
  }
}
</style>
