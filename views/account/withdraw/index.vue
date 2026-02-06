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
import { useInterface } from "@/hooks/useInterface";
import Modal from "@/components/Modal/index.vue";
import { ref } from "vue";
import Popup from "@/components/Popup.vue";
import { getWithDrawMethodList, updateWithDrawMethod, withDrawNow } from "@/api/account/integral";
import { onLoad } from "@dcloudio/uni-app";
import { useRouter } from "@/hooks/useRouter";
import { useMainStore } from "@/store/modules/useMainStore";
import { storeToRefs } from "pinia";
import { aliIcon, balanceIcon } from "@/utils/images";
import { cloneDeep } from "lodash-es";

// ========================= hooks ==========================
const {toast, loading, hideLoading} = useInterface();
const {scrollTop} = useScroll();
const {getParams, goBack} = useRouter();
const mainStore = useMainStore();
const {user} = storeToRefs(mainStore)


// =========================== 提现方式 =========================
const methodRenderList = ref([])

const updatePopupRef = ref()

const methodCurrent = ref()


/**
 * 获取提现方式列表
 * 此处服务端使用list，方便后期扩展
 * @return {Promise<void>}
 */
async function doGetWithDrawMethodList() {
  methodRenderList.value = await getWithDrawMethodList()
  methodCurrent.value = methodRenderList.value[0].id
}

const getMethodIcon = (type) => {
  return [balanceIcon, aliIcon][type]
}

const methodLoading = ref(false)

const methodForm = ref()

/**
 * 保存提现方式
 */
async function confirmDrawMethod() {
  if (methodLoading.value) return
  if (!methodForm.value.realName) return toast({title: '请输入真实姓名'})
  if (!methodForm.value.accountNum) return toast({title: '请输入账号'})
  await updateWithDrawMethod(methodForm.value)
  toast({title: '设置成功'})
  await doGetWithDrawMethodList()
  updatePopupRef.value.close()
}

/**
 * 打开添加支付方式
 * @return {Promise<void>}
 */
async function openAliPopup(item) {
  methodForm.value = cloneDeep(item)
  updatePopupRef.value.show()
}

// ========================== 提现 =============================
const maxMoney = ref(0) // 最大提现金额
const modalRef = ref()
const modalTitle = ref('')

function selectAll() {
  withdrawForm.value.amount = maxMoney.value
}

/**
 * 提现防呆
 */
function openModal() {
  if (withdrawForm.value.amount <= 0) return toast({title: '提现金额必须大于0'})
  const method = methodRenderList.value.find(item => item.id === methodCurrent.value)
  modalTitle.value = `确定要提现 ${ withdrawForm.value.amount } 到 ${ method.paymentMethod } 吗？`
  modalRef.value.show()
}


const withdrawLoading = ref(false)
const withdrawForm = ref({
  amount: 0,
})

async function doWithdrawDeposit() {
  try {
    withdrawLoading.value = true
    withdrawForm.value.id = methodRenderList.value.find(item => item.id === methodCurrent.value).id
    await withDrawNow(withdrawForm.value)
    toast({title: '提现成功'})
    withdrawForm.value.id = undefined
    maxMoney.value -= withdrawForm.value.amount
    withdrawForm.value.amount = 0
    goBack({}, 2000)
  } finally {
    withdrawLoading.value = false
  }
}

onLoad(async (options) => {
  const params = getParams(options);
  await doGetWithDrawMethodList()
  maxMoney.value = params.maxMoney || 0
  if (params && Number(params.type) === 1) {
    const find = methodRenderList.value.find((item) => item.paymentMethod === "余额");
    if (!find) return
    methodCurrent.value = find.id
  }
})
</script>

<template>
  <Header
      :scroll-top="scrollTop"
      system-bar-area-bg="#fff"
      header-area-bg="#fff">
    提现
  </Header>
  <view>
    <view class="verification">
      <view class="ver-card">
        <view class="title">提现金额</view>
        <view class="input row">
          <view class="flex flex-ai__center">
            <text class="price">￥</text>
            <input
                v-model="withdrawForm.amount"
                :max="maxMoney"
                type="digit"
                placeholder="请输入提现金额" />
          </view>
          <text
              v-if="maxMoney>0"
              class="btn"
              @click="selectAll">全部提现
          </text>
        </view>
        <view class="row">
          可提现金额{{ maxMoney.toFixed(2) }}元
        </view>
      </view>

      <view class="ver-card">
        <view class="title">提现至</view>
        <uv-radio-group
            activeColor="#00CBCC"
            v-model="methodCurrent"
            placement="column"
        >
          <template
              v-for="item in methodRenderList"
              :key="item.id">
            <view
                class="flex flex-jc__sb flex-ai__center"
                @click="methodCurrent = item.id">
              <view class="input row method">
                <view class="flex flex-ai__center">
                  <image
                      class="icon"
                      :src="getMethodIcon(item.type)" />
                  <text class="text">{{ item.paymentMethod }}</text>
                </view>
                <text
                    v-if="item.type!==0"
                    class="btn primary-color"
                    @click.stop="openAliPopup(item)">
                  更新账户
                </text>
              </view>
              <uv-radio
                  :customStyle="{marginBottom: '8px'}"
                  label=" "
                  :name="item.id"
              />
            </view>
          </template>
        </uv-radio-group>
      </view>

      <view
          class="btn-row row animation-button"
          :class="{disabled:withdrawForm.amount<=0}"
          @click="openModal">
        确认提现
      </view>
    </view>
  </view>
  <Modal
      ref="modalRef"
      :content="modalTitle"
      @confirm="doWithdrawDeposit" />

  <!-- 绑定 -->
  <Popup
      ref="updatePopupRef"
      :title="`绑定${methodForm&&methodForm.paymentMethod || ''}`"
      mode="center"
      :show-closeable="false">
    <view
        class="ali-popup"
        v-if="methodForm">
      <view class="input">
        <input
            type="text"
            placeholder="请输入真实姓名"
            v-model="methodForm.realName">
      </view>
      <view class="input">
        <input
            type="text"
            placeholder="请输入账号"
            v-model="methodForm.accountNum">
      </view>
      <view
          class="btn animation-button"
          @click="confirmDrawMethod">
        保存
      </view>
    </view>
  </Popup>
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


    .input {
      @include useFlex(space-between, center);
      @include usePadding(21, 24);
      width: 100%;
      //background: #F6F8F8;
      border-radius: 8rpx;
      border-bottom: 1rpx solid #f6f8f8;

      .price {
        font-size: 48rpx;
        font-weight: bolder;
      }

      input {
        width: 100%;
      }

      .icon {
        width: 80rpx;
        height: 80rpx;
        margin-right: 30rpx;
      }
    }

    .method {
      margin-top: 0 !important;
    }

    .none-border {
      border: none;
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

.ali-popup {
  width: 80vw;
  @include usePadding(32, 32);

  .input {
    width: 100%;
    background: #f6f8f8;
    @include usePadding(21, 21);
    border-radius: 8rpx;
    margin-bottom: 16rpx;
  }


  .btn {
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 8rpx;
  }
}

:deep(.u-radio) {
  margin-bottom: 0 !important;
}

</style>
