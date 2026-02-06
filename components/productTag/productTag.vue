<template>
  <div class="tag-box" :class="size && `tag-box-${size}`" v-if="data">
    <div class="tag tag-text" v-if="data.styleType === 1" :style="{'color': data.fontColor,'backgroundColor':data.bgColor,'borderColor':data.borderColor}">
      <div class="text">{{data.tagName}}</div>
    </div>
    <div class="tag tag-image" v-else :style="{'backgroundImage': `url(${data.imageUrl})`}">
      <div class="text">{{data.tagName}}</div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
const props = defineProps({
  data: {
    type: Object,
    default() {
      return {};
    },
  },
  size: {
    type: String,
    default: ''
  },
});
const {data} = toRefs(props);
</script>

<style
    lang="scss"
    scoped
>
.tag-box{
  float: left;
}
.tag{
  height: 32rpx;
  border-radius: 3rpx;
  padding: 0 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 4rpx 8rpx 0 0;
  .text{
    font-size: 20rpx;
  }
}
.tag-text{
  color: #333;
  border: 1px solid #ffffff;
}
.tag-image{
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: center;
  .text{
    color: #fff;
  }
}
</style>
