<template>
	<!-- #ifdef MP-WEIXIN -->
  <Header
      ref="headerRef"
      :show-return="false"
      headerAreaBg="#f3f4f6"
      systemBarAreaBg="#f3f4f6"
      :scroll-top="scrollTop"> 分类
  </Header>
  <!-- #endif -->
  <view
      class="goods-category"
      :style="computeMainBoxStyle"
  >
    <uv-vtabs
        :list="categoryData"
        :hdHeight="`${headerRef&&headerRef.containerHeight || 0}px`"
    >
      <template
          v-for="(item, index) in categoryData"
          :key="index"
      >
        <uv-vtabs-item :index="index">
          <view class="category-list">
            <view
                class="category"
            >
              <view class="category-title" @click="toGoodsCategoryList(item.id)">
                <view class="category-title-text">
                  {{ item.name }}
                </view>
                <uv-icon
                    name="arrow-right"
                    color="#ccc"
                    size="14"
                    class="icon"
                />
              </view>
              <view class="category-content">
                <uv-grid
                    :border="false"
                    :col="3"
                >
                  <uv-grid-item
                      v-for="goodCategory in item.children"
                      @click="toGoodsCategoryList(goodCategory.id)"
                      :key="goodCategory.id"
                  >
                    <view class="category-item">
                      <view class="category-item-icon">
                        <image
                            class="image"
                            :src="goodCategory.picUrl"
                            mode="aspectFit"
                        />
                      </view>
                      <view class="category-item-name">
                        {{ goodCategory.name }}
                      </view>
                    </view>
                  </uv-grid-item>
                </uv-grid>
              </view>
            </view>
          </view>
        </uv-vtabs-item>
      </template>
      <uv-gap
          bg-color="#fff"
          height="600"
      ></uv-gap>
    </uv-vtabs>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { getCategoryList } from '@/api/product'
import { useRouter } from "@/hooks/useRouter";
import Header from "@/components/Header/index.vue"
import { onLoad } from "@dcloudio/uni-app";
import UvVtabs from "@/uni_modules/uv-vtabs/components/uv-vtabs/uv-vtabs.vue";
import UvVtabsItem from "@/uni_modules/uv-vtabs/components/uv-vtabs-item/uv-vtabs-item.vue";
import UvGrid from "@/uni_modules/uv-grid/components/uv-grid/uv-grid.vue";
import UvGridItem from "@/uni_modules/uv-grid/components/uv-grid-item/uv-grid-item.vue";
import UvGap from "@/uni_modules/uv-gap/components/uv-gap/uv-gap.vue";
import { useScroll } from "@/hooks/useScroll";

const {push} = useRouter()
const {scrollTop} = useScroll()
const headerRef = ref() //导航条

// 中心高度 100bh - 上导航栏 - h5底部高度
const computeMainBoxStyle = computed(() => {
  const height = headerRef.value?.containerHeight ?? 0
  return {
    height: `calc(100vh - ${ height }rpx - var(--window-bottom))`
  }
})

const categoryData = ref([]) // 分类列表

/**
 * 获取分类
 */
async function doGetCategoryList() {
  const category = await getCategoryList()
  if (!category) return
  // 二级分类，需要处理一下
  categoryData.value = arrayToTree(category)
}

/**
 * 数组转tree
 * @param items
 * @returns {*[]}
 */
function arrayToTree(items) {
  const rootItems = [];
  const itemMap = {};

  // 首先，将所有项按照id映射到itemMap中，并找到根项（没有父项的项）
  items.forEach(item => {
    itemMap[item.id] = {...item, children: []};

    if (item.parentId === 0) {
      rootItems.push(itemMap[item.id]);
    }
  });

  // 然后，将子项添加到父项的children属性中
  items.forEach(item => {
    if (item.parentId !== 0) {
      itemMap[item.parentId].children.push(itemMap[item.id]);
    }
  });

  return rootItems;
}

/**
 * 去商品列表
 * @param categoryId
 */
function toGoodsCategoryList(categoryId) {
  push({
    url: '/pages/goodsList/goodsList'
  }, {
    data: {sid: categoryId}
  })
}


onLoad(() => {
  doGetCategoryList()
})
</script>

<style lang="scss">
.goods-category {
  width: 100%;
  overflow: hidden;
}

.category-list {
  padding: 0 20rpx;
}

.category {
  margin-bottom: 20rpx;

  &-title {
    display: flex;
    align-items: center;
    margin-top: 50rpx;
    margin-bottom: 30rpx;
    justify-content: space-between;
    &-text {
      line-height: 45rpx;
      font-size: 32rpx;
      color: #333333;
      margin: 0 30rpx;
    }

    .line {
      width: 30rpx;
      height: 1rpx;
      background: #CCCCCC;
    }
  }

  &-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 30rpx;

    .image {
      width: 150rpx;
      height: 110rpx;
      display: block;
      background: #ffffff;
    }

    &-name {
      margin-top: 20rpx;
      line-height: 32rpx;
      font-size: 24rpx;
      color: #999999;
    }
  }
}

.goods-category :deep(.uv-vtabs__bar) {
  background: #F5F5F5;

  .uv-vtabs__bar-item {
    text-align: center;
  }
}
</style>
