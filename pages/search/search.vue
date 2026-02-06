<template>
  <layout>
    <uv-navbar
        :fixed="false"
        title="搜索"
        left-arrow
        @leftClick="goBack"
    />
    <view class="search-bar">
      <uv-search
          v-model="keywordData"
          shape="round"
          :placeholder="placeholder || '搜索商品'"
          actionText="搜索"
          show-action
          @clear="onCancel"
          @custom="searchByKeyword"
          @search="searchByKeyword"
          @cancel="onCancel"
      >
      </uv-search>
    </view>

    <!-- 热门搜索 -->
    <view class="hotSearchBox tipsBox" v-if="hotSearchList.length>0">
      <view class="boxTitle mar-leftgetList-30">
        <label>热门搜索</label>
        <image
            class="seeIcon hotSearchListSee-icon"
            :src="!hideHotFlag ? seeIcon : notSeeIcon"
            @click="hideHotFlag = !hideHotFlag"
        />
      </view>
      <view
          class="hot-flex-list"
          v-if="!hideHotFlag"
      >
        <view
            v-for="(item,index) in hotSearchList"
            :key="index"
            class="historySearDel-box flex-items-plus"
        >
          <view
              class="boxContent"
              @click="handleClickHistoryOrHot(item)"
          >{{ item }}
          </view>
        </view>
      </view>
      <view
          v-else
          class="notSeeContent"
      >当前热门搜索已隐藏
      </view>
    </view>
    <!-- 历史搜索 -->
    <view class="historyBox tipsBox" v-if="historyList.length>0">
      <view class="boxTitle">
        <label class="title">历史搜索</label>
        <image
            class="historyDel-icon"
            @click="showModal(0)"
            :src="historyDeleteIcon"
        />
      </view>
      <view class="historySear-box hot-flex-list">
        <view
            v-for="(item,index) in historyList"
            :key="index"
            class="historySearDel-box flex-items-plus"
        >
          <view
              class="boxContent historyText line1"
              @click="handleClickHistoryOrHot(item)"
          >{{ item }}
          </view>
        </view>
      </view>
    </view>
  </layout>
  <Modal ref="modalRef" :content="modalTitle" @confirm="confirmModal" />
</template>

<script setup>
import { computed, ref, unref } from 'vue';
import { useRouter } from "@/hooks/useRouter";
import {onLoad, onShow} from '@dcloudio/uni-app'
import { hotSearch, historySearch, clearHistorySearch } from "@/api/product";
import Modal from "@/components/Modal/index.vue";
import { seeIcon, notSeeIcon, historyDeleteIcon } from "@/utils/images";
const {push, goBack, getParams} = useRouter()

const searchRef = ref();
const keyword = ref('');
const placeholder = ref('')

const hotSearchList = ref([])
const getHotKeywordList = async () => {
  hotSearchList.value = await hotSearch(0, 10)
}


const historyList = ref([])
const hideHotFlag = ref(false); // 是否隐藏热门
const getHistoryKeywordList = async () => {
  let historData = await historySearch()
  historyList.value = historData.slice(0, 20)
}


const modalRef = ref()
const modalType = ref(0) // 0删除记录 1撤销申请
const modalTitle = computed(()=>{
  const tipsArr = ['您确定要清空搜索记录吗？','您确定要删除这一条记录吗？']
  return tipsArr[modalType.value]
})

/**
 * 打开弹窗
 * @param {number} type 0删除记录 1撤销申请
 */
function showModal(type){
  modalType.value = type
  console.log(modalRef.value)
  unref(modalRef).show()
}

/**
 * 确认弹窗
 */
function confirmModal(){
  const funcArr = [doClearAllRequest]
  funcArr[modalType.value]()
}

/**
 * 清空所有
 */
async function doClearAllRequest(){
  await clearHistorySearch()
  await getHistoryKeywordList()
}


const keywordData = ref('')
function handleClickHistoryOrHot(key) {
  keywordData.value = key
  searchByKeyword()
}

function searchByKeyword() {
  if (!keywordData.value && !placeholder.value) {
    return uni.showToast({
      title: '请输入要搜索内容！',
      duration: 2000,
      icon: 'none'
    });
  }
  push({url: '/pages/goodsList/goodsList'}, {
    data: {
      keyword: keywordData.value || placeholder.value
    }
  })
}

const onCancel = () => {
}



onShow(() => {
  Promise.all([getHotKeywordList(),  getHistoryKeywordList()])
})

onLoad((options) => {
  const params = getParams(options)
  placeholder.value = params.key
})
</script>

<style lang="scss">
.search-box {
  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &-title {
    line-height: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    color: #333333;
    margin-bottom: 20rpx;
  }

  &-action {
    width: 28rpx;
    height: 28rpx;

    .image {
      display: block;
      width: 28rpx;
      height: 28rpx;
    }
  }


  background: #fff;
  padding: 40rpx 35rpx 30rpx;
}
// 热门搜索
.hotSearchBox {
  padding: 0 36rpx;

  .historyText {
    flex: 1;
  }

  .hotSearchListSee-icon {
    height: 24rpx;
  }

  .hotSearchListNotSee-icon {
    height: 36rpx;
  }

  .seeIcon {
    width: 40rpx;
    position: absolute;
    right: 30rpx;
  }

  .notSeeContent {
    margin-top: 20rpx;
    text-align: center;
    font-size: 24rpx;
    color: #CCCCCC;
  }
}

.line {
  margin: 70rpx 0;
  height: 2rpx;
  background: #F3F4F5;
}

// 历史搜索
.historyBox {
  padding: 0 36rpx;

  .historySear-box {
    width: 100%;
  }

  .historyDel-icon {
    width: 30rpx;
    height: 30rpx;
    position: absolute;
    right: 30rpx;
  }

  .historyIconBox {
    width: 50rpx;

    .historySearDel-icon {
      position: relative;
      width: 16rpx;
      height: 16rpx;
    }
  }
}

.tipsBox {
  padding: 15rpx 24rpx;
  background: #ffffff;
  margin-bottom: 20rpx;
}

.boxTitle {
  margin: 30rpx 0;
  label {
    color: #333333;
    font-size: 28rpx;
  }
}
.hot-flex-list{
  gap:20rpx;

}

.historySearDel-box {
  //height: 54rpx;
  line-height: 54rpx;
  background-color: #F1F1F1;
  //text-align: center;
  overflow: hidden;
  display: flex;
  justify-content: space-between;

  .boxContent {
    font-size: 24rpx;
    padding: 0 30rpx;
    color: #333333;
    font-weight: 400;
  }
}
.hot-flex-list {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  .ertical-lines {
    color: #DDDDDD;
    text-align: center;
    font-size: 24rpx;
    padding: 10rpx 0;
  }
}
.flex-items-plus {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
