import api from '../../config/api'
import {
  funMixin
} from '../../config/mixin'
const { sendReq} = funMixin()

import {
  ref,
  onMounted,
} from 'vue';

export default function (componentContent, shopId) {
  const {
    jumpProductDetail,
    jumpCombination
  } = funMixin()
  const productData = ref({
    composeProducts: [],
    rules: [{
      price: null,
      number: null,
    }],
  })

  onMounted(() => {
    getData(true)
  })

  function getData() {
    if(componentContent.value.priceId){
      const params = {
        method: 'GET',
        url: `${api.getPrices}?shopId=${shopId.value}&ids=${componentContent.value.priceId}&page=1&pageSize=10`,
      }
      sendReq(params, (res) => {
        if( res.data.length > 0){
          productData.value = res.data[0]
        }
      })
    } else {
      productData.value = {
        composeProducts: [],
        rules: []
      }
    }
  }

  return {
    getData,
    productData,
    jumpProductDetail,
    jumpCombination
  }
}
