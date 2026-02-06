<!--
    @name: index
    @author: kahu4
    @date: 2024-01-17 15:53
    @description：佣金明细
    @update: 2024-01-17 15:53
-->
<script setup>
import Header from '@/components/Header/index.vue'
import { onLoad, onShow, onPageScroll } from "@dcloudio/uni-app";
import { useScroll } from "@/hooks/useScroll";
import { ref } from "vue";
import dayjs from "dayjs";
import { usePaging } from "@/hooks/usePaging";
import { checkIsDistribution, getMyCommissionDetail, pageCommission } from "@/api/distribution";
import { emptyOrderIcon } from "@/utils/images";
import Empty from "@/components/Empty/index.vue";
import { useJump } from "@/hooks/useJump";
import UvDatetimePicker from "@/uni_modules/uv-datetime-picker/components/uv-datetime-picker/uv-datetime-picker.vue";

// ================================= hooks ================================
const {scrollTop} = useScroll()
const {goWithdraw} = useJump()
onPageScroll(() => {
})

// ============================== 数据 ==================================
const {otherParams, list, loading, refreshPage} = usePaging({
  request: pageCommission,
});

const myCommissionDetail = ref({
  income: 0, // 总收入
  expenses: 0 // 总支出
})

/**
 * 获取总收入、总支出
 * @return {Promise<void>}
 */
async function doGetMyCommissionDetail() {
  myCommissionDetail.value = await getMyCommissionDetail({createTime: otherParams.value.createTime});
}


const userDistributionInfo = ref({
  status: -1,
  refuse: '',
  realName: '',
  levelName: '',
  superiorName: '',
  addUpWages: 0,
  refuseAmount: 0,
  amount: 0
})

/**
 * 查询分销商详细信息
 * @returns {Promise<void>}
 */
async function doCheckIsDistribution() {
  userDistributionInfo.value = await checkIsDistribution();
}

onShow(() => {
  doCheckIsDistribution()
  refreshPage()
})

onLoad(() => {
  otherParams.value.createTime = [`${ selectTimeStr.value } 00:00:00`, `${ selectTimeStr.value } 23:59:59`]
  doGetMyCommissionDetail()
})

// ======================== level tab ====================
const leverTabs = [
  {
    label: '全部',
    filed: '',
    value: 0
  }, {
    label: '收入',
    filed: '',
    value: 1
  }, {
    label: '支出',
    filed: '',
    value: 4
  }]
const leverCurrent = ref(0)

function leverSelect(value) {
  leverCurrent.value = value
  if (value !== 0) {
    otherParams.value.type = value
  } else {
    delete otherParams.value.type
  }
  refreshPage()
}

// ============================ time ===========================
const selectTimeStr = ref(dayjs(Date.now()).format('YYYY-MM-DD'))
const datetimePicker = ref()
const showTime = ref(false)
const timeModelValue = ref(Date.now())

function doShowTime() {
  datetimePicker.value.open()
}

function dateTimeConfirm(e) {
  selectTimeStr.value = dayjs(e.value).format('YYYY-MM-DD')
  otherParams.value.createTime = [`${ selectTimeStr.value } 00:00:00`, `${ selectTimeStr.value } 23:59:59`]
  refreshPage()
  doGetMyCommissionDetail()
}

const colorType = ['red-color', '', 'red-color', 'yellow-color', 'green-color', 'red-color']
const statusType = ['待入账', '已入账', '已取消', '提现中', '提现成功', '提现失败']
</script>

