import api from '../../config/api'
import { funMixin } from '../../config/mixin'
import { ref, onMounted } from 'vue';
import cookie from '@/utils/cookie'

export default function (componentContent, typeId, shopId) {
  const { sendReq, beforeGetData, afterGetData, jumpCoupon, jumpCouponProduct } = funMixin()
  const couponsData = ref([])

  onMounted(() => {
    getData()
  })

  // 获取优惠券列表
  function getData () {
    if (
        componentContent.value.selectedCoupon &&
        componentContent.value.selectedCoupon.length > 0
    ) {
      beforeGetData()
      let _url = `${api.getCoupons}?isPage=2&ids=${componentContent.value.selectedCoupon}`
      const params = {
        method: 'GET',
        url: _url,
      }
      sendReq(
          params,
          (res) => {
            afterGetData()
            couponsData.value = res.data.list
          },
          () => {
            afterGetData()
          }
      )
    } else {
      couponsData.value = []
    }
  }

  // 领取优惠券
  async function receiveCoupon (item) {
      var token = cookie.get('accessToken')
      if (typeof uni !== 'undefined') {
        if (token) {
          const params = {
            url: `${api.takeCoupon}${item.id}`,
            method: 'GET',
          }
          sendReq(
              params,
              (res) => {
                if (res.code !== 0) {
                  uni.showToast({
                    title: res.msg,
                    icon: 'none'
                  })
                } else if(res.data){
                  getData()
                  uni.showToast({
                    title: '领取成功',
                    icon: 'success'
                  })
                }

              },
              () => {
                if (res.code !== 0) {
                  uni.showToast({
                    title: res.msg,
                    icon: 'none'
                  })
                }
              }
          )
        } else {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
		  console.log("===========没有登录22============================================")
          uni.navigateTo({
            url: '/pages/login/guid'
          })
        }
      } else {
        if (token) {
          const params = {
            url: `${api.takeCoupon}${item.id}`,
            method: 'GET',
          }
          sendReq(params).then(res => {
            ElMessage({
              message: '领取成功！',
              type: 'success'
            })
            getData()
          }).catch(res => {
            if (res.data.code !== '200') {
              ElMessage({
                message: res.data.message,
                type: 'success'
              })
            }
          })
        } else {
          ElMessage({
            message: '请先登录'
          })
          // 登录弹框
          // store.commit('IS_LOGIN', false) // 清除顶部个人中心数据
          // store.commit('SHOW_LOGIN') // 调用登录弹框
        }
      }
  }

  return {
    componentContent,
    couponsData,
    receiveCoupon,
    jumpCoupon,
    jumpCouponProduct
  }
}
