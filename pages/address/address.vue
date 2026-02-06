<template>
  <Header :scroll-top="scrollTop">
    {{ pageTitle }}
  </Header>
  <!-- 当列表有数据时展示地址列表，否则展示空状态。使用显式 v-if，避免 v-else 在多根节点/插入文本节点场景下失效 -->
  <view class="address-list" v-if="list && list.length > 0">
    <view class="tip-bar">
      <uv-icon name="info-circle" color="#00CBCC" size="24rpx" />
      <text class="tip-text">左滑可删除地址</text>
    </view>
    <UniSwipeAction :autoClose="false">
      <UniSwipeActionItem v-for="(item) in list" :key="item.id" @click="showModal(item)">
        <view class="address-item">
          <AddressItem :address-item="item" @edit="goEditorAddress" @click="handleClick" />
        </view>
        <template #right>
          <view class="delete-icon" @click="showModal(item)">
            <uv-icon name="trash" color="#fff" />
          </view>
        </template>
      </UniSwipeActionItem>
    </UniSwipeAction>
  </view>
  <!-- 显式判断无数据时渲染空状态,避免 v-else 匹配失败导致同时渲染问题 -->
  <Empty :iconSrc="emptyAddressIcon" v-if="!isLoading && (!list || list.length === 0)">
    您还没有新增地址~
  </Empty>
  <view class="form-buttons">
    <view class="btn-box">
      <!-- #ifdef MP-WEIXIN -->
      <view class="btn" @tap="wxAddFn">
        <image :src="wxechat" class="icon" /> 微信导入
      </view>
      <!-- #endif -->
      <view class="btn btn-primary" @tap="goCreateAddress">
        <image :src="iconAdd" class="icon" />
        新增地址
      </view>
    </view>
  </view>
  <ReturnTop :scroll-top="scrollTop" />
  <Modal ref="delModalRef" content="确认要删除地址吗？" @confirm="doDeleteRequest" />

  <!-- 地址编辑弹窗 -->
  <uv-popup ref="addressEditPopupRef" mode="bottom" :show="showAddressEdit" @close="closeAddressEdit" :round="20"
    :safeAreaInsetBottom="true" :closeable="false" bgColor="transparent" :custom-style="{ height: '90vh' }">
    <AddressEdit v-model="currentEditAddress" @close="closeAddressEdit" @save="handleSaveAddress" />
  </uv-popup>
</template>

