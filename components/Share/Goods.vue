<!--
    @name: index
    @author: kahu4
    @date: 2024-01-16 17:20
    @description：index
    @update: 2024-01-16 17:20
-->
<script setup>
import { ref } from "vue";
import Popup from "@/components/Popup.vue";
import { photoShare, wechatShare } from "@/utils/images";
import { cloneDeep } from "lodash-es";

const emits = defineEmits(['share'])
const popupRef = ref(null);
const title = ref('分享')
const goods = ref(undefined)

function open(titleStr, good = undefined) {
  if (!good) return
  titleStr && (title.value = titleStr)
  goods.value = good
  popupRef.value.show()
}

function close() {

}

function cancel() {
  goods.value = undefined
  popupRef.value.close()
}

function doShare(shareItem) {
  emits('share', shareItem, cloneDeep(goods.value))
  cancel()
}

defineExpose({open})

const shareList = [
  {
    label: '微信好友',
    value: 'wechat',
    icon: wechatShare
  },
  {
    label: '生成海报',
    value: 'photo',
    icon: photoShare
  }
]
</script>

<template>
  <Popup
      ref="popupRef"
      :title="title">
    <template #rightOption><span> </span></template>
    <view class="share-box flex flex-ai__center flex-jc__sa">
      <template
          v-for="item in shareList"
          :key="item.value">
        <template v-if="item.value === 'wechat'">
          <button
              open-type="share"
              @click="doShare(item)"
              class="item flex flex-column flex-jc__center flex-ai__center">
            <image :src="item.icon" />
            <text> {{ item.label }}</text>
          </button>
        </template>
        <template v-else>
          <view
              @click="doShare(item)"
              class="item flex flex-column flex-jc__center flex-ai__center">
            <image :src="item.icon" />
            <text> {{ item.label }}</text>
          </view>
        </template>
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
.share-box {
  width: 100%;
  @include usePadding(0, 45);

  .item {
    image {
      width: 96rpx;
      height: 96rpx;
      border-radius: 50%;
    }

    font-size: 26rpx;
    transition: all .3s;

    &:active {
      scale: 0.9;
    }
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
