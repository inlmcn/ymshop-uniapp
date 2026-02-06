<!-- views/evaluation/questionnaire/detail.vue -->
<template>
  <view class="review-page">
    <!-- 顶部导航栏 -->
    <Navbar :scroll-top="scrollTop" title="健康方案" :is-auto-back="false" @goBack="handleGoBack" />

    <!-- 视频部分 -->
    <swiper v-if="banners && banners.length > 1" class="banner-swiper" indicator-dots circular
      :indicator-color="'rgba(255, 255, 255, 0.5)'" :indicator-active-color="'#00CBCC'"
      style="width: 100%; height: 400rpx">
      <swiper-item v-for="(item, index) in banners" :key="index">
        <!-- 视频 -->
        <video v-if="isVideo(item)" :src="item" style="width: 100%; height: 400rpx" :show-center-play-btn="true"
          :controls="true" :autoplay="false" object-fit="cover"></video>
        <!-- 图片 -->
        <image v-else :src="item" mode="aspectFill" style="width: 100%; height: 400rpx"></image>
      </swiper-item>
    </swiper>
    <view v-if="banners && banners.length === 1" class="banner-swiper">
      <!-- 视频 -->
      <video v-if="isVideo(banners[0])" :src="banners[0]" style="width: 100%; height: 400rpx"
        :show-center-play-btn="true" :controls="true" :autoplay="false" object-fit="cover"></video>
      <!-- 图片 -->
      <image v-else :src="banners[0]" mode="aspectFill" style="width: 100%; height: 400rpx"></image>
    </view>
    <!-- 标题 -->
    <view class="health-title">
      <view class="health-username">为{{ detail.nickname || "--" }}</view>
      <view class="health-title-inner">量身定制的营养补充方案</view>
      <view class="health-subtitle">
        <view>Nutritional supplementation plan</view>
        <view class="health-change" @click="handleAdjustPlan">
          <text style="margin-right: 10rpx;">调整方案</text>
          <uv-icon name="arrow-right" size="22rpx" />
        </view>
      </view>
    </view>

    <!-- :topProducts="[products[0]]" -->
    <ProductList @goPayItem="goPayItem" :products="products" v-if="products.length" @toggleDesc="toggleDesc"
      @changeMore="changeMore" @goDetail="openProductDetail" @changeChecked="changeChecked" />

    <!-- <view class="health-ai">
      <view class="health-ai-desc">
        此方案根据你的生活习惯和健康目标推荐，坚持服用可改善你所关注的健康问题，如需<text>调整方案</text>、<text>解析报告</text>、<text>物流售后</text>等服务，请长按扫码添加官方微信。
      </view>
      <view class="health-ai-btn">
        <view type="primary" @click="healthPartnersClick(2)">
          立即添加
          <uv-icon name="arrow-right" color="#ffffff" size="14px" />
        </view>
      </view>
      <image :src="EVALUATION_IMG_PATH + 'ai_avatar.png'" mode="heightFix" />
    </view> -->
    <view v-if="doContent" class="health-DO">
      <rich-text :nodes="doContent" />
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
    <view :style="{ height: `${safeAreaBottom ? safeAreaBottom + 80 : 120}px` }"></view>
	
    <view class="footer-btns" :style="{ paddingBottom: `${safeAreaBottom ? safeAreaBottom : 15}px` }">
		<!-- 优惠规则 -->
		<view class="discount-rules">
			<view class="year-endmegasale">
				年终钜惠
			</view>
			<view class="year-endtip">
				订单满380元可获专属优惠 | 至高立减50
			</view>
			<!-- <view>
				规则
			</view> -->
			<!-- <view class="arrow-right"></view> -->
		</view>
      <view class="footer-btnss">
      	<!-- <image :src="EVALUATION_IMG_PATH + 'plan-footer-back.png'" mode="widthFix" /> -->
      	<view class="comment-total">
      	  <view class="comment-total-text" v-if="checkedProducts">
      	    每日 <text> {{ checkedProducts.length }} </text> 种
      	  </view>
      	  <view class="comment-total-btn">
      	    合计：<view>
      	      ￥<text>{{ priceTotal || 0 }}</text>
      	    </view>
      	  </view>
      	</view>
      	<view class="footer-btn" @click="goSubmit">立即购买</view>
      </view>
    </view>

    <ReturnTop :scroll-top="scrollTop" />

    <healthPartners mode="tip2" ref="healthPartnersRef" code="health_qrcode" />
    <healthPartners mode="tip2" ref="healthPartners2Ref" code="health_qrcode2" />

    <!-- 在父组件中使用 -->
    <productDetailModal ref="productDetailPopupRef">
      <productDetail :productId="productId" :isLoadingMain="isLoadingMain" :isLoadingDocument="isLoadingDocument"
        :documentData="documentData" :productList="productList" :productMainImages="productMainImages"
        :broadcasterVideo="broadcasterVideo" :formulaVideo="formulaVideo" :detailData="detailData"
        :detailPrice="formatPrice(currentPrice)" :hotsaleList="hotsaleList" :hotsalesNum='hotsalesNum'
        :hotsaleSwiper="hotsaleSwiper" :researchStats="researchStats" :upgradeTitle="upgradeTitle"
        :upgradeContent="upgradeContent"></productDetail>
    </productDetailModal>

    <CustomToast ref="customToastRef" />
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { EVALUATION_IMG_PATH } from "@/utils/imgpath.js";
import Navbar from "../components/Navbar.vue";
import { useScroll } from "@/hooks/useScroll";
import { onLoad, onUnload } from "@dcloudio/uni-app";
import ReturnTop from "@/components/ReturnTop/index.vue";
import ProductList from "./components/product-list.vue";
import healthPartners from "@/components/healthPartners/hit.vue";
import productDetailModal from "./components/product-detail-modal.vue";
import productDetail from "./components/productDetail.vue";
import { useSupplementStore } from "@/store/supplement";
import { getProductDetail, getProductDocument, gethotsaleList, getproductSales, getproductcardList } from '@/api/product'
import { getReportAi2, getReplyCount, getNewsDetail, getDictValue } from "@/api/evaluation";
import { getCartClear } from "@/api/cart";
import { getPlanOrderMinAmount, getPlanOrderMinCount } from "@/api/order";
import { useProductPrice } from '@/hooks/useProductPrice'
import { pick } from "lodash-es";
import { PRODUCT_IMG_PATH } from '@/utils/imgpath.js'
import CustomToast from "@/components/CustomToast/index.vue";
import { onShareAppMessage } from '@dcloudio/uni-app'
import { useShare } from "@/hooks/useShare";
const { goodsDetailsShare } = useShare()

