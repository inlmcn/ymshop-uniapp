<template>
  <uv-sticky bgColor="#fff" customNavHeight="0">
    <Header ref="headerRef" :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
      <template #left>
        <view class="header-left">
          <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
          <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
        </view>
      </template>
      <text class="header-title">评论列表</text>
    </Header>
    <!-- <uv-tabs :list="navList" @change="handleTabChange" lineColor="#00CBCC" v-model="currentTab"
      :scrollable="true"></uv-tabs> -->
    <view id="tabs-container" class="tag-tabs">
      <view v-for="item in navList" :key="item.id" class="tag-tab" :class="{ 'active': currentTab === item.id }" @click="handleTabChange(item)">
        {{ `${item.name}${item.count > 0 ? ` ${item.count}` : ''}` }}
      </view>
    </view>
  </uv-sticky>
    
  <view id="product_review_container" class="product-review">
    <!-- 评价列表 -->
    <scroll-view 
      class="review-list" 
      scroll-y 
      :refresher-enabled="true"
      :refresher-triggered="refreshing" 
      :style="{ height: `calc(100vh - ${tabHeight}px - ${headerRef?.containerHeight || 0}px)` }" 
      @scrolltolower="loadMore" 
      @refresherrefresh="onRefresh" 
      @refresherrestore="onRestore">
      <!-- 无数据状态 -->
      <view v-if="!loading && commentList.length === 0" class="empty-state">
        <image class="empty-icon" :src="COMMON_IMG_PATH + 'empty.png'" mode="aspectFit" />
        <text class="empty-text">暂无评价</text>
        <text class="empty-tip">快来做第一个评价的人吧~</text>
      </view>

      <!-- 评价卡片列表 -->
      <view class="review-card" v-for="(review, index) in commentList" :key="index">
        <!-- 用户信息 -->
        <view class="user-info">
          <image class="avatar"
            :src="cleanUrl(review.picture || review.avatar) || COMMON_IMG_PATH + 'default-avatar.png'" mode="aspectFit"
            @error="handleAvatarError($event, index)" />
          <view class="user-details">
            <view class="user-header">
              <view class="user-left">
                <text class="username">{{ review.replyName || review.nickname || '匿名用户' }}</text>
                <view v-if="review.counta" class="badge-text">购买{{ review.counta }}次</view>
              </view>
              <view class="review-time">
                <text class="time">{{ review.createTime }}</text>
              </view>
            </view>
            <view class="rating-time">
              <uv-rate :value="review.productScore || 0" 
                       :count="5" 
                       :size="12" 
                       active-color="#FF9D18"
                       inactive-color="#E7E7E7" 
                       readonly 
                       active-icon="star-fill" 
                       inactive-icon="star-fill" 
                       :gutter="0" />
              <text class="time">使用{{ review.nextDay == 0 ? '当天' : `${review.nextDay}天后` }}评价</text>
            </view>
          </view>
        </view>

        <!-- 评价内容 -->
        <text class="review-content">{{ review.comment }}</text>

        <!-- 评价图片 -->
        <view class="review-images" v-if="getImgList(review).length > 0">
          <image v-for="(img, imgIndex) in getImgList(review)" :key="imgIndex" class="review-image" :src="cleanUrl(img)"
            mode="aspectFill" @click="previewReviewImage(img, review)" />
        </view>

        <uv-line v-if="review.merchantReplyContent || review.additionalReply" color="#E8E8E8"></uv-line>

        <!-- 追评区域 -->
        <view v-if="review.additionalReply" class="follow-up-review">
          <view class="follow-up-review-title">使用{{ review.additionalDay == 0 ? '当天' : `${review.additionalDay}天后` }}追评</view>

          <text v-if="review.additionalReply" class="follow-up-review-content">{{ review.additionalReply }}</text>

          <view v-if="getAdditionalReplyImage(review).length > 0" class="follow-up-review-images">
            <image v-for="(img, imgIndex) in getAdditionalReplyImage(review)" :key="imgIndex" class="follow-up-review-image" :src="cleanUrl(img)"
              mode="aspectFill" @click="previewAdditionalReplyImage(img, review)" />
          </view>

        </view>

        <!-- 商家回复区域 -->
         <view v-if="review.merchantReplyContent" class="merchant-reply">
          <text class="merchant-reply-title">商家回复:</text>
          <text class="merchant-reply-content">{{ review.merchantReplyContent }}</text>
         </view>

        <!-- 产品信息 -->
        <view class="product-info">
          <text class="spec">
            已购 {{ review.productName }}
          </text>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view class="load-more" v-if="commentList.length > 0">
        <view v-if="loadingMore" class="loading-text">
          <uv-loading-icon mode="circle" size="32"></uv-loading-icon>
          <text style="margin-left: 16rpx;">加载中...</text>
        </view>
        <text v-else-if="noMore" class="no-more-text">没有更多了</text>
        <text v-else class="load-more-text">上拉加载更多</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, getCurrentInstance, nextTick } from 'vue'
