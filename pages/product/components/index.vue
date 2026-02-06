<template>
  <view class="product-detail">
    <!-- 主要内容骨架屏 -->
    <view class="main-skeleton" v-if="isLoadingMain">
      <uv-skeleton :loading="true" :rows="0" :animate="true" :rowsHeight="800"></uv-skeleton>
      <view style="padding: 30rpx;">
        <uv-skeleton :loading="true" :rows="3" :animate="true" :rowsHeight="[60, 40, 30]"></uv-skeleton>
      </view>
    </view>

    <!-- 媒体区域（产品主图 + 主播讲解 + 配方讲解） -->
    <view class="main-content-wrapper" :class="{ 'fade-in': !isLoadingMain }" v-show="!isLoadingMain">
      <view class="main-content">
        <ProductMediaSection :productMainImages="productMainImages" :broadcasterMedia="broadcasterVideo"
                             :formulaMedia="formulaVideo" @tabChange="onMediaTabChange" @videoPlay="onVideoPlay"
                             @videoEnd="onVideoEnd" @mediaComplete="onProductMediaComplete" :tagsBadges="tagsBadges"
                             @fullscreenchange="$emit('fullscreenchange', $event)"/>
      </view>
      <view class="content-section">
        <!-- 產品信息區域 -->
        <view class="product-info" v-if="detailData && detailData.storeInfo">
          <div class="product-header">
            <view class="product-price"><text class="rmb">¥</text><text class="price-text">{{ detailPrice }}</text><text class="unit">/月</text></view>
            <view class="sales-info">{{ formatSoldCount(detailData.storeInfo?.sales || 0) }}</view>
          </div>

            <view class="product-name uv-line-2" @longpress="copyProductName">
              <div class="product-name-text"> {{ detailData.storeInfo.storeName }}</div>
            </view>

        </view>

        <!-- 保障信息區域 -->
        <view class="guarantee-section" v-if="detailData">
           <view class="tag-list">
            <view class="tag-item">香港直邮</view>
            <view class="tag-item">全额包税</view>
            <view class="tag-item" v-if="detailData?.replyFsCount" @click="goToReview(1)">{{ detailData?.replyFsCount || 0 }}人好评</view>
            <view class="tag-item" v-if="detailData?.replyCsCount" @click="goToReview(0)">回头客{{ detailData?.replyCsCount || 0 }}人</view>
          </view>

          <view class="guarantee-item1 primary" @click="openAssurancePopup">
            <!-- <view class="guarantee-icon">✓</view> -->
            <image class="guarantee-icon" referrerpolicy="no-referrer"
                   :src="COMMON_IMG_PATH + '6d06d791850.png'" />
            <text class="guarantee-text">正品险 &nbsp;&nbsp;|&nbsp;&nbsp;</text>
          </view>
          <!-- <view class="guarantee-item" v-if="detailData.assureList && detailData.assureList.length > 0">
            |{{detailData.assureList && detailData.assureList.map(item =>
              item.name).join(' | ')}}</view> -->
          <view class="guarantee-item">100%正品保障，PICC财险承保</view>
        </view>
      </view>
    </view>
    <!-- 热销最近购买模块 -->
    <view class="hot-box" v-if="hotsaleList.length>0">
      <view class="gap"></view>
      <view class="hot-box-title">
        <view class="title">最近购买<text>{{'('+formatNumber(hotsalesNum || 0)+')'}}</text></view>
        <view class="title-more" @click="showHotsaleBox">
          <text>查看更多</text>
          <uv-icon name="arrow-right" color="#929CA6" size="18" class="icon" />
        </view>
      </view>
      <view class="hot-box-swiper">
        <swiper :autoplay="true" :interval="3000" :duration="1000" vertical circular>
          <swiper-item v-for="(item,index) in hotsaleSwiper" :key="index">
            <view class="swiper-item" v-for="(items,indexs) in item" :key="indexs">
              <image :src="items.buyerAvatar" mode="aspectFit"></image>
              <view class="hot-box-name">{{items.buyerName}}</view>
              <text>{{items.buyTime}}购买了{{items.buyNum}}件</text>
              <view class="hot-box-buy" @click="buyNow">立即购买</view>
            </view>
          </swiper-item>
        </swiper>
      </view>
    </view>
    <view class="split-bar"></view>
    <!-- 商品评价 -->
    <uv-skeleton
        v-if="isLoadingMain"
        :title="false"
        :rowsWidth="['100%', '100%']"
        :loading="true"
        :rows="2"
        :animate="true"
        :rowsHeight="[40, 120]"></uv-skeleton>

    <view v-else class="comment-section fade-in">
      <template v-if="!detailData || (detailData && detailData.replyCount <= 0)">
        <text class="comment-section-empty">暂无评价，快来抢首评吧~</text>
      </template>

      <template v-else>
        <view class="comment-section-header">
          <view class="comment-section-title">商品评价（{{ (detailData && detailData.replyCount) || 0 }}）</view>
          <view class="comment-section-more" @click="viewOpen">
            <view class="comment-section-more-text">好评率{{ detailData?.positiveReviewRate || 0 }}%</view>
            <uv-icon color="#626262" name="arrow-right" size="24rpx" />
          </view>
        </view>
        <swiper v-if="detailData && detailData.reply && detailData.reply.length > 0" class="comment-section-swiper" :circular="true" :autoplay="true" :interval="3000">
          <swiper-item v-for="item in detailData.reply" :key="item.id" class="comment-section-swiper-item">
            <detail-reply :data="item" :productId="productId"></detail-reply>
          </swiper-item>
        </swiper>
      </template>
    </view>
    <!-- 公众号文章模块 -->
    <view class="official-account" v-if="productList.length>0">
      <view class="gap"></view>
      <view class="official-account-title">{{productList[0].title}}</view>
      <view class="official-account-content">
        <scroll-view scroll-y="true" class="scroll-box">
          <view class="scroll-box-item" v-for="(item,index) in productList" :key="index" @click="towebView(item.jumpUrl)">
            <view class="img-box">
              <image :src="item.imgUrl" mode="aspectFill"></image>
            </view>
            <view class="article-right">
              <view class="article-right-title">
                {{item.contentTitle}}
              </view>
              <view class="article-right-author">
                <image v-if="item.smallImgUrl" :src="item.smallImgUrl" mode="aspectFit"></image>
                <view class="article-right-author-right">
                  <text>{{item.contentIntro}}</text>
                  <view v-if="item.readCount">{{'阅读量 '+item.readCount}}</view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
    <!-- 产品升级 -->
    <view class="research-section-sj" v-if="isLoadingMain" style="background: #f8f8f8;">
      <view style="padding: 40rpx 0;">
        <uv-skeleton :loading="true" :rows="3" :animate="true" :rowsHeight="[40, 200, 200]"></uv-skeleton>
      </view>
    </view>
    <view class="fade-in" style="background: #f8f8f8;" v-show="upgradeContent">
      <view class="gap"></view>
      <view class="research-title-sj">{{upgradeTitle}}</view>
      <!-- 富文本1 -->
      <ProductDetailContent type="richtext" :content="upgradeContent" />
    </view>
    <!-- 產品檢測及認證區域 -->
    <view class="certification-section" v-if="isLoadingDocument">
      <uv-skeleton :loading="true" :rows="2" :animate="true" :rowsHeight="[40, 200]"></uv-skeleton>
    </view>
    <view class="fade-in" v-show="!isLoadingDocument">
      <view class="certification-section"
            v-if="documentData && documentData.report && documentData.report.length > 0">
        <view class="product-certification-title">产品检测及认证</view>
        <view class="product-certification">
          <!-- 动态渲染认证卡片 -->
          <view class="certification-item" v-for="(item, index) in documentData.report" :key="item.id">
            <view class="certification-bg">
              <image :src="item.imgs && item.imgs.replace(/[`']/g, '')" class="certification-image"
                     mode="aspectFill"></image>
              <view class="certification-overlay" @click="handleCertificationClick(item, index)">
                <view class="certification-title">{{ item.title }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 相关研究区域 -->
    <view class="product-specification" v-if="isLoadingDocument">
      <view style="padding: 40rpx 30rpx;">
        <uv-skeleton :loading="true" :rows="3" :animate="true" :rowsHeight="[40, 120, 80]"></uv-skeleton>
      </view>
    </view>
    <view class="fade-in" v-show="!isLoadingDocument">
      <view class="product-specification"
            v-if="shouldShowResearchSection && ((researchStats && researchStats.length > 0) || (documentData && documentData.literatureList && documentData.literatureList.length > 0))">
        <view class="research-section">
          <view class="research-title">相关研究</view>
          <view class="research-cards" v-if="researchStats && researchStats.length > 0">
            <view class="research-card" v-for="stat in researchStats" :key="stat.label">
              <view class="rc-icon" :class="`icon-${stat.icon}`">
                <image v-if="stat.img" :src="stat.img.replace(/[`']/g, '')" class="certification-image"
                       mode="aspectFit"></image>
                <image v-else :src="PRODUCT_IMG_PATH + stat.icon" class="certification-image"></image>
              </view>
              <view class="rc-label">{{ stat.label }}</view>
              <view class="rc-value">{{ stat.value }}</view>
            </view>
          </view>

          <view class="research-list"
                v-if="documentData && documentData.literatureList && documentData.literatureList.length > 0">
            <view class="research-item" v-for="(item, idx) in documentData.literatureList" :key="idx">
              <view class="bullet">•</view>
              <view class="ri-text" @click="goToDetail(item)">{{ item.title }}</view>
              <uv-icon color="rgba(0, 203, 204)" name="arrow-right" size="10" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="research-section-xq" v-if="isLoadingMain" style="background: #f8f8f8;">
      <view style="padding: 40rpx 0;">
        <uv-skeleton :loading="true" :rows="3" :animate="true" :rowsHeight="[40, 200, 200]"></uv-skeleton>
      </view>
    </view>
    <view class="fade-in" style="background: #f8f8f8;  margin-bottom: 150rpx;" v-show="!isLoadingMain">
      <view class="research-title-xq">商品详情</view>
      <!-- 富文本1 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.description" type="richtext"
                            :content="detailData.storeInfo.description" />
      <!-- 图片轮询1 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage" />
      <!-- 图片轮询2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage2" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage2" />
      <!-- 图片轮询3 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage3" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage3" />
      <!-- 图片轮询4 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage4" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage4" />
      <!-- 图片轮询5 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage5" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage5" />

      <!-- 富文本2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.description2" type="richtext"
                            :content="detailData.storeInfo.description2" />
      <!-- 图片轮询2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage6" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage6" />
      <!-- 图片轮询2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage7" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage7" />
      <!-- 图片轮询2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage8" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage8" />
      <!-- 图片轮询2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage9" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage9" />
      <!-- 图片轮询2 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.lunxunImage10" type="carousel"
                            :image-str="detailData.storeInfo.lunxunImage10" />

      <!-- 富文本3 -->
      <ProductDetailContent v-if="detailData?.storeInfo?.description3" type="richtext"
                            :content="detailData.storeInfo.description3" />
      <!-- 注意事项 -->
      <ProductDetailContent v-if="hasContent(detailData?.storeInfo?.description5)" type="info"
                            :content="detailData.storeInfo.description5 || ''" title="注意事项" title-en="Precautions"
                            :default-expanded="true" />

      <!-- 使用禁忌 -->
      <ProductDetailContent v-if="hasContent(detailData?.storeInfo?.description6)" type="info"
                            :content="detailData.storeInfo.description6 || ''" title="使用禁忌" title-en="Usage Taboos"
                            :default-expanded="true" />

      <!-- 常见问题 -->
      <ProductDetailContent v-if="hasContent(detailData?.storeInfo?.description7)" type="info"
                            :content="detailData.storeInfo.description7 || ''" title="常见问题" title-en="Q&A"
                            :default-expanded="true" />

      <!-- 税费标准 -->
      <ProductDetailContent v-if="hasContent(detailData?.storeInfo?.taxDescription)" type="info"
                            :content="detailData?.storeInfo?.taxDescription || ''" title="各地区税费标准参考" title-en="Tax standard"
                            :default-expanded="true" />

      <!-- 参考文献 -->
      <ProductDetailContent v-if="hasContent(detailData?.storeInfo?.description4)" type="info"
                            :content="description4WithoutLastImage" title="参考文献" title-en="Nutrition Facts" :default-expanded="true"
                            :show-qrcode="true" :qrcode-image="lastImageFromDescription4" />
    </view>
    <view class="bottom-bar">
      <view class="bb-left">
        <view class="bb-icon" @tap="contactService">
          <image :src="PRODUCT_IMG_PATH + '20828953122x.png'" class="icon-image"></image>
          <text class="bb-label">客服</text>
        </view>
        <button open-type="share" class="bb-icon">
          <image :src="HOME_IMG_PATH + 'Group 2082895178.png'" class="icon-image"></image>
          <text class="bb-label">分享</text>
        </button>
      </view>
      <view class="bb-right" :class="{ 'has-proxy': mainStore.user && mainStore.user.isSale === 1 }">
        <button v-if="mainStore.user && mainStore.user.isSale === 1" class="bb-btn secondary" @tap="proxyOrder">
          代客下单
        </button>
        <button class="bb-btn primary" :class="{ 'disabled': isLoadingMain }" :loading="isLoadingMain"
                :disabled="isLoadingMain" @tap="buyNow">
          {{ isLoadingMain ? '加载中...' : '立即购买' }}
        </button>
      </view>
    </view>
  </view>
  <!-- 购买记录弹窗 -->
  <uv-popup ref="showHotsalePopupRef" mode="bottom" :round="20" :closeOnClickOverlay="false">
    <view class="hotsale-popup">
      <view class="hotsale-popup-title">
        {{'最近购买('+formatNumber(hotsalesNum || 0)+')'}}
        <view class="icon-close" @click="closeHotsaleBox">
          <uv-icon size="18" name="close" class="icon-close"/>
        </view>
      </view>
      <view class="hotsale-popup-content">
        <view class="hotsale-popup-th">
          <view>购买人</view>
          <view>购买数量</view>
          <view>时间</view>
        </view>
        <scroll-view scroll-y="true" class="hotsale-popup-scroll">
          <view class="hotsale-popup-td-box">
            <view class="hotsale-popup-td" v-for="(item,index) in hotsaleList" :key="index">
              <view class="hotsale-popup-person">
                <image :src="item.buyerAvatar" mode="aspectFit"></image>
                <text>{{item.buyerName}}</text>
              </view>
              <view class="buy">{{item.buyNum}}</view>
              <view>{{item.buyTime}}</view>
            </view>
          </view>
          <view class="hostsale-popup-tip" v-if="hotsaleList.length==20">
            仅展示最近20条
          </view>
        </scroll-view>
      </view>
    </view>
  </uv-popup>
  <!-- 底部弹窗 -->
  <uv-popup ref="showDetailPopupRef" mode="bottom" :round="20" :safe-area-inset-bottom="true"
            @close="closeDetailPopup">
    <view class="detail-popup">
      <view class="popup-header">
        <view class="popup-title">详细信息</view>
        <view class="popup-close" @click="closeDetailPopup">
          <uv-icon name="close" size="20" color="#666"></uv-icon>
        </view>
      </view>

      <view class="popup-content" v-if="selectedItem">
        <!-- 图片展示 -->
        <view class="popup-image-section" v-if="selectedItem.imgs">
          <image :src="selectedItem.imgs.replace(/[`']/g, '')" class="popup-image" mode="aspectFit"></image>
        </view>

        <!-- 标题 -->
        <view class="popup-info-section">
          <view class="popup-item-title">{{ selectedItem.title }}</view>

          <!-- 描述信息 -->
          <!-- <view class="popup-description" v-if="selectedItem.content" v-html="selectedItem.content">
          </view> -->
          <RichHtml :content="selectedItem.content" />

          <!-- 其他详细信息 -->
          <view class="popup-details">
            <view class="detail-item" v-if="selectedItem.type">
              <text class="detail-label">类型：</text>
              <text class="detail-value">{{ selectedItem.type }}</text>
            </view>
            <view class="detail-item" v-if="selectedItem.date">
              <text class="detail-label">日期：</text>
              <text class="detail-value">{{ selectedItem.date }}</text>
            </view>
            <view class="detail-item" v-if="selectedItem.originalLink"
                  style="flex-direction: column; align-items: flex-start;">
              <view class="original-link-wrapper">
                <text class="detail-label">原文链接：</text>
                <text class="detail-value link-text">{{ selectedItem.originalLink }}</text>
                <view class="copy-btn" @click="copyOriginalLink(selectedItem.originalLink)">
                  复制
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮 -->
      <view class="popup-actions">
        <view class="popup-btn" @click="closeDetailPopup">返回</view>
      </view>
    </view>
  </uv-popup>

  <!-- 保障弹窗（居中） -->
  <AssurancePopup ref="assurancePopupRef" />
</template>

<script setup>
import {ref,computed} from 'vue'
import MediaSwiper from '@/components/MediaSwiper/index.vue'
import ProductMediaSection from '@/components/ProductMediaSection/index.vue'
import DetailReply from '@/components/detail-reply/detail-reply.vue'
import ProductDetailContent from '@/components/ProductDetailContent/index.vue'
import { useRouter } from '@/hooks/useRouter'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH, HOME_IMG_PATH } from '@/utils/imgpath.js'
import {getCartAdd, getCartClear} from '@/api/cart'
import { useService } from "@/hooks/useService";
import AssurancePopup from '@/components/AssurancePopup/index.vue'
import { useMainStore } from '@/store/modules/useMainStore'
import RichHtml from '@/components/RichHtml/RichHtml.vue'
import uvSkeleton from '@/uni_modules/uv-skeleton/components/uv-skeleton/uv-skeleton.vue'
import CustomerServiceUtil from '@/utils/customerService.js';
import { formatSoldCount, formatNumber } from '@/utils/utils'
import {useShoppingCartStore} from "@/store/modules/useShoppingCart";

