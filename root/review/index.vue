<template>
  <view class="review-page">
    <!-- 顶部导航栏 -->
    <Header ref="headerRef" system-bar-area-bg="#fff" header-area-bg="#fff" :scroll-top="scrollTop" :show-return="false">
      <image :src="COMMON_IMG_PATH + 'logo.png'" class="logo-image"></image>
    </Header>
    <!-- 报告切换标签 -->
    <view class="tabs">
      <view class="tab-item" :class="{ active: state.activeTab === 0 }" @click="switchTab(0)">
        <text class="tab-text">我的报告 {{ total1 }}</text>
        <view class="tab-indicator" v-if="state.activeTab === 0"></view>
      </view>
      <view class="tab-item" :class="{ active: state.activeTab === 1 }" @click="switchTab(1)">
        <text class="tab-text">好友报告 {{ total2 }}</text>
        <view class="tab-indicator" v-if="state.activeTab === 1"></view>
      </view>
    </view>

    <!-- 健康评估报告卡片 -->
    <view v-if="reportList.length">
      <reportCard v-for="(item, index) in reportList.filter((o, i) => isOpen || i < 2)" :item="item" :key="item.id"
        :hide="index > 0" />
      <view class="report-card-export" v-if="reportList.length > 2">
        <view class="report-card-export-btn" v-if="!isOpen" @click="openDrug">
          展开
          <uv-icon name="arrow-down" color="#999999" size="28rpx" />
        </view>
        <view class="report-card-export-btn" style="margin-top: 15rpx" v-else @click="openDrug">
          收起
          <uv-icon name="arrow-up" color="#999999" size="28rpx" />
        </view>
      </view>
    </view>
    <view v-else>
      <reportCard :item="{}" />
    </view>

    <!-- 体验健康测评 -->
    <view class="experience-card" v-if="!reportList.length && !loading">
      <text class="experience-title">体验健康测评</text>
      <view class="feature-list">
        <text class="feature-item">✓ 3分钟获取健康方案</text>
        <text class="feature-item">✓ 基于中国+美国双标准模型设计</text>
        <text class="feature-sub">——中国居民健康风险评估FFQ、美国NHANES FFQ</text>
        <text class="feature-item">✓ 国家营养师+AI双重分析</text>
      </view>
      <view class="stats">
        <text class="stats-text">已有 </text>
        <text class="stats-number">{{ userReportCount || "--" }}</text>
        <text class="stats-text"> 人参与评估</text>
      </view>
      <image class="answer-btn" @click="startTest" v-if="state.activeTab === 0" :src="COMMON_IMG_PATH + 'answer_btn.gif'" mode="heightFix"></image>
      <view class="btn-start" v-else>
        <text class="btn-text">邀请好友测评</text>
        <button open-type="share">分享</button>
      </view>
    </view>

    <!-- 添加健康伙伴 -->
    <view style="height: 100rpx" v-if="reportList.length && state.activeTab === 0"> </view>
    <view v-if="reportList.length && endDate < 7 && !loading && state.activeTab === 0 && !user.wecomName" class="evaluation-partner"
      :style="{ bottom: '10px' }" @click="healthPartnersClick">
      <view class="evaluation-partner-left">
        <image :src="EVALUATION_IMG_PATH + 'jkhb_icon3.png'" mode="widthFix" />
        添加专属健康伙伴，获取正确的服用指导
      </view>
      <uv-icon name="arrow-right" size="14px" style="display: block" />
    </view>
    <view v-if="reportList.length && endDate >= 7 && !loading && state.activeTab === 0" class="evaluation-warn"
      :style="{ bottom: '0px' }" @click="startTest">
      <view class="evaluation-warn-left">距离上次测评已经 <text>{{ endDate }}</text> 天，建议每个月重新进行一次评测</view>
      <uv-icon name="arrow-right" size="14px" style="display: block" />
    </view>

    <healthPartners ref="healthPartnersRef" />
    <FloatIcon :top-limit="containerHeight" :bottom-limit="floatIconBottomLimit" @click="handleFloatIconClick" />
  </view>
</template>

