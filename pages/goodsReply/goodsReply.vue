<template>
  <Header :scroll-top="scrollTop">评价</Header>
  <view class="replys">
    <view class="tabs">
      <view
          class="item"
          v-for="item in tabList"
          :key="item.id"
          :class="item.id === activeId && 'on'"
          @tap="toggleTab(item.id)"
      >
        {{ item.text }}
        <text v-if="item.id===0">({{ total }})</text>
      </view>
    </view>
    <view
        class="reply-card"
        v-if="replyListData.records && replyListData.records.length > 0"
    >
      <reply
          v-for="(item, index) in replyListData.records"
          :key="index"
          :data="item"
      />
    </view>
    <Empty
        :iconSrc="emptyReply"
        v-else
    >
      暂无评论~
    </Empty>
  </view>
  <ReturnTop :scroll-top="scrollTop" />
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { replyList } from '@/api/goods'
import Header from '@/components/Header/index.vue'
import Empty from '@/components/Empty/index.vue'
import { useRouter } from "@/hooks/useRouter";
import { emptyReply } from "@/utils/images";
import ReturnTop from "@/components/ReturnTop/index.vue";
import { useScroll } from "@/hooks/useScroll";

const {scrollTop} = useScroll()

const replyListData = ref([])
const total = ref(0)
const pid = ref(0)
const activeId = ref(0)
const tabList = ref([{
  id: 0,
  text: '全部'
}, {
  id: 1,
  text: '好评'
},
  {
    id: 2,
    text: '中评'
  }, {
    id: 3,
    text: '差评'
  }, {
    id: 4,
    text: '有图'
  }])
const {getParams, goBack} = useRouter();

const handleGetReplyList = async (type) => {
  let params = {
    id: pid.value
  }
  if (type) {
    params.type = type
  }
  replyListData.value = await replyList(params)
  replyListData.value.records.map(item => {
    item.sku = item.sku.split(',').join('+')
    return item
  })
  if (!type) {
    total.value = replyListData.value.total
  }
}

const toggleTab = (id) => {
  activeId.value = id
  handleGetReplyList(id)
}

onLoad((option) => {
  const params = getParams(option)
  pid.value = params.id
  handleGetReplyList()
})


</script>

<style lang="scss">

.replys {
  background-color: #fff;

  .tabs {
    padding: 30rpx 34rpx;
    display: flex;

    .item {
      height: 55rpx;
      line-height: 55rpx;
      border: 1rpx solid #00CBCC;
      margin-right: 20rpx;
      padding: 0 16rpx;
      font-size: 28rpx;
      color: #00CBCC;
      cursor: pointer;

      &:first-child {
        padding: 0 15rpx;
      }

      &.on {
        background: #00CBCC;
        color: #FFFFFF;
      }
    }
  }
}
page {
  background: #ffffff;
}
</style>
