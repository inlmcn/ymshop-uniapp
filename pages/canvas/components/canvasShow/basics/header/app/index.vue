<template>
  <div class="header" :style="{ backgroundColor: componentContent.pageBgColor }">
    <div class="header-row">
      <image
          class="logo"
          :src="componentContent.imageUrl"
          mode="heightFix"
      />
      <div
          class="search-col"
          @click="toSearch(item)">
        <div class="search-input">
          <div v-if="componentContent.keyList.length === 0">搜索商品</div>
          <swiper
              v-else
              class="swiper-wrapper"
              :circular="true"
              :indicator-dots="false"
              :autoplay="true"
              :vertical="true">
            <swiper-item
                class="swiper-slide"
                v-for="(item,index) in componentContent.keyList"
                :key="index">
              <div class="a-link">{{ item }}</div>
            </swiper-item>
          </swiper>
        </div>
      </div>
    </div>
    <div class="tabs-nav-warp">
      <uv-tabs
          :current="tabCurrent"
          :list="tabsList"
          :activeStyle="{color:'#00CBCC',fontWeight: 'bold'}"
          key-name="name"
          line-color="#00CBCC"
          @change="handleTabsChange" />
    </div>
  </div>
</template>
<script setup>
import { computed, ref, toRefs } from 'vue';
import commonMixin from '../mixin';

const emits = defineEmits(['tabsChange'])

const props = defineProps({
  componentContent: {
    type: Object,
    default() {
      return {};
    },
  },
});
const {componentContent} = toRefs(props);

const {jumpLink, toSearch} = commonMixin();

/******************************** tab相关 ****************************************/
// 计算tab list，插入首页选项
const tabsList = computed(() => ([{name: '首页', category: {id: 'index'}}, ...componentContent.value.tabs]))
// 当前tab索引
const tabCurrent = ref(0)
// 当前tab项
const tabCurrentItem = computed(() => tabsList.value[tabCurrent.value])

/**
 * tabs 发生改变
 * @param index
 */
const handleTabsChange = ({index}) => {
  tabCurrent.value = index
  emits('tabsChange', tabCurrentItem.value)
}
</script>

<style
    lang="scss"
    scoped>
.header {
  padding: 11rpx 34rpx 0;
  overflow: hidden;

  .logo {
    // width: 280px;
    height: 40rpx;
    margin-bottom: 11rpx;
  }

  .search-col {
    height: 60rpx;
    overflow: hidden;
    border-radius: 30rpx;
    padding: 0 30rpx 0 90rpx;
    background: #FFFFFF url("https://hnapi.booseng.com/static/images/icon-search.png") no-repeat 30rpx center / auto 30rpx;
    font-size: 24rpx;
    line-height: 60rpx;
    color: #999999;
    margin: 24rpx 0;

    .search-input {
      width: 100%;
    }

    .swiper-wrapper {
      width: 100%;
      height: 60rpx;
    }
  }
}

.tabs-nav-warp {
  margin: 20rpx 0 10rpx 0;
}
</style>
