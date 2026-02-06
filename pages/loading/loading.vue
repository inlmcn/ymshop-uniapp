<template>
  <layout class="bargaining">
    <view class="swiper">
      <image :src="bargainingBg" />
    </view>
    <blank size="15"></blank>
    <container min>
      <uv-grid
        :border="false"
        :col="1"
        :gutter="10"
      >
        <uv-grid-item>
          <goods
            list
            title="Cookawu灰色涤纶宽松T 恤潮趣味罗文落肩上衣"
            primary
            groupNum="3"
            price="239"
            original="339"
          >
            <template #action>
              <uv-button
                round
                block
                type="primary"
              >
                立即拼团
              </uv-button>
            </template>
          </goods>

        </uv-grid-item>
      </uv-grid>
    </container>
    <blank size="15"></blank>

  </layout>
</template>

<script setup>
import { bargainingBg } from "@/utils/images";
export default {
  data() {
    return {
      title: 'Hello'
    }
  },
  onLoad() {

  },
  methods: {

  }
}
</script>

<style lang="scss">
.bargaining {
  background-color: #333333;
}

.swiper {
  width: 100%;

  .image {
    width: 100%;
    display: block;
  }
}

.groupBuy-top {
  margin-top: -182rpx;
  z-index: 9;
  position: relative;
}
</style>