const supplementStore = useSupplementStore();

const healthPartnersRef = ref(null);
const healthPartners2Ref = ref(null);
const customToastRef = ref(null);
const productDetailPopupRef = ref(null);

const openProductDetail = (productId) => {

  // 并行加载主要内容和文档内容
  Promise.all([
    handleGetDetail(productId),
    handleGetDocument(productId),
    getproductSale(productId),
    gethotSale(productId),
    getproductCard(productId)
  ]).catch(error => {
    console.error('加载数据失败:', error)
  })
  productDetailPopupRef.value.open(productId);
};

// 产品ID
const productId = ref(null);
const isLoadingMain = ref(true)
const isLoadingDocument = ref(true)
// 文档数据
const documentData = ref({ report: [], literatureList: [], literatureImg: null });
// 产品轮播图数据
const productImages = ref([
  PRODUCT_IMG_PATH + 'image7952x.png',
  // 可以添加更多图片
]);
//产品升级标题
const upgradeTitle = ref('')
const upgradeContent = ref('')
//公众号文章内容
const productList = ref([])
// 产品主图数据（只有图片）
const productMainImages = ref([]);
// 主播讲解视频
const broadcasterVideo = ref([]);
// 配方讲解视频
const formulaVideo = ref([]);
// 产品详情数据
const detailData = ref({});
// 最近购买
const hotsaleList = ref([])
const hotsalesNum = ref(0)
const hotsaleSwiper = ref([])
const hotsaleOffset = ref(0)
const showhotsaleTip = ref(false)
const loadhotsaleIng = ref(false)
const researchStats = ref([
  { icon: '20828953082x.png', label: '研究年限', value: '1883-至今' },
  { icon: '20828953092x.png', label: '临床实验论文', value: 63 },
  { icon: '20828953102x.png', label: '荟萃分析论文', value: 37 }
])
// 使用价格处理函数
const {
  selectedAttr,
  currentPrice,
  currentProductValue,
  priceRange,
  hasStock,
  currentStock,
  formatPrice,
  selectAttr,
  initDefaultAttr,
  getAttrList,
  getAttrInfo
} = useProductPrice(detailData);
const handleGetDetail = async (id) => {
  try {
    isLoadingMain.value = true
    let data = { productId: id }
    const detail = await getProductDetail(data);
    detailData.value = detail;
    upgradeTitle.value = detail.upgradeTitle
    upgradeContent.value = detail.upgradeContent
    console.log('商品详情数据:', detail)

    // 检查评价数据
    if (detail && detail.replyCount > 0 && !detail.reply) {
      // 如果有评价数量但没有评价数据，获取评价列表
      try {
        const { replyList } = await import('@/api/goods');
        const replyData = await replyList({ id: id });
        if (replyData && replyData.records && replyData.records.length > 0) {
          // 将第一条评价数据添加到详情中
          detailData.value.reply = replyData.records[0];
          console.log('获取到的评价数据:', replyData.records[0]);
        }
      } catch (error) {
        console.error('获取评价数据失败:', error);
      }
    }

    // 从API数据中获取产品图片和视频列表
    if (detail) {
      const { video, storeInfo } = detail;
      let tempProductMainImages = [];

      // 处理产品主图（只有图片）
      if (storeInfo.sliderImage) {
        const mediaUrls = storeInfo.sliderImage.split(',').map(url => url.trim());

        // 提取纯图片列表
        tempProductMainImages = mediaUrls
          .filter(url => !/\.(mp4|mov|avi|wmv|flv|mkv|webm|m4v)(\?.*)?$/i.test(url.toLowerCase()))
          .map(url => ({
            type: 1, // 图片
            url: url
          }));

        // 保存纯图片列表用于其他用途
        productImages.value = mediaUrls.filter(url => {
          return !/\.(mp4|mov|avi|wmv|flv|mkv|webm|m4v)(\?.*)?$/i.test(url.toLowerCase());
        });
      }

      // 处理主播讲解视频（storeInfo.zbImg 字段）
      if (storeInfo.zbImg) {
        const zbImgArr = storeInfo.zbImg.split(',').map(item => item.trim()).filter(item => item);
        if (zbImgArr.length > 0) {
          broadcasterVideo.value = zbImgArr.map(url => ({
            type: 2, // 视频
            url: url
          }));
        }
      }

      // 处理配方讲解视频（storeInfo.pfImg 字段）
      if (storeInfo.pfImg) {
        const pfImgArr = storeInfo.pfImg.split(',').map(item => item.trim()).filter(item => item);
        if (pfImgArr.length > 0) {
          formulaVideo.value = pfImgArr.map(url => ({
            type: 2, // 视频
            url: url
          }));
        }
      }

      // 设置产品主图
      productMainImages.value = tempProductMainImages;

      console.log('产品主图:', productMainImages.value);
      console.log('主播讲解视频:', broadcasterVideo.value);
      console.log('配方讲解视频:', formulaVideo.value);
    }

    // 设置商品分享
    // goodsDetailShare(detail.storeInfo)
    // setGoodsDetail(detail)
    // setDefaultAttr(detail)
    // await handleGetCanGroupByList()
  } catch (error) {
    console.dir(error)
  } finally {
    isLoadingMain.value = false
  }
};
const handleGetDocument = async (id) => {
  try {
    isLoadingDocument.value = true
    const document = await getProductDocument(id);
    console.log(document, 'daaaa')
    // 存储文档数据
    documentData.value = document;
    // 从API返回的数据中构建researchStats
    if (document.researchStats && Array.isArray(document.researchStats)) {
      researchStats.value = document.researchStats;
    } else if (document.literatureImg) {
      // 如果有literatureImg数据，则根据字段映射构建researchStats
      researchStats.value = [
        { icon: '20828953082x.png', label: '研究年限', value: document.literatureImg.ageLimit || 0, img: document.literatureImg.ageImg },
        { icon: '20828953092x.png', label: '临床实验论文', value: document.literatureImg.cliniPaper || 0, img: document.literatureImg.cpImg },
        { icon: '20828953102x.png', label: '荟萃分析论文', value: document.literatureImg.metaPaper || 0, img: document.literatureImg.mpImg }
      ];
    }
  } catch (error) {
    console.dir(error)
  } finally {
    isLoadingDocument.value = false
  }
}
//获取热销数量
const getproductSale = async (id) => {
  try {
    const data = {
      productId: id
    }
    const datas = await getproductSales(data)
    hotsalesNum.value = datas
  } catch (error) {
    console.dir(error)
  }
}
//获取热销数据
const gethotSale = async (id, bool) => {
  try {
    const data = {
      productId: id,
      offset: hotsaleOffset.value,
      limit: 20
    }
    const datas = await gethotsaleList(data)
    if (datas.length > 0) {
      hotsaleList.value = datas
      loadhotsaleIng.value = false
    } else {
      showhotsaleTip.value = true
      loadhotsaleIng.value = true
    }
    if (!bool) {
      hotsaleSwiper.value = chunkhotSaleList(datas)
    }
  } catch (error) {
    loadhotsaleIng.value = false
    console.dir(error)
  }
}
//热销数据处理
const chunkhotSaleList = (arr) => {
  let chunkSize = 2;
  let chunks = [];
  let tempChunk = [];
  for (let i = 0; i < arr.length; i++) {
    tempChunk.push(arr[i]);
    if (tempChunk.length === chunkSize) {
      chunks.push(tempChunk);
      tempChunk = [];
    }
  }
  // 如果最后一个子数组不满chunkSize，将其加入结果
  if (tempChunk.length > 0) {
    chunks.push(tempChunk);
  }
  return chunks
}
//获取公众号数据
const getproductCard = async (id) => {
  try {
    const datas = await getproductcardList(id)
    productList.value = datas
  } catch (error) {
    console.dir(error)
  }
}

