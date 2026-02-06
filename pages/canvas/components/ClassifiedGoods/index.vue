<!--
    @name: index
    @author: kahu4
    @date: 2024-03-19 18:12
    @description：index
    @update: 2024-03-19 18:12
-->
<script setup>
import { computed, onMounted, toRefs, watch } from "vue";
import { usePage } from "@/hooks";
import { getProductList } from "@/api/product";
import { emptyCollectIcon } from "@/utils/images";
import Goods from "@/components/goodsComponents/Goods.vue";
import Empty from "@/components/Empty/index.vue";
import ListLoadLoading from "@/components/ListLoadLoading/index.vue";
import ListLoadOver from "@/components/ListLoadOver/index.vue";

/**
 * @property {number|string} classifyId 分类id
 */
const props = defineProps({
  classifyId: {
    type: [String, Number],
    required: true
  }
})

const {classifyId} = toRefs(props)
const {keyword, refresh, sid, couponId, dataList, loadend, loading, listEmpty} = usePage(getProductList)

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

watch(classifyId, async () => {
  sid.value = classifyId.value
  await refresh?.()
}, {
  immediate: true
})
// onMounted(async () => {
//   await refresh?.()
// })
</script>

<template>
  <view class="classify-goods">
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
                  infoPadding="20rpx"
              >
                <template #options>
                  <view class="good-bottom">
                    <view class="price">
                      ￥{{ item.price }}
                    </view>
                    <view class="sale">
                      仅剩{{ item.stock }}件
                    </view>
                  </view>
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
      当前分类暂时没有商品哦~
    </Empty>
    <!-- 加载中 -->
    <ListLoadLoading v-if="loading" />
    <!-- 加载完毕-->
    <ListLoadOver v-if="loadend">
      <span @click="push({ url: '/pages/goodsList/goodsList' })">
        浏览更多商品
      </span>
    </ListLoadOver>
  </view>
</template>

<style
    scoped
    lang="scss">
.classify-goods {
  @include usePadding(35, 0);

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
</style>
