<!-- views/evaluation/questionnaire/detail.vue -->
<template>
  <view class="review-page">
    <page-container :duration="0" :show="isShow" :overlay="false" @beforeleave="handleBeforeleave"></page-container>
    <Navbar title="问卷信息" :isAutoBack="false" @goBack="goPrevPage" />
    <view v-show="!loading" class="mb-tabs" :style="{ top: currentMb != null ? barHeight : '0' }">
      <view class="mb-tabs-item" @click="curMb(item, index)" v-for="(item, index) in mubiao" :key="index" :class="{ xon: index === Number(currentMb) && currentMb !== null }" :style="{ background: index === Number(currentMb) && currentMb !== null ? item.currentColor : '#999999' }">{{
        item.op.name
      }}</view>
    </view>

    <scroll-view :scroll-with-animation="true" :style="getScrollStyle()" :scroll-anchoring="true" :scroll-top="scrollTop" @scroll="scrollChange" :scroll-into-view="scrollIntoView" scroll-y>
      <!-- status === 0 问卷生成中，请稍后， === 1 生成完成 -->
      <view v-if="loading" class="loading-page">
        <view class="loading-box" v-if="status === 0 && loading">
          <image :src="EVALUATION_IMG_PATH + 'loading.gif'" mode="widthFix" style="width: 240rpx; height: 240rpx" />
          <view>营养报告生成中...</view>
        </view>
        <!-- <view class="loading-box" v-if="status === 1 && loading">
        <image :src="EVALUATION_IMG_PATH + 'successful.png'" mode="widthFix" style="width: 100rpx; height: 100rpx;" />
        <view>生成成功</view>
      </view> -->
      </view>

      <!-- 健康评估报告卡片 -->
      <view v-if="reportDetail.id && !loading">
        <reportCard mode="detail" :item="reportDetail" :showBuy="false" />
      </view>
      <view v-else-if="!loading">
        <reportCard mode="detail" :item="{}" />
      </view>

      <!-- 皮肤隐患模块 -->
      <view v-show="!loading" :id="`skinhazard${index}`" v-for="(item, index) in mubiao" :key="index">
        <SkinHazard :mubiaoItem="item" @openDrugDetail="openDrugDetail" />
      </view>

      <!-- 为什么选择我们模块 -->
      <view v-show="!loading" :id="`skinhazard${mubiao.length}`">
        <WhyChooseUs />
      </view>
    </scroll-view>

    <!-- <ReturnTop :scroll-top="currentTop" /> -->

    <!-- 底部按钮 -->
    <view :style="{ height: `${safeAreaBottom ? safeAreaBottom + 55 : 90}px` }" v-if="!loading"></view>
    <view class="footer-btns" :style="{ paddingBottom: `${safeAreaBottom ? safeAreaBottom : 15}px` }" v-if="!loading && showButtom">
      <view class="footer-btn xplain" @click="healthPartnersClick">保存健康报告</view>
      <view class="footer-btn" @click="addHealthPlan">查看健康方案</view>
    </view>
    <healthPartnersHit mode="detail" ref="healthPartnersHitRef" code="question_qrcode" @close="healthPartnersHitClose" />

    <!-- 药物详情弹窗组件 -->
    <DrugDetailModal ref="drugDetailModalRef" @closeModal="closeModal" />
  </view>
</template>

