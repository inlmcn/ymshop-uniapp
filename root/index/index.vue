<template>
  <view class="container">
    <!-- 总骨架屏 -->
    <template v-if="isLoading">
      <view class="page-skeleton">
        <uv-skeleton :loading="isLoading" :rows="10" :rowsHeight="100" :animate="true"></uv-skeleton>
      </view>
    </template>
    <template v-else>
      <!-- 新品轮播 -->
      <view class="new-products">
        <template v-if="bannerLoading">
          <uv-skeleton :loading="bannerLoading" :rows="3" :rowsHeight="200" title
                       :animate="true"></uv-skeleton>
        </template>
        <template v-else>
          <swiper class="swiper" indicator-dots="true"
                  autoplay circular :interval="2000">
            <swiper-item v-for="(item, index) in newProductList" :key="index">
              <view class="swiper-item">
                <image :src="item.image" mode="aspectFill" class="product-image"
                       @click="goToProductDetail(item)">
                </image>
              </view>
              <view class="pc-subtitle uv-line-2">{{ item.storeName }}</view>
            </swiper-item>
          </swiper>
        </template>
      </view>
      <!-- 品牌保障区域 -->
      <view class="assurance-section">
        <view class="assurance-header" @click="toNewsDetail(24)">
          <text class="assurance-title">HC营养严选：严选有专利/临床原料的营养补剂</text>
          <image :src="INDEX_IMG_PATH + 'angle-right.png'" mode="widthFix" class="arrow-icon"></image>
        </view>
        <view class="assurance-grid">
          <view class="assurance-item" @click="toSelective(1)">
            <image :src="INDEX_IMG_PATH + 'kexue.png'" mode="widthFix" class="assurance-icon"></image>
            <text class="assurance-text">科学循证</text>
          </view>
          <view class="assurance-item" @click="toSelective(2)">
            <image :src="INDEX_IMG_PATH + 'yanxuan.png'" mode="widthFix" class="assurance-icon"></image>
            <text class="assurance-text">严选原料</text>
          </view>
          <view class="assurance-item" @click="toSelective(3)">
            <image :src="INDEX_IMG_PATH + 'peifang.png'" mode="widthFix" class="assurance-icon"></image>
            <text class="assurance-text">有效配方</text>
          </view>
          <view class="assurance-item" @click="toSelective(4)">
            <view class="icon-wrapper">
              <image :src="INDEX_IMG_PATH + 'jiance.png'" mode="widthFix" class="assurance-icon"></image>
              <view class="badge"
                    :style="{ backgroundImage: 'url(' + INDEX_IMG_PATH + 'badge.png' + ')', backgroundSize: '100% 100%',backgroundRepeat: 'no-repeat' }"
                    v-if="multipleTotal">{{ multipleTotal > 99 ? '99+' : multipleTotal }}</view>
            </view>
            <text class="assurance-text">全面检测</text>
          </view>
        </view>
      </view>

      <!-- 热卖产品 -->
      <view class="hot-products">
        <view class="section-header">
          <text class="section-title">热卖产品</text>
          <view class="see-all" @click="toProduct">
            <text>查看全部</text>
            <image :src="INDEX_IMG_PATH + 'angle-right1.png'" mode="heightFix"></image>
          </view>
        </view>
        <template v-if="hotProductsLoading">
          <view class="skeleton-container">
            <uv-skeleton :loading="hotProductsLoading" :rows="2" :rowsWidth="['100%', '100%']"
                         :rowsHeight="200" :animate="true"></uv-skeleton>
          </view>
        </template>
        <template v-else>
          <rtScrollx :rows="2" :styleType="2" :lL="hotProducts.length" :is_scroll="true">
            <view class="product-cardh" v-for="(item, index) in hotProducts" :key="index"
                  @click="toGoodsDetail(item.id)">
              <view class="pc-top-section">
                <view class="pc-title">{{ item.productName.slice(0, 4) }}</view>
                <view class="pc-image">
                  <image v-if="!item.productBadge" :src="item.image" mode="aspectFit" />
                </view>
              </view>
              <view class="pc-tags-wrapper">
                <!-- First row: up to 2 tags -->
                <view class="pc-tags-row">
                  <view class="pc-tag"
                        v-for="(tag, tagIndex) in getValidTags(item.productTagNameList).slice(0, 3)"
                        :key="'r1-' + tagIndex" :style="{
											color: tag.fontColor || '#FFFFFF',
											backgroundColor: tag.bgColor || '#00CBCC',
											borderColor: tag.borderColor || '#00CBCC'
										}">
                    {{ typeof tag === 'string' ? tag : tag.tagName }}
                  </view>
                </view>
              </view>
              <view class="pc-subtitle uv-line-2">{{ item.storeName }}</view>
              <view class="pc-price-row">
                <view class="pc-price">￥{{ item.price }}/月</view>
                <view class="pc-status">{{ formatSoldCount(item.sales) }}</view>
              </view>
              <image v-if="item.productBadge" class="pc-badge" :src="item.productBadge" mode="aspectFit"></image>
            </view>
          </rtScrollx>
        </template>
      </view>


      <!-- 健康测评组合区域 -->
      <view class="assessment-combo-section">
        <!-- 左侧：健康报告 -->
        <!-- <view class="assessment-card" @click="startAssessment">
          <view class="ac-title">免费获取健康报告</view>
          <view class="ac-subtitle">已有{{ assessmentCount }}人参与测评</view>
          <image :src="INDEX_IMG_PATH + 'ggiff.gif'" mode="widthFix" class="ac-phone-img"></image>
        </view> -->
        <view class="assessment-card" @click="startAssessment">
          <!-- GIF 背景 -->
          <image class="ac-bg" :src="INDEX_IMG_PATH + 'ggiff.gif'" mode="aspectFill" />

          <!-- 文字内容 -->
          <view class="ac-title">免费获取健康报告</view>
          <view class="ac-subtitle">已有<text style="color: red;font-weight: 600;">{{ assessmentCount
            }}</text>人参与测评</view>
        </view>


        <!-- 右侧组合 -->
        <view class="right-combo">
          <!-- 健康伙伴 -->
          <view class="partner-card" @click="contactService">
            <image :src="INDEX_IMG_PATH + 'partner-card.png'" mode="widthFix"
                   style="width: 100%; display: block;">
            </image>
          </view>

          <!-- 优惠券 -->
          <view class="coupon-card" @click="getCoupon">
            <image :src="INDEX_IMG_PATH + 'coupon-card-new.png'" mode="widthFix"
                   style="width: 100%; display: block;">
            </image>
          </view>
        </view>
      </view>
      <!-- 品牌动态 -->
      <view class="brand-news">
        <view class="section-header">
          <text class="section-title">品牌动态</text>
        </view>

        <template v-if="newsLoading">
          <view class="news-skeleton">
            <uv-skeleton :loading="newsLoading" :rows="1" :rowsWidth="['100%']" :rowsHeight="300"
                         :animate="true"></uv-skeleton>
          </view>
        </template>
        <template v-else>
          <view class="news-slider">
            <swiper class="news-swiper" autoplay circular :interval="3000" :duration="500">
              <swiper-item v-for="(news, index) in brandNoticeList" :key="index">
                <view class="news-item" @click="toNewsDetail(news.id)">
                  <image :src="news.picUrl" mode="aspectFill" class="news-img"></image>
                  <view class="news-overlay">
                    <text class="news-title">{{ news.title }}</text>
                    <text class="news-subtitle">查看详情</text>
                  </view>
                </view>
              </swiper-item>
            </swiper>
          </view>
        </template>
      </view>
      <!-- 用户评价 -->
      <view class="user-reviews">
        <view class="section-header">
          <text class="section-title">用户评价</text>
        </view>

        <view class="review-tabs">
          <view class="tabs-container">
            <view class="tabs-wrapper" :class="{ 'tabs-expanded': showAllTabs }">
              <view class="tab" v-for="tab in displayedTabs" :key="tab.type"
                    :class="{ active: activeReviewType === tab.type }" @click="onSelectReviewTab(tab)">
                {{ tab.label }}
              </view>
            </view>
            <view class="tab more" v-if="isTabsOverflow" @click.stop="toggleMoreTabs">
              <image :src="INDEX_IMG_PATH + 'angle.png'" mode="widthFix"
                     style="width: 21rpx;height: 21rpx;"
                     :style="{ transform: showAllTabs ? 'rotate(180deg)' : 'rotate(0deg)' }">
              </image>
            </view>
          </view>
        </view>

        <template v-if="reviewsLoading">
          <view class="review-skeleton">
            <uv-skeleton :loading="reviewsLoading" :rows="2" avatar :rowsWidth="['100%', '100%']"
                         :rowsHeight="120" :animate="true"></uv-skeleton>
          </view>
        </template>
        <template v-else>
          <view class="reviews-slider">
            <wangScrollx ref="reviewCarousel" :data="userReviews" field="avatar" mode="single"
                         @selection="selection" @activeIndexChange="onActiveIndexChange">
              <template #default="{ item }">
                <view class="review-card">
                  <view class="user-info">
                    <image class="user-avatar" :src="item.picture ? item.picture : item.avatar"
                           mode="aspectFill"></image>
                    <view class="user-details">
                      <view class="user-name">{{ item.replyName ? item.replyName : item.nickname
                        }}
                      </view>
                      <view class="user-meta">{{ item.replySex ? item.replySex : item.gender ==
                      0 ? '女' : '男' }} | {{ item.replyAge
                          ? item.replyAge : `${item.age || 0}岁` }}| {{ item.idName }}
                      </view>
                    </view>
                  </view>
                  <view class="user-tags">
                    <text class="tag" v-for="tag in item.replyTagList" :key="tag">{{ tag }}</text>
                  </view>
                  <view class="review-content">{{ item.comment }}</view>
                  <view class="buy-same"
                        @click.stop.prevent="toGoodsDetail(item.productId || item.id)">购买同款
                    {{ item.storeProduct?.storeName }}
                    →</view>
                </view>
              </template>
            </wangScrollx>
          </view>

          <!-- 指示点 - 一条线上的滑块 -->
          <view class="review-dots" v-if="userReviews.length > 1" @click="handleDotsClick">
            <view class="dots-track">
              <view class="dots-slider" :style="{ left: sliderPosition + '%' }">
              </view>
            </view>
          </view>
        </template>
      </view>
      <!-- 关注区域 -->
      <view class="follow-section">
        <view class="follow-header">
          <text class="follow-title">关注营养严选</text>
          <text class="follow-subtitle">探索专属你的健康之道</text>
        </view>

        <template v-if="followLoading">
          <view class="follow-skeleton">
            <uv-skeleton :loading="followLoading" :rows="2" :rowsWidth="['100%', '100%']" :rowsHeight="150"
                         :animate="true"></uv-skeleton>
          </view>
        </template>
        <template v-else>
          <view class="feature-cards">
            <view class="feature-card" v-for="(feature, index) in scienceNoticeList" :key="index"
                  @click="toNewsDetail(feature.id)">
              <image :src="feature.picUrl" mode="aspectFill" class="feature-img"></image>
              <view class="feature-overlay">
                <view class="feature-info">
                  <text class="feature-title">{{ feature.title }}</text>
                  <text class="feature-desc">{{ feature.remark }}</text>
                </view>
                <!-- <text class="learn-more">了解更多＞</text> -->
              </view>
            </view>
          </view>

          <view class="follow-channels">
            <view class="channel" v-for="(channel, index) in followChannels" :key="index"
                  @tap="handleChannelClick(index)">
              <image :src="channel.icon" :class="['channel-icon', 'icon-' + index]"></image>
              <text class="channel-brand">HealthCoast</text>
              <text class="channel-name">{{ channel.name }}＞</text>
            </view>
          </view>
        </template>
      </view>
    </template>
    <QrcodePopup ref="qrcodePopupRef" :config="qrcodePopupConfig" @close="handlePopupClose"
                 @open="handlePopupOpen" />
    <HealthPartners ref="healthPartnersRef" mode="homePage" />


    <view v-if="showCampaign" class="campaign-overlay" @touchmove.stop.prevent>
      <view class="assurance-card">
        <view class="campaign-close-btn" @click="closeCampaign">
          <image style="width: 60rpx; height: 60rpx;" mode="widthFix" :src="COMMON_IMG_PATH + 'X.png'">
          </image>
        </view>
        <view>
          <image style="width: 100%;" mode="widthFix" :src="cpImg" @click="campaignToIn"></image>
        </view>
      </view>
    </view>
	<view class="float-placeholder" :style="{'height':floatpopupList.length*72+'rpx'}"></view>
	<view class="float-box" v-if="floatpopupList&&floatpopupList.length>0">
		<view class="float-item" v-for="(item,index) in floatpopupList" :key="item.id" @click="topathPage(item.path)">
			<view v-if="item.type!==12" class="float-close" @click.stop="floatpopupList.splice(index,1)">
				<uv-icon name="close" color="#666666" size="32rpx" />
			</view>
			<view class="float-content">
				<image :src="item.popupImage" mode="scaleToFill"></image>
			</view>
			<view class="arrow-right">
				<uv-icon name="arrow-right" color="#666666" size="32rpx" />
			</view>
		</view>
	</view>
  </view>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, onBeforeUnmount, watch, unref, toRefs } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import wangScrollx from '@/components/wangScrollx/index.vue'