const healthPartnersClick = (i) => {
  if (i == 1) {
    healthPartnersRef.value.open();
  } else {
    healthPartners2Ref.value.open();
  }
};

const { scrollTop } = useScroll();

const products = ref([]);
const elseProducts = ref([]);
let originalProducts = []

const getPids = (mode) => {
  const pids = products.value.filter((item) => item.checked).map((item) => (mode === "id-num" ? `${item.id}-${item.onSale}` : item.id));
  const pids2 = elseProducts.value.filter((item) => item.checked).map((item) => (mode === "id-num" ? `${item.id}-${item.onSale}` : item.id));
  return [...pids, ...pids2];
};

const priceTotal = computed(() => {
  const total = products.value.reduce((acc, cur) => {
    if (cur.checked) {
      return acc + cur.price * cur.onSale;
    }
    return acc;
  }, 0);
  return Number(total.toFixed(2));
});

const checkedProducts = computed(() => {
  return products.value.filter((item) => item.checked);
});

const goSubmit = async () => {
  const ids = getPids("id-num");
  if (!ids || ids.length === 0) {
    uni.showToast({
      title: "请选择产品",
      icon: "none",
    });
    return;
  }

  const minCount = await getPlanOrderMinCount();
  if (minCount !== 0 && ids.length < minCount) {
    customToastRef.value.show({
      title: `组合方案建议至少选取${minCount}款产品\n协同增效，收效更佳哦`,
    });
    return;
  }

  const minAmount = await getPlanOrderMinAmount();
  if (minAmount !== 0 && priceTotal.value < minAmount) {
    customToastRef.value.show({
      title: `组合方案满${minAmount}元起购\n协同增效，收效更佳哦`,
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
  clearSupplementStore();
  uni.navigateTo({ url: `/pages/orderList/confirmOrder?nickname=${detail.value.nickname}&tag=1&rpid=${pid.value}&data=${ids}&isup=1&isNew=${0}&isPlan=1` });
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
const doContent = ref("");

const changeMore = (item) => {
  const current = products.value.find(o => o.id === item.id);
  if (!current) return;
  current.showMore = true;
};

// 新增：切换展开/收起状态
const toggleDesc = (item) => {
  const current = products.value.find(o => o.id === item.id);
  if (!current) return;
  current.isOpen = !current.isOpen;
};

const goPayItem = async (item, type) => {
  try {
    await getCartClear();
    console.log("购物车已清空");
  } catch (error) {
    console.error("清空购物车失败:", error);
    // 清空失败不影响购买流程，继续执行
  }
  // 可按需替换为具体下单页路由
  clearSupplementStore();
  uni.navigateTo({ url: `/pages/orderList/confirmOrder?nickname=${detail.value.nickname}&tag=1&rpid=${pid.value}&data=${[`${item.id}-${item.onSale}`]}&isup=1&isNew=${0}&isPlan=1` });
};

// 调整补剂方案
const handleAdjustPlan = async () => {
  try {
    uni.showLoading({
      title: "加载中...",
      mask: true,
    });
    const ids = products.value.map((item) => item.id);

    const confirmData = await Promise.all(ids.map((id) => getProductDetail({ productId: id })));

    supplementStore.setConfirmList(confirmData);
    supplementStore.setSelectList([]);
    uni.navigateTo({ url: "/pages/product/replenish?isPlan=1" });
  } finally {
    uni.hideLoading();
  }
};

const detail = ref({});
const mubiao = ref([]);
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

    const doStr = data?.noticeDO?.content || '';
    doContent.value = doStr.replace(/<img /g, "<img style='width:100%;' ");

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
          minNumber: item.onSale || 1,
          index: uniqueProducts.length,
        });
      }
    }

    originalProducts = uniqueProducts;
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

