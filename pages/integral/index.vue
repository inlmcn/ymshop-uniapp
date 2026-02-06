<template>
  <view class="integral-page">
    <!-- 积分头部 -->
    <view class="integral-header">
      <Header system-bar-area-bg="linear-gradient( 270deg, #E2FFFF 0%, #F8FFFF 98%)"
        header-area-bg="linear-gradient( 270deg, #E2FFFF 0%, #F8FFFF 98%)" :scroll-top="scrollTop" :show-return="true"
        :left-width="20">
        <view class="title-text">积分商城</view>
      </Header>
      <view class="points-container">
        <view class="points-card">
          <view class="points-display">
            <image class="points-icon" :src="COMMON_IMG_PATH + '/24f15a3ea26adf.png'" />
            <text class="points-value">{{ userPoints }}</text>
          </view>
          <view class="task-btn" @click="goToTasks">
            <text class="task-text">做任务赚积分</text>
            <image class="task-arrow" :src="COMMON_IMG_PATH + '/8248ad9cc509.png'" />
          </view>
        </view>
        <!-- 兑换码输入 -->
        <view class="exchange-code-input">
          <input class="code-input" v-model="exchangeCode" placeholder="请输入兑换码" />
          <text class="exchange-btn" @click="handleExchange">兑换</text>
        </view>
        <!-- 积分换好物横幅 -->
        <view class="banner-card">
          <view class="banner-content">
            <view class="banner-text">
              <text class="banner-title">积分换好物</text>
              <text class="banner-subtitle">补剂兑换 品类多多</text>
            </view>
            <image class="banner-arrow" :src="COMMON_IMG_PATH + '/37598c7616ffede6.png'" />
          </view>
          <image class="banner-image1" :src="COMMON_IMG_PATH + '/e50f0c2b29e0f277.png'" />
          <image class="banner-image" :src="COMMON_IMG_PATH + '/baa09d05c940dbe0.png'" />
        </view>
      </view>
    </view>
    <!-- 商品列表 -->
    <view class="products-section">
      <view class="tabs-bar">
        <text class="tab-item" @click="switchTab(0)">全部商城</text>
        <view class="tab-line">
          <text class="tab-item">积分明细</text>
          <text class="tab-item">兑换记录</text>
        </view>
      </view>

      <view class="product-grid" v-if="currentTab === 0">
        <view class="product-card" v-for="(item, index) in productList" :key="item.id" @click="goToProduct(item)">
          <view class="product-badge" :class="item.type === 'red' ? 'badge-red' : 'badge-orange'">
            <view class="badge-amount">
              <text class="currency">¥</text>
              <view class="value">
                <text class="value-text">{{ item.amount }}</text>
                <text class="label-text">现金红包</text>
              </view>
            </view>
            <image class="badge-icon" :src="COMMON_IMG_PATH + '/020bf04c2c57f1b.png'" />
            <text class="badge-tip">兑换即用</text>
          </view>
          <text class="product-name">{{ item.name }}</text>
          <view class="product-footer">
            <text class="points-required">{{ item.points }}</text>
            <text class="points-unit">积分</text>
            <view class="exchange-btn" :class="item.canExchange ? '' : 'disabled'">
              <text class="btn-text">去兑换</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部占位 -->
    <!-- <image class="footer-placeholder"
      src="/static/lanhu_huiyuanzhongxin/e50f0c2b29e0f277.png" /> -->
  </view>
</template>
<script setup>
import { ref, reactive } from 'vue'
import { INDEX_IMG_PATH, COMMON_IMG_PATH } from '@/utils/imgpath.js'
import Header from "@/components/Header/index.vue";

// 响应式数据
const userPoints = ref(86347)
const exchangeCode = ref('')
const currentTab = ref(0)

const hotProducts = reactive([
  {
    id: 1,
    amount: 100,
    type: 'red',
    name: '100元膨胀现金',
    points: 5000,
    canExchange: false
  },
  {
    id: 2,
    amount: 50,
    type: 'orange',
    name: '50元膨胀现金',
    points: 5000,
    canExchange: false
  }
])

