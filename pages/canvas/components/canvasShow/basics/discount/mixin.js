import api from '../../config/api'
import { funMixin } from '../../config/mixin'
import { ref, onMounted, onBeforeUnmount } from 'vue';

export default function (componentContent, typeId, shopId) {
  const { sendReq, beforeGetData, afterGetData, jumpProductDetail, jumpDiscount } = funMixin()
  const activityData = ref({})
  const productList = ref([])
  const count = ref([])
  const timer = ref(null)
  const countDownInterval = ref(null)

  onMounted(() => {
    if (componentContent.value.id || componentContent.value.sourceType === '1') {
      // getProList()
      getActivit()
    } else {
      productList.value = []
    }
  })

  onBeforeUnmount(() => {
    clearInterval(timer.value)
  })

  function getProList (id) {
    beforeGetData()
    const params = {
      method: 'POST',
      url: api.getActivityProduct,
      data: {
        isPage: 2,
        ids: [id]
      }
    }
    sendReq(
        params,
        (res) => {
          afterGetData()
          productList.value = res.data.list.slice(0, componentContent.value.productNum)
        },
        () => {
          afterGetData()
        }
    )
  }

  function getActivit () {
    beforeGetData()
    let url = ''
    if(componentContent.value.sourceType === '1'){
      url = `${api.getActivityByType}?type=3` // 1、拼团，2、秒杀，3、限时折扣
    }else{
      url = `${api.getActivity}?id=${componentContent.value.id}`
    }
    const params = {
      method: 'GET',
      url,
    }
    sendReq(
        params,
        (res) => {
          afterGetData()
          activityData.value = res.data
          getProList(res.data.id)
          getTime()
        },
        () => {
          afterGetData()
        }
    )
  }

  function getTime () {
    const date = new Date().getTime()
    let startTime = activityData.value.startTime
    let endTime = activityData.value.endTime
    let time = 0
    if (activityData.value.state === 0) {
      time = startTime - date // 未开始
    } else if(activityData.value.state === 1) {
      time = endTime - date // 进行中
    }
    if(countDownInterval.value){
      clearInterval(countDownInterval.value)
    }
    countDownInterval.value = setInterval(()=>{
      countDown(time)
      time -= 1000
      if(time <= 0){
        clearInterval(countDownInterval.value)
        activityData.value.state ++
      }
    },1000)
  }
  function countDown (time) {
    const fn = (v) => (v < 10 ? `0${v}` : v)
    const t = parseInt(time / 1000)
    const text = activityData.value.state === 0 ? '开始' : '结束'
    const hour = parseInt(t / 3600)
    const min = parseInt((t % 3600) / 60)
    const s = t % 60
    count.value = [text, fn(hour), fn(min), fn(s)]
  }

  // 获取进度条数字
  function getPercentageNum(item){
    const total = item.total
    const stock = item.stock
    return (total-stock)/total*100
  }

  return {
    activityData,
    productList,
    count,
    jumpProductDetail,
    jumpDiscount,
    getPercentageNum
  }
}
