<template>
  <view class="index-container">
    <Header
        system-bar-area-bg="#fff"
        header-area-bg="#fff"
        :scroll-top="scrollTop">
      {{headerName}}
    </Header>
    <CanvasPage :canvas-id="canvasId" :scroll-top="scrollTop" @updateName="updateName"/>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad, onPageScroll, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { useMainStore } from '@/store/modules/useMainStore'
import CanvasPage from './components/canvasShow/canvasShowPage.vue'
import { useShare } from "@/hooks/useShare";
import {useRouter} from "@/hooks/useRouter";
import Header from "@/components/Header/index.vue";
import {useScroll} from "@/hooks/useScroll";
const {getParams} = useRouter();
const canvasId = ref(0)
const headerName = ref('')
const {scrollTop} = useScroll()
const main = useMainStore()

const {shareAppMessage, shareTimeline} = useShare();
onShareAppMessage(shareAppMessage)
onShareTimeline(shareTimeline)

const updateName = (val)=>{
  headerName.value = val
}

const props = defineProps({
    details: String,
})
console.log("props.details", props.details);

console.log("props.details2", JSON.parse(props.details));

canvasId.value = JSON.parse(props.details).id
 
//const data2 = getParams(props.details)
//console.log("data", data2);
 

//console.log("id22222:",props.id)

onLoad((options) => {
  const params = getParams(options)
  //canvasId.value = params.id
  main.init()
})



</script>

<style lang="scss">
.index-container {
  width: 100%;
  position: relative;
}
</style>
