<template>
  <page-meta :page-style="'overflow:' + (maskShows ? 'hidden' : 'visible')"></page-meta>
  <Header v-show="!isFullscreen" :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
      </view>
    </template>
    <text class="header-title">产品详情</text>
  </Header>
  <productDetail :productId="productId" :isLoadingMain="isLoadingMain" :isLoadingDocument="isLoadingDocument"
                 :documentData="documentData" :productList="productList" :productMainImages="productMainImages"
                 :broadcasterVideo="broadcasterVideo" :formulaVideo="formulaVideo" :detailData="detailData"
                 :detailPrice="formatPrice(currentPrice)" :hotsaleList="hotsaleList" :hotsalesNum='hotsalesNum'
                 :hotsaleSwiper="hotsaleSwiper" v-model:maskShows="maskShows" :researchStats="researchStats"
                 :upgradeTitle="upgradeTitle" :upgradeContent="upgradeContent" :tagsBadges="tagsBadges"
                 @fullscreenchange="handleFullscreenChange"></productDetail>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import Header from '@/components/Header/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { collectSingle, getProductDetail, getProductDocument, gethotsaleList, getproductSales, getproductcardList } from '@/api/product'
import { COMMON_IMG_PATH, PRODUCT_IMG_PATH } from '@/utils/imgpath.js'
import { checkTheUser, addRoutineOpenId } from "@/api/auth";
import productDetail from './components/index.vue'
import { useProductPrice } from '@/hooks/useProductPrice'
import { useMainStore } from '@/store/modules/useMainStore'
import { useShare } from "@/hooks/useShare";
const { shareTimeline, goodsDetailsShare } = useShare()
const { getParams, goBack, toHome, push } = useRouter()
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
const productId = ref(null)
const isFullscreen = ref(false)

const handleFullscreenChange = (fullScreen) => {
  console.log('页面级全屏状态改变:', fullScreen)
  isFullscreen.value = fullScreen
  if (fullScreen) {
    uni.hideStatusBar()
  } else {
    uni.showStatusBar()
  }
}
const isLoadingMain = ref(true)
const isLoadingDocument = ref(true)
const mainStore = useMainStore()
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
// 轮播TagsBadges
const tagsBadges = ref([]);
// 配方讲解视频
const formulaVideo = ref([]);
// 产品详情数据
const detailData = ref(null);
// 最近购买
const hotsaleList = ref([])
const hotsalesNum = ref(0)
const hotsaleSwiper = ref([])
const hotsaleOffset = ref(0)
const maskShows = ref(false)
const showhotsaleTip = ref(false)
const loadhotsaleIng = ref(false)
// 使用价格处理函数
const { currentPrice, formatPrice } = useProductPrice(detailData);
const researchStats = ref([])
// 微信小程序分享给好友
onShareAppMessage(() => {
  const firstImage = productMainImages.value?.[0];
  
  return goodsDetailsShare({
    storeName: detailData.value?.storeName || '',
    image: firstImage?.url || '',
    id: productId.value
  })
})

// 微信小程序分享到朋友圈
onShareTimeline(() => {
  return shareTimeline()
})

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
      // 轮播TagsBadges
      tagsBadges.value = [storeInfo.zbInfo, storeInfo.pfInfo]
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
//获取公众号数据
const getproductCard = async (id) => {
  try {
    const datas = await getproductcardList(id)
    productList.value = datas
  } catch (error) {
    console.dir(error)
  }
}
//跳转到webview
const towebView = src => {
  push({ url: '/pages/webview/index' }, { data: { src } })
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

onLoad(async (options) => {
  console.log(options, '1111111===========>>')
	const params = getParams(options)
	console.log(params, '222==========>>>')
	productId.value = params.id || options.id

	if (options.scene) {
		//表示扫二维码 或者 小程序链接 过来的
		let sc = options.scene;
		//邀请码
		if (sc.startsWith('code_')) {
			let code = sc.substring(5);
			checkTheUserInit(code, Number(options.channelId))
		}
		if (sc.startsWith('productId_')) {
			productId.value = sc.substring(10);
		}
	}
	
	console.log("========productId=========" + productId.value)
	// 并行加载主要内容和文档内容
	Promise.all([
		handleGetDetail(productId.value),
		handleGetDocument(productId.value),
		getproductSale(productId.value),
		gethotSale(productId.value),
		getproductCard(productId.value)
	]).catch(error => {
		console.error('加载数据失败:', error)
	})
	
	addRoutineOpenIdInit();
})

async function addRoutineOpenIdInit() {
  wx.login({
    async success(res) {
      if (res.code) {
        console.log('微信code===========----' + res.code)
        let data = {};
        data.phoneCode = '888815';
        data.loginCode = res.code;
        const loginRes = await addRoutineOpenId(data);
        console.log('==补全openid==执行结果===========----' + loginRes)
      }
    }
  });
}

async function checkTheUserInit(invitationCode, channelId) {
  //进行注册绑定关系操作
  wx.login({
    async success(res) {
      if (res.code) {
        console.log('微信code===========----' + res.code)
        let data = {};
        data.phoneCode = '888811';
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
// Header Section
.header-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #121212;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24rpx;

  .icon-home {
    width: 48rpx;
    height: 48rpx;
  }
}
</style>
