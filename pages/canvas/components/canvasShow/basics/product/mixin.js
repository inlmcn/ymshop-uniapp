import api from '../../config/api'
import { funMixin } from '../../config/mixin'
import { ref, onMounted } from 'vue';

export default function (componentContent) {
  const { sendReq, beforeGetData, afterGetData, jumpProductDetail, jumpProList } = funMixin()

  const productData = ref([])
  const loading = ref(true)
  onMounted(() => {
    getData(true)
  })

  function getData (isFirst) {
    loading.value = true
    if (componentContent.value.productData.sourceType === '1') {
      if (
          componentContent.value.productData.productIdList?.length > 0
      ) {
        beforeGetData()
        sendReq(
            {
              url: `${api.getProducts}?page=1&isPage=2&ids=${componentContent.value.productData.productIdList}`,
              method: 'GET',
            },
            (proRes) => {
              afterGetData()
              productData.value = proRes.data.list
              loading.value = false
              if (isFirst) {
                componentContent.value.productData.imgTextData = productData.value
              }
            },
            () => {
              afterGetData()
              loading.value = false
            }
        )
      } else {
        productData.value = []
      }
    } else if (componentContent.value.productData.sourceType === '2') {
      if (componentContent.value.productData?.categoryId) {
        beforeGetData()
        sendReq(
            {
              url: `${api.getProducts}?page=1&isPage=2&cateId=${componentContent.value.productData.categoryId}`,
              method: 'GET',
            },
            (proRes) => {
              afterGetData()
              loading.value = false
              productData.value = proRes.data.list
              if (isFirst) {
                componentContent.value.productData.imgTextData = productData.value
              }
              // _.swiper.update()
            },
            () => {
              afterGetData()
              loading.value = false
            }
        )
      } else {
        productData.value = {
          products: [],
        }
      }
    }
  }

  // 获取进度条数字
  function getPercentageNum(item){
    const total = item.campaignTotal || item.total
    const stock = item.campaignStock || item.stock
    return (total-stock)/total*100
  }
  return {
    productData,
    jumpProductDetail,
    jumpProList,
    getPercentageNum,
    loading
  }
}
