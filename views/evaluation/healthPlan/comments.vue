<template>
  <Navbar title="评论列表" />
  <view class="comment-list-page">
    <!-- 标签页 -->
    <view class="tab-container">
      <view class="tab-wrapper">
        <view v-for="(tab, index) in tabs" :key="index" class="tab-item" :class="{ active: currentTab === index }" @click="switchTab(index)">
          <text class="tab-text">{{ tab.name }}</text>
          <view v-if="currentTab === index" class="tab-active-line"></view>
        </view>
      </view>
    </view>

    <!-- 评价列表（按传入数据结构渲染） -->
    <view class="comment-container">
      <view v-for="(item, index) in commentList" :key="index" class="comment-card">
        <!-- 产品与评分信息 -->
        <view class="comment-header">
          <view class="product-name">{{ item.prodcutName || '商品评价' }}</view>
          <view class="rate-wrap">
            <uv-rate :value="item.productScore || 0" :count="5" :size="28" active-color="#FF9D18" disabled />
            <text class="rate-text">商品评分：{{ item.productScore || 0 }}分</text>
          </view>
          <view class="rate-wrap mt-8">
            <uv-rate :value="item.serviceScore || 0" :count="5" :size="24" active-color="#00CBCC" disabled />
            <text class="rate-text">服务评分：{{ item.serviceScore || 0 }}分</text>
          </view>
        </view>

        <!-- 评价内容 -->
        <view class="comment-content">
          {{ item.comment }}
        </view>

        <!-- 评价图片 -->
        <view v-if="getImgList(item).length > 0" class="comment-images">
          <image v-for="(img, imgIndex) in getImgList(item)" :key="imgIndex" class="comment-img" :src="cleanUrl(img)" mode="aspectFill" />
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
import Navbar from "../components/Navbar.vue";
const { getParams, goBack } = useRouter()
const currentTab = ref(0)
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

// 清洗URL中的反引号和空格
const cleanUrl = (url) => String(url || '').replace(/`/g, '').replace(/\s/g, '')

// 兼容后端可能返回的两种图片字段：imgs(array) 或 pics(string)
const getImgList = (item) => {
  if (!item) return []
  if (Array.isArray(item.imgs) && item.imgs.length) return item.imgs
  if (typeof item.pics === 'string' && item.pics) return [item.pics]
  return []
}

// 后端返回的图片链接可能包含反引号或空格，统一清洗

// 根据当前tab从后端拉取评论列表
const fetchComments = async () => {
  if (!pid.value || loading.value) return
  loading.value = true
  try {
    const type = tabs.value[currentTab.value]?.type
    const params = { id: pid.value }
    if (type !== '' && type !== undefined && type !== null) params.type = type
    const res = await replyList(params)
    if (res && res.code === 200) {
      commentList.value = Array.isArray(res.data) ? res.data : []
    } else if (res && res.code === 0) {
      // 兼容部分接口返回code=0
      commentList.value = Array.isArray(res.data) ? res.data : []
    } else {
      commentList.value = []
    }
  } catch (e) {
    console.error('加载评价失败:', e)
    commentList.value = []
  } finally {
    loading.value = false
  }
}

// 切换标签
const switchTab = (index) => {
  currentTab.value = index
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

// 标签页样式
.tab-container {
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;

  .tab-wrapper {
    display: flex;
    padding: 0 30rpx;
    height: 88rpx;
    align-items: center;
  }

  .tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: all 0.3s ease;

    .tab-text {
      font-size: 32rpx;
      color: #999999;
      transition: color 0.3s ease;
    }

    .tab-active-line {
      position: absolute;
      bottom: 0;
      width: 40rpx;
      height: 6rpx;
      background-color: #4a90e2;
      border-radius: 3rpx;
    }

    &.active {
      .tab-text {
        color: #333333;
        font-weight: 500;
      }
    }
  }
}

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
      .mt-8 { margin-top: 8rpx; }
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
  .load-more { display: none; }

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