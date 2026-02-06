import api from '../../config/api'
import {
  funMixin
} from '../../config/mixin'
import {
  ref,
  onMounted
} from 'vue';

export default function (componentContent, typeId, shopId) {
  const {
    sendReq,
    beforeGetData,
    afterGetData,
    jumpProductDetail,
    jumpGroupWorks
  } = funMixin()
  const productList = ref([])

  onMounted(() => {
    getData()
  })

  function getData () {
      beforeGetData()
      const params = {
        method: 'POST',
        url: api.getActivityProduct,
        data: {
          isPage: 2,
          type: 1
        }
      }
      sendReq(
          params,
          (res) => {
            afterGetData()
            productList.value = res.data.list
          },
          () => {
            afterGetData()
          }
      )
  }

  return {
    productList,
    jumpProductDetail,
    jumpGroupWorks
  }
}