const formateProductList = async (list) => {
  try {
    uni.showLoading({
      title: "加载中...",
      mask: true,
    });

    const currentList = list.filter(item => item?.storeInfo?.id)
    const currentProducts = await Promise.all(currentList.map(async (item, index) => {
      const originalItem = originalProducts.find(o => o.id === item.storeInfo.id);
      const storeInfo = item.storeInfo;
      const uniqueObj = Object.values(item.productValue || {})[0]


      return originalItem || {
        ...pick(storeInfo, ['id', 'comparePrice', 'defaultNumber', 'image',
          'storeName', 'storeInfo', 'specUnit', 'productTitle']),
        price: uniqueObj.price,
        otPrice: uniqueObj.otPrice,
        goodstag: '自选',
        labelList: item.labelList || [],
        onSale: storeInfo.lzNum || storeInfo.onSale || 1,
        minNumber: storeInfo.lzNum || storeInfo.onSale || 1,
        costNum: storeInfo.costNum || 0,
        checked: true,
        index,
        _notOriginal: true,
      }
    }));

    products.value = currentProducts;
  } finally {
    uni.hideLoading();
  }
};

const handleChangeHealthPlanProducts = () => {
  const confirmList = supplementStore.confirmList;
  formateProductList(confirmList);
  supplementStore.setConfirmList([]);
  supplementStore.setSelectList([]);
};

