import api from '../../config/api'
import {
  funMixin
} from '../../config/mixin'
import {
  ref,
  onMounted,
} from 'vue';

export default function (componentContent) {
  const {
    sendReq,
    jumpProductDetail,
    jumpProList
  } = funMixin()
  const productData = ref([])

  onMounted(() => {
    getData(true)
  })

  function getData(isFirst) {
    if (componentContent.value.productData.sourceType === '1') {
      if(componentContent.value.productData.productIdList && componentContent.value.productData.productIdList.length>0){
        sendReq({
          url: `${api.getProducts}?page=1&pageSize=99&ids=${componentContent.value.productData.productIdList}`,
          method: 'GET'
        }, (proRes) => {
          productData.value = proRes.data.list
          if(isFirst){
            componentContent.value.productData.imgTextData = productData.value
          }
          // _.$forceUpdate() // 刷新轮播图

        })
      } else {
        productData.value = []
      }
    } else if(componentContent.value.productData.sourceType === '2'){
      if(componentContent.value.productData.categoryId) {
        sendReq({
          url: `${api.getProducts}?page=1&pageSize=99&classifyId=${componentContent.value.productData.categoryId}`,
          method: 'GET'
        }, (proRes) => {
          productData.value = proRes.data.list
          if(isFirst){
            componentContent.value.productData.imgTextData = productData.value
          }
          // _.$forceUpdate() // 刷新轮播图
        })
      } else {
        productData.value = []
      }
    }
  }

  return {
    productData,
    jumpProductDetail,
    jumpProList
  }
}