<template>
  <view class="commission">
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff">佣金明细
    </Header>
    <view class="commission__inner">
      <!-- 账户信息-->
      <view class="account-card">
        <view class="header flex flex-jc__sb flex-ai__center">
          <view class="col">
            <view class="title grey-color">
              总收益（元）
            </view>
            <view class="money">
              {{ userDistributionInfo.addUpWages || '0.00' }}
            </view>
          </view>
          <view class="col flex flex-jc__sb flex-ai__center btn-group">
            <view
                class="btn line-btn"
                @click="goWithdraw({type:0,maxMoney:userDistributionInfo.amount||0})"> 提现
            </view>
            <view
                class="btn"
                @click="goWithdraw({type:1,maxMoney:userDistributionInfo.amount||0})">转余额
            </view>
          </view>
        </view>
        <view class="gradation-line"></view>

        <view class="bottom">
          <view class="item">
            <view class="title grey-color">待入账佣金</view>
            <view class="count"> {{ userDistributionInfo.refuseAmount || '0.00' }}</view>
          </view>
          <view class="item">
            <view class="title  grey-color">可提现佣金</view>
            <view class="count"> {{ userDistributionInfo.amount || '0.00' }}</view>
          </view>
        </view>
      </view>
      <!-- 筛选 -->
      <view class="filtrate-row flex flex-ai__center flex-jc__sb">
        <view
            class="date flex flex-ai__center"
            @click="doShowTime">
          {{ selectTimeStr }}
          <uv-icon
              name="arrow-down"
              color="#333" />
        </view>
        <view class="info grey-color">
          总收入￥{{ myCommissionDetail.income }} 总支出￥{{ myCommissionDetail.expenses }}
        </view>
      </view>
      <!-- 佣金明细列表 -->
      <view class="money-list">
        <!-- tab -->
        <view class="tab-content">
          <view
              class="tab-item"
              :class="{current:leverCurrent===lever.value}"
              v-for="lever in leverTabs"
              :key="lever.value"
              @click="leverSelect(lever.value)"
          >
            {{ lever.label }}
          </view>
        </view>
        <!-- money-item -->
        <template v-if="list.length>0">
          <view
              class="money-item flex flex-jc__sb"
              v-for="item in list">
            <view class="left flex flex-column flex-jc__sb">
              <view class="name">{{ item.distributorName }}</view>
              <view class="id">订单号：{{ item.orderId }}</view>
            </view>
            <view class="right">
              <view class="title">
                <text v-if="item.type===1"> +</text>
                <text v-if="item.type===4"> -</text>
                ￥{{ item.amount }}
              </view>
              <view
                  class="status"
                  :class="[colorType[item.type]]">
                {{ statusType[item.type] }}
              </view>
            </view>
          </view>
        </template>
        <Empty
            padding="30rpx 0 0 0"
            :iconSrc="emptyOrderIcon"
            v-else
        >
          您还没有相关订单~
        </Empty>
      </view>
    </view>

    <!-- 时间选择器 -->
    <uv-datetime-picker
        ref="datetimePicker"
        v-model="timeModelValue"
        mode="date"
        @confirm="dateTimeConfirm"
        @cancel="showTime=false"
    />
  </view>
</template>

<style
    scoped
    lang="scss">
.commission {
  &__inner {
    @include usePadding(34, 34);

    .account-card {
      @include usePadding(32, 32);
      width: 100%;
      background: #333333;
      border-radius: 15rpx;
      color: #fff;
      font-size: 28rpx;

      .header {
        padding-bottom: 32rpx;
        //border-bottom: 1rpx dashed #f5f5f5;

        .col {
          .money {
            font-size: 48rpx;
            font-weight: bold;
          }

          .btn {
            @include usePadding(24, 13);
            background: #fff;
            color: #333;
            border-radius: 15rpx;
          }

          .line-btn {
            border: 1rpx solid #fff;
            background: #333;
            color: #fff;
          }
        }

        .btn-group {
          gap: 20rpx
        }
      }

      .gradation-line {
        margin: 0 auto;
        width: 90%;
        height: 1rpx;
        background: linear-gradient(to right, #333333, #f5f5f5, #333);
      }

      .bottom {
        margin-top: 32rpx;
        display: grid;
        grid-template-columns: repeat(2, 1fr);

        .item {
          font-size: 28rpx;

          .count {
            font-size: 32rpx;
            margin-top: 5rpx;
          }
        }
      }
    }

    .filtrate-row {
      font-size: 28rpx;
      color: #333;
      margin: 24rpx 0;

      .date {
        font-weight: 600;
      }

      .info {
        font-size: 24rpx;
      }
    }

    .money-list {
      @include usePadding(32, 32);
      border-radius: 15rpx;
      background: #fff;

      .tab-content {
        width: 100%;
        background: #fff;
        padding-bottom: 20rpx;
        border-bottom: 1rpx solid #f5f5f5;
        @include useFlex(space-between, center, row, nowrap, 30rpx);

        .tab-item {
          @include usePadding(0, 16);
          text-align: center;
          border-radius: 15rpx;
          flex: 1 0 auto;
          background: #f6f8f8;
          color: #333333;
          transition: all .3s;

          &.current {
            background: $primary-color;
            color: $white-color;
          }
        }
      }

      .money-item {
        @include usePadding(0, 20);
        width: 100%;
        border-bottom: 1rpx solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .left {
          color: $tips-color;

          .name {
            color: #333;
            font-weight: bold;
            font-size: 28rpx;
          }

          .id {
            font-size: 24rpx;
          }
        }

        .right {
          .title {
            color: #333;
            font-weight: bold;
            font-size: 28rpx;
          }

          .status {
            @include usePadding(24, 4);
            background: #f6f6f6;
            color: #999999;
            border-radius: 50rpx;
            font-size: 24rpx;
            margin-top: 20rpx;
          }
        }
      }
    }

    .grey-color {
      color: $tips-color;
    }
  }
}

.orange-color {
  background: #E85A2B12 !important;
  color: #E85A2B !important;
}

.yellow-color {
  background: #FFFADF !important;
  color: #E8A31D !important;
}

.green-color {
  background: #EAF9EC !important;
  color: #28c445 !important;
}

.red-color {
  background: rgba(232, 43, 150, 0.07) !important;
  color: #df151c !important;
}
</style>
