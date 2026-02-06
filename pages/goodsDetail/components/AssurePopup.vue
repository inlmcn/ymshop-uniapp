<script setup>
import { ref } from "vue";
import Popup from "@/components/Popup.vue";
const popupRef = ref(null);
const title = ref('服务')
const assureList = ref([])

function open(list) {
  if (!list) return
  assureList.value = list
  popupRef.value.show()
}

function cancel() {
  assureList.value = []
  popupRef.value.close()
}

defineExpose({open})
</script>

<template>
  <Popup
      ref="popupRef"
      :title="title">
    <template #rightOption><span> </span></template>
    <view class="assure-box">
      <template
          v-for="item in assureList"
          :key="item.id">
        <view class="item">
          <view class="title">{{item.name}}</view>
          <view class="content">{{item.content}}</view>
        </view>
      </template>

    </view>
    <view
        class="cancel"
        @click="cancel">
      取消
    </view>
  </Popup>
</template>

<style
    lang="scss"
    scoped>
.assure-box {
  width: 100%;
  @include usePadding(20, 45);

  .item {
    margin-bottom: 60rpx;
    .title{
      font-weight: bold;
      margin-bottom: 20rpx;
    }
    .content{}
  }
}

.cancel {
  width: 100%;
  text-align: center;
  @include usePadding(0, 25);
  border-top: 1rpx solid $page-bg-color;
  transition: all .3s;

  &:active {
    scale: 0.9;
  }
}

button {
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  font-size: 26rpx;
  align-items: center !important;
  line-height: normal;

  &:after {
    box-shadow: none;
    border: none;
  }
}
</style>
