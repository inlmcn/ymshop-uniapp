<template>
  <uv-navbar :fixed="true" :placeholder="true" :title="title" @leftClick="back()" />
  <div class="rich-text">
    <rich-text :nodes="ruleText" class="rich-content">

    </rich-text>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivityPageStore } from '@/store/modules/useActivityPageStore'
import { back } from '@/utils/router'

const activityPageStore = useActivityPageStore()
const ruleText = computed(() => {
  let text= activityPageStore.activityPageRule
  console.log('text',text)
  if(text) {
    text = text.replace(/<img/g, '<img style="max-width:100%;height:auto;display:block;margin:10rpx 0;"');
  }
  return text
})
const title = ref('活动规则说明')
</script>

<style lang="scss" scoped>
.rich-text {
  max-width: 100%;
}

image, img {
  max-width: 100% !important;
}

.rich-content {
  img {
    max-width: 100% !important;
    display: block;
  }
}
</style>