import Header from '@/components/Header/index.vue'
import { COMMON_IMG_PATH } from '@/utils/imgpath'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from '@/hooks/useRouter'
import { replyList, getCommentTypeCount } from '@/api/goods'

const _this = getCurrentInstance();

const { goBack, getParams, toHome } = useRouter()
const commentList = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const refreshing = ref(false)
const pid = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const noMore = ref(false)

const tabHeight = ref(0);
const headerRef = ref();
const replyId = ref('')

const NAV_LIST = [
  { name: '全部', id: 0, type: 0, field: 'all' },
  { name: '回头客', id: 1, type: 6, field: 'repeatCustomer' },
  { name: '追评', id: 2, type: 5, field: 'followUpComments' },
  { name: '图文', id: 3, type: 4, field: 'textAndImages' },
  { name: '好评', id: 4, type: 1, field: 'goodReview' },
  { name: '中评', id: 5, type: 2, field: 'moderateReview' },
  { name: '差评', id: 6, type: 3, field: 'negativeReview' },
];

const navList = ref([]);

const currentTab = ref(0);
// 处理标签切换事件
const handleTabChange = (tab) => {
  console.log(tab, 'tab');
  if (tab.id === currentTab.value || loading.value || loadingMore.value) return;

  currentTab.value = tab.id
  currentPage.value = 1
  noMore.value = false
  commentList.value = [] // 清空列表
  fetchComments()
}

// 下拉刷新
const onRefresh = async () => {
  refreshing.value = true
  currentPage.value = 1
  noMore.value = false
  await fetchComments()
  refreshing.value = false
}

// 刷新恢复
const onRestore = () => {
  refreshing.value = false
}

// 加载更多
const loadMore = () => {
  if (loadingMore.value || noMore.value || loading.value) return
  currentPage.value++
  fetchComments(true)
}

