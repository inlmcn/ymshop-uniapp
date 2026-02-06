<template>
  <view class="questionnaire-container">
    <view class="questionnaire-header">
      <text class="title">用户满意度调查问卷</text>
    </view>
    <view class="questionnaire-content">
      <view class="question-item">
        <text class="question">1. 您对我们的产品/服务整体满意度如何？</text>
        <radio-group class="options">
          <label class="option">
            <radio value="5" />
            <text>非常满意</text>
          </label>
          <label class="option">
            <radio value="4" />
            <text>满意</text>
          </label>
          <label class="option">
            <radio value="3" />
            <text>一般</text>
          </label>
          <label class="option">
            <radio value="2" />
            <text>不满意</text>
          </label>
          <label class="option">
            <radio value="1" />
            <text>非常不满意</text>
          </label>
        </radio-group>
      </view>
      
      <view class="question-item">
        <text class="question">2. 您认为我们的产品/服务有哪些需要改进的地方？</text>
        <textarea class="textarea" placeholder="请输入您的建议..."></textarea>
      </view>
      
      <view class="question-item">
        <text class="question">3. 您是否会推荐我们的产品/服务给朋友？</text>
        <radio-group class="options">
          <label class="option">
            <radio value="yes" />
            <text>会</text>
          </label>
          <label class="option">
            <radio value="no" />
            <text>不会</text>
          </label>
          <label class="option">
            <radio value="maybe" />
            <text>可能会</text>
          </label>
        </radio-group>
      </view>
      
      <view class="question-item">
        <text class="question">4. 您对我们的产品/服务还有其他意见或建议吗？</text>
        <textarea class="textarea" placeholder="请输入您的意见或建议..."></textarea>
      </view>
    </view>
    
    <view class="submit-button">
      <button @click="submitQuestionnaire">提交问卷</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';

// 提交问卷
function submitQuestionnaire() {
  uni.showToast({
    title: '感谢您的反馈',
    icon: 'success',
    duration: 2000
  });
  
  // 延迟返回上一页
  setTimeout(() => {
    uni.navigateBack();
  }, 2000);
}
</script>

<style scoped>
.questionnaire-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.questionnaire-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.questionnaire-content {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.question-item {
  margin-bottom: 40rpx;
}

.question {
  font-size: 30rpx;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.options {
  display: flex;
  flex-direction: column;
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}

.option text {
  margin-left: 20rpx;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  height: 150rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 15rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.submit-button {
  margin-top: 40rpx;
  text-align: center;
}

.submit-button button {
  background-color: #07c160;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 60rpx;
  font-size: 32rpx;
}
</style>