const props = defineProps({
  productId:{
    default: null
  },
  isLoadingMain:{
    type:Boolean,
    default: true
  },
  isLoadingDocument:{
    type: Boolean,
    default: true
  },
  documentData:{
    type: Object,
    default:{}
  },
  productList:{
    type: Array,
    default:[]
  },
  productMainImages:{
    type: Array,
    default: []
  },
  broadcasterVideo:{
    type: Array,
    default: []
  },
  formulaVideo:{
    type: Array,
    default: []
  },
  detailData:{
    type: Object,
    default: {}
  },
  hotsaleList:{
    type: Array,
    default: []
  },
  hotsalesNum:{
    type:Number,
    default: 0
  },
  hotsaleSwiper:{
    type:Array,
    default:[]
  },
  maskShows:{
    type: Boolean,
    default: false
  },
  researchStats:{
    type: Array,
    default: () => []
  },
  upgradeTitle:{
    type: String,
    default:''
  },
  upgradeContent:{
    type: String,
    default:''
  },
  detailPrice:{
    type: Number,
    default: 0
  },
  tagsBadges:{
    type: Array,
    default: []
  }
})
const emits = defineEmits(['update:maskShows', 'fullscreenchange'])
const { getServiceData, openService } = useService();
//跳转到webview
const towebView = src=>{
  push({url: '/pages/webview/index'}, {data: {src}})
}
const mainStore = useMainStore()
const { getParams, goBack, toHome, push } = useRouter()
// 初始化分享
const shoppingCartStore = useShoppingCartStore()

