<!--
    @name: 上哦
    @author: kahu4
    @date: 2023-11-02 18:30
    @description：Goods
    @update: 2023-11-02 18:30
-->
<script setup>
import LazyImage from '@/components/LazyImage/index.vue'
import { computed, toRefs } from "vue";
import { GOODS_ITEM_TYPE } from "@/components/goodsComponents/utils/index.type";
import { useRouter } from "@/hooks/useRouter";
import { getRandom } from "@/utils/utils";

const props = defineProps({
  goods: {
    type: Object,
    default: () => ({})
  },
  imgWidth: {
    type: String,
    default: '100%'
  },
  /** 图片比例 */
  ratio: {
    type: [String, Boolean],
    default: () => '1/1'
  },
  infoPadding: {
    type: String,
    default: () => "0 0"
  },
  /** title是否换行 */
  titleWrap: {
    type: Boolean,
    default: () => false
  },
  /** title 文字大小 rpx */
  titleSize: {
    type: Number,
    default: () => 28
  },
  type: {
    type: String,
    default: () => GOODS_ITEM_TYPE.NEW
  },
  row: {
    type: Boolean,
    default: false
  },
  jump: {
    type: Boolean,
    default: true
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

const {
  goods,
  imgWidth,
  ratio,
  infoPadding,
  titleWrap,
  titleSize,
  row,
  jump, rounded
} = toRefs(props)

const {push} = useRouter()

const randomRatio = computed(() => (`${ 1 / getRandom(1, 1.3) }`))

function toDetail() {
  if (!jump.value) return
  push({url: '/pages/product/detail'}, {data: {id: goods.value.id, skuId: goods.value.skuId}})
}


</script>

<template>
  <view
      :class="{'goods':true,'row':row,'no-rounded':!rounded}"
      @click="toDetail"
  >
    <!-- goods image -->
    <view
        class="goods-image"
        :style="{
          'width':imgWidth,
          'aspect-ratio': ratio===true?randomRatio:ratio
        }"
    >
      <LazyImage
          :unique="goods.id"
          :src="goods.image"
          class="image"
          :mode="ratio===true?'aspectFit':'aspectFill'"
      />
    </view>
    <!-- good info -->
    <view
        class="goods-info"
        :style="{
          'padding':infoPadding,
          'width':row?`calc( 100% - ${imgWidth} )`:'100%',
          'height':row?`${imgWidth}`:'auto'
         }"
    >
      <view
          :class="{
              'title-row':true,
              'nowrap': !titleWrap
          }"
          :style="{
              'font-size':`${titleSize}rpx`
          }"
      >
        {{ goods.storeName }}
      </view>
      <view
          class=""
          style="width: 100%;">
        <slot
            name="options"
            :goods="goods"
        ></slot>
      </view>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.goods {
  position: relative;
  width: 100%;
  border-radius: 15rpx;
  overflow: hidden;

  &-image {
    flex-shrink: 0;

    .image {
      width: 100%;
      height: 100%;
    }
  }

  &-info {
    width: 100%;
    box-sizing: border-box;

    .title-row {
      user-select: none;
      width: 100%;
      padding-bottom: 15rpx;
      font-size: 28rpx;
    }

    .nowrap {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .goods-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: space-between;
  }

}

.no-rounded {
  border-radius: 0;
}
</style>