const handleGoBack = (_, callback) => {
  clearSupplementStore();
  callback();
};

const clearSupplementStore = () => {
  supplementStore.setConfirmList([]);
  supplementStore.setSelectList([]);
};

onLoad((o) => {
  pid.value = o.id;
  qid.value = o.qid;

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

  uni.$on('SAVE_REPLENISH_CONFIRM_LIST', handleChangeHealthPlanProducts);

  uni.hideShareMenu({
    menus: ["shareAppMessage", "shareTimeline"],
  });
});


onUnload(() => {
  console.log("页面卸载，清空确认订单数据");
  getCartClear();
  uni.$off('SAVE_REPLENISH_CONFIRM_LIST', handleChangeHealthPlanProducts);
});

// 微信小程序分享给好友
onShareAppMessage((options) => {

  if (options.from === 'button') {
    return goodsDetailsShare({
      storeName: detail.value?.storeName || '',
      image: productMainImages.value?.[0]?.url || '',
      id: productId.value
    })
  }
})
</script>

<style lang="scss" scoped>
.review-page {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 0;
  overflow-x: hidden;
}

.footer-btns{
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	background: #ffffff;
	box-shadow: 0 -10rpx 10rpx rgba(0, 0, 0, 0.05);
	z-index: 9;
	//优惠规则
	.discount-rules{
		background-color: #FFE9EA;
		width: 750rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #FE5160;
		font-size: 24rpx;
		padding: 0 30rpx 0 25rpx;
		box-sizing: border-box;
		font-weight: bold;
		.year-endmegasale{
			width: 116rpx;
			height: 33rpx;
			line-height: 33rpx;
			text-align: center;
			background-color: #FE5160;
			border-radius: 8rpx;
			color: #fff;
		}
		.year-endtip{
			flex: 1;
			margin: 0 10rpx;
		}
		// .arrow-right{
		// 	width: 10rpx;
		// 	height: 10rpx;
		// 	border-top: 1rpx solid #FE5160;
		// 	border-right: 1rpx solid #FE5160;
		// 	border-bottom: 1rpx solid transparent;
		// 	border-left: 1rpx solid transparent;
		// 	transform: rotate(45deg);
		// 	margin-left: 6rpx;
		// }
	}
}
.footer-btnss {
  display: flex;
  padding: 25rpx 40rpx 20rpx;
  justify-content: space-between;
  box-sizing: border-box;
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
  font-weight: 500;
  color: #222222;
  line-height: 40rpx;

  text {
    color: #00cbcc;
  }
}