// 弹窗相关状态
const showDetailPopupRef = ref(null);
const showHotsalePopupRef = ref(null)
const selectedItem = ref(null);



// 初始化默认选中的规格（选择第一个规格）
// initDefaultAttr();

const goodReviewCount = ref(0)
const returningCustomerCount = ref(0)

// const fetchCommentStats = async (id) => {
// 	try {
// 		// 获取好评数量 (type: 1)
// 		const goodRes = await replyList({ id, type: 1, page: 1, limit: 1 })
// 		if (goodRes) {
// 			goodReviewCount.value = goodRes.total || 0
// 		}

// 		// 获取回头客数量 (payCount > 3)
// 		// 注意：客户端统计限制为前500条评论
// 		const allRes = await replyList({ id, type: 0, page: 1, limit: 500 })
// 		if (allRes) {
// 			const list = allRes.records || allRes.data || []
// 			const count = list.filter(item => {
// 				const pc = parseInt(item.payCount) || 0
// 				return pc > 3
// 			}).length
// 			returningCustomerCount.value = count
// 		}
// 	} catch (e) {
// 		console.error('fetchCommentStats error', e)
// 	}
// }

const goToReview = (type) => {
  uni.navigateTo({
    url: `/pages/product-review/index?id=${props.productId}`
  })
}

