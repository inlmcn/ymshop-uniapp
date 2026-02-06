import api from '../../config/api'
import { funMixin } from '../../config/mixin'
import { ref, onMounted } from 'vue';

const vipMixin = () => {
  const { sendReq, jumpVip, jumpProductDetail } = funMixin()
  const productData = ref([])
  onMounted(() => {
    getData()
  })

  function getData() {
    sendReq({
      url: `${api.getMemberProducts}?page=1&pageSize=20`,
      method: 'GET'
    }, (proRes) => {
      productData.value = proRes.data.list
      console.log(productData.value)
    })
  }

  return {
    productData,
    jumpVip,
    jumpProductDetail
  }
}

export default vipMixin
