<template>
  <div class="text warp" :class="['text-'+componentContent.textPos,{'show-more':componentContent.showMore},'terminal' + terminal]" :style="{backgroundColor:componentContent.bgColor}">
    <div class="line-warp" :class="{'borderBot':componentContent.showLine}">
      <h3 class="h3" :style="{fontSize:componentContent.fontSizeNum+'rpx',fontWeight:componentContent.textFontW,color:componentContent.titColor}">{{componentContent.title}}</h3>
      <p class="p" :style="{fontSize:componentContent.describeSizeNum+'rpx',fontWeight:componentContent.describeFontW,color:componentContent.describeColor}">{{componentContent.describe}}</p>
      <div class="btn-more" v-show="componentContent.showMore" :class="'style'+componentContent.styleValue" @click="jumpLink(item.linkObj)"><span>查看更多</span><i class="iconfont icon-arrow-right"></i></div>
    </div>
  </div>
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
const { terminal, componentContent } = toRefs(props)
</script>

<style lang="scss" scoped>
  .text{
    position: relative;
    padding: 0 34rpx;
    .line-warp{
      padding: 10upx 0;
    }
    .borderBot{
      border-bottom: 1upx solid #cccc;
    }
    .h3{
      line-height: 1.5;
    }
    .p{
      line-height: 1.5;
      margin-top: 5upx;
    }
    .style1{

    }
    .style2{
      .iconfont{
        display: none;
      }
    }
    .style3{
      span{
        display: none;
      }
    }
    &.text-left{
      text-align: left;
      &.show-more{
        position: relative;
        padding-right: 20upx;
        .btn-more{
          position: absolute;
          right: 0;
          top: 10upx;
        }
      }
    }
    &.text-center{
      text-align: center;
    }
    &.text-right{
      text-align: right;
    }
  }
</style>