import rtScrollx from '@/components/rtScrollx/index.vue'
import { INDEX_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath.js'
import { useScroll } from '@/hooks/useScroll'
import Header from "@/components/Header/index.vue";
import { getDistributorProductList, getProductHot, getCouponLinkByClId, receiveAllClId, getPopUpInfo, addPopupLogs } from "@/api/product";
import { getDictType } from "@/api/global";
import { getDictValue,getReportCorner } from "@/api/evaluation";
import { getBannerList } from "@/api/banner";
import { useRouter } from '@/hooks/useRouter'
import { replyList, replyHomeList } from '@/api/goods'
import { getNoticeListTop } from "@/api/user";
import { useShare } from "@/hooks/useShare";
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { syncProductPriceFromProductValue, formatSoldCount } from '@/utils/utils'
import uvSkeleton from '@/uni_modules/uv-skeleton/components/uv-skeleton/uv-skeleton.vue'
import QrcodePopup from '@/components/QrcodePopup/index.vue'
import { getUserReportCount } from "@/api/evaluation";
import { useMainStore } from "@/store/modules/useMainStore";
import { checkTheUser } from "@/api/auth";
import cookie from "@/utils/cookie";
import { storeToRefs } from "pinia";
import Popup from '@/components/Popup/index.vue'
import HealthPartners from '@/components/healthPartners/hit.vue'
import { getMultipleList } from '@/api/multiple.js'

// 滚动状态供 Header 使用
const { scrollTop } = useScroll()

// 初始化router
const router = useRouter()
const mainStore = useMainStore();
const { user } = toRefs(mainStore);

// 初始化分享
const { defaultShare, shareAppMessage, shareTimeline, shareH5 } = useShare()
// 设置默认分享内容
// defaultShare()

// 骨架屏加载状态
const isLoading = ref(true)
const bannerLoading = ref(true)
const hotProductsLoading = ref(true)
const reviewsLoading = ref(true)
const newsLoading = ref(true)
const followLoading = ref(true)
// 弹窗引用
const xiaohongshuPopupRef = ref()
const qrcodePopupRef = ref()
const healthPartnersRef = ref()
const qrcodePopupConfig = ref({
  title: '扫码关注小红书',
  subtitle: '@HealthCoast',
  description: '关注品牌资讯 获取最新动态',
  qrcodeImage: '',
  tipText: '长按识别二维码'
})

// 显示弹窗
const showPopup = () => {
  console.log('显示小红书弹窗')
  console.log('xiaohongshuPopupRef.value:', xiaohongshuPopupRef.value)
  if (xiaohongshuPopupRef.value) {
    console.log('调用弹窗open方法')
    xiaohongshuPopupRef.value.open()
  } else {
    console.error('xiaohongshuPopupRef.value为空')
  }
}
const getCoupon = async () => {
  uni.navigateTo({
    url: '/pages/couponShare/index'
  })
}
// 处理频道点击事件
const handleChannelClick = async (index) => {
  console.log('点击频道索引:', index)
  const channel = followChannels.value[index]
  if (channel && channel.dictKey) {
    try {
      const response = await getDictValue({
        dictType: 'mall_config_dict_type',
        label: channel.dictKey
      })
      console.log('获取二维码响应:', response)
      const qrcodeImageUrl = response?.data || response
      if (qrcodeImageUrl) {
        qrcodePopupConfig.value = {
          title: channel.title,
          subtitle: '@HealthCoast',
          description: channel.description,
          qrcodeImage: qrcodeImageUrl,
          tipText: channel.tipText
        }
        console.log('更新的qrcodePopupConfig:', qrcodePopupConfig.value)
        qrcodePopupRef.value?.open?.()
      } else {
        console.error('获取二维码为NULL')
        uni.showToast({
          title: '获取二维码失败',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('获取二维码失败:', error)
      uni.showToast({
        title: '获取二维码失败',
        icon: 'none'
      })
    }
  }
}



// 处理弹窗关闭事件
const handlePopupClose = () => {
  console.log('弹窗已关闭')
}

// 处理弹窗打开事件
const handlePopupOpen = () => {
  console.log('弹窗已打开')
}
// 模板引用
const reviewCarousel = ref(null)

// 基本状态
const currentTab = ref(0)

// 用户评价 tabs 配置与状态
const reviewTabs = ref([])

// 當前激活的標籤類型
const activeReviewType = ref(0)

// 是否顯示更多標籤（展開狀態）
const showAllTabs = ref(false)

// 計算顯示的標籤（默認顯示5個，展開後全部顯示）
const displayedTabs = computed(() => {
  return showAllTabs.value ? reviewTabs.value : reviewTabs.value.slice(0, 5)
})

// 是否顯示"更多"按鈕（當標籤超過5個時）
const isTabsOverflow = computed(() => {
  return reviewTabs.value.length > 5
})
// 是否顯示更多彈窗
const showMore = ref(false)

// 切換展開/收起
function toggleMoreTabs() {
  showAllTabs.value = !showAllTabs.value
}

const assessmentCount = ref(8888)
const currentReviewIndex = ref(0)
// 自動輪播定時器
let autoPlayTimer = null

// 計算滑塊位置（百分比）
const sliderPosition = computed(() => {
  const total = userReviews.value.length
  if (total <= 1) return 0
  // 確保索引在有效範圍內，防止越界
  const currentIndex = Math.min(currentReviewIndex.value, total - 1)
  // 計算當前索引在總數中的位置百分比
  return (currentIndex / (total - 1)) * 100
})

// 顯示的3個指示點索引（響應式數據）
const displayedDotIndexes = ref([0, 1, 2])

// 更新指示點顯示
function updateDisplayedDots() {
  if(!userReviews){
    return
  }
  const total = userReviews.value.length

  if (total === 0) {
    displayedDotIndexes.value = []
    return
  }

  // 如果數據少於等於3個，直接返回所有索引
  if (total <= 3) {
    displayedDotIndexes.value = Array.from({ length: total }, (_, i) => i)
    return
  }

  // 如果數據多於3個，顯示當前索引及其前後各一個
  const current = currentReviewIndex.value
  const prevIndex = (current - 1 + total) % total
  const nextIndex = (current + 1) % total

  // 强制创建新数组，确保响应式更新
  displayedDotIndexes.value = [prevIndex, current, nextIndex]
}

// 監聽 currentReviewIndex 變化，自動更新指示點
watch(currentReviewIndex, () => {
  updateDisplayedDots()
}, { immediate: true })

// 監聽 userReviews 變化，自動更新指示點
watch(userReviews, () => {
  updateDisplayedDots()
}, { deep: true })

const newProductList = ref([])

const hotProducts = ref([])


const userReviews = ref([])

const followChannels = ref([])

// 获取关注区域数据
const selectFollowChannels = async () => {
  try {
    followChannels.value = [
      { icon: INDEX_IMG_PATH + 'gzh.png', name: '公众号', dictKey: 'gzh_img', title: '扫码关注公众号', description: '获取健康知识 关注品牌资讯', tipText: '长按识别二维码' },
      { icon: INDEX_IMG_PATH + 'qywx.png', name: '健康伙伴', dictKey: 'qy_wx_img', title: '扫码添加专属健康伙伴', description: '保存健康报告 深度健康解析', tipText: '长按识别二维码' },
      { icon: INDEX_IMG_PATH + 'xhs.png', name: '小红书', dictKey: 'xhs_img', title: '扫码关注小红书', description: '关注品牌资讯 获取最新动态', tipText: '长按保存图片' },
    ]
  } catch (error) {
    console.error('获取关注区域数据失败:', error)
  } finally {
    followLoading.value = false
  }
}

const productHotList = ref([])

async function selectProductHot() {
  try {
    const phList = await getProductHot(30);
    console.log(phList, '111111');
    // 将productValue中第一个SKU的price赋值给父级的price
    const processedList = syncProductPriceFromProductValue(phList);
    hotProducts.value = processedList;
    // console.log("========343243333===productHotList================"+JSON.stringify(hotProducts.value));
  } catch (error) {
    console.error('获取热卖产品失败:', error)
  } finally {
    hotProductsLoading.value = false
  }
}

async function selectHomeReply(val) {
  // 更新選中的標籤索引
  activeReviewType.value = val

  let data = { type: val }
  try {
    const relpyList = await replyHomeList(data);
    userReviews.value = relpyList.records
    // console.log("========評價列表================" + JSON.stringify(userReviews.value));
    // 重置當前索引，並確保在有效範圍內
    currentReviewIndex.value = 0
    // 如果數據加載後索引超出範圍，進行修正
    if (currentReviewIndex.value >= userReviews.value.length && userReviews.value.length > 0) {
      currentReviewIndex.value = 0
    }
    // 延遲啟動自動輪播，確保DOM已更新
    nextTick(() => {
      if (userReviews.value.length > 1) {
        startAutoPlay()
      }
    })
  } catch (error) {
    console.error('获取用户评价失败:', error)
  } finally {
    reviewsLoading.value = false
  }
}

// 自動輪播到下一個數據
function nextReviewGroup() {
  const total = userReviews.value.length
  if (total <= 1) return // 如果數據少於等於1個，不需要自動輪播

  // 切換到下一個索引（循環）
  currentReviewIndex.value = (currentReviewIndex.value + 1) % total

  // 調用輪播組件切換到指定索引
  if (reviewCarousel.value && typeof reviewCarousel.value.goToSlide === 'function') {
    reviewCarousel.value.goToSlide(currentReviewIndex.value)
  }
}

// 啟動自動輪播
function startAutoPlay() {
  stopAutoPlay() // 先清除現有定時器
  if (userReviews.value.length > 1) {
    // 每5秒切換一次
    autoPlayTimer = setInterval(() => {
      nextReviewGroup()
    }, 5000)
  }
}

// 停止自動輪播
function stopAutoPlay() {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

function onSelectReviewTab(tab) {
  activeReviewType.value = tab.type
  selectHomeReply(tab.type)
}

function onMoreSelect(action) {
  showMore.value = false
  if (typeof action?.type !== 'undefined') {
    activeReviewType.value = action.type
    selectHomeReply(action.type)
  }
}

const brandNoticeList = ref([])
async function selectBrandNoticeListTop() {
  try {
    const nList = await getNoticeListTop(10, 3);
    brandNoticeList.value = nList;
  } catch (error) {
    console.error('获取品牌动态失败:', error)
  } finally {
    newsLoading.value = false
  }
}

const scienceNoticeList = ref([])
async function selectScienceNoticeListTop() {
  try {
    const nList = await getNoticeListTop(10, 4);
    scienceNoticeList.value = nList;
  } catch (error) {
    console.error('获取科学动态失败:', error)
  } finally {
    newsLoading.value = false
  }
}

/**
 * 去商品详情
 * @param productId
 */
function toGoodsDetail(productId) {
  if (!productId) {
    console.warn('商品ID为空')
    uni.showToast({
      title: '商品不存在，为您推荐其他产品',
      icon: 'none'
    })
    // 1秒后跳转
    setTimeout(() => {
      uni.switchTab({
        url: '/root/product/index'
      })
    }, 1000)
    return
  }
  console.log("======================" + productId)
  navigateToDetail(productId)
}

// 过滤有效的标签（只显示有 tagName 的标签）
function getValidTags(tags) {
  if (!tags || !Array.isArray(tags)) return [];
  return tags.filter(tag => typeof tag === 'string' || tag.tagName);
}
const navLock = ref(false)
function navigateToDetail(productId) {
  if (navLock.value) return
  navLock.value = true
  uni.navigateTo({ url: `/pages/product/detail?id=${productId}` })
  setTimeout(() => { navLock.value = false }, 600)
}


function toNewsDetail(id) {
  console.log("======================" + id)
  router.push({
    url: '/pages/webview/news'
  }, {
    data: {
      id: id
    }
  })
}

// 获取轮播图数据
const getBannerData = async () => {
  try {
    let banner = await getBannerList()
    console.log('获取到的轮播图数据:', banner)
    // 确保banner数据存在且是数组
    if (banner && Array.isArray(banner)) {
      newProductList.value = banner
    } else if (banner && banner.data && Array.isArray(banner.data)) {
      // 处理API返回的数据结构可能是 { data: [...] } 的情况
      newProductList.value = banner.data
    } else {
      console.error('获取轮播图数据格式不正确:', banner)
      newProductList.value = []
    }
  } catch (error) {
    console.error('获取轮播图数据失败:', error)
    newProductList.value = []
  } finally {
    bannerLoading.value = false
  }
}

//是否执行
const isExe = ref(0);
const issc = ref(0)
const clId = ref('')
const sceneParam = ref('')
// 页面生命周期（如需初始化逻辑可放入这里）
onLoad(async (option) => {
  const payload=mainStore.payload || {}
  option=Object.assign(option,payload)
  console.log('option==>',option)
  mainStore.payload={}
  initUser(option)
  // 初始化逻辑
  try {
    let dictType = await getDictType('YM_REPLY_TITLE')
    console.log('获取到的字典类型数据:', dictType)
    reviewTabs.value = dictType.map(item => ({
      label: item.label,
      type: item.value,
      id: item.id
    }))
    // 默认选中第一个tab
    const firstTabType = reviewTabs.value.length > 0 ? reviewTabs.value[0].type : 0
    activeReviewType.value = firstTabType

    await Promise.all([
      getBannerData(),
      selectProductHot(),
      selectHomeReply(firstTabType),
      selectBrandNoticeListTop(),
      selectScienceNoticeListTop(),
      selectFollowChannels()
    ])

    // activeReviewType.value = 0

    // 所有数据加载完成后关闭总骨架屏
    isLoading.value = false

  } catch (error) {
    console.error('页面数据加载失败:', error)
    // 即使出错也要关闭骨架屏，避免用户一直看到加载状态
    isLoading.value = false
  }

  // 渲染后检测是否溢出
  nextTick(() => {
    checkTabsOverflow()
  })

  // 监听窗口尺寸变化（H5下有效）以动态检测溢出
  if (typeof uni !== 'undefined' && typeof uni.onWindowResize === 'function') {
    uni.onWindowResize(() => {
      checkTabsOverflow()
    })
  }
})


const initUser = async (option) =>{
  let code = ''
  if (option.scene) {
    let sc = option.scene;
    sceneParam.value = option.scene;
    if (sc.startsWith('code_')) {
      issc.value = 2
      code = sc.substring(5);
    } else {
      issc.value = 1
      clId.value = sc
    }
  }
  if (option.id) {
    issc.value = 1
    clId.value = option.id
  }
  console.log(clId.value + "============options===============" + code)

  // 可以在这里进行异步操作
  var token = cookie.get('accessToken')
  console.log('是否登录==================token----', token)
  if (!token) {
    console.log('是否登录====未登陆，进行优化校验===========----')
    checkTheUserInit(code,Number(option.channelId));
  } else {
    console.log('--已登录   ----')
    if (issc.value == 2) {
      checkTheUserInit(code,Number(option.channelId));
    } else {
		//链接发券-扫码只弹一次
		if(isExe.value==0){
			getLink()
		}
    }
  }
}

const { logoSrc } = storeToRefs(mainStore);
async function checkTheUserInit(invitationCode,channelId) {
  //进行注册绑定关系操作
  wx.login({
    async success(res) {
      if (res.code) {
        console.log('微信code===========----' + res.code)
        let data = {};
        data.phoneCode = '888804';
        data.loginCode = res.code;
        data.invitationCode = invitationCode;
        data.channelId = channelId
        const loginRes = await checkTheUser(data);
        await mainStore.setAccessToken(loginRes)
        getLink()
      }
    }
  });
}

// 创建 ref
const campaignPopupRef = ref(null)
const showCampaign = ref(false)
const cpImg = ref('')

// 兼容旧调用：提供 show/close 方法
campaignPopupRef.value = {
  show() { showCampaign.value = true },
  close() { showCampaign.value = false }
}

const isFor = ref(0)
const openType = ref(0)
const popupObj = ref({})
const popupList = ref([])
const floatpopupList = ref([])
async function isPopup(tag) {
  const data = await getPopUpInfo(0);
  if(data && data.length>0){
    let ppList = data;
    popupList.value =  data.filter(item=>item.popupType==0);
	floatpopupList.value = data.filter(item=>item.popupType==1)
    if(tag==1){
      //初始一个弹窗
      popupShow(tag);
    }

    //processList(ppList);
  }
}

const popupInit = async()=>{

}

const popupShow = async()=>{
  if(popupList.value.length>0){
    popupObj.value = popupList.value[0];
    openType.value = 1;
    cpImg.value = popupObj.value.popupImage;
    campaignPopupRef.value?.show?.();
    //显示完后，删掉第一个，这样再次点关闭的时候，就是显示下一个了
    popupList.value.splice(0,1)
  }
}


//这个是3秒后，自动显示下一个 的方法
const processList = async (ppList) => {
  for (let i = 0; i < ppList.length; i++) {
    const item = ppList[i];
    if (item.isOpen == 1 && isFor.value == 0) {
      popupObj.value = item;
      openType.value = 1;
      cpImg.value = item.popupImage;
      campaignPopupRef.value?.show?.();
      // 等待 3 秒再进入下一个循环
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};


async function getLink() {
  if(issc.value !=1){
    isPopup(1)
    return
  }
  console.log("是否需要弹优惠券的弹窗：clId=" + clId.value)
  if (clId.value) {
    const data = await getCouponLinkByClId(clId.value);
    console.log("优惠卷活动信息：" + JSON.stringify(data))
    if (data.state && data.state == 1) {
      console.log("优惠卷活动信息：==============进来了==================")
      cpImg.value = data.imgs;
      campaignPopupRef.value?.show?.()
      openType.value = 0
      // setTimeout(() => {
      //   console.log('3秒后执行一次')
      // 	isPopup()
      // }, 3000)
      isPopup(0)
    }
  }
}

// 关闭活动弹窗
const closeCampaign = () => {
  showCampaign.value = false
  popupShow()
}

//悬浮窗跳转
const topathPage = (url)=>{
	if(url){
		uni.navigateTo({
		  url
		})
	}
}

//弹窗跳转
async function campaignToIn() {
  if(openType.value==1){
    console.log("==============popupObj======弹窗数据为=2222===============："+JSON.stringify(popupObj));
    if(popupObj.value){
      campaignPopupRef.value?.close?.()
      //如果点击了，则不再进行循环
      isFor.value = 1
      if(popupObj.value.path){
        isExe.value=1;
		let path = popupObj.value.path;
		if (path.startsWith("/root/")) {
			uni.switchTab({ url: popupObj.value.path})
		}else{
			uni.navigateTo({
			  url: popupObj.value.path,
			})
		}
      }
      addPopupLogs(popupObj.value.id);
    }
  } else {
    const data = await receiveAllClId(clId.value);
    if (data) {
      uni.showToast({
        title: '领取成功',
        icon: 'success'
      })
      campaignPopupRef.value?.close?.()
      // 延迟2秒后跳转
      setTimeout(() => {
        isExe.value=1;
        uni.navigateTo({
          url: '/pages/discountCoupon/index',
        })
      }, 1000)
    }
  }
}


// 检查标签页是否溢出
function checkTabsOverflow() {
  // 使用 uni.createSelectorQuery 获取标签页容器的宽度
  uni.createSelectorQuery().select('.tabs-container').boundingClientRect((containerRect) => {
    if (!containerRect) return

    uni.createSelectorQuery().selectAll('.tab').boundingClientRect((tabRects) => {
      if (!tabRects || tabRects.length === 0) return

      // 计算所有标签的总宽度
      let totalWidth = 0
      tabRects.forEach(rect => {
        totalWidth += rect.width
      })

      // 如果总宽度超过容器宽度，则显示"更多"按钮
      if (totalWidth > containerRect.width) {
        // 这里可以设置一个响应式变量来控制"更多"按钮的显示
        // 但由于 isTabsOverflow 已经是一个计算属性，它会自动判断
        console.log('标签页溢出，显示更多按钮')
      }
    }).exec()
  }).exec()
}

// 初次挂载后检测一次溢出
onMounted(() => {
  nextTick(() => {
    checkTabsOverflow()
  })
})

// 組件卸載時清理定時器
onBeforeUnmount(() => {
  stopAutoPlay()
})

function goToBannerDetail(item) {
  uni.navigateTo({
    url: `${item.linkUrl}`
  });
}
// 交互方法
function viewProductDetail(productId) {
  router.push({ url: '/pages/product/detail' }, { data: { id: productId } })
}

function isValidUrl(str) {
  return str.startsWith('http');
}

function goToProductDetail(item) {
  isExe.value=1;
  console.log('使用linkUrl跳转:', item)
  const url = item.linkUrl

  if (isValidUrl(url)) {
    router.push({ url: '/pages/webview/index' }, { data: { src: url } })
    return;
  }

  // 检查是否是tabbar页面
  const tabbarPages = [
    '/root/index/index',
    '/root/product/index',
    '/root/review/index',
    '/root/user/user'
  ]

  if (tabbarPages.includes(url)) {
    console.log('跳转到tabbar页面:', url)
    router.pushToTab({ url }).catch(error => {
      console.error('跳转到tabbar页面失败:', error)
      // 如果pushToTab失败，尝试使用uni.switchTab
      uni.switchTab({
        url,
        fail: (err) => {
          console.error('uni.switchTab也失败:', err)
          uni.showToast({
            title: '页面跳转失败',
            icon: 'none'
          })
        }
      })
    })
  } else {
    // 如果是产品详情页，需要提取产品ID并使用router.push传递参数
    if (url.includes('/pages/product/detail')) {
      // 从URL中提取产品ID
      const productId = url.match(/id=(\d+)/)?.[1]
      if (productId) {
        router.push({ url: '/pages/product/detail' }, { data: { id: productId } })
        return
      }
    }
    router.push({ url }).catch(error => {
      console.error('跳转失败:', error)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none'
      })
    })
  }
}


const multipleTotal = ref(0)
const getMultipleTotal = async () => {
  try {
    const res = await getMultipleList()
    if (res && res.length > 0) {
      // 统计res中的itemList的总数
      let total = 0
      res.forEach(item => {
        total += item.itemList.length
      })
      multipleTotal.value = total
    }
  } catch (err) {
    console.error('获取产品列表失败:', err)
  }
}

function toSelective(val) {
  if (val === 1) {
    // 科学循证
    uni.navigateTo({ url: '/pages/literature-search/index' })
  } else if (val === 2) {
    // 严选原料
    uni.navigateTo({ url: '/pages/strict-rawmaterials/index' })
  } else if (val === 3) {
    // 有效配方
    uni.navigateTo({ url: '/pages/products/index' })
  } else if (val === 4) {
    // 多重检测
    uni.navigateTo({ url: '/pages/multiple-detection/index' })
    // uni.navigateTo({ url: '/pages/testing-result/index' })
  }
}


function toProduct() {
  uni.switchTab({ url: '/root/product/index' })
}

function startAssessment() {
  uni.navigateTo({ url: '/views/evaluation/startup/index' })
}
function goToSearch() {
  uni.navigateTo({ url: '/pages/search/search' })
}
function showMenu() {
  // 菜单逻辑
}
function selection(selectedItem) {
  if (!selectedItem) {
    console.warn('选中的用户评价为空')
    return
  }
  const productId = selectedItem.productId || selectedItem.id
  console.log('111选中的用户评价:', productId)
  if (!productId) {
    console.warn('评价数据中缺少商品ID:', selectedItem)
    uni.showToast({
      title: '商品不存在，为您推荐其他产品',
      icon: 'none'
    })
    // 1秒后跳转
    setTimeout(() => {
      uni.switchTab({
        url: '/root/product/index'
      })
    }, 1000)
    return
  }
  // router.push({
  // 	url: '/pages/product/detail'
  // }, {
  // 	data: {
  // 		id: productId
  // 	}
  // })
  navigateToDetail(productId)
}

function contactService() {
  if (healthPartnersRef.value) {
    healthPartnersRef.value.open()
  }
}

function onActiveIndexChange(index) {
  currentReviewIndex.value = index
  // 用戶手動滑動時，暫停自動輪播
  stopAutoPlay()
  // 3秒後重新啟動自動輪播（給用戶足夠時間查看）
  setTimeout(() => {
    if (userReviews.value.length > 1) {
      startAutoPlay()
    }
  }, 3000)
}
function goToReview(targetIndex) {
  // 立即更新當前索引
  currentReviewIndex.value = targetIndex
  // 停止自動輪播
  stopAutoPlay()
  // 調用輪播組件切換到指定索引
  if (reviewCarousel.value && typeof reviewCarousel.value.goToSlide === 'function') {
    reviewCarousel.value.goToSlide(targetIndex)
  }
  // 3秒後重新啟動自動輪播
  setTimeout(() => {
    if (userReviews.value.length > 1) {
      startAutoPlay()
    }
  }, 3000)
}

// 處理點擊指示線
function handleDotsClick(e) {
  const total = userReviews.value.length
  if (total <= 1) return

  // 使用 uni.createSelectorQuery 獲取軌道位置
  uni.createSelectorQuery().select('.dots-track').boundingClientRect((rect) => {
    if (!rect) return

    // 獲取點擊位置（更兼容的事件坐標獲取方式）
    const clientX = e.detail?.x || e.touches?.[0]?.clientX || e.clientX
    if (!clientX) return

    // 計算點擊位置相對於軌道的百分比
    const clickX = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100))

    // 計算對應的索引
    const targetIndex = Math.round((percentage / 100) * (total - 1))
    const clampedIndex = Math.max(0, Math.min(targetIndex, total - 1))

    goToReview(clampedIndex)
  }).exec()
}


onShow(async() => {
  console.log("========isExe.value======================"+isExe.value);
  if(isExe.value==1){
    let option = {};
    option.scene = sceneParam.value;
    const payload=mainStore.payload || {}
    option=Object.assign(option,payload)
    console.log('option==>',option)
    mainStore.payload={}
    console.log("========option======================",option);
    initUser(option)
  }

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
  // 获取导航条高度
  getUserReportCount().then((res) => {
    console.log("res", res);
    assessmentCount.value = res;
  });
  getMultipleTotal();
})

// 微信小程序分享到朋友圈
onShareTimeline(() => {
  return shareTimeline();
});

// 微信小程序分享给好友
onShareAppMessage(() => {
  const invitationCode = unref(user) ? unref(user).invitationCode : "";

  if (clId.value == '216') {
    return {
      title: '立即领取100元优惠券包☟☟☟',
      imageUrl: INDEX_IMG_PATH + 'coupon_100.jpg',
      path: 'root/index/index?id=216'
    }
  }

  defaultShare(invitationCode);
  return shareAppMessage();
});
</script>

<style scoped lang="scss">
page {
  background: #F8F9FA;
}

.logo-image {
  // 靠左
  width: 388rpx;
  height: 32rpx;
}

.container {
  width: 100%;
  // min-height: 100vh;
  background: #F8F9FA;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 顶部导航栏 */
.navbar {
  padding: 40rpx 30rpx 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.search-icon {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.search-icon:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.search-icon .iconfont {
  font-size: 28rpx;
  color: #fff;
}

.menu-icon {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.menu-icon:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.menu-dot {
  width: 6rpx;
  height: 6rpx;
  background-color: #fff;
  border-radius: 50%;
}

/* 品牌宣传语 */
.brand-slogan {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 79rpx;
  margin: 24rpx 30rpx;
  padding: 0 24rpx;
  background: #EBFFFF;
  border-radius: 8px;
}

.brand-left {
  display: flex;
  align-items: center;

  image {
    width: 31rpx;
    height: 36rpx;
    margin-right: 5rpx;
  }
}

.slogan-text {
  font-size: 30rpx;
  color: rgba(0, 203, 204, 1);
  font-weight: 500;
}

.arrow-icon {
  width: 13rpx;
  height: 21rpx;
}

/* 品牌保障区域 */
.assurance-section {
  margin: -64rpx 30rpx 10rpx;
  padding: 0;
  background: #fff;
  border-radius: 20rpx;
  position: relative;
  z-index: 10;
  overflow: hidden;
}

.assurance-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  line-height: 64rpx;
  gap: 10rpx;
  background: #EBFFFF;
}

.assurance-title {
  font-size: 26rpx;
  color: #00CBCC;
  font-weight: 600;
}

.assurance-grid {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20rpx 30rpx;
}

.assurance-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.icon-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.assurance-icon {
  width: 56rpx;
  height: 56rpx;
}

.badge {
  position: absolute;
  top: -10rpx;
  right: -20rpx;
  /* background: #FF4D4F; */
  // background-image: url('/static/images/badge.png');
  // background-size: 100% 100%;
  // background-repeat: no-repeat;
  color: #fff;
  font-size: 14rpx;
  /* padding: 2rpx 8rpx; */
  /* border-radius: 10px 10px 10px 0; */
  width: 47rpx;
  height: 31rpx;
  line-height: 31rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  /* box-shadow: 0 0 2px rgba(255,77,79,0.4); */
}

.assurance-text {
  font-size: 24rpx;
  font-weight: 500;
  font-family: MiSans, MiSans;
  color: #272727;
  line-height: 50rpx;
  text-align: center;
  font-style: normal;
  text-transform: none;
}

/* 新品轮播 */
.new-products {
  margin: 0;
}

.swiper {
  width: 100%;
  height: 460rpx;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
}
:deep(.wx-swiper-dots-horizontal){
  top: 70rpx !important;
  // right: 20rpx !important;
  // transform: translate(0%) !important;
  text-align:center;
  height:0rpx;
}
:deep(.wx-swiper-dot){
  width: 15rpx;
  height: 15rpx;
}
:deep(.wx-swiper-dot-active){
  border-radius: 8rpx;
  animation: chnageswiperDot 500ms linear forwards;
}
@keyframes chnageswiperDot {
  0% { width: 15rpx;}
  100% { width: 30rpx;}
}
.swiper-item {
  position: relative;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 40rpx 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tag {
  display: inline-block;
  padding: 8rpx 20rpx;
  background: rgba(255, 255, 255, 0.95);
  color: #ff6b6b;
  font-size: 24rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  width: auto;
  font-weight: 500;
  backdrop-filter: blur(10rpx);
}

.product-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.3);
  margin-bottom: 10rpx;
}

.view-details {
  margin-top: 30rpx;
  width: auto;
  padding: 15rpx 30rpx;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 30rpx;
  font-size: 22rpx;
  border: none;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.view-details:active {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2rpx);
}

/* 热卖产品 */
.hot-products {
  margin: 20rpx 30rpx 10rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 48rpx;
  font-weight: 500;
  color: #000008;
}

.see-all {
  display: flex;
  align-items: center;
  color: #000008;
  font-size: 26rpx;
  transition: color 0.3s ease;
}

.see-all:active {
  color: #667eea;
}

.see-all image {
  width: 20rpx;
  height: 20rpx;
  margin-left: 5rpx;
}

.products-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20rpx;
}

.product-card {
  position: relative;
  background-color: #F6F6F6;
  border-radius: 24rpx;
  padding: 24rpx;
  min-height: 180rpx;
  margin: 0 12rpx 24rpx 12rpx;
  width: calc(100% - 24rpx);
  box-sizing: border-box;
  scroll-snap-align: start;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:active {
  transform: translateY(-8rpx);
  box-shadow: 0 15rpx 35rpx rgba(0, 0, 0, 0.15);
}

.product-card:active::before {
  opacity: 1;
}

.product-img {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 20rpx;
  border-radius: 15rpx;
  transition: transform 0.3s ease;
}

.product-card:active .product-img {
  transform: scale(1.1);
}

.product-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #000008;
  margin-bottom: 12rpx;
  text-align: center;
}

.tags {
  display: flex;
  margin-bottom: 15rpx;
  gap: 8rpx;
}

.tag-item {
  font-size: 26rpx;
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.2);
  font-weight: 500;
}

.product-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 20rpx;
  text-align: center;
  line-height: 1.4;
}

.price-sales {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 26rpx;
  align-items: center;
}

.price {
  color: #ff6b6b;
  font-weight: 600;
  font-size: 28rpx;
}

.sales {
  color: #999;
  font-size: 24rpx;
}

/* 健康测评组合区域 */
.assessment-combo-section {
  margin: 20rpx 30rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  /* height: 270rpx; */
}

/* 左侧：健康报告卡片 */
// .assessment-card {
// 	flex: 0.65;
// 	flex-shrink: 0;

// 	/* 移除背景和边框，使用纯图片 */
// 	background: transparent;
// 	border-radius: 0;
// 	padding: 0;
// 	display: block;
// 	position: relative;
// 	overflow: visible;
// }

// .ac-title {
// 	position: absolute;
// 	top: 30rpx;
// 	left: 30rpx;
// 	font-size: 30rpx;
// 	font-weight: 600;
// 	color: #00CBCC;
// }

// .ac-subtitle {
// 	position: absolute;
// 	top: 80rpx;
// 	left: 30rpx;
// 	font-size: 26rpx;
// 	font-weight: 600;
// 	color: #00CBCC;
// }
.assessment-card {
  flex: 0.65;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border-radius: 16rpx;
}

/* GIF 背景 */
.ac-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 标题 */
.ac-title {
  position: absolute;
  top: 30rpx;
  left: 30rpx;
  font-size: 26rpx;
  font-weight: 600;
  color: #004974;
  z-index: 2;
}

/* 副标题 */
.ac-subtitle {
  position: absolute;
  top: 75rpx;
  left: 30rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: #004974;
  z-index: 2;
}



/* 右侧组合 */
.right-combo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 通用右侧卡片 */
.partner-card,
.coupon-card {
  /* 移除 flex: 1，让图片自然撑开 */
  width: 100%;
  display: block;
  /* 移除默认圆角和溢出隐藏，因为切图可能自带 */
  border-radius: 0;
  background: transparent;
  border: none;
  padding: 0;
}


/* 角标通用样式 */
.corner-tag {
  position: absolute;
  top: 16rpx;
  right: -34rpx;
  width: 120rpx;
  text-align: center;
  font-size: 18rpx;
  color: #fff;
  transform: rotate(45deg);
  padding: 4rpx 0;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.corner-tag.green {
  background: #A6E6D6;
}

.corner-tag.gold {
  background: #EEDC9A;
}


/* 用户评价 */
.user-reviews {
  margin: 30rpx;
}

.review-tabs {
  width: 100%;
  padding-bottom: 15rpx;
  margin-bottom: 25rpx;
  overflow: visible;
}

.tabs-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 12rpx;
}

.tabs-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex: 1;
  gap: 12rpx;
  min-width: 0;
}

/* 展開狀態下允許換行 */
.tabs-wrapper.tabs-expanded {
  flex-wrap: wrap;
}

.tab {
  padding: 12rpx 24rpx;
  background: #E8FFFF;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #00CBCC;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.3s ease;
  cursor: pointer;
}

.tab.active {
  background: #00CBCC;
  color: #fff;
}

.tab.more {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent !important;
  flex-shrink: 0;
  flex-wrap: nowrap;
  position: relative;
  top: 0;
}

.tab.more image {
  width: 30rpx;
  height: 30rpx;
  transition: transform 0.3s ease;
}

.reviews-slider {
  margin-top: 30rpx;
  position: relative;
}

/* 指示点样式 - 一条线上的滑块 */
.review-dots {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  padding: 20rpx;
  position: relative;
  cursor: pointer;
}

.dots-track {
  width: 80rpx;
  height: 6rpx;
  background-color: #E8E8E8;
  border-radius: 3rpx;
  position: relative;
}

.dots-slider {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 30rpx;
  height: 6rpx;
  background-color: #000000;
  border-radius: 3rpx;
  transition: left 0.3s ease;
  z-index: 2;
}

/* 评价卡片样式 */
.review-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.8);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 360rpx;
  width: 505rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  // scale: 0.8;
  // transform-origin: center center;
}