const productList = reactive([
  {
    id: 3,
    amount: 100,
    type: 'red',
    name: '100元膨胀现金',
    points: 5000,
    canExchange: false
  },
  {
    id: 4,
    amount: 50,
    type: 'orange',
    name: '50元膨胀现金',
    points: 5000,
    canExchange: false
  },
  {
    id: 5,
    amount: 100,
    type: 'red',
    name: '100元膨胀现金',
    points: 5000,
    canExchange: false
  },
  {
    id: 6,
    amount: 50,
    type: 'orange',
    name: '50元膨胀现金',
    points: 5000,
    canExchange: false
  }
])

// 方法定义
// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 返回首页
const goHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 搜索
const handleSearch = () => {
  console.log('搜索')
}

// 前往任务页面
const goToTasks = () => {
  uni.navigateTo({
    url: '/pages/tasks/index'
  })
}

// 兑换码兑换
const handleExchange = () => {
  if (!exchangeCode.value) {
    uni.showToast({
      title: '请输入兑换码',
      icon: 'none'
    })
    return
  }
  console.log('兑换码:', exchangeCode.value)
  // TODO: 调用兑换接口
}

// 切换标签
const switchTab = (index) => {
  currentTab.value = index
  if (index === 1) {
    // 跳转到积分明细页
    uni.navigateTo({
      url: '/pages/integral/detail'
    })
  } else if (index === 2) {
    // 跳转到兑换记录页
    uni.navigateTo({
      url: '/pages/integral/record'
    })
  }
}

// 前往商品详情
const goToProduct = (item) => {
  uni.navigateTo({
    url: `/pages/integral/product?id=${item.id}`
  })
}
</script>
<style lang='scss' scoped>
.integral-page {
  min-height: 100vh;
  background-color: #fff;
}

/* 积分头部 */
.integral-header {
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
  padding: 48rpx 40rpx;
  margin-bottom: 20rpx;
  color: #000000;
  position: sticky;
  top: 0;
  z-index: 999;
  background: linear-gradient(270deg, #E2FFFF 0%, #F8FFFF 98%);
  transition: all .3s;

  // /* 兑换码输入 */
  .exchange-code-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: rgba(255, 255, 255, 0.32);
    border: 2px solid #fff;
    border-radius: 48rpx;
    margin: 40rpx 0;
    padding: 0 28rpx;
    height: 80rpx;

    .code-input {
      flex: 1;
      font-size: 32rpx;
      color: #999;
    }

    .exchange-btn {
      font-size: 32rpx;
      color: #00cbcc;
      font-weight: 500;
    }
  }

  // /* 横幅卡片 */
  .banner-card {
    position: relative;
    background: #FFFCFA;
    border-radius: 24rpx;
    padding: 42rpx 40rpx;
    overflow: hidden;

    .banner-content {
      position: relative;
      z-index: 2;
    }

    .banner-text {
      .banner-title {
        display: block;
        font-size: 48rpx;
        font-weight: 600;
        color: #4c4036;
        line-height: 56rpx;
        margin-bottom: 8rpx;
      }

      .banner-subtitle {
        display: block;
        font-size: 36rpx;
        font-weight: 500;
        color: #4c4036;
        line-height: 56rpx;
      }
    }

    .banner-arrow {
      width: 116rpx;
      height: 104rpx;
      margin-top: 13rpx;
      // position: absolute;
      // bottom: 0;
      margin-left: 120rpx;
      margin-bottom: -100rpx;
    }

    .banner-image {
      position: absolute;
      right: 40rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 258rpx;
      height: 218rpx;
      z-index: 1;
    }

    .banner-image1 {
      position: absolute;
      right: 140rpx;
      top: 8%;
      transform: translateY(-50%);
      width: 306rpx;
      height: 306rpx;
      z-index: 1;
    }
  }

  .points-container {
    .points-card {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .points-display {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .points-icon {
          width: 64rpx;
          height: 64rpx;
        }

        .points-value {
          font-size: 60rpx;
          font-weight: 700;
          color: #4c4036;
        }
      }

      .task-btn {
        display: flex;
        align-items: center;
        height: 48rpx;
        background-color: #00cbcc;
        border-radius: 24rpx;
        padding: 0rpx 16rpx;

        .task-text {
          font-size: 24rpx;
          color: #fff;
        }

        .task-arrow {
          width: 20rpx;
          height: 20rpx;
        }
      }
    }

  }
}


