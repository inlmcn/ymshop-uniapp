<!--
    @name: index
    @author: kahu4
    @date: 2024-01-16 11:19
    @description：index
    @update: 2024-01-16 11:19
-->
<script setup>
import { emptyCollectIcon, groupByBg } from "@/utils/images";
import Header from "@/components/Header/index.vue";
import { useScroll } from "@/hooks/useScroll";
import ListLoadLoading from "@/components/ListLoadLoading/index.vue";
import ListLoadOver from "@/components/ListLoadOver/index.vue";
import Empty from "@/components/Empty/index.vue";
import Goods from "@/components/goodsComponents/Goods.vue";
import { onLoad } from '@dcloudio/uni-app'
import { usePage } from "@/hooks";
import { getProductList } from "@/api/product";
import { useRouter } from "@/hooks/useRouter";
import { computed, toRefs } from "vue";
import GoodsItemOptions from "@/views/activity/groupBy/component/GoodsItemOptions.vue";

const {scrollTop} = useScroll()

const {refresh, dataList, loadend, loading, listEmpty} = usePage(getProductList)
const {push} = useRouter()
onLoad(() => {
  refresh()
})
const props = defineProps({
  more: {
    type: Boolean,
    default: () => true
  }
})
const {more} = toRefs(props)


const colList = computed(() => [
  {
    name: 'all',
    data: dataList.value.filter((item, index) => index % 2 === 0)
  },
  {
    name: 'right',
    data: dataList.value.filter((item, index) => index % 2 !== 0)
  }
])
const executeRefresh = () => {
  refresh()
  console.log()
}

defineExpose({executeRefresh})
</script>

<template>
  <Header
      :scroll-top="scrollTop"
  >
    拼团专区
  </Header>
  <view class="group-buy-container">
    <!-- 背景 -->
    <view class="bg-box">
      <image
          class="bg"
          :src="groupByBg" />
    </view>

    <!-- 内容 -->
    <view class="main-box">
      <view class="main-box__inner">
        <view
            class="row-product"
            v-if="colList[0].data.length>0">
          <Goods
              row
              :ratio="true"
              :goods="colList[0].data[0]"
              imgWidth="200rpx"
              infoPadding="0rpx 20rpx"
          >
            <template #options="{goods}">
              <GoodsItemOptions :goods="goods" />
            </template>
          </Goods>
        </view>
        <view
            class="product-box"
            v-if="!listEmpty"
        >
          <!-- 分两列 后期瀑布流 -->
          <template
              v-for="col in colList"
              :key="col.name"
          >
            <view class="goods-col">
              <template
                  v-for="item in col.data"
                  :key="item.id"
              >
                <view class="product">
                  <Goods
                      :ratio="true"
                      :goods="item"
                      infoPadding="30rpx 10rpx"
                  >
                    <template #options="{goods}">
                      <GoodsItemOptions :goods="goods" />
                    </template>
                  </Goods>
                </view>
              </template>
            </view>
          </template>
        </view>
        <Empty
            v-else
            :iconSrc="emptyCollectIcon"
        >
          暂时没有商品推荐哦~
        </Empty>
        <!-- 加载中 -->
        <ListLoadLoading v-if="loading" />
        <!-- 加载完毕-->
        <ListLoadOver v-if="loadend">
          <template v-if="more">
         <span @click="push({ url: '/pages/goodsList/goodsList' })">
        浏览更多商品
      </span>
          </template>
          <template v-else>
            到底了~
          </template>
        </ListLoadOver>
      </view>
    </view>
  </view>
</template>
<style lang="scss">
page {
  background: $page-bg-color;
}
</style>
<style
    scoped
    lang="scss">
.group-buy-container {
  width: 100%;
  position: relative;

  .bg-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    aspect-ratio: 750/435;

    .bg {
      width: 100%;
      height: 100%;
    }
  }

  .main-box {
    top: 250rpx;
    position: relative;
    @include usePadding(30, 30);

    &__inner {
      //background: #000;
      .row-product {
        @include usePadding(30, 30);
        width: 100%;
        background: $white-color;
        border-radius: 15rpx;
      }

      .product-box {
        margin-top: 30rpx;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
        //display: flex;
        //gap: 20rpx;

        .goods-col {
          width: 49%;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          flex-grow: 0;
          float: left;

          &:nth-child(2) {
            float: right;
          }


          .product {
            flex-grow: 0;
            width: 100%;
            background: $white-color;
            border-radius: 20rpx;
            overflow: hidden;
            margin-bottom: 20rpx;

            .good-bottom {
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 20rpx;

              .price {
                font-size: 28rpx;
              }

              .sale {
                color: #999999;
              }
            }
          }
        }
      }
    }
  }
}
</style>