.review-card:active {
  transform: translateY(-6rpx) scale(0.98);
  box-shadow: 0 15rpx 40rpx rgba(0, 0, 0, 0.15);
}

/* wangScrollx组件选中状态样式 */
.item-checked .review-card {
  transform: scale(1.1);
  box-shadow: 0 15rpx 40rpx rgba(0, 203, 166, 0.2);
  border: 2rpx solid rgba(0, 203, 166, 0.3);
}

.user-info {
  display: flex;
  margin-bottom: 10rpx;
  align-items: flex-start;
  flex-shrink: 0;
}

.user-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  border: 2rpx solid rgba(102, 126, 234, 0.1);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 26rpx;
  font-weight: 600;
  color: #000008;
  margin-bottom: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-meta {
  font-size: 20rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6rpx;
  margin-bottom: 10rpx;
}

.user-tags .tag {
  background: linear-gradient(135deg, rgba(0, 203, 166, 0.1) 0%, rgba(0, 212, 170, 0.1) 100%);
  color: #00CBCC;
  font-size: 18rpx;
  padding: 3rpx 10rpx;
  border-radius: 10rpx;
  border: 1rpx solid rgba(0, 203, 166, 0.2);
  font-weight: 500;
  white-space: nowrap;
}

.review-content {
  font-size: 22rpx;
  color: #555;
  line-height: 1.3;
  margin-bottom: 15rpx;
  display: block;
  text-align: justify;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.buy-same {
  width: 100%;
  background: linear-gradient(135deg, rgba(0, 203, 166, 0.1) 0%, rgba(0, 212, 170, 0.1) 100%);
  color: #00CBCC;
  border-radius: 18rpx;
  padding: 12rpx 16rpx;
  font-size: 22rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  flex-shrink: 0;
  margin-top: auto;
  min-height: 34rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-sizing: border-box;
}

.buy-same:active {
  background: #00CBCC;
  color: #fff;
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 203, 166, 0.3);
}

