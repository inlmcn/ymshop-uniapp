<template>
  <view class="agreement-page">
    <Navbar title="隐私协议" />
    <view class="agreement-box">
      <rich-text :nodes="description" bindtap="onOpenLink" />
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import Navbar from "../components/Navbar.vue";
import { getNewsDetail } from "@/api/evaluation";

const description = ref("");

onLoad(() => {
  getNewsDetail(20).then((res) => {
    description.value = res.content.replace(/<img /g, "<img style='width:100%;' ");
  });
});
</script>

<style scoped lang="scss">
.agreement-box {
  padding: 30rpx;
  background-color: white;
  min-height: 100vh;
  box-sizing: border-box;
}
</style>
