<template>
  <layout>
    <uv-navbar :fixed="false" title="填写物流" left-arrow @leftClick="goBack" />
    <div>
      <div class="mb-20">
      </div>

      <view class="logistics-form-section">
        <uv-list :border="false">
          <uv-list-item :border="false">
            <view class="logistics-form-row">
              <view class="logistics-form-label">物流公司</view>
              <view class="logistics-form-value" @tap="openLogisticsPicker">
                <text class="logistics-form-text" :class="{ 'is-placeholder': !data.name }">
                  {{ data.name || '请选择' }}
                </text>
                <uv-icon name="arrow-right" color="#c0c4cc" size="16"></uv-icon>
              </view>
            </view>
          </uv-list-item>
          <uv-list-item :border="false">
            <view class="logistics-form-row">
              <view class="logistics-form-label">物流单号</view>
              <view class="logistics-form-input">
                <uv-input 
                  placeholder="请输入物流单号" 
                  border="none" 
                  v-model="data.postalCode"
                  fontSize="28rpx"
                  inputAlign="right"
                  :placeholderStyle="{ color: '#c0c4cc' }"
                  :customStyle="{ paddingRight: '0' }"
                ></uv-input>
              </view>
            </view>
          </uv-list-item>
        </uv-list>
        <uv-picker ref="logisticsPicker" :columns="logisticsColumns" keyName="name"
          @confirm="logisticsPickerConfirm"></uv-picker>
      </view>
      <view class="logistics-form-section">
        <uv-list :border="false">
          <uv-list-item :border="false">
            <view class="logistics-form-row">
              <view class="logistics-form-label">退货说明</view>
              <view class="logistics-form-input">
                <uv-input 
                  placeholder="请输入退货说明" 
                  border="none" 
                  v-model="data.returnPolicy"
                  fontSize="28rpx"
                  inputAlign="right"
                  :placeholderStyle="{ color: '#c0c4cc' }"
                  :customStyle="{ paddingRight: '0' }"
                ></uv-input>
              </view>
            </view>
          </uv-list-item>
        </uv-list>
      </view>
      <view class="logistics-upload-section">
        <view class="logistics-upload-header">
          <div class="logistics-upload-title">上传凭证</div>
        </view>
        <view class="logistics-upload-body">
          <upload-file v-model="list" />
        </view>
      </view>

    </div>
    <div class="logistics-submit-btn">
      <uv-button round block type="primary" @tap="handleApplyForAfterSales"
        :customStyle="{ backgroundColor: '#00CBCC', color: '#fff', border: 'none' }">
        提交
      </uv-button>
    </div>
  </layout>
</template>

<script setup>

import { computed, ref } from 'vue'
import { addLogisticsInformation, getExpress } from '@/api/order'
import { onLoad } from '@dcloudio/uni-app'
import { useRouter } from "@/hooks/useRouter";
import { useInterface } from "@/hooks/useInterface";

const { toast } = useInterface()
const { getParams, goBack, push } = useRouter()
const logisticsPicker = ref(null)
const refundType = ref(null)
const list = ref([])
const logisticsColumns = ref([])

const data = ref({
  code: '',
  name: '',
  postalCode: '',
  orderCode: '',
  id: '',
  returnPolicy: '',
  returnVoucher: ''
})


const getExpressList = () => {
  getExpress().then((res) => {
    logisticsColumns.value = [res]
  })
}

// 打开快递弹窗
const openLogisticsPicker = () => {
  logisticsPicker.value.open();
}

// 快递弹窗确认
const logisticsPickerConfirm = (e) => {
  console.log(e)
  data.value.code = e.value[0].code
  data.value.name = e.value[0].name
  logisticsPicker.value.close();
}

const handleApplyForAfterSales = async () => {
  if (!data.value.code) {
    uni.showToast({
      icon: "none",
      title: '请选择快递公司',
      duration: 2000
    });
    return
  }
  if (!data.value.postalCode) {
    uni.showToast({
      icon: "none",
      title: '请选择退货说明',
      duration: 2000
    });
    return
  }
  await addLogisticsInformation({
    ...data.value,
    returnVoucher: list.value.map(v => {
      return v.url
    }).join(',')
  })
  toast({
    title: '填写成功'
  })
  push({ url: '/pages/refundInfo/refundInfo' }, {
    data: {
      id: data.value.id,
    },
    type: "redirectTo"
  })
}

onLoad((options) => {
  const params = getParams(options)
  data.value.id = params.id
  data.value.orderCode = params.orderCode
  getExpressList()
})


</script>

<style lang="scss" scoped>
// 表单区域
.logistics-form-section {
  // margin-bottom: 12rpx;
}

.logistics-form-row {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 100rpx;
  padding: 0 !important;
  box-sizing: border-box;
  border-bottom: 1rpx solid #e6e6e6;
}

.logistics-form-label {
  width: 160rpx;
  font-size: 28rpx;
  color: #303133;
  flex-shrink: 0;
  padding-left: 34rpx;
  padding-right: 20rpx;
}

.logistics-form-input {
  flex: 1;
  overflow: hidden;
  padding-right: 34rpx;
  min-width: 0;
}

.logistics-form-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8rpx;
  padding-right: 4rpx;
  min-width: 0;
  overflow: hidden;
}

.logistics-form-text {
  font-size: 28rpx;
  color: #303133;
  text-align: right;
  
  &.is-placeholder {
    color: #c0c4cc;
  }
}

// 移除uv-list-item的分隔线
:deep(.uv-list) {
  border: none !important;
}

:deep(.uv-list-item) {
  border-bottom: none !important;
}

:deep(.uv-list-item__wrapper) {
  border-bottom: none !important;
}

:deep(.uv-list-item__wrapper::after) {
  display: none !important;
}

// 上传区域
.logistics-upload-section {
  background: #ffffff;
  border-radius: 0;
  // margin-bottom: 12rpx;
}

.logistics-upload-header {
  min-height: 100rpx;
  padding: 0 34rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logistics-upload-title {
  font-size: 28rpx;
  color: #303133;
  font-weight: 400;
}

.logistics-upload-body {
  padding: 24rpx 34rpx;
}

// 提交按钮
.logistics-submit-btn {
  padding: 40rpx 32rpx;
}
</style>