const fetchComments = async (isLoadMore = false) => {
  if (!pid.value) return
  if (loading.value || loadingMore.value) return

  if (isLoadMore) {
    if (noMore.value) return
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    // 根据currentTab的id找到对应的标签对象获取type
    const selectedTab = navList.value.find(item => item.id === currentTab.value)
    const type = selectedTab?.type
    console.log('currentTab:', currentTab.value)
    // 直接构建包含id、type和分页参数的对象
    const params = {
      id: pid.value,
      type,
      page: currentPage.value,
      limit: pageSize.value
    }

    if (replyId.value) {
      params.replyId = replyId.value
      replyId.value = ''
    }
    console.log('fetchComments params:', params)
    const res = await replyList(params)
    console.log('fetchComments response:', res)

    if (res) {
      // 处理实际的API响应结构：直接返回分页对象 {records: [...], total: 399, size: 10, current: 1, pages: 40}
      if (Array.isArray(res.records)) {
        if (isLoadMore) {
          commentList.value = [...commentList.value, ...res.records]
        } else {
          commentList.value = res.records
        }
        totalPages.value = res.pages || 0
        noMore.value = currentPage.value >= totalPages.value
      } else if (res.code === 0 || res.code === 200) {
        // 兼容包装在code结构中的响应
        const records = res.data?.records || res.data || []
        const pages = res.data?.pages || 0
        if (isLoadMore) {
          commentList.value = [...commentList.value, ...(Array.isArray(records) ? records : [])]
        } else {
          commentList.value = Array.isArray(records) ? records : []
        }
        totalPages.value = pages
        noMore.value = currentPage.value >= totalPages.value
      } else if (Array.isArray(res.data)) {
        // 兼容直接返回数组的情况
        if (isLoadMore) {
          commentList.value = [...commentList.value, ...res.data]
        } else {
          commentList.value = res.data
        }
      } else {
        console.warn('Unexpected API response structure:', res)
        if (!isLoadMore) commentList.value = []
      }
    } else {
      console.warn('Empty API response')
      if (!isLoadMore) commentList.value = []
    }
  } catch (e) {
    console.error('加载评价失败:', e)
    if (!isLoadMore) commentList.value = []
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const fetchNavListCount = async () => {
  try {
    const res = await getCommentTypeCount(pid.value);

    if (res) {
      const list = NAV_LIST.map(item => {
        const count = res[item.field];
        return {
          ...item,
          count: count || 0
        }
      });
      const activeList = list.filter(item => item.count > 0);

      if (activeList.length > 0) {
        navList.value = activeList;
      } else {
        navList.value = [NAV_LIST[0]];
      }
    } else {
      navList.value = [NAV_LIST[0]];
    }
  } catch (e) {
    navList.value = [NAV_LIST[0]];  
  } finally {
    await nextTick();
    const el = uni.createSelectorQuery().in(_this).select('#tabs-container');
    el.boundingClientRect().exec(res => {
      tabHeight.value = res[0].height || 0;
    });
  }
}

// 清洗URL中的反引号、空格和其他无效字符
const cleanUrl = (url) => {
  if (!url) return ''

  // 转换为字符串并清理各种无效字符
  let cleanedUrl = String(url)
    .replace(/`/g, '')           // 移除反引号
    .replace(/\s+/g, '')         // 移除所有空格
    .replace(/[\r\n\t]/g, '')    // 移除换行符和制表符
    .trim()                      // 移除首尾空白

  // 如果URL不是以http开头，且不为空，则可能需要添加协议
  if (cleanedUrl && !cleanedUrl.startsWith('http') && !cleanedUrl.startsWith('//')) {
    // 这里可以根据实际情况添加默认协议或域名
    // cleanedUrl = 'https://' + cleanedUrl
  }

  return cleanedUrl
}
const getImgList = (item) => {
  if (!item) return []

  // 处理 pics 数组（新API格式）
  if (Array.isArray(item.pics)) {
    return item.pics.filter(pic => pic && pic.trim() !== '')
  }

  // 兼容旧格式：imgs 数组
  if (Array.isArray(item.imgs) && item.imgs.length) {
    return item.imgs.filter(img => img && img.trim() !== '')
  }

  // 兼容 pictures 字符串格式
  if (typeof item.pictures === 'string' && item.pictures.trim()) {
    // 如果是逗号分隔的字符串，分割处理
    return item.pictures.split(',').filter(pic => pic && pic.trim() !== '')
  }

  return []
}

const getAdditionalReplyImage = (item) => {
  if (!item) return []
  
  if (typeof item.additionalReplyImage === 'string' && item.additionalReplyImage.trim()) {
    return item.additionalReplyImage.split(',').filter(pic => pic && pic.trim() !== '')
  }
  return []
}

// 处理头像加载失败
const handleAvatarError = (e, index) => {
  console.log('头像加载失败，使用默认头像', index)
  // 头像加载失败时，已经通过 || 设置了默认头像，这里可以添加额外处理
}

const previewReviewImage = (currentImg, review) => {
  const imgList = getImgList(review).map(img => cleanUrl(img));
  uni.previewImage({
    current: cleanUrl(currentImg),
    urls: imgList
  });
};

const previewAdditionalReplyImage = (currentImg, review) => {
  const imgList = getAdditionalReplyImage(review).map(img => cleanUrl(img));
  uni.previewImage({
    current: cleanUrl(currentImg),
    urls: imgList
  });
};

onLoad(async (options) => {
  // 获取产品id并初始化加载
  const params = getParams(options)
  pid.value = options.id || params?.id || ''
  replyId.value = options.replyId || params?.replyId || ''
  if (pid.value) {
    fetchNavListCount()
    await fetchComments()
  }
})
</script>
<style lang="scss">
  page {
    padding-bottom: 0 !important;
  }
</style>
<style lang="scss" scoped>
.tag-tabs {
  @include useFlex(flex-start, center, row, wrap, 20rpx);
  padding: 30rpx;

  .tag-tab {
    padding: 0 16rpx;
    height: 48rpx;
    border-radius: 10rpx;
    background-color: #F7F8F9;
    color: #626262;
    font-size: 26rpx;
    line-height: 48rpx;
    border-radius: 65rpx 65rpx 65rpx 65rpx;
    transition: color 0.3s ease, background-color 0.3s ease;

    &.active {
      background-color: #E7FFFF;
      color: #00BEBF;
    }
  }

  .tag-tab-text {
    font-size: 28rpx;
    color: #000000;
    font-weight: 500;
  }
}

.product-review {
  background-color: #f8f9fa;
  position: relative;
}

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

// 状态栏
.status-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 32rpx 18rpx;
  background-color: #ffffff;
  z-index: 100;

  .time {
    font-size: 30rpx;
    color: #121212;
    font-weight: 500;
  }

  .status-icons {
    display: flex;
    align-items: center;
    gap: 10rpx;

    .icon {
      width: 30rpx;
      height: 22rpx;
    }
  }
}

// 评价列表
.review-list {
  overflow-y: auto;
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 60rpx;
  text-align: center;

  .empty-icon {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 40rpx;
    opacity: 0.6;
  }

  .empty-text {
    font-size: 32rpx;
    color: #999999;
    font-weight: 500;
    margin-bottom: 16rpx;
    display: block;
  }

  .empty-tip {
    font-size: 26rpx;
    color: #CCCCCC;
    line-height: 40rpx;
    display: block;
  }
}

.review-card {
  padding: 20rpx;
  margin: 24rpx 24rpx 0;
  background-color: #ffffff;
  border-radius: 18rpx;
}

// 用户信息
.user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12rpx;

  .avatar {
    width: 60rpx;
    height: 60rpx;
    margin-right: 15rpx;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .user-details {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 5rpx;
    justify-content: space-between;

    .user-left {
      @include useFlex(flex-start, center, row, wrap, 6rpx);
    }

    .username {
      font-size: 26rpx;
      color: #000000;
      font-weight: 700;
      margin-right: 8rpx;
    }

    .badge-text {
      width: 101rpx;
      height: 32rpx;
      line-height: 32rpx;
      font-size: 18rpx;
      color: #00CBCC;
      background-color: #E3FAFA;
      border-radius: 36rpx;
      text-align: center;
    }

    .review-time {
      font-size: 24rpx;
      color: #7b7b7b;
    }
  }

  .rating-time {
    display: flex;
    align-items: center;

    .time {
      margin-left: 12rpx;
      font-size: 20rpx;
      color: #7b7b7b;
    }
  }
}

// 评价内容
.review-content {
  font-size: 26rpx;
  color: #222222;
  line-height: 33rpx;
  margin-bottom: 27rpx;
  display: block;
}

// 评价图片
.review-images {
  display: flex;
  flex-wrap: wrap;
  gap: 29rpx;
  margin-bottom: 22rpx;

  .review-image {
    width: 108rpx;
    height: 108rpx;
    border-radius: 18rpx;
    overflow: hidden;
  }
}

// 追评区域
.follow-up-review {
  margin-top: 24rpx;

  .follow-up-review-title {
    font-weight: 600;
    font-size: 28rpx;
    color: #00CBCC;
    line-height: 36rpx;
    margin-bottom: 16rpx;
  }

  .follow-up-review-content {
    font-size: 26rpx;
    color: #222222;
    line-height: 33rpx;
    display: block;
  }

  .follow-up-review-images {
    display: flex;
    flex-wrap: wrap;
    gap: 29rpx;
    margin-top: 22rpx;

    .follow-up-review-image {
      width: 108rpx;
      height: 108rpx;
      border-radius: 18rpx;
      overflow: hidden;
    }
  }
}

// 商家回复区域
.merchant-reply {
  margin-top: 16rpx;
  padding: 10rpx 16rpx;
  background-color: #F7F8F9;
  border-radius: 18rpx;
  line-height: 32rpx;
  font-size: 22rpx;
  color: #262626;

  .merchant-reply-title {
    font-weight: 700;
  }
}

// 产品信息
.product-info {
  margin-top: 24rpx;

  .spec {
    font-size: 24rpx;
    color: #7B7B7B;
    line-height: 40rpx;
  }
}

// 加载更多样式
.load-more {
  padding: 40rpx 0;
  text-align: center;

  .loading-text {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #999999;
  }

  .load-more-text {
    font-size: 28rpx;
    color: #999999;
  }

  .no-more-text {
    font-size: 28rpx;
    color: #CCCCCC;
  }
}
</style>
