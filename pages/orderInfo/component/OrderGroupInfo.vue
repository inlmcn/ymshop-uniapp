<!--
    @name: GroupInfo
    @author: kahu4
    @date: 2024-01-22 11:53
    @description：GroupInfo
    @update: 2024-01-22 11:53
-->
<script setup>
import { computed, onMounted, ref, toRefs } from "vue";
import { getGroupByDetailTeamworkId } from "@/api/goods";
import { useJump } from "@/hooks/useJump";

const {goGroupByDetail} = useJump()

const props = defineProps({
  orderInfoData: {
    type: Object,
    required: true
  }
})

const {orderInfoData} = toRefs(props)

const residuePersonNum = computed(() => {
  if (!groupDetail.value) return 1
  return groupDetail.value.person - groupDetail.value.users.length
})
// 拼团详情
const groupDetail = ref()
// 拼团状态 0 进行中 1 成功 2 失败
const groupState = ref(0)
// 拼团title
const groupTitle = computed(() => {
  if (!groupDetail.value) return
  if (groupState.value === 0) {
    return `${ groupDetail.value.person }人团,再邀${ residuePersonNum.value }位即可拼团成功`
  }
  if (groupState.value === 1) {
    return '拼团成功，请等待商家发货'
  }
  if (groupState.value === 2) {
    return '拼团失败，可以再次开团啊~'
  }
})

/**
 * 获取拼团详情
 * @return {Promise<void>}
 */
async function doGetGroupByDetailTeamworkId() {
  const res = await getGroupByDetailTeamworkId({id: orderInfoData.value.teamworkId});
  groupDetail.value = res
  // 校验状态 state 0 进行中 1 成功 2 失败
  groupState.value = res.state
}

onMounted(() => {
  doGetGroupByDetailTeamworkId()
})

</script>

<template>
  <view class="group-info mb-20 card">
    <view class="card-head flex flex-jc__start">
      <view class="card-title">
        拼团信息
      </view>
      <view class="sub">
        {{ groupTitle }}
      </view>
    </view>
    <view class="card-content group-by flex flex-wrap flex-jc__start">
      <view
          class="users"
          v-if="groupDetail">
        <view
            v-for="user in groupDetail.users"
            :key="user.id"
            class="user-item">
          <image :src="user.avatar" />
          <view
              class="first-group"
              v-if="user.isHead === '1'">
            团长
          </view>
        </view>
        <!-- 该团还需要几个人 -->
        <view
            class="user-item plus"
            v-for="item in residuePersonNum"
            :key="item"
            @click="goGroupByDetail({teamworkId:orderInfoData.teamworkId})">
          <uv-icon name="plus" />
        </view>
      </view>

    </view>
  </view>
</template>

<style
    scoped
    lang="scss">
.sub {
  color: $tips-color;
  font-size: 28rpx;
  margin-left: 5rpx;
}

.primary-color {
  color: $primary-color;
}

.group-by {
  @include usePadding(30, 30);
  gap: 32rpx;

  .user-header {
    image {
      width: 130rpx;
      height: 130rpx;
      border-radius: 50%;
      background: #e5e5e5;
    }
  }
}

.users {
  margin: 40rpx 0;
  @include useFlex(flex-start, center, row, wrap, 20rpx);
  width: 100%;

  .user-item {
    width: 130rpx;
    height: 130rpx;
    border-radius: 50%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 10rpx rgba(220, 220, 220, 0.7);

    image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #e5e5e5;
    }

    .first-group {
      @include usePadding(16, 5);
      background: $primary-color;
      color: $white-color;
      white-space: nowrap;
      border-radius: 34rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      font-size: 24rpx;
    }
  }
}

</style>