.comment-total-btn {
  display: flex;
  align-items: center;
  font-size: 26rpx;

  &>view {
    color: #00cbcc;

    text {
      font-size: 36rpx;
      font-weight: 600;
    }
  }
}

.footer-btn {
  width: 240rpx;
  height: 60rpx;
  line-height: 60rpx;
  background: #00cbcc;
  border: 0;
  font-weight: 500;
  font-size: 24rpx;
  color: #FFFFFF;
  text-align: center;
  border-radius: 30rpx;
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

// .health-ai {
//   margin: 30rpx 30rpx 10rpx 30rpx;
//   background: #ededef;
//   border-radius: 32rpx;
//   padding: 35rpx 20rpx 35rpx 166rpx;
//   position: relative;
//   height: 227rpx;
//   box-sizing: border-box;
//   @include useFlex(flex-start, flex-end, column, nowrap);
//   overflow: hidden;

//   &>image {
//     position: absolute;
//     left: 16rpx;
//     bottom: 0;
//     height: 209rpx;
//   }
// }

// .health-ai-desc {
//   font-weight: 400;
//   font-size: 20rpx;
//   color: #262626;
//   line-height: 29rpx;
//   text-align: center;

//   text {
//     font-weight: 700;
//   }
// }

// .health-ai-btn {
//   display: flex;
//   margin-top: 20rpx;
// }

// .health-ai-btn>view {
//   margin: 0;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 4rpx;
//   width: 176rpx;
//   height: 48rpx;
//   font-size: 24rpx;
//   color: white;
//   background: #00cbcc;
//   border-radius: 24rpx;
//   border: 0;
// }
.health-qa,
.health-DO {
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
