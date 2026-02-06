<template>
  <uv-sticky bgColor="#fff" customNavHeight="0">
    <Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
      <template #left>
        <view class="header-left">
          <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
          <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome" />
        </view>
      </template>
      <text class="header-title">评论列表</text>
    </Header>
    <uv-tabs :list="navList" @change="handleTabChange" lineColor="#00CBCC" v-model="currentTab"
      :scrollable="false"></uv-tabs>
  </uv-sticky>
  <view class="product-review">
    <!-- 评价列表 -->
    <scroll-view class="review-list" scroll-y>
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
          <image class="avatar" :src="cleanUrl(review.avatar) || COMMON_IMG_PATH + 'default-avatar.png'" mode="aspectFit" @error="handleAvatarError($event, index)" />
          <view class="user-details">
            <view class="user-header">
              <view class="user-left">
                <text class="username">{{ review.nickname || '匿名用户' }}</text>
                <text class="badge-text">购买{{ review.payCount }}次</text>
              </view>
              <view class="purchase-badge">
                <view class="star-rating">
                  <uv-rate :value="review.productScore || 0" :count="5" :size="24" active-color="#FF9D18"
                    inactive-color="#E4E4E4" readonly active-icon="star-fill" inactive-icon="star" />
                </view>
              </view>
            </view>
            <view class="rating-time">
              <text class="time">{{ review.createTime }}</text>
            </view>
          </view>
        </view>

        <!-- 评价内容 -->
        <text class="review-content">{{ review.comment }}</text>

        <!-- 评价图片 -->
        <view class="review-images" v-if="getImgList(review).length > 0">
          <image v-for="(img, imgIndex) in getImgList(review)" :key="imgIndex" class="review-image" :src="cleanUrl(img)"
            mode="aspectFit" />
        </view>

        <!-- 产品信息 -->
        <view class="product-info">
          <text class="spec">{{ review.merchantReplyContent }}</text>
          <text class="usage-days">使用{{ review.replyDa || 0 }}天后评价</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import Header from '@/components/Header/index.vue'
