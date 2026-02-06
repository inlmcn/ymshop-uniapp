<template>
  <Header :show-return="true" :show-right="true" header-area-bg="#fff" system-bar-area-bg="#fff">
    <template #left>
      <view class="header-left">
        <uv-icon name="arrow-left" size="20" color="#000" @click="goBack" />
        <image class="icon-home" :src="COMMON_IMG_PATH + 'homeimg.png'" @click="toHome"/>
      </view>
    </template>
    <text class="header-title">评论列表</text>
  </Header>
  <view class="comment-list-page">
    <!-- 使用uv-tabs组件实现标签页 -->
    <uv-sticky bgColor="#fff" customNavHeight="0">
      <uv-tabs v-model="currentTab" :list="tabs" :is-scroll="true" :ellipsis="false" line-color="#FF9D18"
        line-width="40" line-height="4" active-color="#FF9D18" inactive-color="#666" font-size="28"
        @change="handleTabChange" />
    </uv-sticky>

    <!-- 评价列表（按传入数据结构渲染） -->
    <view class="comment-container">
      <view v-for="(item, index) in commentList" :key="index" class="comment-card">
        <!-- 产品与评分信息 -->
        <view class="comment-header">
          <view class="user-info">
            <image v-if="item.avatar" class="user-avatar" :src="cleanUrl(item.avatar)" mode="aspectFill" />
            <view class="user-details">
              <text class="user-name">{{ item.nickname || '匿名用户' }}</text>
              <text class="comment-time">{{ item.createTime }}</text>
            </view>
          </view>
          <view class="rate-wrap">
            <uv-rate :value="item.productScore || 0" :count="5" :size="24" active-color="#FF9D18"
              inactive-color="#E4E4E4" readonly active-icon="star-fill" inactive-icon="star" />
            <text class="rate-text">商品评分：{{ item.productScore || 0 }}分</text>
          </view>
          <view class="rate-wrap mt-8">
            <uv-rate :value="item.serviceScore || 0" :count="5" :size="24" active-color="#FF9D18"
              inactive-color="#E4E4E4" readonly active-icon="star-fill" inactive-icon="star" />
            <text class="rate-text">服务评分：{{ item.serviceScore || 0 }}分</text>
          </view>
          <view v-if="item.sku" class="sku-info">
            <text class="sku-text">规格：{{ item.sku }}</text>
          </view>
        </view>

        <!-- 评价内容 -->
        <view class="comment-content">
          {{ item.comment }}
        </view>

        <!-- 评价图片 -->
        <view v-if="getImgList(item).length > 0" class="comment-images">
          <image v-for="(img, imgIndex) in getImgList(item)" :key="imgIndex" class="comment-img" :src="cleanUrl(img)"
            mode="aspectFill" />
        </view>

        <!-- 唯一标识 -->
        <view class="unique-line" v-if="item.unique">
          <text class="unique-text">唯一标识：{{ item.unique }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="commentList.length === 0" class="empty-state">
        <text>暂无评价</text>
      </view>
    </view>

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from "@/hooks/useRouter"
import { onLoad } from '@dcloudio/uni-app'
import { PRODUCT_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath'
import { replyList } from '@/api/goods'
import Header from "@/components/Header/index.vue";
const { getParams, goBack, toHome } = useRouter()
const currentTab = ref(null)
const commentList = ref([])
const loading = ref(false)
const pid = ref('')

// 标签数据与后端type参数对齐
// type：1好评 2中评 3差评 4有图；空=全部
const tabs = ref([
  { name: '全部', type: '' },
  { name: '有图', type: 4 },
  { name: '好评', type: 1 },
  { name: '中评', type: 2 },
  { name: '差评', type: 3 }
])

// 初始化currentTab为第一个标签
currentTab.value = tabs.value[0]

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

// 兼容后端可能返回的多种图片字段：pics(array)、imgs(array) 或 pictures(string)
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

// 后端返回的图片链接可能包含反引号或空格，统一清洗

// 根据当前tab从后端拉取评论列表
const fetchComments = async () => {
  if (!pid.value || loading.value) return
  loading.value = true
  try {
    // currentTab是当前选中的标签对象，直接从中获取type
    const type = currentTab.value?.type
    console.log('currentTab:', currentTab.value)
    console.log('type:', type)
    // 直接构建包含id和type的参数对象
    const params = { id: pid.value, type }
    console.log('fetchComments params:', params)
    console.log('Final API URL will be:', `/product/reply/list/${pid.value}?id=${pid.value}&type=${type}`)
    const res = await replyList(params)
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

// 处理标签切换事件
const handleTabChange = (tab) => {
  currentTab.value = tab
  fetchComments()
}

onLoad(async (options) => {
  // 获取产品id并初始化加载
  const params = getParams(options)
  pid.value = options.id || params?.id || ''
  await fetchComments()
})
</script>

<style lang="scss" scoped>
.comment-list-page {
  font-family: 'MiSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

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

// uv-tabs组件已实现标签页功能，原标签页样式已移除

// 评价列表容器
.comment-container {
  padding: 24rpx 30rpx;

  .comment-card {
    background-color: #ffffff;
    border-radius: 24rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.03);
    }

    .comment-header {
      margin-bottom: 24rpx;

      .user-info {
        display: flex;
        align-items: center;
        margin-bottom: 16rpx;

        .user-avatar {
          width: 60rpx;
          height: 60rpx;
          border-radius: 50%;
          margin-right: 16rpx;
          background-color: #f0f0f0;
        }

        .user-details {
          flex: 1;

          .user-name {
            display: block;
            font-size: 28rpx;
            font-weight: 500;
            color: #333333;
            margin-bottom: 4rpx;
          }

          .comment-time {
            display: block;
            font-size: 24rpx;
            color: #999999;
          }
        }
      }

      .product-name {
        font-size: 30rpx;
        font-weight: 600;
        color: #333333;
        margin-bottom: 12rpx;
      }

      .rate-wrap {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .rate-text {
          font-size: 24rpx;
          color: #666666;
        }
      }

      .sku-info {
        margin-top: 8rpx;

        .sku-text {
          font-size: 24rpx;
          color: #666666;
          background-color: #f8f8f8;
          padding: 4rpx 12rpx;
          border-radius: 8rpx;
        }
      }

      .mt-8 {
        margin-top: 8rpx;
      }
    }

    // 评价内容
    .comment-content {
      font-size: 28rpx;
      line-height: 44rpx;
      color: #333333;
      margin-bottom: 24rpx;
    }

    // 评价图片
    .comment-images {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 24rpx;

      .comment-img {
        width: 200rpx;
        height: 200rpx;
        border-radius: 16rpx;
        margin-right: 16rpx;
        margin-bottom: 16rpx;
        background-color: #f0f0f0;
      }
    }

    .unique-line {
      padding-top: 12rpx;
      border-top: 1rpx solid #f5f5f5;

      .unique-text {
        display: block;
        font-size: 24rpx;
        color: #999999;
      }
    }
  }

  // 加载更多
  .load-more {
    display: none;
  }

  // 空状态
  .empty-state {
    text-align: center;
    padding: 100rpx 0;
    font-size: 28rpx;
    color: #999999;
  }
}

// 底部安全区域
.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
}

// 响应式调整
@media (min-width: 750px) {
  .comment-list-page {
    max-width: 750px;
    margin: 0 auto;
  }
}
</style>