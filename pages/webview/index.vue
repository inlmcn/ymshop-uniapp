<!--
    @name: webview
    @author: kahu4
    @date: 2023-11-08 18:49
    @description：index
    @update: 2023-11-08 18:49
-->
<script setup>
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { ref } from "vue";

const {getParams} = useRouter()

const routeParams = ref({src: ''})

onLoad((options) => {
  routeParams.value = getParams(options)
})
</script>

<template>
  <view class="webview-container">
    <web-view :src="routeParams.src" />
  </view>
</template>

<style
    scoped
    lang="scss"
>

</style>