import { MY_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from '@/hooks/useRouter'
import { replyListPids } from '@/api/goods'
const { goBack, getParams, toHome } = useRouter()

// 评价数据
const reviews = [
  {
    id: 1,
    avatar: 'image_1.png',
    username: '麻辣毛豆',
    purchaseCount: 'X',
    rating: 4,
    time: '2小时前',
    content: '商品包装很高端, 产品也很方便, 使用了一段时间, 非常适合懒人保养~',
    images: ['image_4.png'],
    productSpec: '产品规格：辅酶Q10 30颗x3盒',
    usageDays: 'X'
  },
  {
    id: 2,
    avatar: 'image_5.png',
    username: '用户A4Wbih',
    purchaseCount: 'X',
    rating: 4,
    time: '22小时前',
    content: '商品包装很高端, 产品也很方便, 使用了一段时间, 非常适合懒人保养~',
    images: ['image_4.png', 'image_4.png', 'image_4.png'],
    productSpec: '产品规格：辅酶Q10 30颗x3盒',
    usageDays: 'X'
  },
  {
    id: 2,
    avatar: 'image_5.png',
    username: '用户A4Wbih',
    purchaseCount: 'X',
    rating: 4,
    time: '22小时前',
    content: '商品包装很高端, 产品也很方便, 使用了一段时间, 非常适合懒人保养~',
    images: ['image_4.png', 'image_4.png', 'image_4.png'],
    productSpec: '产品规格：辅酶Q10 30颗x3盒',
    usageDays: 'X'
  },
  {
    id: 2,
    avatar: 'image_5.png',
    username: '用户A4Wbih',
    purchaseCount: 'X',
    rating: 4,
    time: '22小时前',
    content: '商品包装很高端, 产品也很方便, 使用了一段时间, 非常适合懒人保养~',
    images: ['image_4.png', 'image_4.png', 'image_4.png'],
    productSpec: '产品规格：辅酶Q10 30颗x3盒',
    usageDays: 'X'
  },
  {
    id: 2,
    avatar: 'image_5.png',
    username: '用户A4Wbih',
    purchaseCount: 'X',
    rating: 4,
    time: '22小时前',
    content: '商品包装很高端, 产品也很方便, 使用了一段时间, 非常适合懒人保养~',
    images: ['image_4.png', 'image_4.png', 'image_4.png'],
    productSpec: '产品规格：辅酶Q10 30颗x3盒',
    usageDays: 'X'
  },
  {
    id: 2,
    avatar: 'image_5.png',
    username: '用户A4Wbih',
    purchaseCount: 'X',
    rating: 4,
    time: '22小时前',
    content: '商品包装很高端, 产品也很方便, 使用了一段时间, 非常适合懒人保养~',
    images: ['image_4.png', 'image_4.png', 'image_4.png'],
    productSpec: '产品规格：辅酶Q10 30颗x3盒',
    usageDays: 'X'
  }
]
const commentList = ref([])
const loading = ref(false)
const pid = ref([])
const navList = ref([
  { name: '全部', id: 0, type: '' },
  { name: '最新', id: 1, type: 1 },
  { name: '有图', id: 2, type: 4 }
])
const currentTab = ref(0)
// 处理标签切换事件
const handleTabChange = (tab) => {
  console.log(tab, 'tab');
  currentTab.value = tab.id
  fetchComments()
}
const fetchComments = async () => {
  if (!pid.value || loading.value) return
  loading.value = true
  try {
    // 根据currentTab的id找到对应的标签对象获取type
    const selectedTab = navList.value.find(item => item.id === currentTab.value)
    const type = selectedTab?.type
    console.log('currentTab:', currentTab.value)
    // 直接构建包含id和type的参数对象
    const params = { pids: pid.value, type }
    console.log('fetchComments params:', params)
    console.log('Final API URL will be:', `/product/reply/list/${pid.value}?id=${pid.value}&type=${type}`)
    const res = await replyListPids(params)
    console.log('fetchComments response:', res)

    if (res) {
      // 处理实际的API响应结构：直接返回分页对象 {records: [...], total: 1, size: 10, current: 1, pages: 1}
      if (Array.isArray(res.records)) {
        commentList.value = res.records
      } else if (res.code === 0 || res.code === 200) {
        // 兼容包装在code结构中的响应
        const records = res.data?.records || res.data || []
        commentList.value = Array.isArray(records) ? records : []
      } else if (Array.isArray(res.data)) {
        // 兼容直接返回数组的情况
        commentList.value = res.data
      } else {
        console.warn('Unexpected API response structure:', res)
        commentList.value = []
      }
    } else {
      console.warn('Empty API response')
      commentList.value = []
    }
  } catch (e) {
    console.error('加载评价失败:', e)
    commentList.value = []
  } finally {
    loading.value = false
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

// 处理头像加载失败
const handleAvatarError = (e, index) => {
  console.log('头像加载失败，使用默认头像', index)
  // 头像加载失败时，已经通过 || 设置了默认头像，这里可以添加额外处理
}
onLoad(async (options) => {
  // 获取产品id并初始化加载
  const params = getParams(options)
  pid.value = options.pids || params?.pids || ''
  if (pid.value) {
    await fetchComments()
  }
})
</script>

<style lang="scss" scoped>
.product-review {
  min-height: 100vh;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;
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

// 标签栏
.tab-bar {
  position: reactive;
  top: 200rpx;
  left: 0;
  right: 0;
  height: 89rpx;
  margin-bottom: 24rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #e7e7e7;
  display: flex;
  justify-content: center;
  align-items: center;

  .tab-item {
    width: 250rpx;
    height: 88rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;

    &.active {
      .tab-text {
        color: #222222;
        font-weight: 500;
      }

      .tab-indicator {
        position: absolute;
        bottom: 22rpx;
        width: 80rpx;
        height: 6rpx;
        background-color: #00cbcc;
        border-radius: 64rpx;
      }
    }

    &:not(.active) {
      justify-content: flex-end;
      padding-bottom: 22rpx;

      .tab-text {
        color: #999999;
        font-weight: normal;
      }
    }
  }

  .tab-text {
    font-size: 32rpx;
    letter-spacing: 0.16rpx;
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
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx 24rpx;
  margin: 0 24rpx 24rpx 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

// 用户信息
.user-info {
  display: flex;
  align-items: flex-start;
  margin-bottom: 34rpx;

  .avatar {
    width: 84rpx;
    height: 84rpx;
    margin-right: 15rpx;
    border-radius: 50%;
    background-color: #f5f5f5;
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

    .username {
      font-size: 28rpx;
      color: #000000;
      font-weight: 500;
      margin-right: 8rpx;
    }

    .badge-text {
      font-size: 18rpx;
      color: #00cbcc;
    }

    .purchase-badge {
      padding: 4rpx 12rpx;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .rating-time {
    display: flex;
    align-items: center;

    .star-rating {
      display: flex;
      gap: 5rpx;
      margin-right: 77rpx;

      .star-icon {
        width: 31rpx;
        height: 31rpx;
      }
    }

    .time {
      font-size: 24rpx;
      color: #7b7b7b;
    }
  }
}

// 评价内容
.review-content {
  font-size: 28rpx;
  color: #222222;
  line-height: 40rpx;
  margin-bottom: 37rpx;
  display: block;
}

// 评价图片
.review-images {
  display: flex;
  gap: 29rpx;
  margin-bottom: 37rpx;

  .review-image {
    width: 188rpx;
    height: 188rpx;
    border-radius: 16rpx;
    border: 1rpx solid #c2c2c2;
    background-color: #f2f3f5;
  }
}

// 产品信息
.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .spec {
    font-size: 24rpx;
    color: #0e0e0e;
    line-height: 40rpx;
  }

  .usage-days {
    font-size: 24rpx;
    color: #7b7b7b;
    line-height: 40rpx;
  }
}
</style>