<!--
    @name: 新品首发
    @author: kahu4
    @date: 2023-10-27 14:42
    @description：index
    @update: 2023-10-27 14:42
-->
<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { usePage } from "@/hooks";
import { getProductList } from "@/api/product";
import Empty from "@/components/Empty/index.vue"
import ListLoadOver from "@/components/ListLoadOver/index.vue"
import ListLoadLoading from "@/components/ListLoadLoading/index.vue"
import { useRouter } from "@/hooks/useRouter";
import {emptyCollectIcon} from "@/utils/images";
import Goods from "@/components/goodsComponents/Goods.vue";
import { computed, toRefs } from "vue";

const {refresh, dataList, loadend, loading, listEmpty} = usePage(getProductList)
const {push} = useRouter()
onLoad(() => {
  refresh()
})
const props = defineProps({
  more:{
    type:Boolean,
    default:()=>true
  }
})
const { more } = toRefs(props)


const colList = computed(() => [
  {
    name: 'all',
    data: dataList.value.filter((item,index)=>index%2===0)
  },
  {
    name:'right',
    data: dataList.value.filter((item,index)=>index%2!==0)
  }
])
const executeRefresh = () => {
  refresh()
}

defineExpose({ executeRefresh })
</script>

<template>
  <!--push({ url: '/pages/goodsList/goodsList' }-->
  <view class="recommend-container" v-if="!listEmpty">
    <slot name="head">
      <view class="title-row">
        商品推荐
      </view>
    </slot>
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
      暂时没有商品推荐哦~
    </Empty>
    <!-- 加载中 -->
    <ListLoadLoading v-if="loading" />
    <!-- 加载完毕-->
    <ListLoadOver v-if="loadend" >
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
</template>


<style
    scoped
    lang="scss"
>
.recommend-container{
  @include usePadding(30, 20);
  width: 100%;
  .title-row{
    width: 100%;
    font-size:32rpx;
    text-align: center;
    position: relative;
    color: #333;
    font-weight: bold;
    &::before,&::after{
      content: '';
      position: absolute;
      width: 10%;
      height: 3rpx;
      border-radius: 5rpx;
      background: #333;
      top: 50%;
      transform: translate(0,50%);
    }
    &::before{
      left: 25%;
    }
    &::after{
      right: 25%;
    }
  }
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
    &:nth-child(2){
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
</style>
