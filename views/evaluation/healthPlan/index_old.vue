<!-- views/evaluation/questionnaire/detail.vue -->
<template>
  <view class="review-page">
    <!-- 顶部导航栏 -->
    <Navbar :scroll-top="scrollTop" title="健康方案" />

    <!-- 视频部分 -->
    <swiper class="banner-swiper" indicator-dots circular :indicator-color="'rgba(255, 255, 255, 0.5)'"
      :indicator-active-color="'#00CBCC'" style="width: 100%; height: 400rpx">
      <swiper-item v-for="(item, index) in banners" :key="index">
        <!-- 视频 -->
        <video v-if="isVideo(item)" :src="item" style="width: 100%; height: 400rpx" :show-center-play-btn="true"
          :controls="true" :autoplay="false" object-fit="cover"></video>
        <!-- 图片 -->
        <image v-else :src="item" mode="aspectFill" style="width: 100%; height: 400rpx"></image>
      </swiper-item>
    </swiper>
    <!-- 标题 -->
    <view class="health-title">
      <view class="health-username">为{{ detail.nickname || "--" }}</view>
      <view class="health-title-inner">量身定制的营养补充方案</view>
      <view class="health-subtitle" @click="adjustPlan">
        <view>Nutritional supplementation plan</view>
        <view class="health-change">调整方案 <uv-icon name="arrow-right" size="24rpx" /></view>
      </view>
    </view>

    <view class="health-for" v-if="products">
      <view class="health-for-item">
        <image :src="EVALUATION_IMG_PATH + 'drug_icon.png'" mode="widthFix" />
        <view>
          <text>每日服用</text>
          <view style="margin-top: 10rpx; line-height: 60rpx;">{{ products.length || 0 }}种</view>
        </view>
      </view>
      <view class="health-for-item xone">
        <text></text>
        <view>
          <text>目标需求</text>
          <view>
            <view v-for="(item, index) in detail.answerObj" :key="index">
              <image :src="item.icon" mode="widthFix" />
              <text>{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="health-address">
      <image :src="EVALUATION_IMG_PATH + 'dq_icon.png'" mode="widthFix" /> 香港工厂生产，原产地直邮报关
    </view>

    <productList :isNewUser="!user || !user.payCount" @goPayItem="goPayItem" :products="products" v-if="products.length"
      :elseProducts="elseProducts" @toggleDesc="toggleDesc" @changeMore="changeMore" @goDetail="openProductDetail"
      @changeChecked="changeChecked" />

    <view class="health-ai">
      <view class="health-ai-desc"> 此方案根据你的生活习惯和健康目标推荐，坚持服用可改善你所关注的健康问题，对方案有疑问可添加HC健康伙伴为你提供1V1服务。 </view>
      <view class="health-ai-btn">
        <view type="primary" @click="healthPartnersClick">
          立即添加
          <uv-icon name="arrow-right" color="#ffffff" size="14px" />
        </view>
      </view>
      <image :src="EVALUATION_IMG_PATH + 'ai_avatar.png'" mode="heightFix" />
    </view>

    <view class="health-qa">
      <!-- <view class="health-qa-title">
        <view>常见问题</view>
        <text>Frequently Asked Questions</text>
      </view> -->

      <view class="health-qa-content">
        <rich-text :nodes="qaContent" />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view :style="{ height: `${safeAreaBottom ? safeAreaBottom + 70 : 110}px` }" v-if="user && user.payCount"></view>
    <view :style="{ height: `${safeAreaBottom ? safeAreaBottom + 20 : 60}px` }" v-else></view>
    <view class="footer-btns" :style="{ paddingBottom: `${safeAreaBottom ? safeAreaBottom : 15}px` }"
      v-if="user && user.payCount">
      <image :src="EVALUATION_IMG_PATH + 'plan-footer-back.png'" mode="widthFix" />
      <view class="comment-total">
        <view class="comment-total-text" v-if="products">每日 <text> {{ products.length }} </text> 种</view>
        <!--        <view @click="goComments" class="comment-total-btn">查看评论<text>{{ commentTotal > 999 ? "999+" : commentTotal }}</text> <uv-icon
            name="arrow-right" size="24rpx" /></view> -->
      </view>
      <view class="footer-btn" @click="goSubmit">立即购买</view>
    </view>
    <view class="footer-btns" :style="{ paddingBottom: `${safeAreaBottom ? safeAreaBottom : 15}px`, paddingTop: '0px' }"
      v-else>
      <image :src="EVALUATION_IMG_PATH + 'plan-footer-back.png'" mode="widthFix" />
      <!-- <view class="comment-total" @click="goComments">
        <view class="comment-total-text" v-if="products">每日 <text> {{ products.length }} </text> 种</view>
		<view class="comment-total-btn">查看评论<text>{{ commentTotal > 999 ? "999+" : commentTotal }}</text> <uv-icon
		    name="arrow-right" size="24rpx" /></view>
      </view>
      <view class="footer-btn" @click="goUp">立即购买</view> -->
    </view>

    <ReturnTop :scroll-top="scrollTop" />

    <healthPartners mode="detail" ref="healthPartnersRef" />

    <!-- 在父组件中使用 -->
    <productDetailModal ref="productDetailPopupRef" />
  </view>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { REVIEW_IMG_PATH, EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import Navbar from "../components/Navbar.vue";
import { useScroll } from "@/hooks/useScroll";
import { onLoad } from "@dcloudio/uni-app";
import ReturnTop from "@/components/ReturnTop/index.vue";
import productList from "./components/product-list.vue";
import healthPartners from "@/components/healthPartners/hit.vue";
import productDetailModal from "./components/product-detail-modal.vue";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
const mainStore = useMainStore();
const { user } = storeToRefs(mainStore);

import { getReportAi2, getReplyCount, getNewsDetail, getDictValue } from "@/api/evaluation";
import { getCartClear } from "@/api/cart";
const healthPartnersRef = ref(null);

const productDetailPopupRef = ref(null);

const openProductDetail = (productId) => {
  productDetailPopupRef.value.open(productId);
};

const healthPartnersClick = () => {
  healthPartnersRef.value.open();
};

const { scrollTop } = useScroll();

const products = ref([]);
const elseProducts = ref([]);

const videoUrl = ref("https://www.w3school.com.cn/i/video/shanghai.mp4");

const getPids = (mode) => {
  const pids = products.value.filter((item) => item.checked).map((item) => mode === 'id-num' ? `${item.id}-${item.onSale}` : item.id);
  const pids2 = elseProducts.value.filter((item) => item.checked).map((item) => mode === 'id-num' ? `${item.id}-${item.onSale}` : item.id);
  return [...pids, ...pids2];
};

const goComments = () => {
  uni.navigateTo({ url: "/pages/product-review/index_many?pids=" + getPids() });
};

const addNutritionConsultant = () => { };

const goUp = () => {
  uni.pageScrollTo({
    scrollTop: 430,
    duration: 300,
  });
};

const goSubmit = async () => {
  const ids = getPids('id-num')
  if (!ids || ids.length === 0) {
    uni.showToast({
      title: "请选择产品",
      icon: "none",
    });
    return;
  }
  try {
    await getCartClear();
    console.log("购物车已清空");
  } catch (error) {
    console.error("清空购物车失败:", error);
    // 清空失败不影响购买流程，继续执行
  }
  uni.navigateTo({ url: `/pages/orderList/confirmOrder?nickname=${detail.value.nickname}&tag=1&rpid=${pid.value}&data=${ids}&isup=1&isNew=${!user || !user.payCount ? 0 : 1}` });
};

const safeAreaBottom = ref(0);
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

const qaContent = ref("");

const changeMore = (index, type) => {
  if (type === 2) {
    elseProducts.value[index].showMore = true;
    return;
  }
  products.value[index].showMore = true;
};

// 新增：切换展开/收起状态
const toggleDesc = (index, type) => {
  if (type === 2) {
    elseProducts.value[index].isOpen = !elseProducts.value[index].isOpen;
    return;
  }
  products.value[index].isOpen = !products.value[index].isOpen;
};

const changeChecked = (index, type) => {
  console.log("changeChecked", index, type);
  if (type === 2) {
    elseProducts.value[index].checked = !elseProducts.value[index].checked;
    return;
  }
  products.value[index].checked = !products.value[index].checked;
};

const orderInfo = ref({
  orderId: "",
});

const goPayItem = async (item, type) => {
  try {
    await getCartClear();
    console.log("购物车已清空");
  } catch (error) {
    console.error("清空购物车失败:", error);
    // 清空失败不影响购买流程，继续执行
  }
  // 可按需替换为具体下单页路由
  uni.navigateTo({ url: `/pages/orderList/confirmOrder?nickname=${detail.value.nickname}&tag=1&rpid=${pid.value}&data=${[`${item.id}-${item.onSale}`]}&isup=1&isNew=${!user || !user.payCount ? 0 : 1}` });
};

// 健康方案信息
const healthPlan = reactive({
  title: "个性化营养补剂方案",
  description: "根据你的健康状况定制",
  canAdjust: true,
  products: [],
});

// 调整补剂方案
const adjustPlan = async () => {
  try {
    await getCartClear();
    console.log("购物车已清空");
  } catch (error) {
    console.error("清空购物车失败:", error);
    // 清空失败不影响购买流程，继续执行
  }
  // if (!healthPlan.canAdjust) {
  //   uni.showToast({
  //     title: "当前方案不可调整",
  //     icon: "none",
  //   });
  //   return;
  // }

  // uni.navigateTo({
  //   url: "/pages/product/replenish?orderId=" + orderInfo.orderId,
  // });
  // 可按需替换为具体下单页路由
  uni.navigateTo({ url: `/pages/orderList/confirmOrder?nickname=${detail.value.nickname}&tag=1&rpid=${pid.value}&data=${getPids('id-num')}&isup=0&isNew=${!user || !user.payCount ? 0 : 1}` });
};

const detail = ref({});
const mubiao = ref([]);
const productId = ref("");
const commentTotal = ref(0);
const getData = async () => {
  try {
    const data = await getReportAi2(pid.value);
    // 递归扁平化数组
    const flatten = (array) => {
      return array.reduce((acc, val) => {
        return acc.concat(Array.isArray(val) ? flatten(val) : val);
      }, []);
    };
    detail.value = {
      ...data,
      answerObj: JSON.parse(data.answerObj || "[]").map((obj) => {
        return {
          ...obj,
          icon: obj.img,
        };
      }),
    };
    // 对商品列表根据ID去重
    const flattenedProducts = flatten(data.kyList);
    const uniqueProducts = [];
    const seenIds = new Set();

    for (const item of flattenedProducts) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueProducts.push({
          ...item,
          checked: true,
          minNumber: item.onSale || 1
        });
      }
    }
    products.value = uniqueProducts;
    // elseProducts.value = flatten(data.wxList).map(item=>{
    //   item.checked = true;
    //   return item;
    // });
    productId.value = products.value[0].id;
    getReplyCount(products.value.map((item) => item.id).join(",")).then((total) => {
      commentTotal.value = total;
    });

    if (data && data.airesult) {
      const { result } = JSON.parse(data.airesult);
      if (result && result.mubiao) {
        mubiao.value = result.mubiao.map((item, index) => {
          if (index === 1) {
            item.theme = "2";
          } else if (index === 2) {
            item.theme = "3";
          }
          item.kyList = data.kyList[index] || [];
          item.wxList = data.wxList[index] || [];
          return item;
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const pid = ref("");
const qid = ref("");
const banners = ref([]);

// 判断是否为视频文件
const isVideo = (url) => {
  if (!url) return false;
  const videoExtensions = [".mp4", ".mov", ".avi", ".wmv", ".flv", ".m3u8"];
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext));
};

// 判断是否为图片文件
const isImage = (url) => {
  if (!url) return false;
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
};

onLoad((o) => {
  pid.value = o.id;
  qid.value = o.qid;

  console.log("mainStore", user.value);
  debugger;

  getSafeArea();

  getNewsDetail(19).then((res) => {
    qaContent.value = res.content.replace(/<img /g, "<img style='width:100%;' ");
  });

  getDictValue({
    dictType: "mall_config_dict_type",
    label: "health_banner",
  }).then((res) => {
    banners.value = JSON.parse(res || "[]");
  });

  getData();
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
  box-shadow: 0 -10rpx 10rpx rgba(0, 0, 0, 0.1);
  display: flex;
  padding: 20rpx 40rpx;
  justify-content: space-between;
  box-sizing: border-box;
  z-index: 9;
  align-items: center;

  &>image {
    position: absolute;
    width: 100%;
    bottom: 100%;
    display: block;
    left: 0;
  }
}

.comment-total {
  width: 40%;
  padding-left: 15rpx;
}

.comment-total-text {
  font-size: 28rpx;
  font-weight: 600;

  text {
    color: #00cbcc;
  }
}

.comment-total-btn {
  display: flex;
  align-items: center;
  margin-top: 10rpx;
  font-size: 24rpx;

  &>text {
    color: #00cbcc;
    margin: 0 5rpx;
  }
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

.health-title {
  margin: 30rpx;
}

.health-username {
  font-size: 38rpx;
  font-weight: 600;
}

.health-title-inner {
  font-size: 38rpx;
  font-weight: 600;
}

.health-subtitle {
  // 英文大写
  text-transform: uppercase;
  font-size: 24rpx;
  display: flex;
  justify-content: space-between;
  color: #666666;
  margin-top: 10rpx;
}

.health-change {
  display: flex;
  align-items: center;
}

.health-for {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 0 30rpx;
}

.health-for-item {
  width: 47%;
  background: #fefffd;
  border-radius: 20rpx;
  border: 2rpx solid #ebebeb;
  box-sizing: border-box;
  padding: 10rpx 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &>image {
    width: 50rpx;
    height: 60rpx;
    margin-left: 20rpx;
  }

  &.xone {
    &>view {
      width: 100%;

      &>view {
        transform: translateX(10rpx);
      }
    }
  }

  &>view {
    width: calc(100% - 90rpx);
    text-align: right;

    &>text {
      color: #868686;
      font-weight: 500;
      font-size: 24rpx;
    }

    &>view {
      display: flex;
      justify-content: flex-end;

      &>view {
        text-align: center;
        font-size: 28rpx;
        color: #000000;
        font-weight: 500;
        margin-top: 10rpx;
        margin-left: 10rpx;

        &>image {
          width: 34rpx;
          height: 34rpx;
          display: block;
          margin: 0 auto;
        }

        &>text {
          width: 100%;
          font-size: 24rpx;
          display: block;
          transform: scale(0.8) translate(0%, 0%);
          /* 根据实际情况调整数值 */
        }
      }
    }
  }
}

.health-address {
  margin: 30rpx;
  height: 65rpx;
  background: linear-gradient(90deg, #f3ca7e 0%, #fff1cf 50%, #f3ca7e 100%);
  border-radius: 10rpx 10rpx 10rpx 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 24rpx;
  color: #462800;
  text-align: left;
  font-style: normal;
  text-transform: none;

  image {
    width: 28rpx;
    height: 28rpx;
    display: block;
    margin-right: 10rpx;
  }
}

.health-ai {
  margin: 30rpx;
  background: #ededef;
  border-radius: 32rpx;
  padding: 30rpx;
  position: relative;

  &>image {
    position: absolute;
    right: 30rpx;
    bottom: 0;
    height: 106%;
  }
}

.health-ai-desc {
  font-size: 24rpx;
  width: 70%;
}

.health-ai-btn {
  display: flex;
  margin-top: 20rpx;
}

.health-ai-btn>view {
  display: flex;
  align-items: center;
  background: #00cbcc;
  border-radius: 62rpx;
  width: 200rpx;
  font-size: 28rpx;
  justify-content: center;
  height: 60rpx;
  line-height: 60rpx;
  margin: 0;
  border: 0;
  color: white;
}

.health-qa {
  margin: 50rpx 30rpx 0;
}

.health-qa-title {
  view {
    font-size: 38rpx;
    font-weight: 600;
  }

  text {
    font-size: 24rpx;
    color: #666666;
  }
}

.health-qa-content {
  margin-top: 30rpx;
}
</style>
