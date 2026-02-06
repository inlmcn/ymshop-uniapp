<template>
  <view class="checkin-success">
    <!-- 背景图层 -->
    <view class="bg-layer layer-1" :style="{ backgroundImage: `url(${ACTIVITY_IMG_PATH}image_1.png)` }"></view>
    <view class="bg-layer layer-2" :style="{ backgroundImage: `url(${ACTIVITY_IMG_PATH}image_2.png)` }"></view>
    <view class="bg-layer layer-3" :style="{ backgroundImage: `url(${ACTIVITY_IMG_PATH}image_3.png)` }"></view>
    
    <!-- 主要内容 -->
    <view class="main-content">
      <!-- 顶部成功提示 -->
      <view class="success-header">
        <image class="success-icon" :src="ACTIVITY_IMG_PATH +'image_4.png'" mode="aspectFit" />
        <text class="success-title">下单成功！</text>
      </view>
      
      <!-- 顾问邀请区域 -->
      <view class="consultant-section" :style="{ backgroundImage: `url(${ACTIVITY_IMG_PATH}image_5.png)` }">
        <view class="consultant-header">
          <image class="star-icon" :src="ACTIVITY_IMG_PATH +'image_6.png'" mode="aspectFit" />
          <view class="header-text">
            <text class="main-text">添加顾问</text>
            <text class="sub-text">参与减肥打卡</text>
          </view>
          <image class="underline-icon" :src="ACTIVITY_IMG_PATH +'image_8.png'" mode="aspectFit" />
        </view>
        
        <!-- 打卡成果展示 -->
        <view class="achievement-cards">
          <view 
            v-for="(item, index) in achievements" 
            :key="index"
            class="achievement-card"
            :style="{ backgroundImage: `url(${ACTIVITY_IMG_PATH}${item.bgImage})` }"
          >
            <view class="card-content">
              <text class="card-title">{{ item.title }}</text>
              <text class="card-result">{{ item.result }}</text>
            </view>
          </view>
        </view>
        
        <!-- 统计数据 -->
        <view class="stats-section">
          <view class="stats-left">
            <image class="line-icon" :src="ACTIVITY_IMG_PATH +'image_13.png'" mode="aspectFit" />
            <view class="stats-item">
              <image class="dot-icon" :src="ACTIVITY_IMG_PATH +'image_14.png'" mode="aspectFit" />
              <text class="stats-text">平均打卡10天</text>
            </view>
            <view class="stats-item highlight">
              <image class="dot-icon" :src="ACTIVITY_IMG_PATH +'image_14.png'" mode="aspectFit" />
              <text class="stats-text">减重3.8斤</text>
            </view>
          </view>
          
          <view class="qr-code-section">
            <view class="qr-code-wrapper">
              <image class="qr-frame" :src="ACTIVITY_IMG_PATH +'image_15.png'" mode="aspectFit" />
              <image class="qr-code" :src="ACTIVITY_IMG_PATH +'image_16.png'" mode="aspectFit" />
              <image class="qr-overlay" :src="ACTIVITY_IMG_PATH +'image_17.png'" mode="aspectFit" />
            </view>
            <text class="qr-text">添加顾问 一起健康享瘦</text>
          </view>
        </view>
      </view>
      
      <!-- 奖励区域 -->
      <view class="reward-section">
        <view class="reward-header">
          <image class="reward-decoration" :src="ACTIVITY_IMG_PATH +'image_18.png'" mode="aspectFit" />
          <view class="reward-title-wrapper">
            <text class="reward-title">参与打卡赢好礼!</text>
          </view>
          <image class="reward-decoration" :src="ACTIVITY_IMG_PATH +'image_20.png'" mode="aspectFit" />
        </view>
        <view class="reward-content">
          <text class="reward-item">连续打卡七天可获积分奖励</text>
          <text class="reward-item">一周减重超过1KG可获HC周边礼品</text>
        </view>
      </view>
      
      <!-- 底部图片 -->
      <image class="bottom-image" :src="ACTIVITY_IMG_PATH +'image_21.png'" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { ACTIVITY_IMG_PATH } from '@/utils/imgpath'
// 打卡成果数据
const achievements = [
  {
    title: '连续打卡5天',
    result: '减重1.3kg',
    bgImage: 'image_10.png'
  },
  {
    title: '连续打卡21天',
    result: '减重4.5kg',
    bgImage: 'image_11.png'
  },
  {
    title: '连续打卡8天',
    result: '减重2.5kg',
    bgImage: 'image_12.png'
  }
]
</script>

