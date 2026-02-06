<!--
    @name: index
    @author: kahu4
    @date: 2024-01-21 15:38
    @description：订单核销
    @update: 2024-01-21 15:38
-->
<script setup>
import Header from "@/components/Header/index.vue"
import { useScroll } from "@/hooks/useScroll";
import { wechatIcon } from "@/utils/images";
import { useInterface } from "@/hooks/useInterface";
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { createRechargeOrder, getRechargeConfig } from "@/api/account/balance";
import { doPayment } from "@/utils/paymentUtils";
import { h5InWeChat } from "@/utils";
import { PAY_INSTANCE_TYPE } from "@/utils/payModule";

// ========================= hooks ==========================
const {toast, loading, hideLoading} = useInterface();
const {scrollTop} = useScroll();
const {getParams, push} = useRouter();


// =========================== 充值方式 =========================
const methodRenderList = ref([
  {
    label: '微信',
    value: 0,
    icon: wechatIcon
  }
])


// ========================== 充值 =============================
// 当前选中的充值配置
const current = ref(undefined)
// 充值配置
const rechargeConfig = ref({
  content: '',
  customMin: 0, // 用户最小提现数
  customSwitch: 0, // 是否支持用户自定义金额，0关闭1开启
  rechargePackageBaseVOS: []
})

/**
 * 获取充值配置
 * @return {Promise<void>}
 */
async function doGetRechargeConfig() {
  const res = await getRechargeConfig();
  // 是否开启了自定义
  if (res.customSwitch === 1) {
    res.rechargePackageBaseVOS.push({
      id: 'other',
      name: '其他',
      rechargeAmount: '',
    })
  }
  // 默认选中充值配置的第一项
  if (res.rechargePackageBaseVOS.length > 0) {
    current.value = res.rechargePackageBaseVOS[0].id
    rechargeForm.value.amount = res.rechargePackageBaseVOS[0].rechargeAmount
    rechargeForm.value.packageId = res.rechargePackageBaseVOS[0].id
  }
  rechargeConfig.value = res
}

// 计算其他输入金额的位置
const otherIndex = computed(() => rechargeConfig.value.rechargePackageBaseVOS.findIndex(i => i.id === 'other'))

/**
 * 改变金额tab项
 * @param item
 */
function currentDefaultMoneyItemChange(item) {
  current.value = item.id
  rechargeForm.value.packageId = item.id
  rechargeForm.value.amount = item.rechargeAmount
}

/**
 * 其他金额输入，在此给form赋值
 * @param e
 */
function handleOtherInput(e) {
  rechargeForm.value.amount = parseInt(e.detail.value)
}

// 是否正在请求
const rechargeLoading = ref(false)
// 发起充值的form表单
const rechargeForm = ref({
  type: 0, // 0微信
  amount: 0,
  packageId: null
})

/**
 * 提交充值创建充值订单
 * @return {Promise<void>}
 */
async function confirm() {
  try {
    rechargeLoading.value = true
	if(!rechargeForm.value.amount){
		 return toast({title: `最低充值${ rechargeConfig.value.customMin }元`})
	}
    rechargeForm.value.amount = parseInt(rechargeForm.value.amount)
	if(rechargeForm.value.amount <= 0){
		 return toast({title: `金额必须大有0`})
	}
    // 如果是其他金额，校验有没有大于最低金额
    if (current.value === 'other') {
      delete rechargeForm.value.packageId
      if (rechargeForm.value.amount < rechargeConfig.value.customMin)
        return toast({title: `最低充值${ rechargeConfig.value.customMin }元`})
    }
    const orderId = await createRechargeOrder(rechargeForm.value);
    await doPayment({
      type: PAY_INSTANCE_TYPE.WECHAT,
      payInfo: {orderId}
    })
    // #ifndef H5
    push?.({url: '/pages/payStatus/index?type=2'})
    // #endif
    // 处理微信内h5
    // #ifdef H5
    if (h5InWeChat()) {
      push?.({url: '/pages/payStatus/index?type=2'})
    }
    // #endif
  } catch (e) {
    console.error(e)
    throw new Error(e)
  } finally {
    rechargeLoading.value = false
  }
}


onLoad(async (options) => {
  await doGetRechargeConfig()
})
</script>

