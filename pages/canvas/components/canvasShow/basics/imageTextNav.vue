<template>
  <div class="nav-warp" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div
        class="ul image-text-nav"
        :class="'terminal' + terminal"
        :style="{ backgroundColor: componentContent.comBgColor }"
    >
      <div
          v-for="(item, index) in componentContent.imgTextData"
          :key="index"
          class="li"
          @click="jumpLink(item.linkObj)"
      >
        <div class="img-box">
          <div class="img-box-inner">
            <image
                :style="{ width: item.width+'rpx',height: item.height+'rpx'}"
                class="img"
                :src="item.img"
                fit="contain" />
          </div>
        </div>
        <h4 class="h4">{{ item.title }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import { funMixin } from '../config/mixin'

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
.nav-warp{
  padding: 0 34rpx;
}
.image-text-nav {
  min-height: 102rpx;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 20rpx 0;
  background-color: #fff;
  border-radius: 15rpx;

  .li {
    text-align: center;
    flex: 1;
    min-width: 25%;
    padding: 10rpx 0;
    .img-box {
      .img {
        width: 60rpx;
        height: 60rpx;
      }
    }

    .h4 {
      font-size: 24rpx;
      color: #333;
      line-height: 33rpx;
      margin-top: 18rpx;
    }
  }

  &.terminal4 {
    width: 1000rpx;

    .li {
      .img-box {
        display: inline-block;
        width: 100rpx;
        height: 100rpx;
        border: 2rpx solid #f3f4f5;
        border-radius: 10rpx;

        &-inner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .img {
          width: 60rpx;
          height: 60rpx;
        }
      }

      .h4 {
        font-size: 18rpx;
        color: #ccc;
        line-height: 1em;
        padding-top: 20rpx;
      }
    }
  }
}
</style>
