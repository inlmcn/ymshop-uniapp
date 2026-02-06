<!--
    @name: AddressSelect
    @author: kahu4
    @date: 2024-01-18 14:48
    @description：AddressSelect 地址选择器
    @update: 2024-01-18 14:48
-->
<script setup>
import { computed, nextTick, ref, toRefs, unref } from "vue";
import UvPicker from "@/uni_modules/uv-picker/components/uv-picker/uv-picker.vue";
import { getAddressCityList } from "@/api/address";

/**
 * @property {Array} defaultValue 默认值索引
 */
const props = defineProps({
  defaultValue: {
    type: Array,
    default: () => ([0, 0, 0])
  },
})
const {defaultValue} = toRefs(props)
const emits = defineEmits(['confirm', 'update:default-value'])
const addressPickerRef = ref()
const pickerValue = ref([0, 0, 0])
const provinces = ref([])
const citys = ref([])
const areas = ref([])
const columns = computed(() => {
  return [
    provinces.value, citys.value, areas.value
  ]
})

function handlePickerChange(e) {
  const {columnIndex, index, indexs} = e
  // 改变了省
  if (columnIndex === 0) {
    citys.value = provinces.value[index]?.children || []
    areas.value = citys.value[0]?.children || []
    addressPickerRef.value.setIndexs([index, 0, 0], true)
  } else if (columnIndex === 1) {
    areas.value = citys.value[index]?.children || []
    addressPickerRef.value.setIndexs(indexs, true)
  }
}


function handlePickerConfirm(e) {
  const {indexs, value} = e
  emits('confirm', value, indexs)
  emits('update:default-value', indexs)
}


function handleSetDefaultColumns() {
  pickerValue.value[0] = provinces.value.findIndex((item, index) => index === defaultValue.value[0])
  citys.value = provinces.value[pickerValue.value[0]].children || []
  pickerValue.value[1] = citys.value.findIndex((item, index) => index === defaultValue.value[1])
  areas.value = citys.value[pickerValue.value[1]].children || []
  pickerValue.value[2] = areas.value.findIndex((item, index) => index === defaultValue.value[2])
  nextTick(() => {
    addressPickerRef.value.setIndexs([pickerValue.value[0], pickerValue.value[1], pickerValue.value[2]], true);
  })
}

/**
 * 获取树
 * @returns {Promise<void>}
 */
async function getTree() {
  if (provinces.value <= 0) {
    provinces.value = await getAddressCityList()
  }
}

async function open(defaultStr = '') {
  await getTree()
  handleSetDefaultColumns()
  if (defaultStr) {
    findIndexByDefaultStr(defaultStr)
  }
  unref(addressPickerRef).open()
}

function findIndexByDefaultStr(defaultStr) {
  const areaList = defaultStr.split('-')
  const provinceIndex = provinces.value.findIndex(item => item.name === areaList[0])
  const cityIndex = provinces.value[provinceIndex].children.findIndex(item => item.name === areaList[1])
  const townIndex = provinces.value[provinceIndex].children[cityIndex].children.findIndex(item => item.name === areaList[2])
  pickerValue.value[0] = provinceIndex
  citys.value = provinces.value[pickerValue.value[0]].children || []
  pickerValue.value[1] = cityIndex
  areas.value = citys.value[pickerValue.value[1]].children || []
  pickerValue.value[2] = townIndex
  nextTick(() => {
    addressPickerRef.value.setIndexs([pickerValue.value[0], pickerValue.value[1], pickerValue.value[2]], true);
  })
}


defineExpose({open})


</script>

<template>
  <uv-picker
      ref="addressPickerRef"
      :columns="columns"
      keyName="name"
      @change="handlePickerChange"
      @confirm="handlePickerConfirm"
  />
</template>

<style
    scoped
    lang="scss">

</style>