<script setup>
import { ref, unref, computed, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import Empty from '@/components/Empty/index.vue'
import { iconAdd, wxechat, emptyAddressIcon } from "@/utils/images";
import { getAddressDel, getAddressList, getAddressAddAndEdit } from '@/api/address'
import { useRouter } from "@/hooks/useRouter";
import Header from "@/components/Header/index.vue"
import ReturnTop from "@/components/ReturnTop/index.vue";
import { useScroll } from "@/hooks/useScroll";
import Modal from "@/components/Modal/index.vue";
import AddressItem from "@/pages/address/component/AddressItem.vue";
import UvButton from "@/uni_modules/uv-button/components/uv-button/uv-button.vue";
import UvPopup from "@/uni_modules/uv-popup/components/uv-popup/uv-popup.vue";
import { usePaging } from "@/hooks/usePaging";
import { emitter } from "@/utils/emitter";
import UniSwipeAction from "@/pages/components/Uni/uni-swipe-action/uni-swipe-action.vue";
import UniSwipeActionItem from "@/pages/components/Uni/uni-swipe-action-item/uni-swipe-action-item.vue";
import AddressEdit from '@/components/addressEdit/addressEdit.vue'
import { useInterface } from "@/hooks/useInterface";

// ================================= hooks =============================================
const { push, goBack, getParams } = useRouter()
const { scrollTop } = useScroll()
const { toast } = useInterface()

const actionType = ref(undefined) // 页面状态是选择还是管理 'select' | undefined
const pageTitle = computed(() => actionType.value === 'select' ? '选择地址' : '地址管理') // 页面title

onLoad(async (option) => {
  const params = getParams?.(option)
  actionType.value = params?.type
  // 初始化加载数据
  isLoading.value = true
  await refreshPage?.()
  isLoading.value = false
})

onShow(async () => {
  // 页面每次显示都刷新数据(保证从编辑页面返回时数据最新)
  isLoading.value = true
  await refreshPage?.()
  isLoading.value = false
})
// ============================== 用户地址列表相关 =================================
const isLoading = ref(true) // 添加加载状态
const { list, refreshPage } = usePaging({
  request: getAddressList,
  load: false // 不使用 onLoad 自动加载,由我们手动控制
});

// ============================== 地址编辑弹窗相关 =================================
const showAddressEdit = ref(false)
const addressEditPopupRef = ref()
const currentEditAddress = ref({
  id: undefined,
  realName: undefined,
  phone: undefined,
  detail: undefined,
  isDefault: undefined,
  payerName: undefined,
  idCard: undefined,
  address: {
    cityId: undefined,
    city: undefined,
    district: undefined,
    province: undefined,
  }
})

/**
 * 去创建地址 - 使用弹窗方式
 */
function goCreateAddress() {
  // 重置表单数据
  currentEditAddress.value = {
    id: undefined,
    realName: undefined,
    phone: undefined,
    detail: undefined,
    isDefault: undefined,
    payerName: undefined,
    idCard: undefined,
    address: {
      cityId: undefined,
      city: undefined,
      district: undefined,
      province: undefined,
    }
  }
  showAddressEdit.value = true
  // 使用 nextTick 确保 DOM 更新后再调用 open 方法
  nextTick(() => {
    addressEditPopupRef.value?.open?.()
  })
}

/**
 * 去修改地址 - 使用弹窗方式
 * @param address
 */
function goEditorAddress(address) {
  console.log(address, '111111111111111111');
  // 设置编辑数据
  currentEditAddress.value = {
    id: address.id,
    realName: address.realName,
    phone: address.phone,
    detail: address.detail,
    isDefault: address.isDefault,
    payerName: address.payerName,
    idCard: address.idCard,
    cardId: address.cardId,
    cardName: address.cardName,

    address: {
      cityId: address.cityId,
      city: address.city,
      district: address.district,
      province: address.province,
    }
  }
  showAddressEdit.value = true
  // 使用 nextTick 确保 DOM 更新后再调用 open 方法
  nextTick(() => {
    addressEditPopupRef.value?.open?.()
  })
}

/**
 * 关闭地址编辑弹窗
 */
function closeAddressEdit() {
  showAddressEdit.value = false
  addressEditPopupRef.value?.close?.()
}

/**
 * 处理保存地址
 * @param addressData
 */
async function handleSaveAddress(addressData) {
  try {
    // 规范化：补齐平铺字段，确保 province/city/district 在顶层也存在
    const province = addressData.province ?? addressData.address?.province
    const city = addressData.city ?? addressData.address?.city
    const district = addressData.district ?? addressData.address?.district

    const apiPayload = {
      ...addressData,
      // 平铺字段（后端/其他页面可能依赖）
      province,
      city,
      district,
      // 兼容嵌套结构
      address: {
        ...(addressData.address || {}),
        province,
        city,
        district,
      },
      postCode: undefined,
    }

    await getAddressAddAndEdit(apiPayload)
    toast?.({ title: '保存成功' })
    closeAddressEdit()
    // 保存后立即刷新列表数据
    await refreshPage?.()

    // 如果是选择地址模式，保存后自动选择该地址
    if (actionType.value === 'select') {
      const normalized = {
        ...apiPayload,
        // isDefault 规范为数字（部分页面用 1 判断）
        isDefault: apiPayload.isDefault ? 1 : 0,
      }
      emitter.emit('selectAddress', normalized)
      goBack?.({ delta: 1 })
    }
  } catch (error) {
    console.error('保存地址失败:', error)
    toast?.({ title: '保存失败，请重试' })
  }
}

/**
 * 处理选择状态下返回
 * @param item
 */
function handleClick(item) {
  if (actionType.value === 'select') {
    emitter.emit('selectAddress', item)
    goBack?.({ delta: 1 })
  }
}

// ============================ 删除相关 ============================
const delModalRef = ref()
const prepareData = ref(undefined)

/**
 * 打开弹窗
 */
function showModal(data) {
  prepareData.value = data
  unref(delModalRef).show()
}

/**
 * 删除地址
 */
async function doDeleteRequest() {
  await getAddressDel(prepareData.value)
  await refreshPage?.()
}

// 微信导入
const wxAddFn = () => {
  uni.chooseAddress({
    success(res) {
      let addData = {
        realName: res.userName,
        phone: res.telNumber,
        detail: res.detailInfo,
        province: res.provinceName,
        city: res.cityName,
        district: res.countyName
      }
      goEditorAddress(addData)
    },
    fail: (res) => {
      console.log('err---选择地址', res)
    }
  })
}
</script>

<style lang="scss">
@import "../../style/images";

.address-list {
  padding: 20rpx 20rpx 100rpx 20rpx;
  position: relative;
}

/* 顶部提示条样式 */
.tip-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 20rpx;
  background: linear-gradient(135deg, #E6F9F9 0%, #F0FCFC 100%);
  border-radius: 16rpx;
  border: 1rpx solid #B8EDED;

  .tip-text {
    font-size: 26rpx;
    color: #00CBCC;
    font-weight: 500;
  }
}

.form-buttons {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 20rpx);
  left: 0;
  z-index: 999;
  width: 100%;
  padding: 0;

  .btn-box {
    padding: 0 34rpx;
    display: flex;

    .btn {
      flex: 1;
      margin-left: 24rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80rpx;
      border: 1px solid #00CBCC;
      font-size: 34rpx;
      color: #00CBCC;
      cursor: pointer;
      border-radius: 40rpx;

      .icon {
        width: 44rpx;
        height: 44rpx;
        margin-right: 16rpx;
      }

      &:first-child {
        margin-left: 0;
      }

      &.btn-primary {
        background: #00CBCC;
        border-color: #00CBCC;
        color: #fff;
      }
    }
  }
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

.address-item {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  box-sizing: border-box;
  background: #fff;
  margin-bottom: 20rpx;
}
</style>