//显示热卖弹窗
const showHotsaleBox = ()=>{
  emits('update:maskShows', true)
  showHotsalePopupRef.value.open()
}
//关闭热卖弹窗
const closeHotsaleBox = ()=>{
  emits('update:maskShows', false)
  showHotsalePopupRef.value.close()
}
const copyOriginalLink = (link) => {
  uni.setClipboardData({
    data: link,
    success: () => {
      uni.showToast({ title: '复制成功', icon: 'success' });
    }
  });
}
const researchFindings = ref([
  '藤黄果有助于抑制食欲和减少脂肪',
  '白芸豆有助于减少碳水摄入'
])
const hasContent = (val) => {
  if (!val) return false
  const str = String(val)
  const plain = str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim()
  if (plain.length > 0) return true
  const imgs = Array.from(str.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)).map(m => m[1]).filter(Boolean)
  return imgs.length > 0
}

// 从 description4 中提取最后一张图片（用于二维码扫描）
const lastImageFromDescription4 = computed(() => {
  if (!props.detailData?.storeInfo?.description4) return ''
  const content = props.detailData.storeInfo.description4
  const imgs = Array.from(content.matchAll(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi)).map(m => m[1]).filter(Boolean)
  return imgs.length > 0 ? imgs[imgs.length - 1] : ''
})

// 获取 description4 去除最后一张图片后的内容
const description4WithoutLastImage = computed(() => {
  if (!props.detailData?.storeInfo?.description4) return ''
  let content = props.detailData.storeInfo.description4

  // 找到最后一个 img 标签并移除
  const lastImgMatch = Array.from(content.matchAll(/<img[^>]*>/gi)).pop()
  if (lastImgMatch) {
    const lastIndex = content.lastIndexOf(lastImgMatch[0])
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + content.substring(lastIndex + lastImgMatch[0].length)
    }
  }

  return content
})
const viewOpen = () => {
  // push(
  // 	{ url: '/pages/comment/list' },
  // 	{ data: { id: productId.value } }
  // )
  uni.navigateTo({ url: '/pages/product-review/index?id=' + props.productId })
}
// 保障弹窗
const assurancePopupRef = ref(null)
const openAssurancePopup = () => {
  assurancePopupRef.value?.open?.()
}
const goToService = async () => {
  await getServiceData()
  await openService()
};
const contactService = () => {
  // uni.showToast({ title: '联系客服', icon: 'none' })
  // // 可按需替换为具体客服页路由
  // handleContact()
  // goToService()
  // uni.showToast({ title: '功能未开放', icon: 'none' })
  CustomerServiceUtil.open()
}