/* 热门推荐 */
.hot-products {
  padding: 40rpx 40rpx 0;

  .product-row {
    display: flex;
    gap: 18rpx;
    margin-bottom: 76rpx;
  }

  .divider-image {
    width: 310rpx;
    height: 108rpx;
    margin: 0 auto;
    display: block;
  }
}

/* 商品卡片 */
.product-card {
  flex: 1;
  background-color: #fff;
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 8rpx 24rpx 0 rgba(103, 61, 17, 0.08);

  .product-badge {
    position: relative;
    background-color: #ffe9e4;
    border-radius: 16rpx;
    padding: 30rpx 24rpx 12rpx;
    margin-bottom: 36rpx;

    &.badge-red {
      background: linear-gradient(90deg, #fc9077 0%, #e9403c 100%);

      .badge-tip {
        color: #ea413c;
      }
    }

    &.badge-orange {
      background: linear-gradient(90deg, #ffcb83 0%, #ff8a32 100%);

      .badge-tip {
        color: #ff9d18;
      }
    }

    .badge-amount {
      display: flex;
      align-items: baseline;

      .currency {
        font-size: 28rpx;
        font-weight: 700;
        color: #fff;
      }

      .value {
        font-size: 48rpx;
        font-weight: 700;
        color: #fff;
        display: flex;
        align-items: center;

        .label-text {
          margin-left: 8rpx;
          font-size: 22rpx;
          font-weight: 500;
          color: #fff;
        }
      }
    }

    .badge-label {
      display: block;
      font-size: 22rpx;
      font-weight: 500;
      color: #fff;
      margin-top: 6rpx;
    }

    .badge-icon {
      position: absolute;
      right: 20rpx;
      top: 50%;
      transform: translateY(-50%);
      width: 66rpx;
      height: 86rpx;
    }
  }

  .badge-tip {
    display: block;
    font-size: 22rpx;
    margin-bottom: 20rpx;
  }

  .product-name {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #222;
    margin-bottom: 4rpx;
  }

  .product-footer {
    display: flex;
    align-items: center;
    gap: 4rpx;

    .points-required {
      font-size: 32rpx;
      font-weight: 700;
      color: #00cbcc;
    }

    .points-unit {
      font-size: 22rpx;
      color: #00cbcc;
      margin-right: auto;
    }

    .exchange-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 44rpx;
      background-color: #c2c2c2;
      border-radius: 22rpx;
      padding: 0 27rpx;

      &:not(.disabled) {
        background-color: #00cbcc;
      }

      .btn-text {
        font-size: 22rpx;
        color: #fff;
        line-height: 1;
      }
    }
  }
}

/* 商品列表区域 */
.products-section {
  background: linear-gradient(271deg, #e2ffff 0%, #f8ffff 97.59%);
  padding: 28rpx 40rpx;

  .tabs-bar {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e7e7e7;
    margin-bottom: 40rpx;

    .tab-item {
      font-size: 36rpx;
      color: #222;
      padding-bottom: 24rpx;
      margin-right: 40rpx;
    }

    .tab-line {
      .tab-item {
        font-size: 24rpx;
        color: #00cbcc;
        margin-right: 0;
      }

      .tab-item:nth-child(1) {
        margin-right: 24rpx;
      }
    }
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 18rpx;
  }
}

.title-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #121212;
  text-align: center;
}

/* 底部占位 */
.footer-placeholder {
  width: 100%;
  height: 68rpx;
  display: block;
}
</style>