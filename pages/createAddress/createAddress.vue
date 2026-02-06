<template>
  <view>
    <Header>{{ title }}</Header>
    <view class="create-address">
      <view class="list noBorder">
        <view class="list-main">
          <view class="list-label w-158">
            收货地址
          </view>
          <view class="list-content" @click="openAddressSelect">
            <template v-if="form.address.cityId">
              {{ form.address.province }} {{ form.address.city }} {{ form.address.district }}
            </template>
            <template v-else>
              <span class="choose">
                点击选择
                <uv-icon name="arrow-right" />
              </span>
            </template>
          </view>
        </view>
      </view>
      <view class="list">
        <view class="list-main">
          <view class="list-label w-158">
            详细地址
          </view>
          <view class="list-content">
            <input type="text" placeholder="请输入详细地址" v-model="form.detail" />
          </view>
        </view>
      </view>
      <view class="list">
        <view class="list-main">
          <view class="list-label w-158">
            姓名
          </view>
          <view class="list-content">
            <input type="text" placeholder="请输入姓名" v-model="form.realName" />

          </view>
        </view>
      </view>
      <view class="list">
        <view class="list-main">
          <view class="list-label w-158">
            电话
          </view>
          <view class="list-content">
            <input type="tel" placeholder="请输入电话" maxlength="11" v-model="form.phone" />
          </view>
        </view>
      </view>
    </view>
    <view class="form-checkbox">
      <uv-checkbox-group v-model="defaultAddress">
        <uv-checkbox shape="circle" label="设为默认地址" name="isDefault" labelColor="#999999" activeColor="#00CBCC" />
      </uv-checkbox-group>
    </view>
    <view class="form-buttons">
      <uv-button type="primary" text="提交"
        customStyle="margin-top: 10px;background-color: #00CBCC;border-radius: 30rpx;border: none;" @click="submit" />
    </view>
    <AddressSelect ref="addressSelectRef" @confirm="addressSelectConfirm" />
  </view>
</template>

<script setup>
import { computed, onMounted, ref, unref, } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAddressAddAndEdit, getAddressCityList } from '@/api/address'
import { useRouter } from "@/hooks/useRouter";
import Header from "@/components/Header/index.vue";
import UvCheckboxGroup from "@/uni_modules/uv-checkbox/components/uv-checkbox-group/uv-checkbox-group.vue";
import UvCheckbox from "@/uni_modules/uv-checkbox/components/uv-checkbox/uv-checkbox.vue";
import UvButton from "@/uni_modules/uv-button/components/uv-button/uv-button.vue";
import UvIcon from "@/uni_modules/uv-icon/components/uv-icon/uv-icon.vue";
import AddressSelect from '@/components/AddressSelect/index.vue'
import { useInterface } from "@/hooks/useInterface";
import { checkPhone } from "@/utils/utils";


// ========================== hooks ================================================
const { toast } = useInterface();
const { getParams, push, goBack } = useRouter()

const title = computed(() => form.value.id ? '编辑地址' : '添加地址')
const defaultAddress = ref([]) // 是否为默认地址  ['isDefault']默认 []非默认
const actionType = ref(undefined) // 是否是选择地址

// =========================== 表单相关 ==========================================
// 表单
const form = ref({
  id: undefined,
  realName: undefined,
  phone: undefined,
  detail: undefined,
  isDefault: undefined,
  address: {
    cityId: undefined,
    city: undefined,
    district: undefined,
    province: undefined,
  }
});

/**
 * 校验表单
 * @param form
 * @return {boolean}
 */
function checkForm(form) {
  if (!form.address?.cityId) {
    toast?.({ title: "请选择收货地址" })
    return false
  }
  if (!form.detail) {
    toast?.({ title: "请输入详细地址" })
    return false
  }
  if (!form.realName) {
    toast?.({ title: "请输入姓名" })
    return false
  }
  if (!checkPhone(form.phone)) {
    toast?.({ title: "请输入正确手机号" })
    return false
  }
  return true
}

const submitLoading = ref(false) // 是否正在提交

/**
 * 提交表单
 * @return {Promise<void>}
 */
async function submit() {
  if (!checkForm(form.value) || submitLoading.value) return
  try {
    submitLoading.value = true
    await getAddressAddAndEdit({
      ...form.value,
      postCode: undefined,
      isDefault: defaultAddress.value.length > 0 ? 1 : 0,
    })
    toast?.({ title: '保存成功' })
    goBack()
  } finally {
    submitLoading.value = false
  }
}

/**
 * 设置编辑表单
 * @param addressItem
 */
function setFormDefault(addressItem) {
  form.value.id = addressItem.id
  form.value = {
    ...form.value,
    ...addressItem,
    address: {
      cityId: addressItem.cityId,
      city: addressItem.city,
      district: addressItem.district,
      province: addressItem.province,
    }
  }
  // 默认地址
  if (addressItem.isDefault) {
    defaultAddress.value = ['isDefault']
  }
}

// ================================= 地址选择相关 ==================================
const addressSelectRef = ref()

/**
 * 打开选择地址
 */
function openAddressSelect() {
  const { address } = unref(form)
  let defaultAddressStr = ''
  if (address.province && address.city && address.district) {
    defaultAddressStr = `${address.province}-${address.city}-${address.district}`
  }
  unref(addressSelectRef).open(defaultAddressStr)
}

/**
 * 地址选择confirm
 * @param areaList 地区 [省, 市, 区]
 */
function addressSelectConfirm(areaList) {
  if (areaList.length < 3) return
  const { address } = unref(form)
  address.province = areaList[0]?.name
  address.city = areaList[1]?.name
  address.cityId = areaList[1]?.id
  address.district = areaList[2]?.name
}

/**
 * 获取城市列表
 * @returns {Promise<void>}
 */
async function getCityList(city) {
  let cityList = await getAddressCityList()
  let provinceListLen = cityList.length
  for (let i = 0; i < provinceListLen; i++) {
    let cityListLen = cityList[i].children.length
    for (let j = 0; j < cityListLen; j++) {
      if (city === cityList[i].children[j].name) {
        form.value.address.cityId = cityList[i].id
      }
    }
  }
}

onLoad(async (options) => {
  const params = getParams?.(options)
  actionType.value = params?.type
  if (params?.address) {
    if (!params?.address?.cityId) {
      getCityList(params?.address?.city)
    }
    setFormDefault(params?.address)
  }
})
onMounted(() => {
})
</script>

<style lang="scss">
.create-address {
  background: #fff;
}

.form-checkbox {
  padding-left: 35rpx;
}

.w-158 {
  flex: 0 0 158rpx;
}

.choose {
  @include useFlex(space-between, center);
  font-size: 28rpx;
  color: #808080;
}
</style>