const goStore = () => {
  // 可按需替换为具体店铺页路由
  uni.switchTab({ url: '/root/index/index' })
}

// 来自 ProductMediaSection 组件的事件监听
const onMediaTabChange = (tabName) => {
  console.log('ProductMediaSection tab 切换到:', tabName);
}

const onVideoPlay = (e) => {
  console.log('视频开始播放:', e);
}

const onVideoEnd = (e) => {
  console.log('视频播放结束:', e);
}

const onProductMediaComplete = (currentMediaTab) => {
  console.log('媒体流程完成:', currentMediaTab);
}

const buyNow = async () => {
  // 判断用户是否已登录
  if (!mainStore.user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    uni.navigateTo({
      url: '/pages/login/guid'
    });
    return;
  }

  // 检查商品数据是否加载完成
  if (props.isLoadingMain) {
    uni.showToast({
      title: '商品信息加载中，请稍候',
      icon: 'none'
    });
    return;
  }

  // 检查商品详情数据是否存在
  if (!props.detailData) {
    uni.showToast({
      title: '商品信息加载失败',
      icon: 'none'
    });
    return;
  }

  // 检查商品规格信息是否完整
  if (!props.detailData.productValue || Object.keys(props.detailData.productValue).length === 0) {
    uni.showToast({
      title: '商品规格信息加载中，请稍候',
      icon: 'none'
    });
    return;
  }
  let onSale = 1
  // 为每productValue中的SKU补充onSale字段（从 storeInfo 中复制）
  if (props.detailData && props.detailData.productValue && props.detailData.storeInfo) {
    onSale = props.detailData.storeInfo.onSale || 1; // 从 storeInfo 获取起售数量，默认为 1
    console.log('【detail.vue】被起售数量:', onSale);

    // 遍历每SKU并补充onSale
    Object.keys(props.detailData.productValue).forEach(key => {
      if (props.detailData.productValue[key] && !props.detailData.productValue[key].onSale) {
        props.detailData.productValue[key].onSale = onSale;
        console.log(`【detail.vue】为 SKU ${key} 补充onSale: ${onSale}`);
      }
    });
  }
  shoppingCartStore.activityId= 0
  shoppingCartStore.cartIds= []
  await getCartClear()
  console.log('购物车已清空')
  try {
    let specKeys = Object.keys(props.detailData.productValue)
    let cartRes = await getCartAdd({
      isNew: 1,
      cartType: 1,
      teamworkId: '',
      productId: props.productId,
      uniqueId: props.detailData.productValue[specKeys[0]].unique,
      cartNum: onSale
    })
    if (!cartRes) {
      throw new Error('添加购物车失败')
    }
    console.log('加入购物车成功', cartRes)
    // 保存购物车ID
    shoppingCartStore.cartIds.push(cartRes.cartId)
    uni.navigateTo({
      url: '/pages/orderList/orderPay'
    })
  } catch (error) {
    console.error('添加购物车失败:', error)
    uni.showToast({
      title: error.message || '添加购物车失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 代客下单
const proxyOrder = async () => {
  // 判断用户是否已登录
  if (!mainStore.user) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    uni.navigateTo({
      url: '/pages/login/guid'
    });
    return;
  }
  // 清空购物车
  try {
    await getCartClear()
    console.log('购物车已清空')
  } catch (error) {
    console.error('清空购物车失败:', error)
    // 清空失败不影响购买流程，继续执行
  }
  // 可按需替换为具体下单页路由
  uni.navigateTo({ url: `/pages/orderList/confirmOrder?data=${props.productId}` })
}

// 打开详情弹窗
const goToDetail = (item) => {
  selectedItem.value = item;
  showDetailPopupRef.value.open();
}

// 处理认证项点击
const handleCertificationClick = (item, index) => {
  if (index === 0) {
    uni.navigateTo({
      url: `/pages/testing-result/index?id=${props.productId}`
    });
  } else {
    goToDetail(item);
  }
}

// 关闭弹窗
const closeDetailPopup = () => {
  showDetailPopupRef.value.close();
  selectedItem.value = null;
}

// 过滤有效的标签（只显示有 tagName 的标签）
function getValidTags(tags) {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.filter(tag => typeof tag === 'string' || tag.tagName);
}

const copyProductTitle = () => {
  const title = props.detailData?.storeInfo?.productTitle || '';
  if (title) {
    uni.setClipboardData({
      data: title,
      success: () => {
        uni.showToast({
          title: '复制成功',
          icon: 'none'
        });
      }
    });
  }
};

const copyDescription = () => {
  const storeInfo = props.detailData?.storeInfo;
  if (storeInfo) {
    const description = (storeInfo.storeInfo || '') + (storeInfo.storeInfo2 || '');
    if (description) {
      uni.setClipboardData({
        data: description,
        success: () => {
          uni.showToast({
            title: '复制成功',
            icon: 'none'
          });
        }
      });
    }
  }
};

const copyProductName = () => {
  const storeName = props.detailData?.storeInfo?.storeName || '';
  if (storeName) {
    uni.setClipboardData({
      data: storeName,
      success: () => {
        uni.showToast({
          title: '复制成功',
          icon: 'none'
        });
      }
    });
  }
};
// 计算是否应该显示相关研究模块
const shouldShowResearchSection = computed(() => {
  // 检查 literatureImg 中的三个字段是否都为 null 或 0
  const literatureImg = props.documentData?.literatureImg
  if (!literatureImg) return true // 如果没有 literatureImg 数据，保持原有逻辑
  const ageLimit = literatureImg.ageLimit
  const cliniPaper = literatureImg.cliniPaper
  const metaPaper = literatureImg.metaPaper
  // 如果三个字段都是 null 或 0，则不显示
  const allEmpty = (!ageLimit || ageLimit === 0) &&
      (!cliniPaper || cliniPaper === 0) &&
      (!metaPaper || metaPaper === 0)

  return !allEmpty
})
</script>

<style lang="scss" scoped>
.product-detail {
  width: 100%;
  min-height: 100vh;
  background: $uni-bg-color;
  position: relative;
  padding-bottom: 80rpx;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 骨架屏样式 */
.main-skeleton {
  width: 100%;
  background: #fff;
}

/* 淡入动画 */
.fade-in {
  animation: fadeIn 0.3s ease-in;
  .gap{
    width:100%;
    height: 24rpx;
    background-color: #F8F9FA;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 主要内容包装器 */
.main-content-wrapper {
  opacity: 0;

  &.fade-in {
    opacity: 1;
  }
}

.header-right {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50px;
  padding: 16rpx 26rpx;
  border: 1px solid rgba(151, 151, 151, 0.2);

  .icon-more {
    width: 37rpx;
    height: 13rpx;
    background-color: #000;
    border-radius: 2rpx;
  }

  .divider {
    width: 1rpx;
    height: 37rpx;
    background-color: rgba(0, 0, 0, 0.2);
    margin: 0 23rpx;
  }

  .icon-search {
    width: 34rpx;
    height: 34rpx;
  }
}

/* 主要内容区域 */
.main-content {
  width: 100%;
  position: relative;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* 內容區域樣式 */
.content-section {
  padding: 15rpx 30rpx 30rpx 30rpx;
  /* 为悬浮底栏预留空间 */
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

/* 產品信息區域 */
.product-info {
}

.product-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 38rpx;
  margin-top: 22rpx;
}
.product-title{
  position: relative;
}
.product-name {
  position: relative;
  font-size: 34rpx;
  font-weight: 400;
  color: $uni-text-color;
  line-height: 1.4;
  // text-indent: 113rpx;
  &:after{
    position: absolute;
    content: ' ';
    top:6rpx;
    left:0;
    width: 103rpx;
    height: 35rpx;
    background: url("/static/images/quanqg.png") no-repeat center;
    background-size:100% 100%;
  }
  .product-name-text{
    text-indent: 113rpx;
  }
}

.product-price {
  font-size: 36rpx;
  color: $uni-text-color;
  white-space: nowrap;
  display: flex;
  align-items: baseline;
  .rmb{
    font-size: 30rpx;
  }
  .price-text{
    font-weight: 600;
    font-size: 44rpx;
  }
  .unit{
    font-size: 30rpx;
  }
}

.product-usage {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 15rpx;
  text-align: right;
}

.usage-badge {
  display: inline-block;
  background: #00CBCC;
  color: #fff;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  flex-shrink: 0;
  white-space: nowrap;
}

.usage-subTitle {
  font-size: 26rpx;
  color: $uni-text-color-grey;
  text-align: left;
}

.sales-info-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sales-info {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
}

.feature-badges {
  display: flex;
  gap: 15rpx;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.badge {
  // background: #87CEEB;
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.badge-0 {
  background: #00CBCC;
}

.badge-1 {
  background: #0FBCF4;
}

/* 產品描述區域 */
.product-description {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
}

.description-text {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  line-height: 1.6;
}

/* 保障信息區域 */
.guarantee-section {
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15rpx;
}

.guarantee-item1 {
  display: flex;
  font-size: 26rpx;
  font-weight: 400;
  color: #7D7D7D;
  white-space: nowrap;
  gap: 13rpx;
}

.guarantee-item {
  font-size: 26rpx;
  font-weight: 400;
  color: #7D7D7D;
  white-space: nowrap;

  &.primary {
    color: $uv-success;
    font-weight: 600;
  }
}

.tag-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 17rpx;
  margin-top: 22rpx;
  margin-bottom: 32rpx;
}

.tag-item {
  font-size: 24rpx;
  color: #999999;
  border: 1px solid #999999;
  padding: 6rpx 8rpx;
  border-radius: 6rpx;
  background-color: #FFFFFF;
}

.guarantee-icon {
  width: 32rpx;
  height: 32rpx;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  margin-right: 5rpx;
}

.guarantee-divider {
  color: $uni-text-color-grey;
  font-size: 24rpx;
}
// 热销最近购买模块
.hot-box{
  .gap{
    width:100%;
    height: 24rpx;
    background-color: #F8F9FA;
  }
  .hot-box-title{
    display: flex;
    align-items: center;
    height: 35rpx;
    line-height: 35rpx;
    padding: 30rpx;
    font-size: 34rpx;
    .title{
      flex: 1;
      font-weight: bold;
      text{
        display: inline-block;
        width:155rpx;
        text-align: center;
      }
    }
    .title-more{
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #636363;
      text{
        margin-right: 8rpx;
      }
    }
  }
  .hot-box-swiper{
    padding: 0 30rpx 30rpx 30rpx;
    swiper{
      height: 134rpx;
      swiper-item{
        height:164rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        .swiper-item{
          height: 67rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 26rpx;
          image{
            width: 56rpx;
            height: 56rpx;
            border-radius: 50%;
            margin-right: 9rpx;
          }
          .hot-box-name{
            flex: 1;
            color: #333;
          }
          text{
            color: #7F7F7F;
          }
          .hot-box-buy{
            width: 145rpx;
            height: 50rpx;
            line-height: 50rpx;
            border-radius: 25rpx;
            text-align: center;
            background-color: #00CBCC;
            margin-left: 27rpx;
            color: #fff;
          }
        }
      }
    }
  }
}

//公众号文章模块
.official-account{
  .gap{
    width:100%;
    height: 24rpx;
    background-color: #F8F9FA;
  }
  .official-account-title{
    height: 35rpx;
    line-height: 35rpx;
    padding: 30rpx 28rpx;
    font-size: 34rpx;
    font-weight: bold;
  }
  .official-account-content{
    padding: 14rpx 32rpx 30rpx 32rpx;
    .scroll-box{
      max-height: 370rpx;
      .scroll-box-item{
        margin-bottom: 10rpx;
        height: 152rpx;
        border-radius: 18rpx;
        overflow: hidden;
        display: flex;
        .img-box{
          width: 152rpx;
          height: 152rpx;
          background-color: #D9D9D9;
          image{
            width: 152rpx;
            height: 152rpx;
          }
        }
        .article-right{
          flex: 1;
          height: 152rpx;
          padding: 22rpx 0 22rpx 18rpx;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: #F7F7F7;
          .article-right-title{
            font-size: 28rpx;
            color: #000;
            font-weight: bold;
            width: 515rpx;
            white-space: nowrap; /* 禁止换行 */
            overflow: hidden; /* 隐藏溢出内容 */
            text-overflow: ellipsis; /* 显示省略号 */
          }
          .article-right-author{
            display: flex;
            align-items: center;
            font-size: 26rpx;
            color: #565656;
            image{
              width: 45.6rpx;
              height: 45.6rpx;
              border-radius: 50%;
            }
            .article-right-author-right{
              flex: 1;
              display:flex;
              justify-content: space-between;
              text{
                width: 215rpx;
                margin: 0 8rpx;
                white-space: nowrap; /* 禁止换行 */
                overflow: hidden; /* 隐藏溢出内容 */
                text-overflow: ellipsis; /* 显示省略号 */
              }
              view{
                width: 215rpx;
                text-align: right;
                margin-right: 25rpx;
                white-space: nowrap; /* 禁止换行 */
                overflow: hidden; /* 隐藏溢出内容 */
                text-overflow: ellipsis;
              }
            }
          }
        }
      }
    }
  }
}

/* 商品评价区域 */
.comment-section {
  padding: 30rpx 0;

  .comment-section-empty {
    font-size: 28rpx;
    color: #999999;
    line-height: 56rpx;
    text-align: center;
    padding: 0 30rpx;
  }

  .comment-section-header {
    padding: 0 30rpx;
    @include flex-align(space-between, center);

    .comment-section-title {
      font-weight: 700;
      font-size: 34rpx;
      color: #333333;
      line-height: 56rpx;
    }

    .comment-section-more {
      @include flex-align(flex-start, center);
      gap: 8rpx;

      .comment-section-more-text {
        font-size: 28rpx;
        color: #00CBCC;
        line-height: 56rpx;
      }
    }
  }

  .comment-section-swiper {
    margin-top: 35rpx;
    width: 100%;
    height: 140rpx;
    box-sizing: border-box;

    .comment-section-swiper-item {
      width: 100%;
      height: 100%;
      padding: 0 30rpx;
      box-sizing: border-box;
    }
  }
}


/* 產品檢測及認證區域 */
.certification-section {
  padding: 40rpx 30rpx;
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.product-certification-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $uni-text-color;
  margin-bottom: 30rpx;
}

.product-certification {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.certification-item {
  position: relative;
  height: 200rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.certification-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.certification-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.certification-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-end;
}

.certification-overlay .certification-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: 600;
  padding: 20rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
}

.detail-content {
  box-sizing: border-box;
  word-break: break-word;
  text-align: center;
}

.detail-content image,
.detail-content img {
  display: block;
  /* 去除底部空隙并可居中 */
  margin: 0 auto;
  /* 居中 */
  max-width: 100%;
  /* 不超出父容器 */
  height: auto;
  /* 按比例缩放 */
  object-fit: contain;
  /* 保持内容完整显示 */
  box-sizing: border-box;
}


/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  z-index: 100;
  box-sizing: border-box;
  overflow-x: hidden;
  max-width: 100vw;
}

.bb-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  flex: 0 0 auto;
}

.bb-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  flex: 1;

  &:not(.has-proxy) {
    .bb-btn {
      max-width: 500rpx;
    }
  }
}

.bb-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8rpx;
  color: $uni-text-color-grey;
  text-align: center;
  width: 60rpx;
}

button.bb-icon {
  background-color: transparent;
  border: none;
  padding: 0;
  margin: 0;
  line-height: normal;

  &::after {
    border: none;
  }
}

.bb-label {
  font-size: 22rpx;
  color: #656565;
  text-align: center;
}

.icon-image {
  width: 36rpx;
  height: 36rpx;
}

.bb-btn {
  flex: 1;
  border-radius: 60rpx;
  height: 74rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  /* 重置button默认样式 */
  padding: 0;
  margin: 0;
  font-size: 28rpx;
  font-weight: 700;

  /* 去除button默认边框 */
  &::after {
    border: none;
  }

  &.primary {
    background: #00CBCC;
    border: none !important;
    color: #fff;

    &.disabled {
      background: #ccc;
      opacity: 0.6;
    }
  }

  &.secondary {
    background: #fff;
    border: 2rpx solid #00CBCC;
    color: #00CBCC;

    .bb-btn-text {
      color: #00CBCC;
    }
  }
}

.bb-btn-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1;
  display: block;
  text-align: center;
}

/* 相关研究模块 */
.research-section,
.literature-section,
.literature-img-section {
  padding: 40rpx 30rpx;
  background: #fff;
  margin-bottom: 20rpx;
  box-sizing: border-box;
  max-width: 100%;
  overflow-x: hidden;
}

.research-section-xq {
  padding: 40rpx 0;
  background: #fff;
  margin-bottom: 20rpx;
}
.research-section-sj {
  padding: 40rpx 0;
  background: #fff;
  margin-bottom: 20rpx;
}

/* 文献列表样式 */
.literature-list {
  background: #fff;
  border-radius: 16rpx;
}

.literature-item {
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.literature-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.literature-header {
  margin-bottom: 16rpx;
}

.literature-title {
  font-size: 30rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: 8rpx;
}

.literature-subtitle {
  font-size: 26rpx;
  color: $uni-text-color-grey;
}

/* 文献图片信息样式 */
.literature-img-container {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.img-info-item {
  background: #F7F8FA;
  border-radius: 16rpx;
  padding: 20rpx;
}

.img-info-label {
  font-size: 28rpx;
  font-weight: 500;
  color: $uni-text-color;
  margin-bottom: 16rpx;
}

.info-image {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  object-fit: contain;
}

.research-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $uni-text-color;
  margin-bottom: 30rpx;
}

.research-title-xq {
  font-size: 36rpx;
  font-weight: 700;
  color: $uni-text-color;
  padding-left: 30rpx;
  padding-bottom: 30rpx;
  background-color: #fff;
}

.research-title-sj {
  font-size: 36rpx;
  font-weight: 700;
  height: 144rpx;
  line-height: 144rpx;
  color: $uni-text-color;
  padding-left: 24rpx;
  background-color: #fff;
}

.research-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  margin-bottom: 20rpx;
  box-sizing: border-box;
  width: 100%;
}

.research-card {
  background: #F7F8FA;
  border-radius: 24rpx;
  padding: 30rpx 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.rc-icon {
  width: 72rpx;
  height: 72rpx;
  margin: 0 auto 16rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #EFF6FF, #F1F5F9);
}

/* 简单的图标色块变化 */
.icon-search {
  background: linear-gradient(135deg, #E6F7FF, #F1F5F9);
}

.icon-microscope {
  background: linear-gradient(135deg, #E8FFF3, #F1F5F9);
}

.icon-chart {
  background: linear-gradient(135deg, #FFF0E6, #F1F5F9);
}

.rc-label {
  font-size: 24rpx;
  color: $uni-text-color-grey;
  margin-bottom: 8rpx;
}

.rc-value {
  font-size: 28rpx;
  font-weight: 700;
  color: $uni-text-color;
}

.research-list {
  background: #fff;
  border-radius: 24rpx;
  padding: 10rpx 0;
}

.research-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 10rpx 20rpx 0;
  margin: 0 10rpx;
  border-bottom: 1rpx solid rgb(0, 0, 0, 0.4);
}

// .research-item:last-child {
// 	border-bottom: none;
// }

.bullet {
  width: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: $uni-text-color;
}

.ri-text {
  flex: 1;
  font-size: 28rpx;
  color: $uni-text-color;
}

.ri-arrow {
  width: 40rpx;
  text-align: center;
  font-size: 32rpx;
  color: #00CBCC;
}

// 购买记录弹窗样式
.hotsale-popup{
  background-color: #fff;
  font-size: 26rpx;
  border-radius: 30rpx 30rpx 0 0;
  .hotsale-popup-title{
    height: 92rpx;
    line-height: 92rpx;
    text-align: center;
    font-weight: bold;
    position: relative;
    font-size: 32rpx;
    .icon-close{
      position: absolute;
      right: 40rpx;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .hotsale-popup-content{
    background-color: #F8F9FA;
    padding: 26rpx 30rpx 12rpx 30rpx;
    font-size: 26rpx;
    .hotsale-popup-th{
      height: 76rpx;
      background-color: #F2F8F8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: 18rpx 18rpx 0 0;
      color: #000;
      font-weight: bold;
      padding: 0 34rpx 0 52rpx;
    }
    .hotsale-popup-scroll{
      height: 60vh;
      background-color: #fff;
      color: #646464;
      border-radius: 0 0 18rpx 18rpx;
      -webkit-overflow-scrolling: auto !important; /* iOS 关键属性 */
      overscroll-behavior: none !important;        /* 现代浏览器 */
      scroll-behavior: auto !important;
      .hotsale-popup-td-box{
        .hotsale-popup-td{
          height: 76rpx;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 19rpx 0 20rpx;
          view{
            display: flex;
            align-items: center;
            height: 76rpx;
            &.buy{
              flex: 1;
            }
            &.hotsale-popup-person{
              text{
                display: inline-block;
                width: 265rpx;
              }
              image{
                width: 46rpx;
                height: 46rpx;
                border-radius: 50%;
                margin-right: 15rpx;
              }
            }
          }
        }
      }
      .hostsale-popup-tip{
        background-color: #F8F9FA;
        text-align: center;
        height: 32rpx;
        line-height: 32rpx;
        color: #646464;
        padding-top: 32rpx;
      }
    }
  }
}

/* 弹窗样式 */
.detail-popup {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* 原文链接样式 */
.original-link-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 12rpx;
}

.link-text {
  flex: 1;
  word-break: break-all;
  color: #666;
  font-size: 26rpx;
  margin-right: 16rpx;
  line-height: 40rpx;
}

.copy-btn {
  padding: 6rpx 24rpx;
  background-color: #fff;
  color: #07c160;
  font-size: 24rpx;
  border-radius: 0;
  border: 1rpx solid #07c160;
  white-space: nowrap;
}

.copy-btn:active {
  background-color: #f5f5f5;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $uni-text-color;
}

.popup-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
}

.popup-content {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.popup-image-section {
  margin-bottom: 30rpx;
  text-align: center;
}

.popup-image {
  width: 100%;
  max-height: 400rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.popup-info-section {
  margin-bottom: 30rpx;
}

.popup-item-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: 20rpx;
  line-height: 1.4;
}

.popup-description {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  line-height: 1.6;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;

  :deep(img) {
    max-width: 100% !important;
    height: auto !important;
    display: block;
    margin: 10rpx auto;
    border-radius: 8rpx;
  }
}

.popup-details {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: $uni-text-color-grey;
  flex-shrink: 0;
}

.detail-value {
  font-size: 28rpx;
  color: $uni-text-color;
  flex: 1;
  // 超出部分省略号
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.popup-actions {
  padding: 20rpx 30rpx 30rpx;
  border-top: 1rpx solid #eee;
}

.popup-btn {
  display: block;
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  background-color: #00CBCC;
  border-radius: 40rpx;
}
.split-bar {
  height: 24rpx;
  background-color: #F8F9FA;
}
</style>
