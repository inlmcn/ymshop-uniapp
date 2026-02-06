<template>
  <div class="videoBox" :class="'terminal' + terminal" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div class="videoLeftBox">
      <h3 v-if="componentContent.title">{{componentContent.title}}</h3>
      <div class="content" v-if="removeTags(componentContent.mainBody)" v-html="componentContent.mainBody"></div>
    </div>
    <div class="videoRightBox">
      <video class="myVideo" id="myVideo" :poster="componentContent.coverImg" :src="componentContent.videoUrl" enable-danmu danmu-btn controls></video>
    </div>
    <div class="clear"></div>
  </div>
</template>

<script setup>
import { toRefs, ref, onMounted } from 'vue';
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
const isPlay = ref(false)
const videoContext = ref(null)

onMounted(()=>{
  videoContext.value = uni.createVideoContext('myVideo',this)
})

function handlePlayVideo(){
  isPlay.value = true
  setTimeout(()=>{
    videoContext.value.play()
  },500)
}

// 清除html标签
const removeTags = (html)=>{
  return html.replace(/<[^>]*>/g, '');
}
</script>

<style lang="scss" scoped>
 .videoBox {
   padding: 0 34rpx;
   display: flex;
   justify-content: flex-start;
   align-items: center;
   .videoLeftBox {
     h3 {
       font-size: 28upx;
       color: #333333;
       margin-bottom: 10upx;
       font-weight: normal;
     }
     p {
       color: #333333;
       font-size: 14upx;
       line-height: 30upx;
     }
   }
   .videoRightBox {
     width: 50%;
     video {
       width: 100%;
     }
   }
   .clear {
     clear: both;
   }
 }
 .terminal1,.terminal2,.terminal3{
   &.videoBox{
     display: block;
     .videoLeftBox{
       width: 100%;
       text-align: center;
       .content{
         margin-bottom: 20px;
       }
     }
     .videoRightBox {
       width: 100%;
     }
   }
 }
 .myVideo{
   aspect-ratio: 16/9;
   height: auto;
 }
</style>
