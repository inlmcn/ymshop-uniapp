<template>
  <view class="customer-service-container">
    <web-view :src="serviceUrl"></web-view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const serviceUrl = ref('')

onLoad((options) => {
  console.log('[客服页面] 接收参数:', options)
  
  if (options.url) {
    serviceUrl.value = decodeURIComponent(options.url)
    console.log('[客服页面] 客服链接:', serviceUrl.value)
  } else {
    uni.showToast({
      title: '客服链接错误',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  }
})
</script>

<style scoped lang="scss">
.customer-service-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>
