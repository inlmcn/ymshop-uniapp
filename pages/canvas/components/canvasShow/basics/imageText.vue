<template>
  <div
      class="imageText"
      :class="['terminal'+terminal,'pos-' + componentContent.positionValue]"
      :style="{ backgroundColor: componentContent.pageBgColor }"
  >
    <div class="img-box img-left">
      <a
          class="item a-link"
          @click="jumpLink(componentContent.linkObj)">
        <image
            class="img"
            :src="componentContent.imageUrl"
            alt=""
            mode="aspectFit" />
      </a>
    </div>
    <div class="text">
      <h3 class="h3">{{ componentContent.title }}</h3>
      <div v-html="componentContent.content"></div>
    </div>
    <div class="img-box img-right">
      <a
          class="item a-link"
          @click="jumpLink(componentContent.linkObj)">
        <image
            class="img"
            :src="componentContent.imageUrl"
            alt=""
            mode="aspectFit" />
      </a>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import funMixin from '../config/mixin/funMixin.js'

const {jumpLink} = funMixin()
const props = defineProps({
  terminal: {
    type: Number,
    default: 4,
  },
  componentContent: {
    type: Object,
    default() {
      return {};
    }
  }
})
const {terminal, componentContent} = toRefs(props)
</script>

<style
    lang="scss"
    scoped>
.imageText {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20upx 34rpx;

  .img-box {
    width: 50%;
    padding-bottom: 30%;
    background-color: #cacaca;
    position: relative;

    .img {
      max-width: 100%;
      height: 100%;
      max-height: 100%;
      position: absolute;
      margin: auto;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }

  .text {
    width: 40%;

    .h3 {
      font-size: 30upx;
      margin-bottom: 24upx;
    }

    .p {
      font-size: 16upx;
    }
  }

  &.pos-top {
    display: block;
    text-align: center;

    .img-box {
      width: 100%;
    }

    .text {
      width: 100%;
      margin-top: 30upx;
    }

    .img-right {
      display: none;
    }
  }

  &.pos-bottom {
    display: block;
    text-align: center;

    .img-box {
      width: 100%;
    }

    .text {
      width: 100%;
      margin-bottom: 30upx;
    }

    .img-left {
      display: none;
    }
  }

  &.pos-left {
    .img-right {
      display: none;
    }
  }

  &.pos-right {
    .text {
      padding-left: 20upx;
    }

    .img-left {
      display: none;
    }
  }

}

.terminal1, .terminal2, .terminal3 {
  width: 710upx;
  margin: 0 auto;
}
</style>