<script setup>
import { reactive, ref, computed, toRefs, unref, watch, onMounted } from "vue";
import { COMMON_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import { useScroll } from "@/hooks/useScroll";
import { getPageUid, getUserReportCount, getPageFriend,getReportCorner } from "@/api/evaluation";
import healthPartners from "@/components/healthPartners/index.vue";
import { onShareAppMessage, onShareTimeline, onShow,onLoad } from "@dcloudio/uni-app";
import { useShare } from "@/hooks/useShare";
import { useMainStore } from "@/store/modules/useMainStore";
import { useInterface } from "@/hooks/useInterface";
const { evaluationShare, shareTimeline } = useShare();
import dayjs from "@/uni_modules/uv-ui-tools/libs/util/dayjs.js";
import { checkTheUser } from "@/api/auth";
import reportCard from "@/components/reportCard/index.vue";
import Header from "@/components/Header/index.vue";
import FloatIcon from "./components/FloatIcon.vue";

const mainStore = useMainStore();
const { user } = toRefs(mainStore);
const { toast } = useInterface();

onShareAppMessage(() => {
  const invitationCode = unref(user) ? unref(user).invitationCode : "";
  console.log("invitationCode", invitationCode);
  const params = evaluationShare(invitationCode || "");
  console.log("params", params);
  return params;
});
onShareTimeline(shareTimeline);

const healthPartnersRef = ref(null);

const healthPartnersClick = () => {
  healthPartnersRef.value.open();
};

const { scrollTop } = useScroll();
const state = reactive({
  activeTab: 0,
  isLoading: false,
  hasError: false,
});

const isOpen = ref(false);
const openDrug = () => {
  isOpen.value = !isOpen.value;
};

const reportList = ref([]);
const headerRef = ref()

const startTest = () => {
  if (state.activeTab === 0) {
    if (user.value) {
      console.log("开始答题");
      // 跳转到测评页面
      uni.navigateTo({
        url: "/views/evaluation/startup/index",
      });
    } else {
      toast({ title: "请先登录" });
      uni.navigateTo({
        url: "/pages/login/guid",
      });
    }
  }
};

const handleFloatIconClick = () => {
  console.log("handleFloatIconClick", user.value);
  if (user.value) {
      // 跳转到测评页面
      uni.navigateTo({
        url: "/views/evaluation/startup/index",
      });
  } else {
    toast({ title: "请先登录" });
    uni.navigateTo({
      url: "/pages/login/guid",
    });
  }
}

const endDate = ref(0)
const loading = ref(true)

const partnerBottom = computed(() => {
  const systemInfo = uni.getSystemInfoSync();
  return systemInfo.safeAreaInsets.bottom + 50;
});

const containerHeight = computed(() => {
  return headerRef.value?.containerHeight || 0;
})

const floatIconBottomLimit = computed(() => {
  if (
    (reportList.value.length && endDate.value < 7 && !loading.value && state.activeTab === 0 && !user.value?.wecomName)
    || (reportList.value.length && endDate.value >= 7 && !loading.value && state.activeTab === 0)
  ) {
    return 50;
  } else {
    return 10;
  }
})

const switchTab = (index) => {
  state.activeTab = index;
  reportList.value = [];
  if (index === 0) {
    getReportList();
  } else if (index === 1) {
    getPageFriendList();
  }
};

const total1 = ref('');
const total2 = ref('');

const getReportList = () => {
  loading.value = true;
  uni.showLoading({
    title: "加载中",
  });
  getPageUid({
    pageNo: 1,
    pageSize: 50,
  })
    .then((res) => {
      loading.value = false;
      uni.hideLoading();
      if (res && res.list) {
        total1.value = res.list.length;
        if (state.activeTab === 0) {
          reportList.value = res.list.map((item, index) => {
            // let mubiao = [];
            // if (data && data.airesult) {
            //   const { result } = JSON.parse(data.airesult);
            //   if (result && result.mubiao) {
            //     mubiao = result.mubiao;
            //   }
            // }
            if (index === 0) {
              endDate.value = dayjs().diff(dayjs(item.createTime), "day");
            }
            return {
              ...item,
              id: item.id,
              username: item.nickname,
              version: index === 0 ? "新版本" : "",
              time: dayjs(item.createTime).format("YYYY.MM.DD HH:mm"),
              height: {
                value: item.height,
                unit: "cm",
                label: "身高/CM",
              },
              weight: {
                value: item.weight,
                unit: "kg",
                label: "体重/KG",
              },
              bmi: {
                value: Number(Number(item.bmi || 0).toFixed(2)),
                label: "BMI",
              },
              centerImage: item.avatar,
              items: JSON.parse(item.answerObj || "[]").map((obj, oIndex) => {
                return {
                  ...obj,
                  icon: obj.img,
                  // tags: mubiao[oIndex].bqtag && mubiao[oIndex].bqtag.value ? mubiao[oIndex].bqtag.value : [],
                  tags: obj.aname
                  // tags: ["细菌感染", "时而生病", "时而生病", "时而生病"],
                };
              }),
            };
          });
        }
      }
    })
    .catch((err) => {
      loading.value = false;
      console.error(err);
      uni.hideLoading();
    });
};

// getPageFriend
const getPageFriendList = () => {
  loading.value = true;
  uni.showLoading({
    title: "加载中",
  });
  getPageFriend({
    pageNo: 1,
    pageSize: 50,
  })
    .then((res) => {
      loading.value = false;
      uni.hideLoading();
      if (res && res.list) {
        total2.value = res.list.length;
        if (state.activeTab === 1) {
          reportList.value = res.list.map((item, index) => {
            // let mubiao = [];
            // if (data && data.airesult) {
            //   const { result } = JSON.parse(data.airesult);
            //   if (result && result.mubiao) {
            //     mubiao = result.mubiao;
            //   }
            // }
            if (index === 0) {
              endDate.value = dayjs().diff(dayjs(item.createTime), "day");
            }
            return {
              ...item,
              id: item.id,
              username: item.nickname,
              version: index === 0 ? "新版本" : "",
              time: dayjs(item.createTime).format("YYYY.MM.DD HH:mm"),
              height: {
                value: item.height,
                unit: "cm",
                label: "身高/CM",
              },
              weight: {
                value: item.weight,
                unit: "kg",
                label: "体重/KG",
              },
              bmi: {
                value: Number(Number(item.bmi || 0).toFixed(2)),
                label: "BMI",
              },
              centerImage: item.avatar,
              items: JSON.parse(item.answerObj || "[]").map((obj, oIndex) => {
                return {
                  ...obj,
                  icon: obj.img,
                  // tags: mubiao[oIndex].bqtag && mubiao[oIndex].bqtag.value ? mubiao[oIndex].bqtag.value : [],
                  tags: obj.aname
                  // tags: ["细菌感染", "时而生病", "时而生病", "时而生病"],
                };
              }),
            };
          });
        }
      }
    })
    .catch((err) => {
      loading.value = false;
      console.error(err);
      uni.hideLoading();
    });
};

const userReportCount = ref(0);

const userMobile =  ref(null);

watch(
  () => user.value,
  () => {
    if(!userMobile.value && user.value){
      userMobile.value =  user.value.mobile;
      getReportList();
      getPageFriendList();
    }
  }
);

onShow(() => {
  setTimeout(() => {
    if (user.value) {
      userMobile.value =  user.value.mobile;
      getReportList();
      getPageFriendList();
    } else {
      loading.value = false;
    }
  });
  getUserReportCount().then((res) => {
    console.log("res", res);
    userReportCount.value = res;
  });
  getReportCorner().then(res=>{
	  if(res){
		  uni.setTabBarBadge({
		  	index:2,
		  	text:res
		  })
	  }else{
		  uni.removeTabBarBadge({
			  index:2
		  })
	  }
  })
});

onLoad(async (options) => {
  console.log("onLoad options=================================:", options);
  if (options.scene) {
  	//表示扫二维码 或者 小程序链接 过来的
  	let sc = options.scene;
  	if (sc.startsWith('code_')) {
  		let code = sc.substring(5);
  		checkTheUserInit(code,Number(options.channelId))
  	}
  }
});


async function checkTheUserInit(invitationCode,channelId) {
	//进行注册绑定关系操作
	wx.login({
		async success(res) {
			if (res.code) {
				console.log('微信code===========----' + res.code)
				let data = {};
				data.phoneCode = '888810';
				data.loginCode = res.code;
				data.invitationCode = invitationCode;
				data.channelId = channelId
				const loginRes = await checkTheUser(data);
				await mainStore.setAccessToken(loginRes)
			}
		}
	});
}

</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 0;
}