/* 品牌动态 */
.brand-news {
  margin: 30rpx 0;
}

.brand-news .section-header {
  padding: 0 30rpx;
}

.news-slider {
  width: 100%;
}

.news-swiper {
  width: 100%;
  height: 300rpx;
}

.news-item {
  display: block;
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  border-radius: 0;
  position: relative;
  overflow: hidden;
}

.news-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
}

.news-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160rpx;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.6) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 30rpx;
  box-sizing: border-box;
}

.news-title {
  font-size: 36rpx;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.5);
  margin-bottom: 8rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0;
  line-height: 1.2;
}

.news-subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.5);
  font-weight: 400;
}

/* 总骨架屏样式 */
.page-skeleton {
  padding: 30rpx;
  height: 100vh;
  background-color: #fff;
}

/* 关注区域 */
.follow-section {
  margin: 30rpx;
  margin-bottom: 150rpx;
}

.follow-header {
  margin-bottom: 30rpx;
}

.follow-title {
  font-size: 48rpx;
  font-weight: 500;
  color: #000008;
  line-height: 1.17;
  display: block;
}

.follow-subtitle {
  font-size: 48rpx;
  font-weight: 500;
  color: #000008;
  line-height: 1.17;
  display: block;
}

.feature-cards {
  display: flex;
  flex-direction: column;
  gap: 48rpx;
  margin-bottom: 60rpx;
}

