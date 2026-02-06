import { ref, computed } from 'vue'

/**
 * 处理商品价格的 composable 函数
 * @param {Object} detailData - 商品详情数据的响应式对象
 * @returns {Object} 返回价格相关的数据和方法
 */
export function useProductPrice(detailData) {
  // 当前选中的规格
  const selectedAttr = ref(null)

  /**
   * 计算当前价格
   * 优先级：选中规格价格 > 第一个规格价格 > storeInfo价格
   */
  const currentPrice = computed(() => {
    if (!detailData.value || !detailData.value.productValue) {
      return detailData.value?.storeInfo?.price || 0
    }

    // 如果有选中的规格，从 productValue 中获取对应价格
    if (selectedAttr.value && detailData.value.productValue[selectedAttr.value]) {
      return detailData.value.productValue[selectedAttr.value].price
    }

    // 如果没有选中规格，获取第一个规格的价格
    const firstAttrKey = Object.keys(detailData.value.productValue)[0]
    if (firstAttrKey && detailData.value.productValue[firstAttrKey]) {
      return detailData.value.productValue[firstAttrKey].price
    }

    // 兜底返回 storeInfo 中的价格
    return detailData.value.storeInfo?.price || 0
  })

  /**
   * 获取当前选中规格的完整信息
   * 包括：price, stock, image, sku 等
   */
  const currentProductValue = computed(() => {
    if (!detailData.value || !detailData.value.productValue) {
      return null
    }

    // 如果有选中的规格
    if (selectedAttr.value && detailData.value.productValue[selectedAttr.value]) {
      return detailData.value.productValue[selectedAttr.value]
    }

    // 如果没有选中规格，返回第一个规格的信息
    const firstAttrKey = Object.keys(detailData.value.productValue)[0]
    if (firstAttrKey && detailData.value.productValue[firstAttrKey]) {
      return detailData.value.productValue[firstAttrKey]
    }

    return null
  })

  /**
   * 获取价格区间（最低价-最高价）
   */
  const priceRange = computed(() => {
    if (!detailData.value || !detailData.value.productValue) {
      const price = detailData.value?.storeInfo?.price || 0
      return { min: price, max: price }
    }

    const prices = Object.values(detailData.value.productValue).map(item => item.price)
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    }
  })

  /**
   * 格式化价格显示
   * @param {Number|String} price - 价格
   * @param {Number} decimals - 小数位数，默认2位
   * @returns {String} 格式化后的价格字符串
   */
  const formatPrice = (price, decimals = 2) => {
    if (typeof price === 'number') {
      return price.toFixed(decimals)
    }
    return parseFloat(price || 0).toFixed(decimals)
  }

  /**
   * 选择规格
   * @param {String} attrKey - 规格键名（如："默认"）
   */
  const selectAttr = (attrKey) => {
    if (detailData.value && detailData.value.productValue && detailData.value.productValue[attrKey]) {
      selectedAttr.value = attrKey
      console.log('选中规格:', attrKey, '价格:', detailData.value.productValue[attrKey].price)
      return true
    }
    console.warn('规格不存在:', attrKey)
    return false
  }

  /**
   * 初始化默认规格（选择第一个）
   */
  const initDefaultAttr = () => {
    if (detailData.value && detailData.value.productValue) {
      const firstAttrKey = Object.keys(detailData.value.productValue)[0]
      if (firstAttrKey) {
        selectedAttr.value = firstAttrKey
        console.log('初始化默认规格:', firstAttrKey, '价格:', detailData.value.productValue[firstAttrKey].price)
        return firstAttrKey
      }
    }
    return null
  }

  /**
   * 获取所有规格列表
   */
  const getAttrList = () => {
    if (!detailData.value || !detailData.value.productValue) {
      return []
    }
    return Object.keys(detailData.value.productValue).map(key => ({
      key,
      ...detailData.value.productValue[key]
    }))
  }

  /**
   * 根据规格键获取规格信息
   * @param {String} attrKey - 规格键名
   */
  const getAttrInfo = (attrKey) => {
    if (!detailData.value || !detailData.value.productValue) {
      return null
    }
    return detailData.value.productValue[attrKey] || null
  }

  /**
   * 检查当前规格是否有库存
   */
  const hasStock = computed(() => {
    if (!currentProductValue.value) {
      return detailData.value?.storeInfo?.stock > 0
    }
    return currentProductValue.value.stock > 0
  })

  /**
   * 获取当前库存数量
   */
  const currentStock = computed(() => {
    if (!currentProductValue.value) {
      return detailData.value?.storeInfo?.stock || 0
    }
    return currentProductValue.value.stock || 0
  })

  return {
    // 响应式数据
    selectedAttr,
    currentPrice,
    currentProductValue,
    priceRange,
    hasStock,
    currentStock,

    // 方法
    formatPrice,
    selectAttr,
    initDefaultAttr,
    getAttrList,
    getAttrInfo
  }
}