.logo-image {
  width: 234rpx;
  height: 58rpx;
}

// 顶部导航栏
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  background: #fff;
  height: 112rpx;

  .nav-left,
  .nav-right {
    display: flex;
    gap: 24rpx;
  }

  .icon-back,
  .icon-home,
  .icon-menu,
  .icon-search {
    width: 48rpx;
    height: 48rpx;
  }

  .brand-logo {
    width: 234rpx;
    height: 58rpx;
  }
}

// 报告切换标签
.tabs {
  display: flex;
  background: #fff;
  border-bottom: 1rpx solid #e7e7e7;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    position: relative;

    &.active {
      .tab-text {
        color: #222;
        font-weight: 600;
      }

      .tab-indicator {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80rpx;
        height: 8rpx;
        background: #000;
        border-radius: 64rpx;
      }
    }

    .tab-text {
      font-size: 32rpx;
      color: #929292;
    }
  }
}

// 体验健康测评
.experience-card {
  background: linear-gradient(85deg, #fff 0%, #ecfffd 43%, #f5feff 100%);
  border-radius: 28rpx;
  padding: 24rpx 56rpx 60rpx;
  margin: 0 0 40rpx 0;

  .experience-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #000;
    display: block;
    margin-bottom: 42rpx;
  }

  .feature-list {
    .feature-item {
      display: block;
      font-size: 28rpx;
      color: #000;
      margin-bottom: 26rpx;
      letter-spacing: 3rpx;
    }

    .feature-sub {
      display: block;
      font-size: 24rpx;
      color: #000;
      margin: 4rpx 0 26rpx 40rpx;
      letter-spacing: 3rpx;
    }
  }

  .stats {
    text-align: center;
    margin: 34rpx 0 11rpx;

    .stats-text {
      font-size: 22rpx;
      color: #616161;
      letter-spacing: 3rpx;
    }

    .stats-number {
      font-size: 22rpx;
      color: #ff4848;
      font-weight: 600;
      letter-spacing: 3rpx;
    }
  }

  .answer-btn {
    margin: 0 auto;
    display: block;
    width: auto;
    height: 68rpx;
    border-radius: 68rpx;
    box-shadow: 0 5rpx 15rpx rgba(103, 61, 17, 0.08);
  }

  .btn-start {
    background: #00cbcc;
    border-radius: 68rpx;
    height: 68rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 5rpx 15rpx rgba(103, 61, 17, 0.08);
    position: relative;

    button {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }

    .btn-text {
      font-size: 26rpx;
      color: #fff;
      font-weight: 600;
      letter-spacing: 3rpx;
    }
  }
}

.report-card-export {
  display: flex;
  justify-content: center;
  padding: 0 0 60rpx;

  .report-card-export-btn {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #999999;
    border-bottom: 1px solid #aaa;
    line-height: 1;
  }
}

.evaluation-partner {
  position: fixed;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  box-shadow: 4rpx 2rpx 13rpx 0rpx rgba(0, 0, 0, 0.1);
  border-radius: 16rpx 16rpx 16rpx 16rpx;
  padding: 0 15rpx;
  box-sizing: border-box;
  margin: 0 30rpx;
  width: calc(100% - 60rpx);
}

.evaluation-partner-left {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  font-weight: 400;

  image {
    width: 90rpx;
    height: 78rpx;
    margin-top: -10rpx;
  }
}

.evaluation-warn {
  position: fixed;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  background: linear-gradient(84deg, #f5feff 0%, #ecfffd 43%, #f5feff 100%);
  border-radius: 28rpx 28rpx 0 0;
  padding: 20rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
}

.evaluation-warn-left {
  font-weight: 400;
  font-size: 26rpx;
  color: #000000;
  line-height: 50rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;

  text {
    color: #ff4848;
  }
}
</style>