.feature-card {
  width: 100%;
  height: 258rpx;
  border-radius: 20rpx;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.feature-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feature-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, transparent 100%);
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.feature-title {
  font-size: 32rpx;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 1.375;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-desc {
  width: 400rpx;
  font-size: 32rpx;
  font-weight: 400;
  color: #FFFFFF;
  line-height: 1.375;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.learn-more {
  font-size: 32rpx;
  font-weight: 500;
  color: #FFFFFF;
  line-height: 1.375;
  white-space: nowrap;
}

.follow-channels {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 76rpx;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 20rpx 0 80rpx 0;
  -webkit-overflow-scrolling: touch;
}

.channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 154rpx;
}

.icon-0 {
  width: 62rpx;
  height: 52rpx;
}

.icon-1 {
  width: 62rpx;
  height: 50rpx;
}

.icon-2 {
  width: 114rpx;
  height: 40rpx;
}

.channel-info {
  text-align: center;
}

.channel-brand {
  font-size: 18rpx;
  color: #727272;
  letter-spacing: 0.03em;
  display: block;
  text-align: center;
  margin-top: 12rpx;
}

.channel-name {
  font-size: 24rpx;
  font-weight: 400;
  color: #727272;
  letter-spacing: 0.03em;
  display: block;
  text-align: center;
  text-decoration: underline;
}

.channel-arrow {
  font-size: 24rpx;
  font-weight: 400;
  color: #535353;
  line-height: 1.67;
  letter-spacing: 0.03em;
  display: block;
}

/* rtScrollx 热卖产品样式 */
.item-box {
  width: 257rpx;
  height: 251rpx;
  border-radius: 15rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 15rpx;
}



.product-cardh {
  position: relative;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: calc((100vw - 60rpx - 40rpx) / 3);
}

.pc-top-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.pc-title {
  font-size: 32rpx;
  line-height: 1.2;
  font-weight: 400;
  color: #000;
  white-space: normal;
  word-break: break-all;
  flex: 1;
  /* Allow title to take available space */
}

.pc-tags-wrapper {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  height: 44rpx;
  overflow: hidden;
  justify-content: center;
}

.pc-tags-row {
  display: flex;
  gap: 4rpx;
  flex-wrap: nowrap;
  align-items: center;
  min-height: 32rpx;
  /* Ensure row takes up space even if empty */
  overflow: hidden;
}

.pc-tag {
  font-size: 16rpx;
  color: #5578FF;
  background-color: #E7F2FF;
  padding: 4rpx 8rpx;
  border-radius: 32rpx;
}

.pc-subtitle {
  margin-top: 10rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #000;
  box-sizing: border-box;
  //overflow: hidden;
  //text-overflow: ellipsis;
  //white-space: nowrap;
  white-space: break-spaces;
  width: 100%;
  height: 65rpx;
}

.pc-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10rpx;
  width: 100%;
}

