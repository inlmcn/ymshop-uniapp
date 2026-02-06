<template>
  <div class="category-list" :class="'terminal' + terminal" :style="{ backgroundColor: componentContent.pageBgColor }">
    <h2 class="hom-title" :style="{textAlign:componentContent.textAlign}">{{componentContent.title}}</h2>
    <div class="content-warp">
      <div class="ul clearfix" :class="{number5: componentContent.categoryData.length === 5}">
        <div class="li" v-for="(item) of componentContent.categoryData" :key="item.id">
          <a class="item a-link" @click="jumpCategory(item.id)">
            <div class="imgBox">
              <image ref="getHeight" :src="item.img" v-show="item.img" :alt="item.name"  mode="aspectFit"/>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import funMixin from '../config/mixin/funMixin.js'
const { jumpCategory } = funMixin()
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
  .category-list{
    padding: 0 34rpx;
    .hom-title{
      font-size: 32rpx;
      color: #333;
      line-height: 48rpx;
      margin-bottom: 5rpx;
      text-align: center;
      font-weight: normal;
    }
    .content-warp{
      display: flex;
      .ul{
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        .li{
          flex: 1;
          padding: 10upx 0 0 10upx;
          box-sizing: border-box;
          .item{
            height: auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            .imgBox {
              padding-bottom: 80%;
              background-color: #cacaca;
              position: relative;
            }
            image {
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
        }
      }
      .number5 {
        display: block;
        .li {
          width: 25%;
          float: left;
        }
        .li:nth-child(1) {
          width: 50%;
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    .category-list .content-warp .ul .li{
      flex: 0 0 50%;
    }
  }
  .terminal1,.terminal2,.terminal3{
    &.category-list .content-warp{
      display: block;
      .ul{
        margin: -15upx 0 0 -15upx;
        width: auto;
        .li{
          flex: 0 0 50%;
          padding: 15upx 0 0 15upx;
        }
      }
    }
  }
</style>