<style lang="scss" scoped>
.checkin-success {
  min-height: 100vh;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  // 背景图层
  .bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    
    // &.layer-1 {
    //   background-image: url('/static/images/checkin/image_1.png');
    // }
    // &.layer-2 {
    //   background-image: url('/static/images/checkin/image_2.png');
    // }
    // &.layer-3 {
    //   background-image: url('/static/images/checkin/image_3.png');
    // }
  }
  
  .main-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

// 顶部成功提示
.success-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 84rpx;
  
  .success-icon {
    width: 125rpx;
    height: 93rpx;
    margin-left: 17rpx;
  }
  
  .success-title {
    margin-top: 36rpx;
    font-size: 36rpx;
    color: #000000;
    font-weight: normal;
  }
}

// 顾问邀请区域
.consultant-section {
  // background-image: url('/static/images/checkin/image_5.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 51rpx 20rpx;
}

.consultant-header {
  position: relative;
  width: 651rpx;
  height: 124rpx;
  margin-bottom: 27rpx;
  
  .star-icon {
    position: absolute;
    top: 14rpx;
    left: 0;
    width: 22rpx;
    height: 30rpx;
  }
  
  .header-text {
    position: absolute;
    top: 0;
    left: 11rpx;
    transform: rotate(-2.58deg);
    
    .main-text {
      font-size: 72rpx;
      color: #ff803f;
      font-weight: bold;
    }
    
    .sub-text {
      font-size: 56rpx;
      color: #ff803f;
      font-weight: bold;
      margin-left: 10rpx;
    }
  }
  
  .underline-icon {
    position: absolute;
    top: 84rpx;
    left: 13rpx;
    width: 638rpx;
    height: 39rpx;
  }
}

// 成果卡片
.achievement-cards {
  display: flex;
  justify-content: space-between;
  width: 650rpx;
  height: 400rpx;
  margin-left: 10rpx;
  margin-bottom: 33rpx;
}

.achievement-card {
  width: 210rpx;
  height: 400rpx;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  
  .card-content {
    margin-top: 159rpx;
    margin-right: 19rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .card-title,
    .card-result {
      font-size: 30rpx;
      color: #ff803f;
      font-weight: bold;
      white-space: nowrap;
    }
  }
}

// 统计数据
.stats-section {
  display: flex;
  justify-content:space-around;
  align-items: flex-start;
  width: 100%;
  height: 242rpx;
}

.stats-left {
  position: relative;
  margin-top: 30rpx;
  
  .line-icon {
    position: absolute;
    top: 0;
    left: 9rpx;
    width: 1rpx;
    height: 135rpx;
  }
  
  .stats-item {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
    
    .dot-icon {
      width: 20rpx;
      height: 20rpx;
      margin-top: 13rpx;
    }
    
    .stats-text {
      font-size: 36rpx;
      color: #000000;
      font-weight: bold;
      margin-left: 6rpx;
    }
    
    &.highlight .stats-text {
      color: #ff803f;
    }
  }
}

.qr-code-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .qr-code-wrapper {
    position: relative;
    width: 208rpx;
    height: 209rpx;
    
    .qr-frame,
    .qr-code,
    .qr-overlay {
      position: absolute;
      top: 7rpx;
      left: 7rpx;
      width: 194rpx;
      height: 194rpx;
    }
    
    .qr-frame {
      top: 0;
      left: 0;
      width: 208rpx;
      height: 209rpx;
    }
  }
  
  .qr-text {
    margin-top: 9rpx;
    font-size: 18rpx;
    color: #000000;
    text-align: center;
  }
}

// 奖励区域
.reward-section {
  height: 217rpx;
  margin-top: 81rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward-header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 680rpx;
  height: 93rpx;
  margin-bottom: 28rpx;
  
  .reward-decoration {
    width: 55rpx;
    height: 91rpx;
  }
  
  .reward-title-wrapper {
    width: 560rpx;
    height: 90rpx;
    margin: 0 5rpx;
    // background-image: url('/static/images/checkin/image_19.png');
    background-size: 100% 100%;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 1rpx;
    
    .reward-title {
      font-size: 60rpx;
      color: #ffffff;
      font-weight: bold;
      margin-left: 50rpx;
    }
  }
}

.reward-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .reward-item {
    font-size: 36rpx;
    color: #000008;
    text-align: center;
    white-space: nowrap;
  }
}

.bottom-image {
  height: 690rpx;
  margin-top: 44rpx;
}
</style>