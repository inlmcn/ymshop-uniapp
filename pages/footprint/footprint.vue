<template>
  <Header
      :scroll-top="scrollTop"
      header-area-bg="#fff"
      system-bar-area-bg="#fff">
    我的足迹
    <template #right>
      <view
          class="btn"
          @click="setManage(!showManage)"
      >
        {{ showManage ? '完成' : '管理' }}
      </view>
    </template>
  </Header>
  <view class="footprint">
    <uv-checkbox-group
        v-model="selectValues"
        shape="circle"
        activeColor="#00CBCC"
        v-if="dataList.length>0"
    >
      <UniSwipeAction
          class="w-full"
          :autoClose="false">
        <UniSwipeActionItem
            v-for="(item) in dataList"
            :key="item.id">
          <view class="flex flex-ai__center foot-item">
            <uv-checkbox
                v-if="showManage"
                :customStyle="{marginBottom: '8px'}"
                :name="item.id"
            />
            <goods
                list
                :data="item"
                :storeName="item.storeName"
                :price="item.price"
                :stock="item.stock"
                :isCollectFoot="true"
                interval="true"
                desc="3"
                showAction="true"
                surplus="200"
                priceMode="primary"
				link
            >
            </goods>
          </view>
          <template #right>
            <view
                class="delete-icon"
                @click="handleOpenDelete(true,item)">
              <uv-icon
                  name="trash"
                  color="#fff"
                  size="28" />
            </view>
          </template>
        </UniSwipeActionItem>
      </UniSwipeAction>
    </uv-checkbox-group>
    <Empty
        :icon-src="emptyCollectIcon"
        v-else />
  </view>

  <view class="option-height"></view>
  <!-- bar -->
  <view
      class="option-row"
      :style="{height:showManage?'100rpx':'0rpx'}"
  >
    <view class="left">
      <uv-checkbox-group
          v-model="isSelectAll"
          shape="circle"
          activeColor="#00CBCC"
          @change="handleClickSelectAll"
      >
        <uv-checkbox
            shape="circle"
            activeColor="#00CBCC"
            :name="1"
        >
          <span class="all-select">全选</span>
        </uv-checkbox>
      </uv-checkbox-group>
    </view>
    <view
        class="button"
        @click="handleOpenDelete(false)"
    >
      删除
    </view>
  </view>
  <Modal
      ref="deleteModal"
      content="确认要删除所选内容吗？"
      @confirm="toDelete"
      @cancel="toCancelDelete"
  ></Modal>
  <ReturnTop :scroll-top="scrollTop" />

</template>

<script setup>
import { computed, nextTick, ref, unref } from 'vue'
import { footprintPage, unFootprintByList, unFootprintSingle } from '@/api/product'
import { onLoad } from '@dcloudio/uni-app'
import Modal from '@/components/Modal/index.vue'

import { usePage } from '@/hooks'
import Empty from "@/components/Empty/index.vue";
import { emptyCollectIcon } from "@/utils/images";
import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";
import { useScroll } from "@/hooks/useScroll";
import ReturnTop from "@/components/ReturnTop/index.vue";
import Header from "@/components/Header/index.vue";
import UniSwipeAction from "@/pages/components/Uni/uni-swipe-action/uni-swipe-action.vue";
import UniSwipeActionItem from "@/pages/components/Uni/uni-swipe-action-item/uni-swipe-action-item.vue";

const {scrollTop} = useScroll()
const {goBack, push} = useRouter()
const {type, refresh, dataList} = usePage(footprintPage)

const {toast} = useInterface();

const showManage = ref(false) // 是否展示管理

/**
 * 设置是否展示
 * @param show
 */
function setManage(show = true) {
  selectValues.value = []
  showManage.value = show
}


const selectValues = ref([]) // 当前选中的value
// 是否全选，全选[1]非[]
const isSelectAll = computed({
  get: () => unref(selectValues).length === unref(dataList).length ? [1] : [],
  set: () => {
  }
})

/**
 * 处理点击右侧单个选择
 * @param item
 */
function handleRightSingleSelect(item) {
  if (!showManage.value) return
  nextTick(() => {
    const number = unref(selectValues).findIndex(e => e === item.id);
    if (number >= 0)
      unref(selectValues).splice(number, 1)
    else
      unref(selectValues).push(item.id)
  })
}

/**
 * 处理点击全选
 * @param e
 */
function handleClickSelectAll(e) {
  selectValues.value = e.includes(1) ? dataList.value.map(item => item.id) : []
}

// =========================== 👇 删除相关 👇========================================
const deleteModal = ref()
let toDeleteItem

/**
 * 打开删除对话框
 * @param single
 * @param item
 * @returns {*}
 */
function handleOpenDelete(single = false, item = undefined) {
  if (!single) {
    if (unref(selectValues).length <= 0) return toast?.({title: '请先选择足迹'})
  } else {
    // 记录需要删除的
    toDeleteItem = item
  }
  unref(deleteModal).show()
}

/**
 * 确认删除
 */
function toDelete() {
  toDeleteItem ? handleUnCollectSingle() : handleUnCollectList()
}

/**
 * 取消删除
 */
function toCancelDelete() {
  toDeleteItem = undefined
}

/**
 * 删除单个
 */
async function handleUnCollectSingle() {
  await unFootprintSingle(toDeleteItem)
  await refresh?.()
  await toast?.({title: '删除成功'})
  toDeleteItem = undefined
}

/**
 * 处理全部删除
 */
async function handleUnCollectList() {
  const delIds = []
  unref(dataList).forEach(data => {
    if (unref(selectValues).includes(data.id)) {
      delIds.push(data.productId)
    }
  })
  const data = {
    productIdList: delIds
  }
  await unFootprintByList(data);
  await refresh?.()
  await toast?.({title: '删除成功'})
  selectValues.value = []
  toCancelDelete()
}

// =========================== 👆 删除相关 👆========================================
onLoad(async (option) => {
  type.value = 'foot'
  await refresh?.()
})


</script>

<style
    lang="scss"
    scoped
>
@import "../../style/images";

.option-height {
  width: 100%;
  height: 120rpx;
}

.option-row {
  width: 100%;
  height: 100rpx;
  position: fixed;
  z-index: 99;
  bottom: 0;
  left: 0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  opacity: 1;
  overflow: hidden;
  transition: all .3s;

  .left {
    padding: 0 34rpx;
    font-size: 28rpx;
  }

  .button {
    height: 100%;
    display: flex;
    align-items: center;
    padding: 0 80rpx;
    background: #00CBCC;
    color: #fff;
    transition: all .3s;
    font-size: 34rpx;

    &:active {
      font-size: 28rpx;
    }
  }
}

.footprint {
  padding: 20rpx;
  box-sizing: border-box;

  .w-full {
    width: 100%;
  }

  .foot-item {
    background: #fff;
    margin-bottom: 20rpx;
    border-radius: 30rpx;
    padding: 0 20rpx;
  }

  .delete-icon {
    margin: 0 0 20rpx 20rpx;
    width: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary-color;
    border-radius: 30rpx;
    transition: all .3s;

    &:active {
      scale: .9;
    }
  }
}

.footprint :deep(.uv-swipe-action-item__right__button__wrapper) {
  position: relative;

  &:before {
    position: absolute;
    content: '';
    background: $addDelIcon no-repeat center center;
    width: 50rpx;
    height: 50rpx;
    background-size: contain;
  }
}

.footprint :deep(.uv-swipe-action-item__right__button__wrapper__text) {
  visibility: hidden;
}

.option-row {
  bottom: env(safe-area-inset-bottom);
}


</style>