<script setup>
import { reactive, ref, computed, onMounted, getCurrentInstance } from "vue";
import { REVIEW_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import Navbar from "../components/Navbar.vue";
import { useScroll } from "@/hooks/useScroll";
import reportCard from "@/components/reportCard/index.vue";
import SkinHazard from "./components/SkinHazard.vue"; // 引入新组件
import WhyChooseUs from "./components/WhyChooseUs.vue"; // 引入新组件
import { onLoad } from "@dcloudio/uni-app";
import ReturnTop from "@/components/ReturnTop/index.vue";
import { getQuestionnaireTitleList, getReportAi } from "@/api/evaluation";
import dayjs from "@/uni_modules/uv-ui-tools/libs/util/dayjs.js";
import DrugDetailModal from "../components/DrugDetailModal.vue";

import healthPartnersHit from "@/components/healthPartners/hit.vue";
import { initHealthPartnersHit, getScrollStyle, beforeleave, goPrevPage, healthPartnersHitClose, changeShow } from "../utils/backUtils";
const healthPartnersHitRef = ref(null);
const isShow = ref(true);
changeShow((val) => {
  isShow.value = val;
});
const handleBeforeleave = () => {
  beforeleave("detail");
};

import { useMainStore } from "@/store/modules/useMainStore";
import { useInterface } from "@/hooks/useInterface";
import { storeToRefs } from "pinia";
const mainStore = useMainStore();
const { toast } = useInterface();
const { user } = storeToRefs(mainStore);


const fromPage = ref(""); // 来源页面

const healthPartnersClick = () => {
  healthPartnersHitRef.value.open();
};

const addHealthPlan = () => {
  if(fromPage.value === "friend") {
    healthPartnersHitRef.value.open();
    return;
  }
  uni.navigateTo({
    url: `/views/evaluation/healthPlan/index?id=${pid.value}&qid=${qid.value}`,
  });
};

// 药物详情弹窗引用
const drugDetailModalRef = ref(null);
const showButtom = ref(true);


const openDrugDetail = (item) => {
  if (!item.document || !item.document.content) {
    // 无报告资料
    uni.showToast({
      title: "无报告资料",
      icon: "none",
    });
    return;
  }
  const html = item.document ? item.document.content : item.content;
  const formattedContent = html.replace(/<img /g, "<img style='width:100%;' ");
  drugDetailModalRef.value.open(formattedContent);
  showButtom.value = false;
};

const closeModal = () => {
  showButtom.value = true;
};

const currentTop = ref(0);
const scrollIntoView = ref("");
const currentMb = ref(null);
const scrollTop = ref(0);

const scrollChange = (e) => {
  // console.log("scrollChange", e.detail.scrollTop);
  currentTop.value = e.detail.scrollTop;
  let cIndex = null;
  Object.keys(tops.value).forEach((index) => {
    const item = tops.value[index];
    const nextItem = tops.value[Number(index) + 1];
    // console.log(item,nextItem,currentTop.value)
    if (nextItem && currentTop.value >= item && currentTop.value < nextItem) {
      // console.log("命中", `#skinhazard${index}`);
      cIndex = index;
    }
  });
  currentMb.value = cIndex;
};

const curMb = (item, index) => {
  currentMb.value = index;
  scrollTop.value = tops.value[index] + 1;
  setTimeout(() => {
    scrollTop.value = tops.value[index];
  });
};

const reportDetail = ref({});

const safeAreaBottom = ref(0);

const barHeight = computed(() => {
  return uni.getSystemInfoSync().statusBarHeight + 30 + "px";
});
// 获取安全区域
const getSafeArea = () => {
  try {
    const systemInfo = uni.getSystemInfoSync();
    if (systemInfo.safeAreaInsets) {
      safeAreaBottom.value = systemInfo.safeAreaInsets.bottom || 0;
    } else {
      // 如果没有safeAreaInsets，则使用默认值0
      safeAreaBottom.value = 0;
    }
  } catch (error) {
    console.error("获取系统信息失败:", error);
    // 出错时使用默认值0
    safeAreaBottom.value = 0;
  }
};

const pid = ref("");
const qid = ref("");
const status = ref(0);
const mubiao = ref([]);
const loading = ref(true);
const instance = getCurrentInstance();
const tops = ref({});

const getData = async () => {
  try {
    loading.value = true;
    const data = await getReportAi(pid.value);
    // "status": 1  // ai生成状态   0=生成中 （继续轮询）     1=生成完成
    status.value = data.status;
    if (data && data.status === 0) {
      setTimeout(() => {
        getData();
      }, 2000);
    } else {
      loading.value = false;
    }

    reportDetail.value = {
      id: data.id,
      username: data.nickname,
      version: "新版本",
      time: dayjs(data.createTime).format("YYYY.MM.DD HH:mm"),
      height: {
        value: data.height,
        unit: "cm",
        label: "身高/CM",
      },
      weight: {
        value: data.weight,
        unit: "kg",
        label: "体重/KG",
      },
      bmi: {
        value: Number(Number(data.bmi || 0).toFixed(2)),
        label: "BMI",
      },
      centerImage: data.avatar,
      items: JSON.parse(data.answerObj || "[]").map((obj) => {
        return {
          ...obj,
          icon: obj.img,
          tags: obj.aname,
          // tags: ["细菌感染", "时而生病", "时而生病", "时而生病"],
        };
      }),
    };

    if (data && data.airesult) {
      const { result } = JSON.parse(data.airesult);
      const colors = ["#ffc681", "#8c2edf", "#00cbcc"];
      if (result && result.mubiao) {
        mubiao.value = result.mubiao.map((item, index) => {
          if (index === 1) {
            item.theme = "2";
          } else if (index === 2) {
            item.theme = "3";
          }
          item.kyList = data.kyList[index] || [];
          item.wxList = data.wxList[index] || [];
          item.isShow = data.isShow === 1;
          item.currentColor = colors[index];
          return item;
        });

        setTimeout(() => {
          mubiao.value.forEach((item, index) => {
            // 确保元素存在再进行查询
            const selector = `#skinhazard${index}`;
            uni
              .createSelectorQuery()
              .in(instance.proxy)
              .select(selector)
              .boundingClientRect((res) => {
                console.log(selector, "----------------------", res);
                if (res) {
                  tops.value[index] = res.top - 150;
                }
              })
              .exec();
          });

          const selector = `#skinhazard${mubiao.value.length}`;
          uni
            .createSelectorQuery()
            .in(instance.proxy)
            .select(selector)
            .boundingClientRect((res) => {
              console.log(selector, "----------------------", res);
              if (res) {
                tops.value[mubiao.value.length] = res.top - 150;
              }
            })
            .exec();
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const stepList = ref([]);
const getQuestionnaireDetail = async () => {
  getQuestionnaireTitleList(qid.value)
    .then((res) => {
      stepList.value = (res || []).map((item) => {
        item.answerContent = "";
        // "imgSize": 1,   //图标大小  1=宽按钮  2=窄按钮 3=大图标 4=小图标 5=选身高 6=选体重
        const isImage = item.options.find((o) => o.image);
        if (item.options.length === 2 && isImage) {
          item.imgSize = 3;
        } else if (isImage) {
          item.imgSize = 4;
        } else if (item.ttype === "1") {
          item.imgSize = 1;
        } else if (item.ttype === "2") {
          item.imgSize = 1;
        }
        return item;
      });
    })
    .catch((err) => {
      console.error(err);
    });
};

onLoad(async (o) => {
  // if (!user.value) {
  //   toast({ title: '请先登录' })
  //   uni.navigateTo({
  //     url: '/pages/login/guid'
  //   })
  //   return
  // }

  pid.value = o.id;
  qid.value = o.qid;
  fromPage.value = o.fromPage || "";
  getSafeArea();
  await getQuestionnaireDetail();
  getData();
});

onMounted(() => {
  initHealthPartnersHit(healthPartnersHitRef);
});
</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 0;
}

.footer-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #ffffff;
  border-radius: 30rpx 30rpx 0rpx 0rpx;
  box-shadow: 0 -10rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;
  padding: 20rpx 20rpx;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 9;
}

.footer-btn {
  flex: 1;
  margin: 0 15rpx;
  line-height: 78rpx;
  background: #00cbcc;
  border-radius: 48rpx;
  border: 0;
  font-size: 28rpx;
  color: white;
  text-align: center;

  &.xplain {
    background: #f4f4f4;
    color: #000000;
  }
}

.loading-page {
  height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  // background: linear-gradient(180deg, #52eab5 0%,#ffffff 20%, #ffffff 100%);
}

.loading-box {
  text-align: center;

  image {
    display: block;
    margin: 0 auto;
  }

  view {
    margin-top: 10rpx;
    font-size: 32rpx;
    font-weight: 500;
  }
}

.page-scroll-view {
  flex: 1;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0;
}

.mb-tabs {
  position: fixed;
  left: 0;
  width: 100%;
  display: flex;
  align-items: flex-start;
  transition: top 0.3s;
  z-index: 9;
  padding-left: 30rpx;
  box-sizing: border-box;
}

.mb-tabs-item {
  min-width: 140rpx;
  text-align: center;
  width: max-content;
  padding: calc(20px + 20rpx) 20rpx 20rpx;
  font-weight: 600;
  box-sizing: border-box;
  font-size: 20rpx;
  line-height: 30rpx;
  color: #333333;
  margin-right: 10rpx;
  border-radius: 0 0 12rpx 12rpx;

  &.xon {
    padding: calc(20px + 35rpx) 40rpx 35rpx;
    font-size: 28rpx;
    color: white;
  }
}
</style>