<template>
  <view>
    <Header
        :scroll-top="scrollTop"
        system-bar-area-bg="#fff"
        header-area-bg="#fff"> 充值
    </Header>
    <view class="verification">
      <view class="ver-card">
        <view class="title">选择充值面额</view>
        <view class="select-row">
          <view
              class="select-item"
              :class="{current:current === money.id}"
              v-for="money in rechargeConfig.rechargePackageBaseVOS"
              :key="money.value"
              @click="currentDefaultMoneyItemChange(money)">
            {{ money.id === 'other' ? money.name : money.rechargeAmount }}
            <view
                class="give"
                v-if="money.giftAmount>0">送{{ money.giftAmount }}元
            </view>
          </view>
        </view>
        <view
            class="input row"
            :class="{hidden:current !== 'other' }">
          <view class="flex flex-ai__center">
            <text class="price">￥</text>
            <input
                v-if="rechargeConfig.rechargePackageBaseVOS[otherIndex]"
                v-model="rechargeConfig.rechargePackageBaseVOS[otherIndex].rechargeAmount"
                type="number"
                placeholder="请输入充值金额"
                @input="handleOtherInput" />
          </view>
        </view>
      </view>

      <view class="ver-card">
        <view class="title">支付方式</view>
        <uv-radio-group
            activeColor="#00CBCC"
            v-model="rechargeForm.type"
            placement="column"
        >
          <template
              v-for="item in methodRenderList"
              :key="item.value">
            <view
                class="flex flex-jc__sb flex-ai__center"
                @click="rechargeForm.type = item.value">
              <view class="input row method none-border none-bg">
                <view class="flex flex-ai__center">
                  <image
                      class="icon"
                      :src="item.icon" />
                  <text class="text">{{ item.label }}</text>
                </view>
              </view>
              <uv-radio
                  :customStyle="{marginBottom: '8px'}"
                  label=" "
                  :name="item.value"
              />
            </view>
          </template>
        </uv-radio-group>
      </view>


      <view class="tips-content">
        <view class="title">充值说明</view>
        <view
            class="content"
            v-html="rechargeConfig.content"></view>
      </view>

      <view style="width: 100%;height: 140rpx"></view>

      <view
          class="btn-row row animation-button"
          :class="{disabled:rechargeForm.amount<=0}"
          @click="confirm">
        确认充值
      </view>
    </view>
  </view>

</template>

<style
    scoped
    lang="scss">
.verification {
  @include usePadding(34, 34);

  .ver-card {
    @include usePadding(32, 32);
    margin-bottom: 24rpx;
    border-radius: 15rpx;
    background: #fff;

    .title {
      text-align: left;
      font-size: 38rpx;
      font-weight: bold;
    }

    .select-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15rpx;
      margin: 24rpx 0;

      .select-item {
        @include usePadding(0, 30);
        text-align: center;
        width: 100%;
        background: #f6f8f8;
        border: 1rpx solid #f6f8f8;;
        border-radius: 10rpx;
        transition: all .3s;
        position: relative;

        .give {
          @include usePadding(11, 5);
          position: absolute;
          left: 0;
          top: 0;
          background: #00CBCC;
          border-radius: 10rpx 0 10rpx 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20rpx;
          color: #fff;
        }

        &.current {
          background: #fdf0ed;
          border: 1rpx solid #00CBCC;
          color: #00CBCC;
          font-weight: bold;
        }
      }
    }


    .input {
      @include useFlex(space-between, center);
      @include usePadding(21, 24);
      width: 100%;
      scale: 1;
      overflow: hidden;
      transition: all .3s;
      border-radius: 8rpx;
      background: #f6f8f8;
      transform-origin: left top;

      .price {
        font-size: 48rpx;
        font-weight: bolder;
      }

      input {
        width: 100%;
        flex-grow: 1;
      }

      .icon {
        width: 80rpx;
        height: 80rpx;
        margin-right: 30rpx;
      }
    }

    .hidden {
      scale: 0;
      height: 0;
      margin: 0;
      padding: 0;
    }

    .method {
      margin-top: 0 !important;
    }

    .none-border {
      border: none;
    }

    .none-bg {
      background: transparent;
    }

    .qr-scan {
      @include useFlex(center, center);
      margin-top: 40rpx !important;

      image {
        width: 120rpx;
        height: 120rpx;
        transition: all .3s;

        &:active {
          scale: 1.1;
        }
      }
    }
  }

  .tips-content {
    width: 100%;
    color: #999999;

    .title {
      font-size: 28rpx;
    }

    .content {
      padding: 16rpx 0;
      font-size: 24rpx;
    }
  }

  .row {
    margin-top: 24rpx;
  }

  .btn-row {
    @include useFlex(center, center);
    height: 80rpx;
    border-radius: 15rpx;
    position: fixed;
    width: 90%;
    margin: 0 auto;
    bottom: 50rpx;
   /* #ifdef MP-WEIXIN */
    bottom: env(safe-area-inset-bottom);
    /* #endif */
  }

  .disabled {
    background: #f3997d;

    &:active {
      scale: 1;
      animation: disabledAnimation 200ms 15;
    }
  }


  @keyframes disabledAnimation {
    0%, 90% {
      transform: translateX(0);
    }
    30% {
      transform: translateX(-20rpx);
    }
    60% {
      transform: translateX(20rpx);
    }
  }
}


:deep(.u-radio) {
  margin-bottom: 0 !important;
}

</style>
