<template>
  <div class="custom" :class="'terminal' + terminal" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div class="rowLayout" v-if="componentContent.layoutType ==='L1' || componentContent.layoutType ==='L2' || componentContent.layoutType ==='L3' || componentContent.layoutType ==='L4'">
      <div class="customLayout" :style="{'padding':'0 ' + componentContent.pageSpacing + 'px','marginLeft':(-componentContent.imgClearance) +'px'}">
        <div class="ul clearfix" :class="'layout'+componentContent.layoutType">
          <div class='li' v-for="(item,index) of componentContent.imgData" :key="index" :style="{'width':getItemValue(item.width) + '%','height':getItemValue(item.height) + '%','left':getItemValue(item.left) + '%','top':getItemValue(item.top) + '%','paddingLeft':componentContent.imgClearance +'px'}">
            <a class="a-link" @click="jumpLink(item.linkObj)"><image class="img" :src="item.src" v-if="item.src" mode="widthFix" /></a>
          </div>
        </div>
      </div>
    </div>
    <div v-else :style="{'padding':'0 ' + componentContent.pageSpacing + 'upx'}">
      <div class="boxLayout" :style="{'paddingBottom':componentContent.maxH !== 0?getItemValue(componentContent.maxH) + '%': (componentContent.layoutType === 'L1T1B2' ? '50%' : '100%')}">
        <div class="boxLayoutInner">
          <div class="boxWarp">
            <div class="customLayout" :style="{'marginLeft':(-componentContent.imgClearance) +'px','top':(-componentContent.imgClearance) +'px'}">
              <div class="ul clearfix" :class="'layout'+componentContent.layoutType">
                <div class='li' v-for="(item,index) of componentContent.imgData" :key="index" :style="{'width':getItemValue(item.width) + '%','height':getItemValue(item.height) + '%','left':getItemValue(item.left) + '%','top':getItemValue(item.top) + '%','padding':componentContent.imgClearance +'px 0 0 ' + componentContent.imgClearance +'px'}">
                  <a class="a-link" @click="jumpLink(item.linkObj)"><image class="img" :src="item.src" v-if="item.src" mode="aspectFit" /></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRefs } from 'vue';
import funMixin from '../config/mixin/funMixin.js'
const { jumpLink } = funMixin()
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
  }
})
const { terminal, componentContent } = toRefs(props)
// 计算生成格子百分比
function getItemValue (val) {
  const density = parseInt(componentContent.value.density)
  if (val === 0 || density === 0) {
    return 0
  }
  return ((val / density) * 10000) / 100.0 // 小数点后两位百分比
}
</script>

<style lang="scss" scoped>
.custom{
  //width: 710upx;
  //margin: 0 auto;
  .boxLayout{
    position: relative;
    .boxLayoutInner{
      padding-bottom: 100%;
      position: absolute;
      width: 100%;
      left: 0;
      top: 0;
    }
    .boxWarp{
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      overflow: hidden;
    }
  }
  .customLayout{
    position: relative;
    .ul{
      display: flex;
      flex-wrap: wrap;
      position: relative;
    }
    .li{
      box-sizing: border-box;
      .img{
        width: 100%;
        display: block;
      }
      .a-link {
        height: 100%;
      }
    }
    .layoutL1 .li{
      flex: 0 0 100%;
    }
    .layoutL2 .li{
      flex: 0 0 50%;
    }
    .layoutL3 .li{
      flex: 0 0 33.3%;
    }
    .layoutL4 .li{
      flex: 0 0 25%;
    }
    .layoutT2B2{
      padding-bottom: 100%;
      .li{
        width: 50%;
        height: 50%;
        position: absolute;
        .img{
          width: 100%;
          height: 100%;
        }
        &:nth-child(1){
          left: 0;
          top: 0;
        }
        &:nth-child(2){
          right: 0;
          top: 0;
        }
        &:nth-child(3){
          left: 0;
          bottom: 0;
        }
        &:nth-child(4){
          right: 0;
          bottom: 0;
        }
      }
    }
    .layoutL1R2{
      padding-bottom: 100%;
      .li{
        width: 50%;
        height: 50%;
        position: absolute;
        .img{
          width: 100%;
          height: 100%;
        }
        &:nth-child(1){
          height: 100%;
          left: 0;
          top: 0;
        }
        &:nth-child(2){
          right: 0;
          top: 0;
        }
        &:nth-child(3){
          right: 0;
          bottom: 0;
        }
      }
    }
    .layoutT1B2{
      padding-bottom: 100%;
      .li{
        width: 50%;
        height: 50%;
        position: absolute;
        .img{
          width: 100%;
          height: 100%;
        }
        &:nth-child(1){
          width: 100%;
          left: 0;
          top: 0;
        }
        &:nth-child(2){
          left: 0;
          bottom: 0;
        }
        &:nth-child(3){
          right: 0;
          bottom: 0;
        }
      }
    }
    .layoutL1T1B2{
      padding-bottom: 50%;
      .li{
        position: absolute;
        .img{
          width: 100%;
          height: 100%;
        }
        &:nth-child(1){
          width: 50%;
          height: 100%;
          left: 0;
          top: 0;
        }
        &:nth-child(2){
          right: 0;
          top: 0;
          width: 50%;
          height: 50%;
        }
        &:nth-child(3){
          left: 50%;
          bottom: 0;
          width: 25%;
          height: 50%;
        }
        &:nth-child(4){
          right: 0;
          bottom: 0;
          width: 25%;
          height: 50%;
        }
      }
    }
    .layoutaverage{
      padding-bottom: 100%;
      .li{
        position: absolute;
        .img{
          width: 100%;
          height: 100%;
        }
      }
    }
    // #ifdef MP
    .layoutaverage{
      padding-bottom: 91%;
    }
    // #endif
  }
}
</style>
