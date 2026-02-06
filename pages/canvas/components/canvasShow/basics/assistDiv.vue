<template>
  <div class="div" :style="{backgroundColor:componentContent.bgColor,height:componentContent.height + 'rpx'}"></div>
</template>

<script setup>
import { toRefs } from 'vue';
const props = defineProps({
  terminal: {
    type: Number,
    default: 4,
  },
  componentContent: {
    type: Object,
    default () {
      return {};
    }
  },
})
const { componentContent } = toRefs(props)
</script>

<style scoped>
  .div{
    width: 100%;
  }
</style>