.pc-price {
  font-size: 24rpx;
  font-weight: 600;
  color: #222;
}

.pc-status {
  font-size: 18rpx;
  color: #979797;
}

.pc-image {
  width: 80rpx;
  height: 80rpx;
  flex-shrink: 0;
  /* Prevent image from shrinking */
  margin-left: 10rpx;
}

.pc-image image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pc-badge {
  position: absolute;
  display: block;
  top: 0;
  right: 0;
  width: 94rpx;
  height: 94rpx;
}

/* 小红书弹窗样式 */
.xiaohongshu-content {
  padding: 40rpx 20rpx;
  text-align: center;
  background: #ffffff;

  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #000000;
    margin-bottom: 20rpx;
    display: block;
  }

  .subtitle {
    font-size: 28rpx;
    color: #666666;
    margin-bottom: 40rpx;
    display: block;
  }

  .qrcode {
    width: 200rpx;
    height: 200rpx;
    margin: 0 auto 30rpx;
    border-radius: 8rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  }

  .tip {
    font-size: 24rpx;
    color: #999999;
    display: block;
  }
}


.assurance-card {
  position: relative;
  width: 90%;
  max-width: 600rpx;
}

.campaign-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.campaign-close-btn {
  position: absolute;
  bottom: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 60rpx;
  z-index: 10000;
  cursor: pointer;
}
.float-box{
	position: fixed;
	bottom: 0;
	left: 0;
	width: 100%;
	z-index:99;
	.float-item{
		width: 750rpx;
		height: 72rpx;
		position: relative;
		.float-close{
			position: absolute;
			left: 30rpx;
			top:50%;
			transform: translateY(-50%);
		}
		.float-content{
			width: 750rpx;
			height:72rpx;
			image{
				width: 750rpx;
				height:72rpx;
			}
		}
		.arrow-right{
			position: absolute;
			right: 31rpx;
			top:50%;
			transform: translateY(-50%);
		}
	}
}
</style>
