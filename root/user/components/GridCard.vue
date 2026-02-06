<!--
    @name: GridCard
    @author: kahu4
    @date: 2023-11-09 15:09
    @description：GridCard
    @update: 2023-11-09 15:09
-->
<script setup>
import { toRefs } from "vue";
import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";
import { storeToRefs } from "pinia";
import { useMainStore } from "@/store/modules/useMainStore";
import { useService } from "@/hooks/useService";
import { IS_DEMO } from "@/config";

const props = defineProps({
  list: {
    type: Array,
    default: () => ([])
  },
  dotInfo: {
    type: Object
  },
  title: {
    type: String,
    default: () => ''
  },
  buttonText: {
    type: String,
    default: ''
  }
})
const {list, title, buttonText, dotInfo} = toRefs(props)
const emits = defineEmits(['buttonClick'])
const {push} = useRouter();
const {toast} = useInterface();
const mainStore = useMainStore();
const {user} = storeToRefs(mainStore);

async function toLink(listItem) {
  if (!user.value) return toast({title: '请先登录'})
  if (!listItem.path) return toast({title: ' 暂未开放 '})
  if (listItem.path === 'kf') {
    const {getServiceData, openService} = useService();
    await getServiceData()
    await openService()
    return
  }
  push({url: listItem.path}, listItem?.params ?? {})
}
</script>

<template>
  <view class="grid-container">
    <view
        class="title-row"
        v-if="title || buttonText"
    >
      <view>
        {{ title }}
      </view>
      <view
          class="right"
          @click="emits('buttonClick')"
      >
        {{ buttonText }}
        <uv-icon
            v-if="buttonText"
            name="arrow-right"
            color="#ccc"
            size="12"
            class="icon"
        />
      </view>
    </view>
    <view class="icon-box">
      <view
          class="icon-item"
          v-for="item in list"
          :key="item"
          @click="toLink(item)"
      >

        <template v-if="item&&item.rightTopDot">
          <view
              class="dot"
              v-if="dotInfo && dotInfo[item.dotField] && dotInfo[item.dotField]>0"
          >
            {{ dotInfo[item.dotField] < 100 ? dotInfo[item.dotField] : `${ dotInfo[item.dotField] }+` }}
          </view>
        </template>
        <image
            class="icon"
            :src="item.icon"
        />
        <view class="text">
          {{ item.label }}
        </view>
      </view>
    </view>
  </view>
</template>

<style
    scoped
    lang="scss"
>
.grid-container {
  width: 100%;
  background: $white-color;
  border-radius: 15rpx;
  margin: 20rpx 0;
  @include usePadding(16, 32);

  &:first-child {
    margin-top: 0;
  }

  .title-row {
    @include useFlex(space-between, center);
    padding-left: 16rpx;
    margin-bottom: 16rpx;
    font-size: 32rpx;
    color: #333;
    font-weight: 600;

    .right {
      @include useFlex(space-between, center);
      font-size: 24rpx;
      color: $tips-color;
      font-weight: 400;

      .icon {
        margin-left: 8rpx;
      }
    }
  }

  .icon-box {
    display: grid;
    grid-template-columns: repeat(4, 1fr);

    .icon-item {
      @include usePadding(0, 16);
      @include useFlex(space-between, center, column);
      width: 100%;
      font-size: 24rpx;
      color: #333333;
      position: relative;

      .dot {
        z-index: 99;
        position: absolute;
        background: #00CBCC;
        color: #fff;
        right: 20%;
        top: 16rpx;
        transform: translateY(-20%);
        font-size: 18rpx;
        width: 38rpx;
        height: 38rpx;
        text-align: center;
        line-height: 38rpx;
        box-sizing: border-box;
        border-radius: 50%;
        border: 2rpx solid #ffffff;
      }

      .icon {
        width: 60rpx;
        height: 60rpx;
      }

      .text {
        margin: 14rpx 0;
      }
    }
  }
}
</style>
